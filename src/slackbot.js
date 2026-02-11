import { App } from '@slack/bolt';
import crypto from 'crypto';
import { fetchCommitsLast24Hours } from './fetch/github.js';
import { extractCommitSignals } from './extract/index.js';
import { analyzeCommit, analyzeMultipleCommits } from './analyze/commitAnalyzer.js';
import { generatePostIdeas } from './post/ideaGenerator.js';
import { composePost } from './post/Composer.js';
import { rewriteWithCache, needsRewrite } from './ai/rewrite-optimized.js';

// ============================================================
// CORRECTED USE CASE:
// Users generate posts about THEIR OWN commits, not browsing others
// ============================================================

class TokenManager {
  constructor() {
    this.tokens = new Map();
    this.encryptionKey = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
  }
  
  // ... encryption methods same as before ...
  
  saveUserData(slackUserId, data) {
    this.tokens.set(slackUserId, {
      githubToken: this.encrypt(data.githubToken),
      githubUsername: data.githubUsername,
      defaultRepo: data.defaultRepo || null,
      savedAt: new Date()
    });
  }
  
  getUserData(slackUserId) {
    const data = this.tokens.get(slackUserId);
    if (!data) return null;
    
    return {
      githubToken: this.decrypt(data.githubToken),
      githubUsername: data.githubUsername,
      defaultRepo: data.defaultRepo
    };
  }
  
  encrypt(text) {
    const algorithm = 'aes-256-cbc';
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      algorithm,
      Buffer.from(this.encryptionKey, 'hex'),
      iv
    );
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
  }
  
  decrypt(text) {
    const algorithm = 'aes-256-cbc';
    const parts = text.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = Buffer.from(parts[1], 'hex');
    const decipher = crypto.createDecipheriv(
      algorithm,
      Buffer.from(this.encryptionKey, 'hex'),
      iv
    );
    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  }
}

const tokenManager = new TokenManager();

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN
});

// ============================================================
// ONBOARDING FLOW
// ============================================================

app.command('/connect-github', async ({ command, ack, say, client }) => {
  await ack();
  
  // Show setup instructions
  await say({
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '🔗 *Connect Your GitHub Account*\n\nTo generate posts about your commits, I need:'
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*Step 1: Create a Personal Access Token*\n' +
                '1. Go to <https://github.com/settings/tokens/new|GitHub Settings>\n' +
                '2. Click "Generate new token (classic)"\n' +
                '3. Give it a name: `LinkedIn Post Bot`\n' +
                '4. Select scopes: `repo` (for private) or `public_repo` (public only)\n' +
                '5. Click "Generate token" and copy it'
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*Step 2: Send me your details*\n' +
                'Format: `/connect-github <token> <username>`\n\n' +
                'Example:\n' +
                '`/connect-github ghp_xxxxxxxxxxxx yourGitHubUsername`'
        }
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: '🔒 Your token is encrypted and stored securely'
          }
        ]
      }
    ]
  });
});

app.command('/setup', async ({ command, ack, say }) => {
  await ack();
  
  const parts = command.text.trim().split(/\s+/);
  
  if (parts.length < 2) {
    await say('❌ Please provide both token and username:\n`/setup <github_token> <username>`');
    return;
  }
  
  const [token, username, ...repoParts] = parts;
  const defaultRepo = repoParts.join(' ') || null;
  
  // Validate token format
  if (!token.startsWith('ghp_') && !token.startsWith('github_pat_')) {
    await say('❌ Invalid token format. It should start with `ghp_` or `github_pat_`');
    return;
  }
  
  // Save user data
  tokenManager.saveUserData(command.user_id, {
    githubToken: token,
    githubUsername: username,
    defaultRepo
  });
  
  await say({
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `✅ *Connected!*\n\n` +
                `GitHub: @${username}\n` +
                `${defaultRepo ? `Default repo: \`${defaultRepo}\`` : 'No default repo set'}\n\n` +
                `Try it now: \`/my-post\``
        }
      }
    ]
  });
});

// ============================================================
// MAIN COMMAND: Generate post about MY work
// ============================================================

app.command('/my-post', async ({ command, ack, say }) => {
  await ack();
  
  try {
    // Check if user is connected
    const userData = tokenManager.getUserData(command.user_id);
    
    if (!userData) {
      await say({
        text: '❌ Not connected',
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '❌ *You haven\'t connected GitHub yet*\n\nRun `/connect-github` to get started!'
            }
          }
        ]
      });
      return;
    }
    
    const { githubToken, githubUsername, defaultRepo } = userData;
    
    // Parse optional repo parameter
    const specifiedRepo = command.text.trim();
    
    if (!specifiedRepo && !defaultRepo) {
      await say('📝 Please specify a repo: `/my-post owner/repo`\n_Or set a default repo with `/set-default-repo owner/repo`_');
      return;
    }
    
    const targetRepo = specifiedRepo || defaultRepo;
    
    await say(`🔍 Checking your commits in \`${targetRepo}\`...`);
    
    // Fetch commits by THIS user
    const commits = await fetchCommitsLast24Hours(
      targetRepo,
      githubUsername, // Only get commits by this user!
      githubToken
    );
    
    if (commits.length === 0) {
      await say({
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `😕 *No commits found*\n\n` +
                    `I didn't find any commits by @${githubUsername} in \`${targetRepo}\` in the last 24 hours.\n\n` +
                    `Try:\n` +
                    `• Different repo: \`/my-post owner/other-repo\`\n` +
                    `• Wait until you push some commits 😊\n` +
                    `• Check if the repo name is correct`
            }
          }
        ]
      });
      return;
    }
    
    await say(`✅ Found ${commits.length} commits by you! Analyzing...`);
    
    // Process commits
    const commitAnalyses = [];
    for (const commit of commits) {
      const signals = await extractCommitSignals(commit);
      const analysis = analyzeCommit(signals);
      commitAnalyses.push({
        sha: commit.sha,
        message: commit.commit.message,
        ...analysis
      });
    }
    
    const aggregatedAnalysis = analyzeMultipleCommits(commitAnalyses);
    const postIdeas = generatePostIdeas(aggregatedAnalysis);
    const topIdea = postIdeas[0];
    
    await say(`📝 Creating post about: *${topIdea.title}*`);
    
    // Compose post
    let basePost = composePost(topIdea, aggregatedAnalysis);
    
    // Polish with AI (uses shared Groq key)
    let finalPost;
    if (needsRewrite(basePost)) {
      await say('✨ Polishing...');
      finalPost = await rewriteWithCache(basePost, 'pro', 300);
    } else {
      finalPost = basePost;
    }
    
    // Show the post
    await say({
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*📱 Your LinkedIn Post*\n\n${finalPost}`
          }
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `📊 ${commits.length} commits • 💡 ${topIdea.type} • 🎯 ${targetRepo}`
            }
          ]
        },
        {
          type: 'divider'
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: '🔄 Different Angle',
                emoji: true
              },
              value: 'regenerate',
              action_id: 'regenerate'
            },
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: '📋 Copy',
                emoji: true
              },
              value: finalPost,
              action_id: 'copy'
            }
          ]
        }
      ]
    });
    
    // Show alternative ideas
    if (postIdeas.length > 1) {
      const alternatives = postIdeas.slice(1, 3)
        .map((idea, i) => `${i + 2}. ${idea.title}`)
        .join('\n');
      
      await say(`💡 *Other angles to try:*\n${alternatives}\n\n_Run \`/my-post\` again for a different take!_`);
    }
    
  } catch (error) {
    console.error('Error:', error);
    await say(`❌ Error: ${error.message}`);
  }
});

// ============================================================
// UTILITY COMMANDS
// ============================================================

app.command('/set-default-repo', async ({ command, ack, say }) => {
  await ack();
  
  const userData = tokenManager.getUserData(command.user_id);
  if (!userData) {
    await say('❌ Please run `/connect-github` first');
    return;
  }
  
  const repo = command.text.trim();
  
  if (!repo.includes('/')) {
    await say('❌ Format: `/set-default-repo owner/repo`');
    return;
  }
  
  tokenManager.saveUserData(command.user_id, {
    ...userData,
    defaultRepo: repo
  });
  
  await say(`✅ Default repo set to \`${repo}\`\n\nNow you can just run \`/my-post\` without specifying the repo!`);
});

app.command('/my-github', async ({ command, ack, say }) => {
  await ack();
  
  const userData = tokenManager.getUserData(command.user_id);
  
  if (!userData) {
    await say('❌ Not connected. Run `/connect-github` to get started.');
    return;
  }
  
  await say({
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `📊 *Your GitHub Connection*\n\n` +
                `Username: @${userData.githubUsername}\n` +
                `Default repo: ${userData.defaultRepo || '_not set_'}\n` +
                `Token: Connected ✅`
        }
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: '🔄 Update Token'
            },
            action_id: 'update_token'
          },
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: '🗑️ Disconnect'
            },
            style: 'danger',
            action_id: 'disconnect'
          }
        ]
      }
    ]
  });
});

// ============================================================
// HOME TAB (Optional - shows user's stats)
// ============================================================

app.event('app_home_opened', async ({ event, client }) => {
  const userData = tokenManager.getUserData(event.user);
  
  const blocks = userData ? [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*👋 Hey there!*\n\nYou're connected as @${userData.githubUsername}`
      }
    },
    {
      type: 'divider'
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '*🚀 Quick Actions*'
      }
    },
    {
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: '📝 Generate Post'
          },
          action_id: 'quick_post',
          style: 'primary'
        }
      ]
    }
  ] : [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '*👋 Welcome!*\n\nGenerate LinkedIn posts from your GitHub commits automatically.\n\n_Get started:_ `/connect-github`'
      }
    }
  ];
  
  await client.views.publish({
    user_id: event.user,
    view: {
      type: 'home',
      blocks
    }
  });
});

// ============================================================
// START BOT
// ============================================================

(async () => {
  await app.start();
  console.log('⚡️ LinkedIn Post Bot is running!');
  console.log('\nCommands:');
  console.log('  /connect-github  - Setup instructions');
  console.log('  /setup <token> <username> [repo]  - Connect your GitHub');
  console.log('  /my-post [repo]  - Generate post from YOUR commits');
  console.log('  /set-default-repo owner/repo  - Set default repo');
  console.log('  /my-github  - View your settings');
})();

export { app, tokenManager };
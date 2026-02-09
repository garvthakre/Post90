import dotenv from 'dotenv';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { fetchCommit, fetchCommitsLast24Hours } from './fetch/github.js';
import { extractCommitSignals } from './extract/index.js';
import { analyzeCommit, analyzeMultipleCommits } from './analyze/commitAnalyzer.js';
import { generatePostIdeas } from './post/ideaGenerator.js';
import { composePost } from './post/Composer.js';
import { rewritePost } from './ai/rewrite.js';

dotenv.config();

const argv = yargs(hideBin(process.argv))
  .option('repo', {
    type: 'string',
    demandOption: true,
    describe: 'GitHub repository in the format owner/repo'
  })
  .option('sha', {
    type: 'string',
    describe: 'Specific commit SHA to check (optional, if not provided will fetch last 24h)'
  })
  .option('author', {
    type: 'string',
    describe: 'Filter commits by author username (optional)'
  })
  .option('mode', {
    type: 'string',
    choices: ['single', 'daily'],
    default: 'daily',
    describe: 'Mode: single commit or daily summary'
  })
  .option('tone', {
    type: 'string',
    default: 'pro',
    describe: 'Tone for the post (pro, devlife, fun, concise, detailed, optimistic)'
  })
  .option('skip-ai', {
    type: 'boolean',
    default: false,
    describe: 'Skip AI rewrite and use base posts directly (faster, avoids API limits)'
  })
  .help()
  .parse();

(async () => {
  const { repo, sha, author, mode, tone, skipAi } = argv;

  if (mode === 'single' && sha) {
    // Original single commit flow
    console.log(`\n━━━ SINGLE COMMIT MODE ━━━`);
    console.log(`Fetching commit ${sha} from ${repo}\n`);
    
    const rawPath = await fetchCommit(repo, sha);
    const rawCommit = JSON.parse((await import('fs')).readFileSync(rawPath, 'utf-8'));
    
    console.log('Extracting signals...');
    const signals = await extractCommitSignals(rawCommit);
    
    console.log('\n━━━ EXTRACTED SIGNALS ━━━\n');
    console.log(JSON.stringify(signals, null, 2));
    
    const analysis = analyzeCommit(signals);
    console.log('\n━━━ ANALYSIS RESULT ━━━\n');
    console.log(JSON.stringify(analysis, null, 2));
    
    // Use simple composition for single commit
    const basePost = `Made progress on ${repo}. ${analysis.totalFilesChanged} files changed, focusing on ${Object.keys(analysis.signals)[0] || 'improvements'}.`;
    
    if (skipAi) {
      console.log('\n━━━ FINAL POST (No AI Rewrite) ━━━\n');
      console.log(basePost);
    } else {
      const finalPost = await rewritePost({
        basePost,
        intent: analysis.impact,
        angle: Object.keys(analysis.signals)[0] || 'general',
        facts: {
          impact: analysis.impact,
          signals: analysis.signals
        },
        tone,
        constraints: {
          platform: 'linkedin',
          maxLength: 300,
          emoji: true
        }
      });
      
      console.log('\n━━━ FINAL POST ━━━\n');
      console.log(finalPost);
    }
  } else {
    // Enhanced daily mode
    console.log(`\n━━━ DAILY MODE (LAST 24 HOURS) ━━━`);
    console.log(`Fetching commits from ${repo}${author ? ` by ${author}` : ''}\n`);
    
    const commits = await fetchCommitsLast24Hours(repo, author);
    
    if (commits.length === 0) {
      console.log(' No commits found in the last 24 hours');
      return;
    }
    
    console.log(`\n✓ Found ${commits.length} commits\n`);
    
    // Process each commit
    const commitAnalyses = [];
    for (let i = 0; i < commits.length; i++) {
      const commit = commits[i];
      console.log(`\n--- Processing commit ${i + 1}/${commits.length}: ${commit.sha.substring(0, 7)} ---`);
      console.log(`Message: ${commit.commit.message.split('\n')[0]}`);
      
      const signals = await extractCommitSignals(commit);
      const analysis = analyzeCommit(signals);
      
      commitAnalyses.push({
        sha: commit.sha,
        message: commit.commit.message,
        author: commit.commit.author.name,
        date: commit.commit.author.date,
        files: commit.files,
        ...analysis
      });
    }
    
    // Aggregate analysis
    const aggregatedAnalysis = analyzeMultipleCommits(commitAnalyses);
    
    console.log('\n━━━ AGGREGATED ANALYSIS ━━━\n');
    console.log(JSON.stringify(aggregatedAnalysis, null, 2));
    
    // Generate enhanced post ideas
    const postIdeas = generatePostIdeas(aggregatedAnalysis);
    
    console.log('\n━━━ POST IDEAS (RANKED BY RELEVANCE) ━━━\n');
    
    for (let i = 0; i < postIdeas.length; i++) {
      const idea = postIdeas[i];
      console.log(`\n${i + 1}. ${idea.title} [Score: ${idea.relevanceScore}]`);
      console.log(`   Type: ${idea.type} | Angle: ${idea.angle}`);
      console.log(`   ${idea.description}`);
      if (idea.personalizedHooks) {
        console.log(`   Hooks: ${idea.personalizedHooks.slice(0, 2).join(' / ')}`);
      }
      console.log('   ---');
    }
    
    // Generate actual posts for top 3 ideas
    console.log('\n━━━ GENERATED POSTS (Top 3 Ideas) ━━━\n');
    
    const topIdeas = postIdeas.slice(0, 3);
    
    for (let i = 0; i < topIdeas.length; i++) {
      const idea = topIdeas[i];
      
      console.log(`\n┌─ POST ${i + 1}: ${idea.title} ─┐\n`);
      
      // Create personalized base post
      const basePost = composePost(idea, aggregatedAnalysis);
      
      console.log('BASE POST (Ready to use):');
      console.log('─'.repeat(60));
      console.log(basePost);
      console.log('─'.repeat(60));
      
      // Only rewrite with AI if not skipped
      if (!skipAi) {
        try {
          console.log('\nRewriting with AI...');
          
          // Simplified rewrite call with minimal data
          const finalPost = await rewritePost({
            basePost,
            intent: idea.type,
            angle: idea.angle,
            facts: {
              // Only send minimal facts to avoid token limit
              commits: aggregatedAnalysis.totalCommits,
              filesChanged: aggregatedAnalysis.totalFilesChanged
            },
            tone,
            constraints: {
              platform: 'linkedin',
              maxLength: 300,
              emoji: true
            }
          });
          
          console.log('\nAI REWRITTEN VERSION:');
          console.log('─'.repeat(60));
          console.log(finalPost);
          console.log('─'.repeat(60));
        } catch (error) {
          console.log('\n  AI rewrite failed (likely token limit). Using base post instead.');
          console.log(' Tip: Use --skip-ai flag to avoid this, or the base post is often better anyway!');
          console.log('Error:', error.message);
        }
      } else {
        console.log('\n✓ Skipped AI rewrite (--skip-ai flag enabled)');
      }
      
      console.log('\n└' + '─'.repeat(58) + '┘\n');
    }
  }
  
  console.log('\n✓ Done\n');
  
  if (!skipAi) {
    console.log(' TIP: Try --skip-ai flag to skip AI rewrite and use base posts directly');
    console.log('   Base posts are often more authentic and avoid API token limits!\n');
  }
})();
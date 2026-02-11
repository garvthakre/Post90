import dotenv from 'dotenv';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { fetchCommit, fetchCommitsLast24Hours, fetchUserRepos } from './fetch/github.js';
import { extractCommitSignals } from './extract/index.js';
import { analyzeCommit, analyzeMultipleCommits } from './analyze/commitAnalyzer.js';
import { generatePostIdeas } from './post/ideaGenerator.js';
import { composePost } from './post/Composer.js';
import { rewritePost } from './ai/rewrite.js';
import { generateStatsWidget, generateInlineStats } from './utils/statsWidget.js';
import { getFeatureEmoji, enrichPostWithEmojis } from './utils/emojiMapper.js';

dotenv.config();

const argv = yargs(hideBin(process.argv))
  .option('repo', {
    type: 'string',
    describe: 'GitHub repository (owner/repo). Optional if --author is provided'
  })
  .option('sha', {
    type: 'string',
    describe: 'Specific commit SHA (only for single commit mode with --repo)'
  })
  .option('author', {
    type: 'string',
    describe: 'GitHub username - automatically fetches ALL their public repos and commits'
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
  .option('variations', {
    type: 'number',
    default: 3,
    describe: 'Number of post variations to generate (1-10)'
  })
  .option('tones', {
    type: 'string',
    describe: 'Comma-separated list of tones (e.g., "pro,fun,concise")'
  })
  .option('use-emojis', {
    type: 'boolean',
    default: true,
    describe: 'Add contextual emojis to posts'
  })
  .option('stats-style', {
    type: 'string',
    choices: ['compact', 'detailed', 'minimal', 'none'],
    default: 'compact',
    describe: 'Style of stats widget to include'
  })
  .check((argv) => {
    // Validation: need either --repo or --author
    if (!argv.repo && !argv.author) {
      throw new Error('Must specify either --repo or --author');
    }
    return true;
  })
  .help()
  .example('$0 --author garvthakre', 'Fetch all commits from all repos by garvthakre')
  .example('$0 --repo garvthakre/Post90 --author garvthakre', 'Fetch only from specific repo')
  .parse();

(async () => {
  const { repo, sha, author, mode, tone, skipAi, variations, tones, useEmojis, statsStyle } = argv;

  // Validate variations
  const numVariations = Math.min(Math.max(variations, 1), 10);
  
  // Parse tones if provided
  let toneList = [tone];
  if (tones) {
    toneList = tones.split(',').map(t => t.trim());
  }

  if (mode === 'single' && sha) {
    // Single commit mode - requires specific repo
    if (!repo) {
      console.log('⚠ Single commit mode requires --repo');
      return;
    }
    
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
          emoji: useEmojis
        }
      });
      
      console.log('\n━━━ FINAL POST ━━━\n');
      console.log(finalPost);
    }
  } else {
    // Daily mode - fetch from all repos
    console.log(`\n━━━ DAILY MODE (LAST 24 HOURS) ━━━`);
    
    let repos;
    
    if (repo && author) {
      // Specific repo + author filter
      repos = [repo];
      console.log(`Repository: ${repo}`);
      console.log(`Filtering by author: @${author}\n`);
    } else if (author && !repo) {
      // Fetch ALL user's repos
      console.log(`Fetching all public repos for @${author}...\n`);
      repos = await fetchUserRepos(author);
      
      if (repos.length === 0) {
        console.log('⚠ No public repositories found');
        return;
      }
      
      console.log(`Found ${repos.length} repositories\n`);
    } else {
      // Just repo, no author filter
      repos = [repo];
      console.log(`Repository: ${repo}\n`);
    }
    
    // Fetch commits from all repos
    console.log('━━━ FETCHING COMMITS ━━━\n');
    const allCommits = [];
    const repoStats = {};
    
    for (const currentRepo of repos) {
      try {
        const commits = await fetchCommitsLast24Hours(currentRepo, author);
        
        if (commits.length > 0) {
          // Tag each commit with its repo
          commits.forEach(c => c._repo = currentRepo);
          allCommits.push(...commits);
          repoStats[currentRepo] = commits.length;
        }
      } catch (error) {
        console.log(`✗ Error fetching ${currentRepo}: ${error.message}`);
      }
    }
    
    if (allCommits.length === 0) {
      console.log('\n⚠ No commits found in the last 24 hours');
      return;
    }
    
    // Show summary
    console.log(`\n━━━ SUMMARY ━━━`);
    console.log(`✓ Total commits: ${allCommits.length}`);
    console.log(`✓ Repositories with commits: ${Object.keys(repoStats).length}\n`);
    
    if (Object.keys(repoStats).length > 1) {
      console.log('Per-repository breakdown:');
      for (const [repoName, count] of Object.entries(repoStats)) {
        console.log(`  • ${repoName}: ${count} commits`);
      }
      console.log('');
    }
    
    // Process each commit
    const commitAnalyses = [];
    for (let i = 0; i < allCommits.length; i++) {
      const commit = allCommits[i];
      console.log(`\n--- Processing commit ${i + 1}/${allCommits.length}: ${commit.sha.substring(0, 7)} ---`);
      console.log(`Repo: ${commit._repo}`);
      console.log(`Message: ${commit.commit.message.split('\n')[0]}`);
      
      const signals = await extractCommitSignals(commit);
      const analysis = analyzeCommit(signals);
      
      commitAnalyses.push({
        sha: commit.sha,
        message: commit.commit.message,
        author: commit.commit.author.name,
        date: commit.commit.author.date,
        files: commit.files,
        repo: commit._repo,
        ...analysis
      });
    }
    
    // Aggregate analysis
    const aggregatedAnalysis = analyzeMultipleCommits(commitAnalyses);
    
    // Add multi-repo metadata
    aggregatedAnalysis.repoCount = Object.keys(repoStats).length;
    aggregatedAnalysis.repos = Object.keys(repoStats);
    
    console.log('\n━━━ AGGREGATED ANALYSIS ━━━\n');
    console.log(JSON.stringify(aggregatedAnalysis, null, 2));
    
    // Generate stats widget
    if (statsStyle !== 'none') {
      console.log('\n━━━ GITHUB STATS ━━━\n');
      const statsWidget = generateStatsWidget(aggregatedAnalysis, { 
        style: statsStyle, 
        useEmojis 
      });
      console.log(statsWidget);
      
      if (aggregatedAnalysis.repoCount > 1) {
        console.log(`\n Across ${aggregatedAnalysis.repoCount} repositories:`);
        aggregatedAnalysis.repos.forEach(r => console.log(`   • ${r}`));
      }
      console.log('');
    }
    
    // Generate enhanced post ideas
    const postIdeas = generatePostIdeas(aggregatedAnalysis);
    
    console.log('\n━━━ POST IDEAS (RANKED BY RELEVANCE) ━━━\n');
    
    for (let i = 0; i < Math.min(postIdeas.length, 5); i++) {
      const idea = postIdeas[i];
      console.log(`\n${i + 1}. ${idea.title} [Score: ${idea.relevanceScore}]`);
      console.log(`   Type: ${idea.type} | Angle: ${idea.angle}`);
      console.log(`   ${idea.description}`);
      if (idea.personalizedHooks) {
        console.log(`   Hooks: ${idea.personalizedHooks.slice(0, 2).join(' / ')}`);
      }
      console.log('   ---');
    }
    
    // Generate actual posts for top ideas with variations
    console.log(`\n━━━ GENERATED POSTS (${numVariations} Variations) ━━━\n`);
    
    const topIdeas = postIdeas.slice(0, Math.min(numVariations, postIdeas.length));
    
    for (let i = 0; i < topIdeas.length; i++) {
      const idea = topIdeas[i];
      
      // Determine tone for this variation
      const currentTone = toneList[i % toneList.length] || 'pro';
      
      console.log(`\n┌─ VARIATION ${i + 1}/${numVariations}: ${idea.title} (Tone: ${currentTone}) ─┐\n`);
      
      // Create personalized base post
      let basePost = composePost(idea, aggregatedAnalysis);
      
      // Add multi-repo context if relevant
      if (aggregatedAnalysis.repoCount > 1) {
        const inlineStats = generateInlineStats(
          aggregatedAnalysis.totalCommits, 
          aggregatedAnalysis.totalFilesChanged
        );
        const lines = basePost.split('\n');
        lines.splice(1, 0, `\n${inlineStats} across ${aggregatedAnalysis.repoCount} projects`);
        basePost = lines.join('\n');
      } else if (statsStyle !== 'none' && !basePost.includes('📊')) {
        const inlineStats = generateInlineStats(
          aggregatedAnalysis.totalCommits, 
          aggregatedAnalysis.totalFilesChanged
        );
        const lines = basePost.split('\n');
        if (statsStyle === 'compact' && useEmojis) {
          lines.splice(1, 0, `\n${inlineStats}`);
        }
        basePost = lines.join('\n');
      }
      
      // Add emojis if requested
      if (useEmojis && idea.metadata?.feature) {
        const feature = idea.metadata.feature;
        const dominantSignal = Object.keys(aggregatedAnalysis.signals)
          .sort((a,b) => aggregatedAnalysis.signals[b] - aggregatedAnalysis.signals[a])[0];
        
        basePost = enrichPostWithEmojis(basePost, {
          feature,
          dominantSignal,
          impact: aggregatedAnalysis.impacts ? 
            (aggregatedAnalysis.impacts.HIGH_RISK > 0 ? 'HIGH_RISK' : 'MEDIUM_RISK') : 
            'LOW_RISK'
        });
      }
      
      console.log('BASE POST:');
      console.log('─'.repeat(60));
      console.log(basePost);
      console.log('─'.repeat(60));
      
      // Character count
      console.log(`\n Length: ${basePost.length} characters`);
      
      // Only rewrite with AI if not skipped
      if (!skipAi) {
        try {
          console.log(`\n Rewriting with AI (tone: ${currentTone})...`);
          
          const finalPost = await rewritePost({
            basePost,
            intent: idea.type,
            angle: idea.angle,
            facts: {
              commits: aggregatedAnalysis.totalCommits,
              filesChanged: aggregatedAnalysis.totalFilesChanged
            },
            tone: currentTone,
            constraints: {
              platform: 'linkedin',
              maxLength: 300,
              emoji: useEmojis
            }
          });
          
          console.log('\nAI REWRITTEN VERSION:');
          console.log('─'.repeat(60));
          console.log(finalPost);
          console.log('─'.repeat(60));
          console.log(`\n Length: ${finalPost.length} characters`);
        } catch (error) {
          console.log('\n  AI rewrite failed (likely token limit). Using base post instead.');
          console.log(' Tip: Use --skip-ai flag to avoid this');
          console.log(`Error: ${error.message}`);
        }
      } else {
        console.log('\n✓ Skipped AI rewrite (--skip-ai flag enabled)');
      }
      
      console.log('\n└' + '─'.repeat(58) + '┘\n');
    }
    
    // Summary
    console.log('\n━━━ SUMMARY ━━━\n');
    console.log(` Generated ${topIdeas.length} post variation${topIdeas.length > 1 ? 's' : ''}`);
    console.log(` Used tone${toneList.length > 1 ? 's' : ''}: ${toneList.join(', ')}`);
    console.log(` Commits analyzed: ${allCommits.length}`);
    console.log(` Repositories: ${aggregatedAnalysis.repoCount}`);
    console.log(` Stats style: ${statsStyle}`);
    console.log(` Emojis: ${useEmojis ? 'enabled' : 'disabled'}`);
  }
  
  console.log('\n✓ Done\n');
  
  console.log(' USAGE TIPS:');
  console.log('   Simplest: --author garvthakre (fetches ALL your repos)');
  console.log('   Specific repo: --repo owner/repo --author username');
  console.log('   Try --variations 5 for more options');
  console.log('   Use --tones "pro,fun,concise" for different styles');
  console.log('   Use --skip-ai for faster generation\n');
})();
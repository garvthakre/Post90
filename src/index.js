import dotenv from 'dotenv';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { fetchCommit, fetchCommitsLast24Hours } from './fetch/github.js';
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
  .option('variations', {
    type: 'number',
    default: 3,
    describe: 'Number of post variations to generate (1-10)'
  })
  .option('tones', {
    type: 'string',
    describe: 'Comma-separated list of tones to use for variations (e.g., "pro,fun,concise")'
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
  .help()
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
          emoji: useEmojis
        }
      });
      
      console.log('\n━━━ FINAL POST ━━━\n');
      console.log(finalPost);
    }
  } else {
    // Enhanced daily mode with variations
    console.log(`\n━━━ DAILY MODE (LAST 24 HOURS) ━━━`);
    console.log(`Fetching commits from ${repo}${author ? ` by ${author}` : ''}\n`);
    
    const commits = await fetchCommitsLast24Hours(repo, author);
    
    if (commits.length === 0) {
      console.log('⚠ No commits found in the last 24 hours');
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
    
    // Generate stats widget
    if (statsStyle !== 'none') {
      console.log('\n━━━ GITHUB STATS ━━━\n');
      const statsWidget = generateStatsWidget(aggregatedAnalysis, { 
        style: statsStyle, 
        useEmojis 
      });
      console.log(statsWidget);
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
      
      // Add stats widget if requested
      if (statsStyle !== 'none' && !basePost.includes('📊')) {
        const inlineStats = generateInlineStats(
          aggregatedAnalysis.totalCommits, 
          aggregatedAnalysis.totalFilesChanged
        );
        // Add stats at the beginning or after first line
        const lines = basePost.split('\n');
        if (statsStyle === 'compact' && useEmojis) {
          lines.splice(1, 0, `\n📊 ${inlineStats}`);
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
      console.log(`\n📏 Length: ${basePost.length} characters`);
      
      // Only rewrite with AI if not skipped
      if (!skipAi) {
        try {
          console.log(`\nRewriting with AI (tone: ${currentTone})...`);
          
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
          console.log(`\n📏 Length: ${finalPost.length} characters`);
        } catch (error) {
          console.log('\n⚠️  AI rewrite failed (likely token limit). Using base post instead.');
          console.log('💡 Tip: Use --skip-ai flag to avoid this, or the base post is often better anyway!');
          console.log('Error:', error.message);
        }
      } else {
        console.log('\n✓ Skipped AI rewrite (--skip-ai flag enabled)');
      }
      
      console.log('\n└' + '─'.repeat(58) + '┘\n');
    }
    
    // Summary
    console.log('\n━━━ SUMMARY ━━━\n');
    console.log(`✓ Generated ${topIdeas.length} post variation${topIdeas.length > 1 ? 's' : ''}`);
    console.log(`✓ Used tone${toneList.length > 1 ? 's' : ''}: ${toneList.join(', ')}`);
    console.log(`✓ Stats style: ${statsStyle}`);
    console.log(`✓ Emojis: ${useEmojis ? 'enabled' : 'disabled'}`);
  }
  
  console.log('\n✓ Done\n');
  
  console.log('💡 TIPS:');
  console.log('  • Try --variations 5 to generate more options');
  console.log('  • Use --tones "pro,fun,concise" for different styles');
  console.log('  • Add --stats-style detailed for more GitHub stats');
  console.log('  • Use --skip-ai for faster generation\n');
})();
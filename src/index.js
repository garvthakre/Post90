import dotenv from 'dotenv';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { fetchCommit, fetchCommitsLast24Hours } from './fetch/github.js';
import { extractCommitSignals } from './extract/index.js';
import { analyzeCommit, analyzeMultipleCommits } from './analyze/commitAnalyzer.js';
import { generatePostIdeas } from './post/ideaGenerator.js';
import { composePost } from './post/composer.js';
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
  .help()
  .parse();

(async () => {
  const { repo, sha, author, mode, tone } = argv;

  if (mode === 'single' && sha) {
    // Original single commit flow
    console.log(`\n  SINGLE COMMIT MODE `);
    console.log(`Fetching commit ${sha} from ${repo}\n`);
    
    const rawPath = await fetchCommit(repo, sha);
    const rawCommit = JSON.parse((await import('fs')).readFileSync(rawPath, 'utf-8'));
    
    console.log('Extracting signals...');
    const signals = await extractCommitSignals(rawCommit);
    
    console.log('\n EXTRACTED SIGNALS:\n');
    console.log(JSON.stringify(signals, null, 2));
    
    const analysis = analyzeCommit(signals);
    console.log('\n ANALYSIS RESULT:\n');
    console.log(JSON.stringify(analysis, null, 2));
    
    const basePost = composePost(analysis);
    console.log('\n BASE POST:\n');
    console.log(basePost);
    
    const finalPost = await rewritePost({
      basePost,
      intent: analysis.intent,
      angle: analysis.angle,
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
    
    console.log('\n FINAL POST:\n');
    console.log(finalPost);
  } else {
    // New daily mode - fetch all commits from last 24 hours
    console.log(`\nDAILY MODE (LAST 24 HOURS) `);
    console.log(`Fetching commits from ${repo}${author ? ` by ${author}` : ''}\n`);
    
    const commits = await fetchCommitsLast24Hours(repo, author);
    
    if (commits.length === 0) {
      console.log(' No commits found in the last 24 hours');
      return;
    }
    
    console.log(`\n Found ${commits.length} commits\n`);
    
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
        ...analysis
      });
    }
    
    // Aggregate analysis
    const aggregatedAnalysis = analyzeMultipleCommits(commitAnalyses);
 
    console.log(' AGGREGATED ANALYSIS');
 
    console.log(JSON.stringify(aggregatedAnalysis, null, 2));
    
    // Generate post ideas
    const postIdeas = generatePostIdeas(aggregatedAnalysis);
    
 
    console.log(' POST IDEAS');
 
    
    for (let i = 0; i < postIdeas.length; i++) {
      const idea = postIdeas[i];
      console.log(`\n${i + 1}. ${idea.title}`);
      console.log(`   Type: ${idea.type} | Angle: ${idea.angle}`);
      console.log(`   ${idea.description}`);
      console.log(`   Metadata:`, JSON.stringify(idea.metadata, null, 2));
      console.log('   ---');
    }
    
    // Generate actual posts for top 3 ideas
 
    console.log(' GENERATED POSTS (Top 3 Ideas)');
 
    
    const topIdeas = postIdeas.slice(0, 3);
    
    for (let i = 0; i < topIdeas.length; i++) {
      const idea = topIdeas[i];
 
      console.log(`POST ${i + 1}: ${idea.title}`);
 
      
      // Create a base post from the idea
      const basePost = createBasePostFromIdea(idea, aggregatedAnalysis);
      
      const finalPost = await rewritePost({
        basePost,
        intent: idea.type,
        angle: idea.angle,
        facts: {
          ...idea.metadata,
          signals: aggregatedAnalysis.signals
        },
        analysis: aggregatedAnalysis,
        tone,
        constraints: {
          platform: 'linkedin',
          maxLength: 300,
          emoji: true
        }
      });
      
      console.log(finalPost);
      console.log('\n');
    }
  }
  
  console.log('\n Done\n');
})();

function createBasePostFromIdea(idea, analysis) {
  // Return early with the appropriate template based on idea.type
  switch(idea.type) {
    case 'daily_summary':
      return `Made ${idea.metadata.commits} commits today. ${idea.metadata.filesChanged} files changed. ${analysis.totalWeight} lines of code touched. Every commit is progress.`;
    
    case 'focused_technical':
      return `Focused on ${idea.metadata.signal.replace(/_/g, ' ')} today. ${idea.metadata.count} instances across the codebase. Sometimes deep work means touching the same patterns repeatedly until they're right.`;
    
    case 'learning':
      return `Worked extensively with async patterns today. ${idea.metadata.async_changes || 0} async changes, ${idea.metadata.promise_changes || 0} promise updates. Still learning, always improving.`;
    
    case 'build_in_public':
      return `Updated documentation today. ${idea.metadata.doc_changes} documentation changes. Good docs make projects 10x easier to understand.`;
    
    case 'technical_decision':
      return `Made ${idea.metadata.highRiskCommits} high-risk changes today. Networking and environment changes require careful consideration. Engineering is about managing trade-offs.`;
    
    case 'engineering_practice':
      return `Big refactor: ${idea.metadata.linesChanged} lines changed across ${idea.metadata.commits} commits. Large changes are risky but necessary for long-term maintainability.`;
    
    case 'quality':
      return `Focused on testing today. ${idea.metadata.testChanges} test updates. Good tests are the foundation of reliable software.`;
    
    case 'variety':
      return `Full-stack day: worked on ${idea.metadata.signalTypes} different types of tasks. From ${(idea.metadata.signals || []).slice(0, 3).join(', ')} and more. Variety keeps things interesting.`;
    
    default:
      return `Made progress on ${idea.title}. Building in public, one day at a time.`;
  }
}
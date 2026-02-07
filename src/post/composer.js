/**
 * Enhanced Post Composer
 * Generates personalized, story-driven posts based on actual commit data
 */

export function composePost(idea, aggregatedAnalysis) {
  const { commits, signals, totalWeight, totalFilesChanged } = aggregatedAnalysis;
  
  // Extract real commit messages and patterns
  const commitMessages = commits.map(c => c.message.split('\n')[0]);
  const firstCommit = commits[0];
  const lastCommit = commits[commits.length - 1];
  
  // Build narrative components
  const narrative = buildNarrative(idea, aggregatedAnalysis, commitMessages);
  const context = buildContext(idea, aggregatedAnalysis);
  const reflection = buildReflection(idea, aggregatedAnalysis);
  const hook = buildHook(idea, aggregatedAnalysis);
  
  // Compose the post with natural flow
  return composeNaturalPost({
    hook,
    narrative,
    context,
    reflection,
    idea,
    aggregatedAnalysis
  });
}

function buildHook(idea, analysis) {
  const { totalCommits, signals, totalWeight } = analysis;
  
  switch(idea.type) {
    case 'daily_summary':
      if (totalCommits > 10) {
        return `${totalCommits} commits today. One of those days where you look up and realize you've been in the zone for hours.`;
      }
      return `Wrapped up today with ${totalCommits} commits.`;
    
    case 'focused_technical':
      const signalName = formatSignalForReading(idea.metadata.signal);
      return `Spent most of today deep in ${signalName}.`;
    
    case 'learning':
      return `Hit a learning curve today with async patterns.`;
    
    case 'build_in_public':
      return `Took a step back from features today to focus on documentation.`;
    
    case 'technical_decision':
      return `Made some decisions today that needed more thought than usual.`;
    
    case 'engineering_practice':
      return `${totalWeight} lines changed across ${totalCommits} commits. Big refactor day.`;
    
    case 'quality':
      return `Testing day. Not the most glamorous work, but necessary.`;
    
    case 'variety':
      return `Full-stack kind of day.`;
    
    default:
      return `Made progress today.`;
  }
}

function buildNarrative(idea, analysis, commitMessages) {
  const { totalCommits, signals, totalWeight, totalFilesChanged, commits } = analysis;
  
  // Extract actual work done
  const fileTypes = extractFileTypes(commits);
  const keyChanges = extractKeyChanges(signals);
  
  switch(idea.type) {
    case 'daily_summary':
      const fileTypesStr = fileTypes.slice(0, 3).join(', ');
      return `Touched ${totalFilesChanged} files - mostly ${fileTypesStr}. ${keyChanges[0] || 'Various improvements'} was the main theme.`;
    
    case 'focused_technical':
      const count = idea.metadata.count;
      return `${count} separate instances of ${formatSignalForReading(idea.metadata.signal)} across the codebase. Started with one file, realized the pattern was everywhere, ended up doing a systematic pass.`;
    
    case 'learning':
      const asyncCount = idea.metadata.async_changes || 0;
      const promiseCount = idea.metadata.promise_changes || 0;
      return `Working with ${asyncCount} async changes and ${promiseCount} promise updates. The tricky part isn't writing async code - it's handling all the edge cases when things don't resolve as expected.`;
    
    case 'build_in_public':
      const docCount = idea.metadata.doc_changes;
      return `${docCount} documentation updates. Added examples, fixed outdated sections, made sure the README actually reflects what the project does now.`;
    
    case 'technical_decision':
      const highRisk = idea.metadata.highRiskCommits;
      return `${highRisk} commits that touched networking or environment config. These aren't the kind of changes you make lightly - one wrong env variable and things break in production.`;
    
    case 'engineering_practice':
      return `What started as "let me just clean this up" turned into ${totalCommits} commits and ${totalWeight} lines of changes. Sometimes you pull one thread and the whole sweater unravels - in a good way.`;
    
    case 'quality':
      const testCount = idea.metadata.testChanges;
      return `Added and updated ${testCount} tests. The kind of work that doesn't show up in demos but saves hours of debugging later.`;
    
    case 'variety':
      const signalList = Object.keys(signals).slice(0, 4).map(formatSignalForReading);
      return `Jumped between ${signalList.join(', ')}. One of those days where you're touching everything from frontend to infrastructure.`;
    
    default:
      return `Working through the backlog, one commit at a time.`;
  }
}

function buildContext(idea, analysis) {
  const { signals, totalWeight } = analysis;
  
  switch(idea.type) {
    case 'focused_technical':
      return `The codebase was inconsistent - some files using one pattern, others using another. Better to fix it all at once than let it drift further apart.`;
    
    case 'learning':
      return `Async JavaScript still catches me sometimes. You think you understand it, then you hit a race condition or an unhandled rejection that reminds you there's always more to learn.`;
    
    case 'build_in_public':
      return `Good documentation is the difference between someone understanding your project in 5 minutes versus giving up and moving on. Worth the investment.`;
    
    case 'technical_decision':
      return `These changes needed testing, double-checking, and a clear rollback plan. Engineering isn't just about making things work - it's about making sure they keep working.`;
    
    case 'engineering_practice':
      return `The refactor was overdue. Code had accumulated enough cruft that adding new features was getting harder. Sometimes you need to stop and clean house.`;
    
    case 'quality':
      return `Tests are insurance. They don't prevent bugs, but they catch them before users do. And they let you refactor with confidence.`;
    
    default:
      return null;
  }
}

function buildReflection(idea, analysis) {
  switch(idea.type) {
    case 'daily_summary':
      return `Not every day needs to be about shipping features. Sometimes it's about making the foundation stronger.`;
    
    case 'focused_technical':
      return `Consistency compounds. Fix patterns once, benefit every time you touch that code.`;
    
    case 'learning':
      return `Still learning. Always will be. That's why this work stays interesting.`;
    
    case 'build_in_public':
      return `Documentation is code. Treat it with the same care.`;
    
    case 'technical_decision':
      return `Good engineering is mostly boring. It's careful, measured, and defensive. That's what makes it reliable.`;
    
    case 'engineering_practice':
      return `Refactoring feels indulgent until you try to add a feature to messy code. Then it feels essential.`;
    
    case 'quality':
      return `The best code is the code that works when you're not watching.`;
    
    case 'variety':
      return `Full-stack work keeps you sharp. You can't hide behind specialization when you're responsible for everything.`;
    
    default:
      return `Progress over perfection. Ship it, learn from it, improve it.`;
  }
}

function composeNaturalPost({ hook, narrative, context, reflection, idea }) {
  const parts = [hook, narrative];
  
  if (context) {
    parts.push(context);
  }
  
  parts.push(reflection);
  
  // Join with double line breaks for readability
  return parts.filter(Boolean).join('\n\n');
}

function extractFileTypes(commits) {
  const extensions = new Set();
  
  for (const commit of commits) {
    if (commit.files) {
      for (const file of commit.files) {
        const ext = file.filename.split('.').pop();
        if (ext.length < 5) { // Reasonable extension length
          extensions.add(ext);
        }
      }
    }
  }
  
  const extArray = Array.from(extensions);
  const displayMap = {
    'js': 'JavaScript',
    'ts': 'TypeScript',
    'jsx': 'React',
    'tsx': 'React/TS',
    'md': 'docs',
    'json': 'config',
    'css': 'styles',
    'scss': 'styles',
  };
  
  return extArray.map(ext => displayMap[ext] || ext);
}

function extractKeyChanges(signals) {
  const signalPriority = [
    'async_change',
    'networking_change',
    'error_handling_change',
    'test_change',
    'promise_change',
    'function_change',
    'import_change',
  ];
  
  const found = [];
  for (const signal of signalPriority) {
    if (signals[signal]) {
      found.push(formatSignalForReading(signal));
    }
  }
  
  return found;
}

function formatSignalForReading(signal) {
  const readableMap = {
    'async_change': 'async/await patterns',
    'networking_change': 'API calls',
    'error_handling_change': 'error handling',
    'test_change': 'testing',
    'promise_change': 'promise handling',
    'function_change': 'function refactoring',
    'import_change': 'dependency updates',
    'class_change': 'class structures',
    'logging_change': 'logging',
    'jsx_change': 'React components',
    'vue_change': 'Vue components',
    'doc_image_change': 'documentation images',
    'doc_heading_change': 'documentation structure',
    'doc_link_change': 'documentation links',
    'env_variable_change': 'environment config',
  };
  
  return readableMap[signal] || signal.replace(/_/g, ' ');
}
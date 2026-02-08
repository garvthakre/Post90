import { extractFeatureFromCommits } from '../analyze/commitAnalyzer.js';

/**
 * Enhanced Post Ideas Generator - LinkedIn-Ready Version
 * Generates specific, personalized post ideas based on actual commit patterns
 * Now includes feature context for better post generation
 */

export function generatePostIdeas(aggregatedAnalysis) {
  const ideas = [];
  const { totalCommits, signals, impacts, totalWeight, commits } = aggregatedAnalysis;
  
  // Extract the actual feature/topic
  const feature = extractFeatureFromCommits(commits);
  
  // Analyze patterns in commit messages
  const commitPatterns = analyzeCommitPatterns(commits);
  const timeSpan = calculateTimeSpan(commits);
  const workPattern = detectWorkPattern(signals, totalWeight, totalCommits);
  
  // Generate ideas based on detected patterns
  
  // 1. If there's a clear focus area (one signal dominates)
  const dominantSignal = findDominantSignal(signals);
  if (dominantSignal && dominantSignal.percentage > 40) {
    ideas.push(createFocusedWorkIdea(dominantSignal, commits, workPattern, feature));
  }
  
  // 2. If there's a learning/struggle pattern (lots of async, error handling)
  if (signals.async_change > 3 || signals.error_handling_change > 3 || signals.promise_change > 3) {
    ideas.push(createLearningJourneyIdea(signals, commits, commitPatterns, feature));
  }
  
  // 3. If there's documentation work
  const docSignals = (signals.doc_image_change || 0) + (signals.doc_heading_change || 0) + 
                     (signals.doc_link_change || 0) + (signals.doc_tech_stack_change || 0);
  if (docSignals > 0) {
    ideas.push(createDocumentationStoryIdea(signals, commits, docSignals, feature));
  }
  
  // 4. If there are high-risk changes
  if (impacts.HIGH_RISK > 0) {
    ideas.push(createRiskManagementIdea(signals, impacts, commits, feature));
  }
  
  // 5. If it's a large refactor
  if (totalWeight > 500 && totalCommits > 5) {
    ideas.push(createRefactorStoryIdea(totalWeight, totalCommits, commits, signals, feature));
  }
  
  // 6. If there's test work
  if (signals.test_change > 2) {
    ideas.push(createTestingQualityIdea(signals.test_change, commits, feature));
  }
  
  // 7. If it's a variety day (many different types of work)
  const signalTypes = Object.keys(signals).length;
  if (signalTypes >= 5) {
    ideas.push(createFullStackDayIdea(signals, commits, signalTypes, feature));
  }
  
  // 8. If there's a specific technical challenge (networking, env vars)
  if (signals.networking_change > 0 || signals.env_variable_change > 0) {
    ideas.push(createTechnicalChallengeIdea(signals, commits, feature));
  }
  
  // 9. Generic daily summary (always include as fallback)
  ideas.push(createDailySummaryIdea(aggregatedAnalysis, commitPatterns, timeSpan, feature));
  
  // 10. If there's a consistent theme in commit messages
  if (commitPatterns.theme) {
    ideas.push(createThematicWorkIdea(commitPatterns, commits, signals, feature));
  }
  
  // Sort by relevance score
  return ideas.sort((a, b) => b.relevanceScore - a.relevanceScore);
}

function createFocusedWorkIdea(dominantSignal, commits, workPattern, feature) {
  const readableName = formatSignalForReading(dominantSignal.signal);
  
  return {
    type: 'focused_technical',
    angle: dominantSignal.signal,
    title: `Deep Work: ${feature}`,
    description: `A day spent focusing on ${feature.toLowerCase()}`,
    relevanceScore: dominantSignal.percentage,
    metadata: {
      signal: dominantSignal.signal,
      count: dominantSignal.count,
      percentage: dominantSignal.percentage,
      affectedFiles: getAffectedFileCount(commits, dominantSignal.signal),
      pattern: workPattern,
      feature: feature
    },
    personalizedHooks: [
      `Built ${feature.toLowerCase()} today`,
      `Worked on ${feature.toLowerCase()}`,
      `Spent the day on ${feature.toLowerCase()}`
    ]
  };
}

function createLearningJourneyIdea(signals, commits, commitPatterns, feature) {
  const asyncCount = signals.async_change || 0;
  const errorCount = signals.error_handling_change || 0;
  const promiseCount = signals.promise_change || 0;
  
  const learningIndicators = detectLearningIndicators(commits);
  
  return {
    type: 'learning',
    angle: 'async_complexity',
    title: `Learning: ${feature}`,
    description: `Real learning experience with ${feature.toLowerCase()}`,
    relevanceScore: 80,
    metadata: {
      async_changes: asyncCount,
      error_handling: errorCount,
      promise_changes: promiseCount,
      iterations: commitPatterns.iterations || 0,
      learningIndicators,
      feature: feature
    },
    personalizedHooks: [
      `Worked on ${feature.toLowerCase()} today`,
      `Hit a learning curve with ${feature.toLowerCase()}`,
      `Learned a lot about ${feature.toLowerCase()} today`
    ]
  };
}

function createDocumentationStoryIdea(signals, commits, docSignals, feature) {
  const docTypes = [];
  if (signals.doc_image_change) docTypes.push('images');
  if (signals.doc_heading_change) docTypes.push('structure');
  if (signals.doc_link_change) docTypes.push('links');
  
  return {
    type: 'build_in_public',
    angle: 'documentation',
    title: `Documentation: ${feature}`,
    description: `Improving documentation for ${feature.toLowerCase()}`,
    relevanceScore: 70,
    metadata: {
      doc_changes: docSignals,
      types: docTypes,
      filesUpdated: getDocFilesUpdated(commits),
      feature: feature
    },
    personalizedHooks: [
      `Took a break from features to document ${feature.toLowerCase()}`,
      `Documentation day for ${feature.toLowerCase()}`,
      `Made the docs better for ${feature.toLowerCase()}`
    ]
  };
}

function createRiskManagementIdea(signals, impacts, commits, feature) {
  const riskFactors = [];
  if (signals.networking_change) riskFactors.push('API changes');
  if (signals.env_variable_change) riskFactors.push('env config');
  if (signals.async_change) riskFactors.push('async flow');
  
  return {
    type: 'technical_decision',
    angle: 'risk_management',
    title: `Technical Decisions: ${feature}`,
    description: `Careful engineering on ${feature.toLowerCase()}`,
    relevanceScore: 90,
    metadata: {
      highRiskCommits: impacts.HIGH_RISK,
      riskFactors,
      safeguards: detectSafeguards(signals),
      feature: feature
    },
    personalizedHooks: [
      `Made some technical decisions on ${feature.toLowerCase()}`,
      `Careful work on ${feature.toLowerCase()} today`,
      `${feature} required extra thought today`
    ]
  };
}

function createRefactorStoryIdea(totalWeight, totalCommits, commits, signals, feature) {
  const refactorReasons = detectRefactorReasons(signals, commits);
  
  return {
    type: 'engineering_practice',
    angle: 'refactoring',
    title: `Big Refactor: ${feature}`,
    description: `Refactoring ${feature.toLowerCase()}`,
    relevanceScore: 85,
    metadata: {
      linesChanged: totalWeight,
      commits: totalCommits,
      reasons: refactorReasons,
      scope: categorizeRefactorScope(signals),
      feature: feature
    },
    personalizedHooks: [
      `${totalWeight} lines changed in ${feature.toLowerCase()}`,
      `Big refactor on ${feature.toLowerCase()}`,
      `Cleaned up ${feature.toLowerCase()} today`
    ]
  };
}

function createTestingQualityIdea(testCount, commits, feature) {
  return {
    type: 'quality',
    angle: 'testing',
    title: `Testing: ${feature}`,
    description: `Building test coverage for ${feature.toLowerCase()}`,
    relevanceScore: 75,
    metadata: {
      testChanges: testCount,
      coverage: 'improved',
      testTypes: detectTestTypes(commits),
      feature: feature
    },
    personalizedHooks: [
      `Testing day for ${feature.toLowerCase()}`,
      `Added tests for ${feature.toLowerCase()}`,
      `Building confidence in ${feature.toLowerCase()}`
    ]
  };
}

function createFullStackDayIdea(signals, commits, signalTypes, feature) {
  const areas = categorizeDayAreas(signals);
  
  return {
    type: 'variety',
    angle: 'full_stack',
    title: `Full-Stack: ${feature}`,
    description: `Working across the stack on ${feature.toLowerCase()}`,
    relevanceScore: 65,
    metadata: {
      signalTypes,
      areas,
      breadth: 'high',
      feature: feature
    },
    personalizedHooks: [
      `Full-stack day on ${feature.toLowerCase()}`,
      `Touched everything while working on ${feature.toLowerCase()}`,
      `From frontend to backend on ${feature.toLowerCase()}`
    ]
  };
}

function createTechnicalChallengeIdea(signals, commits, feature) {
  const challenges = [];
  if (signals.networking_change) challenges.push('API integration');
  if (signals.env_variable_change) challenges.push('configuration');
  
  return {
    type: 'technical_decision',
    angle: 'infrastructure',
    title: `Infrastructure: ${feature}`,
    description: `Technical infrastructure work on ${feature.toLowerCase()}`,
    relevanceScore: 80,
    metadata: {
      challenges,
      complexity: 'high',
      feature: feature
    },
    personalizedHooks: [
      `Infrastructure work on ${feature.toLowerCase()}`,
      `Behind-the-scenes work on ${feature.toLowerCase()}`,
      `Technical challenges in ${feature.toLowerCase()}`
    ]
  };
}

function createDailySummaryIdea(aggregatedAnalysis, commitPatterns, timeSpan, feature) {
  const { totalCommits, totalFilesChanged, totalWeight } = aggregatedAnalysis;
  
  return {
    type: 'daily_summary',
    angle: 'productivity',
    title: `Daily Update: ${feature}`,
    description: `Progress on ${feature.toLowerCase()}`,
    relevanceScore: 50,
    metadata: {
      commits: totalCommits,
      filesChanged: totalFilesChanged,
      totalWeight,
      timeSpan,
      theme: commitPatterns.theme || 'mixed work',
      feature: feature
    },
    personalizedHooks: [
      `${totalCommits} commits on ${feature.toLowerCase()} today`,
      `Made progress on ${feature.toLowerCase()}`,
      `Productive day on ${feature.toLowerCase()}`
    ]
  };
}

function createThematicWorkIdea(commitPatterns, commits, signals, feature) {
  return {
    type: 'focused_effort',
    angle: 'thematic',
    title: `Focused Work: ${feature}`,
    description: `Consistent work on ${feature.toLowerCase()}`,
    relevanceScore: 75,
    metadata: {
      theme: commitPatterns.theme,
      commits: commits.length,
      consistency: commitPatterns.consistency,
      feature: feature
    },
    personalizedHooks: [
      `Focused session on ${feature.toLowerCase()}`,
      `All commits pointed to ${feature.toLowerCase()}`,
      `Deep work on ${feature.toLowerCase()}`
    ]
  };
}

// Helper functions

function findDominantSignal(signals) {
  const entries = Object.entries(signals);
  if (entries.length === 0) return null;
  
  const total = entries.reduce((sum, [_, count]) => sum + count, 0);
  entries.sort((a, b) => b[1] - a[1]);
  
  const [signal, count] = entries[0];
  const percentage = Math.round((count / total) * 100);
  
  return { signal, count, percentage };
}

function analyzeCommitPatterns(commits) {
  const messages = commits.map(c => c.message.split('\n')[0].toLowerCase());
  
  // Look for common words/themes
  const words = messages.flatMap(m => m.split(/\s+/));
  const wordFreq = {};
  
  for (const word of words) {
    if (word.length > 3 && !isCommonWord(word)) {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    }
  }
  
  const topWord = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])[0];
  
  return {
    theme: topWord ? topWord[0] : null,
    consistency: topWord ? topWord[1] / commits.length : 0,
    iterations: messages.filter(m => m.includes('fix') || m.includes('update')).length
  };
}

function calculateTimeSpan(commits) {
  if (commits.length === 0) return 'unknown';
  
  const times = commits.map(c => new Date(c.date).getTime());
  const span = (Math.max(...times) - Math.min(...times)) / (1000 * 60 * 60);
  
  if (span < 2) return 'concentrated burst';
  if (span < 6) return 'morning/afternoon';
  return 'full day';
}

function detectWorkPattern(signals, totalWeight, totalCommits) {
  if (totalCommits > 15 && totalWeight < 300) return 'iterative';
  if (totalCommits < 5 && totalWeight > 500) return 'big changes';
  return 'steady progress';
}

function getAffectedFileCount(commits, signal) {
  // Simplified - in real implementation, track which files had which signals
  return Math.min(commits.length * 2, 20);
}

function detectLearningIndicators(commits) {
  const messages = commits.map(c => c.message.toLowerCase());
  const indicators = [];
  
  if (messages.some(m => m.includes('fix') || m.includes('correct'))) {
    indicators.push('iterative fixes');
  }
  if (messages.some(m => m.includes('refactor') || m.includes('improve'))) {
    indicators.push('improvements');
  }
  
  return indicators;
}

function getDocFilesUpdated(commits) {
  const docFiles = new Set();
  for (const commit of commits) {
    if (commit.files) {
      commit.files
        .filter(f => f.filename.endsWith('.md'))
        .forEach(f => docFiles.add(f.filename));
    }
  }
  return Array.from(docFiles);
}

function detectSafeguards(signals) {
  const safeguards = [];
  if (signals.error_handling_change) safeguards.push('error handling');
  if (signals.test_change) safeguards.push('tests');
  return safeguards;
}

function detectRefactorReasons(signals, commits) {
  const reasons = [];
  if (signals.function_change > 5) reasons.push('function organization');
  if (signals.import_change > 3) reasons.push('dependency cleanup');
  if (signals.class_change > 2) reasons.push('class structure');
  return reasons;
}

function categorizeRefactorScope(signals) {
  const types = Object.keys(signals).length;
  if (types > 6) return 'wide-ranging';
  if (types > 3) return 'targeted';
  return 'focused';
}

function detectTestTypes(commits) {
  // Simplified - could analyze test file content
  return ['unit tests'];
}

function categorizeDayAreas(signals) {
  const areas = [];
  if (signals.jsx_change || signals.vue_change) areas.push('frontend');
  if (signals.networking_change) areas.push('API layer');
  if (signals.test_change) areas.push('testing');
  if (signals.doc_image_change || signals.doc_heading_change) areas.push('documentation');
  return areas;
}

function isCommonWord(word) {
  const common = ['the', 'and', 'for', 'add', 'update', 'fix', 'with', 'from', 'this', 'that'];
  return common.includes(word);
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
  };
  
  return readableMap[signal] || signal.replace(/_/g, ' ');
}
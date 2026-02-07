/**
 * Enhanced Post Ideas Generator
 * Generates specific, personalized post ideas based on actual commit patterns
 */

export function generatePostIdeas(aggregatedAnalysis) {
  const ideas = [];
  const { totalCommits, signals, impacts, totalWeight, commits } = aggregatedAnalysis;
  
  // Analyze patterns in commit messages
  const commitPatterns = analyzeCommitPatterns(commits);
  const timeSpan = calculateTimeSpan(commits);
  const workPattern = detectWorkPattern(signals, totalWeight, totalCommits);
  
  // Generate ideas based on detected patterns
  
  // 1. If there's a clear focus area (one signal dominates)
  const dominantSignal = findDominantSignal(signals);
  if (dominantSignal && dominantSignal.percentage > 40) {
    ideas.push(createFocusedWorkIdea(dominantSignal, commits, workPattern));
  }
  
  // 2. If there's a learning/struggle pattern (lots of async, error handling)
  if (signals.async_change > 3 || signals.error_handling_change > 3 || signals.promise_change > 3) {
    ideas.push(createLearningJourneyIdea(signals, commits, commitPatterns));
  }
  
  // 3. If there's documentation work
  const docSignals = (signals.doc_image_change || 0) + (signals.doc_heading_change || 0) + 
                     (signals.doc_link_change || 0) + (signals.doc_tech_stack_change || 0);
  if (docSignals > 0) {
    ideas.push(createDocumentationStoryIdea(signals, commits, docSignals));
  }
  
  // 4. If there are high-risk changes
  if (impacts.HIGH_RISK > 0) {
    ideas.push(createRiskManagementIdea(signals, impacts, commits));
  }
  
  // 5. If it's a large refactor
  if (totalWeight > 500 && totalCommits > 5) {
    ideas.push(createRefactorStoryIdea(totalWeight, totalCommits, commits, signals));
  }
  
  // 6. If there's test work
  if (signals.test_change > 2) {
    ideas.push(createTestingQualityIdea(signals.test_change, commits));
  }
  
  // 7. If it's a variety day (many different types of work)
  const signalTypes = Object.keys(signals).length;
  if (signalTypes >= 5) {
    ideas.push(createFullStackDayIdea(signals, commits, signalTypes));
  }
  
  // 8. If there's a specific technical challenge (networking, env vars)
  if (signals.networking_change > 0 || signals.env_variable_change > 0) {
    ideas.push(createTechnicalChallengeIdea(signals, commits));
  }
  
  // 9. Generic daily summary (always include as fallback)
  ideas.push(createDailySummaryIdea(aggregatedAnalysis, commitPatterns, timeSpan));
  
  // 10. If there's a consistent theme in commit messages
  if (commitPatterns.theme) {
    ideas.push(createThematicWorkIdea(commitPatterns, commits, signals));
  }
  
  // Sort by relevance score
  return ideas.sort((a, b) => b.relevanceScore - a.relevanceScore);
}

function createFocusedWorkIdea(dominantSignal, commits, workPattern) {
  const readableName = formatSignalForReading(dominantSignal.signal);
  
  return {
    type: 'focused_technical',
    angle: dominantSignal.signal,
    title: `Deep Work: ${readableName}`,
    description: `A day spent focusing on one specific technical area`,
    relevanceScore: dominantSignal.percentage,
    metadata: {
      signal: dominantSignal.signal,
      count: dominantSignal.count,
      percentage: dominantSignal.percentage,
      affectedFiles: getAffectedFileCount(commits, dominantSignal.signal),
      pattern: workPattern
    },
    personalizedHooks: [
      `${dominantSignal.count} instances of ${readableName} today`,
      `Spent the day deep in ${readableName}`,
      `${readableName} everywhere I looked today`
    ]
  };
}

function createLearningJourneyIdea(signals, commits, commitPatterns) {
  const asyncCount = signals.async_change || 0;
  const errorCount = signals.error_handling_change || 0;
  const promiseCount = signals.promise_change || 0;
  
  const learningIndicators = detectLearningIndicators(commits);
  
  return {
    type: 'learning',
    angle: 'async_complexity',
    title: `Learning in Public: Async Challenges`,
    description: `Share the real learning experience with async patterns`,
    relevanceScore: 80,
    metadata: {
      async_changes: asyncCount,
      error_handling: errorCount,
      promise_changes: promiseCount,
      iterations: commitPatterns.iterations || 0,
      learningIndicators
    },
    personalizedHooks: [
      `Hit some async complexity today that made me think`,
      `Async JavaScript still has surprises for me`,
      `Learning curve day with promises and async/await`
    ]
  };
}

function createDocumentationStoryIdea(signals, commits, docSignals) {
  const docTypes = [];
  if (signals.doc_image_change) docTypes.push('images');
  if (signals.doc_heading_change) docTypes.push('structure');
  if (signals.doc_link_change) docTypes.push('links');
  
  return {
    type: 'build_in_public',
    angle: 'documentation',
    title: `Documentation Day: Making it Better`,
    description: `The often overlooked but crucial work of good docs`,
    relevanceScore: 70,
    metadata: {
      doc_changes: docSignals,
      types: docTypes,
      filesUpdated: getDocFilesUpdated(commits)
    },
    personalizedHooks: [
      `Took a break from features to focus on docs`,
      `Documentation day - not glamorous, but necessary`,
      `Making sure the docs actually reflect reality`
    ]
  };
}

function createRiskManagementIdea(signals, impacts, commits) {
  const riskFactors = [];
  if (signals.networking_change) riskFactors.push('API changes');
  if (signals.env_variable_change) riskFactors.push('env config');
  if (signals.async_change) riskFactors.push('async flow');
  
  return {
    type: 'technical_decision',
    angle: 'risk_management',
    title: `Careful Engineering: Managing Risk`,
    description: `Decisions that required extra thought and testing`,
    relevanceScore: 90,
    metadata: {
      highRiskCommits: impacts.HIGH_RISK,
      riskFactors,
      safeguards: detectSafeguards(signals)
    },
    personalizedHooks: [
      `Made some changes today that needed extra care`,
      `Not the kind of commits you make without thinking twice`,
      `Engineering decisions that matter in production`
    ]
  };
}

function createRefactorStoryIdea(totalWeight, totalCommits, commits, signals) {
  const refactorReasons = detectRefactorReasons(signals, commits);
  
  return {
    type: 'engineering_practice',
    angle: 'refactoring',
    title: `Big Refactor: ${totalWeight} Lines Changed`,
    description: `The story of cleaning up technical debt`,
    relevanceScore: 85,
    metadata: {
      linesChanged: totalWeight,
      commits: totalCommits,
      reasons: refactorReasons,
      scope: categorizeRefactorScope(signals)
    },
    personalizedHooks: [
      `${totalWeight} lines changed. Started small, ended up refactoring everything`,
      `One of those refactors that keeps growing`,
      `Sometimes you need to tear things down to build them better`
    ]
  };
}

function createTestingQualityIdea(testCount, commits) {
  return {
    type: 'quality',
    angle: 'testing',
    title: `Testing Day: Building Confidence`,
    description: `The unglamorous work that prevents future headaches`,
    relevanceScore: 75,
    metadata: {
      testChanges: testCount,
      coverage: 'improved', // Could calculate if we had coverage data
      testTypes: detectTestTypes(commits)
    },
    personalizedHooks: [
      `Testing day. Not exciting, but necessary`,
      `Adding the safety net before changing things`,
      `Future me will thank present me for writing these tests`
    ]
  };
}

function createFullStackDayIdea(signals, commits, signalTypes) {
  const areas = categorizeDayAreas(signals);
  
  return {
    type: 'variety',
    angle: 'full_stack',
    title: `Full-Stack Day: ${signalTypes} Different Areas`,
    description: `Working across the entire stack in one day`,
    relevanceScore: 65,
    metadata: {
      signalTypes,
      areas,
      breadth: 'high'
    },
    personalizedHooks: [
      `Full-stack day. Touched everything from UI to infrastructure`,
      `One of those days where you context-switch constantly`,
      `From frontend to backend and everything between`
    ]
  };
}

function createTechnicalChallengeIdea(signals, commits) {
  const challenges = [];
  if (signals.networking_change) challenges.push('API integration');
  if (signals.env_variable_change) challenges.push('configuration');
  
  return {
    type: 'technical_decision',
    angle: 'infrastructure',
    title: `Infrastructure Work: ${challenges.join(' & ')}`,
    description: `The behind-the-scenes technical work`,
    relevanceScore: 80,
    metadata: {
      challenges,
      complexity: 'high'
    },
    personalizedHooks: [
      `Working on the stuff that doesn't show up in the UI`,
      `Infrastructure changes - invisible but critical`,
      `Making sure the foundation is solid`
    ]
  };
}

function createDailySummaryIdea(aggregatedAnalysis, commitPatterns, timeSpan) {
  const { totalCommits, totalFilesChanged, totalWeight } = aggregatedAnalysis;
  
  return {
    type: 'daily_summary',
    angle: 'productivity',
    title: `Daily Wrap: ${totalCommits} Commits`,
    description: `High-level overview of the day's work`,
    relevanceScore: 50,
    metadata: {
      commits: totalCommits,
      filesChanged: totalFilesChanged,
      totalWeight,
      timeSpan,
      theme: commitPatterns.theme || 'mixed work'
    },
    personalizedHooks: [
      `${totalCommits} commits today. Productive day.`,
      `Wrapped up with ${totalCommits} commits across ${totalFilesChanged} files`,
      `One of those days where you look up and it's already evening`
    ]
  };
}

function createThematicWorkIdea(commitPatterns, commits, signals) {
  return {
    type: 'focused_effort',
    angle: 'thematic',
    title: `Theme: ${commitPatterns.theme}`,
    description: `Work centered around a specific theme or feature`,
    relevanceScore: 75,
    metadata: {
      theme: commitPatterns.theme,
      commits: commits.length,
      consistency: commitPatterns.consistency
    },
    personalizedHooks: [
      `All commits today pointed in the same direction: ${commitPatterns.theme}`,
      `Focused session on ${commitPatterns.theme}`,
      `When the commits tell a coherent story`
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
export function analyzeCommit(fileSummaries) {
  const signalCount = {};
  let totalWeight = 0;

  for (const summary of fileSummaries) {
    totalWeight += summary.weight;

    for (const signal of summary.signals) {
      signalCount[signal] = (signalCount[signal] || 0) + 1;
    }
  }

  return {
    totalFilesChanged: fileSummaries.length,
    totalWeight,
    signals: signalCount,
    impact: classifyImpact(signalCount, totalWeight)
  };
}

export function analyzeMultipleCommits(commitAnalyses) {
  // Aggregate all signals and metrics across commits
  const aggregated = {
    totalCommits: commitAnalyses.length,
    totalFilesChanged: 0,
    totalWeight: 0,
    signals: {},
    impacts: {
      HIGH_RISK: 0,
      MEDIUM_RISK: 0,
      LOW_RISK: 0
    },
    commits: commitAnalyses
  };

  for (const analysis of commitAnalyses) {
    aggregated.totalFilesChanged += analysis.totalFilesChanged;
    aggregated.totalWeight += analysis.totalWeight;
    aggregated.impacts[analysis.impact]++;

    for (const [signal, count] of Object.entries(analysis.signals)) {
      aggregated.signals[signal] = (aggregated.signals[signal] || 0) + count;
    }
  }

  return aggregated;
}

function classifyImpact(signals, weight) {
  if (
    signals.networking_change ||
    signals.env_variable_change
  ) {
    return 'HIGH_RISK';
  }

  if (
    signals.async_change ||
    signals.error_handling_change ||
    signals.promise_change
  ) {
    return 'MEDIUM_RISK';
  }

  if (
    signals.doc_image_change ||
    signals.doc_text_change ||
    signals.code_formatting_change ||
    signals.comment_change
  ) {
    return 'LOW_RISK';
  }

  if (weight > 500) return 'HIGH_RISK';
  if (weight > 150) return 'MEDIUM_RISK';

  return 'LOW_RISK';
}

/**
 * NEW: Extract actual feature/topic from commit messages
 * This is what makes posts specific instead of generic
 */
export function extractFeatureFromCommits(commits) {
  const messages = commits.map(c => c.message.toLowerCase()).join(' ');
  
  // Pattern matching for common features - ADD MORE AS NEEDED
  const features = {
    'auth|login|signup|password|token|jwt|session|oauth': 'Authentication System',
    'payment|stripe|checkout|billing|subscription|invoice': 'Payment Processing',
    'notification|email|sms|alert|push|webhook': 'Notification System',
    'upload|download|file|storage|s3|bucket|asset': 'File Management',
    'search|filter|query|elastic|algolia|index': 'Search Functionality',
    'chat|message|websocket|realtime|socket|presence': 'Real-time Chat',
    'dashboard|analytics|metrics|chart|graph|report': 'Analytics Dashboard',
    'api|endpoint|route|controller|rest|graphql': 'API Development',
    'cache|redis|performance|optimize|speed|latency': 'Performance Optimization',
    'test|spec|coverage|jest|mocha|cypress': 'Testing Infrastructure',
    'deploy|ci|cd|docker|kubernetes|pipeline|github actions': 'DevOps Pipeline',
    'database|migration|schema|sql|postgres|mongo': 'Database Architecture',
    'ui|component|design|css|style|tailwind|layout': 'UI Components',
    'form|validation|input|submit|error': 'Form Handling',
    'table|grid|list|pagination|sort': 'Data Tables',
    'modal|dialog|popup|dropdown|menu': 'Interactive Components',
    'navigation|routing|link|redirect|history': 'Navigation System',
    'state|redux|context|store|zustand': 'State Management',
    'security|xss|csrf|sanitize|vulnerability': 'Security Hardening',
    'logging|monitoring|sentry|error tracking': 'Observability',
    'internationalization|i18n|translation|locale': 'Internationalization',
    'accessibility|a11y|aria|screen reader': 'Accessibility',
    'mobile|responsive|breakpoint|viewport': 'Responsive Design',
    'queue|worker|background|job|cron': 'Background Jobs',
    'export|pdf|csv|excel|download': 'Data Export',
    'import|parser|csv|xlsx|json': 'Data Import',
    'rate limit|throttle|quota|circuit breaker': 'Rate Limiting',
    'retry|backoff|resilience|failover': 'Resilience Patterns',
  };
  
  for (const [pattern, feature] of Object.entries(features)) {
    if (new RegExp(pattern).test(messages)) {
      return feature;
    }
  }
  
  // Fallback: Try to extract from most common meaningful words
  const words = messages
    .split(/\s+/)
    .filter(w => w.length > 4 && !isCommonWord(w));
  
  const wordFreq = {};
  words.forEach(w => wordFreq[w] = (wordFreq[w] || 0) + 1);
  
  const topWord = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])[0];
  
  if (topWord && topWord[1] >= 2) {
    return topWord[0].charAt(0).toUpperCase() + topWord[0].slice(1) + ' Feature';
  }
  
  return 'Feature Development';
}

/**
 * NEW: Detect the actual problem being solved
 * LinkedIn posts need a clear problem statement
 */
export function detectProblem(signals, commits, feature) {
  const problems = {
    'Authentication System': {
      async_change: 'Managing concurrent login sessions without race conditions',
      error_handling_change: 'Handling failed authentication attempts gracefully',
      networking_change: 'Dealing with third-party OAuth provider reliability',
      promise_change: 'Token refresh timing and session management',
      test_change: 'Ensuring auth flows work correctly across edge cases'
    },
    'Payment Processing': {
      async_change: 'Processing payments without blocking the checkout flow',
      error_handling_change: 'Handling payment failures and implementing retry logic',
      networking_change: 'Dealing with payment gateway timeouts and failures',
      promise_change: 'Managing payment webhook processing order',
      test_change: 'Testing payment flows without charging real money'
    },
    'Real-time Chat': {
      async_change: 'Syncing messages across multiple devices instantly',
      promise_change: 'Guaranteeing message delivery in unreliable networks',
      networking_change: 'Handling WebSocket disconnections and reconnections',
      error_handling_change: 'Managing failed message sends gracefully',
      test_change: 'Testing real-time features in development'
    },
    'File Management': {
      async_change: 'Processing large file uploads without blocking the server',
      error_handling_change: 'Resuming failed uploads automatically',
      networking_change: 'Handling slow and unreliable network connections',
      promise_change: 'Coordinating multi-part upload completion',
      test_change: 'Testing upload flows with various file sizes'
    },
    'Performance Optimization': {
      async_change: 'Preventing blocking operations from slowing down the UI',
      promise_change: 'Managing parallel API calls efficiently',
      networking_change: 'Reducing API response times',
      error_handling_change: 'Graceful degradation when services are slow',
      cache_change: 'Deciding what to cache and for how long'
    },
    'API Development': {
      async_change: 'Handling concurrent API requests efficiently',
      error_handling_change: 'Providing meaningful error responses',
      networking_change: 'Ensuring API reliability under load',
      test_change: 'Testing API endpoints thoroughly',
      promise_change: 'Managing database queries in async handlers'
    },
    'Testing Infrastructure': {
      async_change: 'Testing async code without flaky tests',
      promise_change: 'Waiting for async operations in tests',
      test_change: 'Achieving meaningful test coverage',
      error_handling_change: 'Testing error scenarios comprehensively'
    },
    'Notification System': {
      async_change: 'Sending notifications without delaying responses',
      networking_change: 'Ensuring notifications are delivered reliably',
      promise_change: 'Managing notification queues',
      error_handling_change: 'Handling notification service failures'
    },
    'Database Architecture': {
      async_change: 'Running migrations without downtime',
      promise_change: 'Handling complex transaction logic',
      error_handling_change: 'Managing database connection failures',
      test_change: 'Testing database queries and migrations'
    }
  };
  
  // Find the most relevant problem based on signals
  const featureProblems = problems[feature] || {};
  const dominantSignal = Object.keys(signals).sort((a,b) => signals[b] - signals[a])[0];
  
  return featureProblems[dominantSignal] || 'Improving system reliability and user experience';
}

/**
 * NEW: Extract the solution/approach taken
 * Shows HOW the problem was solved
 */
export function extractSolution(signals, feature) {
  const solutions = {
    async_change: {
      'Authentication System': 'Implemented token refresh logic with automatic retry and race condition handling',
      'Payment Processing': 'Built a queue system to process payment webhooks reliably with idempotency',
      'Real-time Chat': 'Used message queuing with delivery confirmations and offline support',
      'File Management': 'Created a chunked upload system with automatic resume capability',
      'Performance Optimization': 'Moved heavy operations to background workers',
      'API Development': 'Added async/await patterns with proper error boundaries',
      'Testing Infrastructure': 'Implemented proper async test utilities and helpers',
      'Notification System': 'Built a background job queue for notification delivery',
      'Database Architecture': 'Used transaction pooling and connection management',
      'default': 'Refactored async flows with proper error handling and timeouts'
    },
    error_handling_change: {
      'Authentication System': 'Added fallback authentication methods and clear error messages',
      'Payment Processing': 'Implemented comprehensive error logging and automatic retry logic',
      'Real-time Chat': 'Built offline message queuing with retry mechanisms',
      'File Management': 'Added automatic upload retry with exponential backoff',
      'Performance Optimization': 'Implemented graceful degradation when services are slow',
      'API Development': 'Created standardized error response format with helpful messages',
      'Testing Infrastructure': 'Added error scenario test coverage',
      'Notification System': 'Implemented fallback notification channels',
      'default': 'Enhanced error handling with user-friendly messages and recovery paths'
    },
    networking_change: {
      'Authentication System': 'Integrated OAuth with multiple providers and fallback options',
      'Payment Processing': 'Added payment gateway failover and timeout handling',
      'Real-time Chat': 'Implemented WebSocket reconnection strategy with exponential backoff',
      'File Management': 'Built resumable uploads with multipart support and progress tracking',
      'Performance Optimization': 'Implemented request batching and connection pooling',
      'API Development': 'Added rate limiting and request throttling',
      'Notification System': 'Implemented webhook retry logic with exponential backoff',
      'default': 'Improved API reliability with timeout handling and retry logic'
    },
    promise_change: {
      'Authentication System': 'Properly sequenced auth flows to prevent race conditions',
      'Payment Processing': 'Ensured webhook processing order with promise chaining',
      'Real-time Chat': 'Implemented message ordering guarantees',
      'File Management': 'Coordinated multi-part upload completion',
      'Performance Optimization': 'Used Promise.all for parallel operations where safe',
      'API Development': 'Properly handled promise rejections in all endpoints',
      'default': 'Improved promise handling with better error catching'
    },
    test_change: {
      'Authentication System': 'Added comprehensive auth flow tests including edge cases',
      'Payment Processing': 'Created test suite for payment scenarios using mocks',
      'Real-time Chat': 'Built tests for connection/disconnection scenarios',
      'File Management': 'Added upload tests for various file sizes and failures',
      'Testing Infrastructure': 'Improved test coverage and reliability',
      'API Development': 'Created API endpoint tests with various inputs',
      'default': 'Expanded test coverage for critical paths'
    },
    doc_image_change: {
      'default': 'Updated documentation with visual guides and examples'
    },
    doc_heading_change: {
      'default': 'Reorganized documentation for better discoverability'
    }
  };
  
  const dominantSignal = Object.keys(signals).sort((a,b) => signals[b] - signals[a])[0];
  const signalSolutions = solutions[dominantSignal] || solutions.async_change;
  
  return signalSolutions[feature] || signalSolutions.default;
}

function isCommonWord(word) {
  const common = ['the', 'and', 'for', 'add', 'update', 'fix', 'with', 'from', 'this', 'that', 
                  'about', 'would', 'there', 'their', 'what', 'which', 'when', 'make', 'like',
                  'time', 'just', 'know', 'take', 'into', 'your', 'some', 'could', 'them'];
  return common.includes(word);
}
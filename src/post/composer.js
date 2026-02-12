import { extractFeatureFromCommits, detectProblem, extractSolution } from '../analyze/commitAnalyzer.js';
import { formatSpecificContext, getPrimaryTech } from '../extract/Specificextractor.js';

/**
 * Enhanced Post Composer - LinkedIn-Ready Version with SPECIFIC CONTEXT
 * Now includes: actual libraries used, functions built, modules touched
 */

export function composePost(idea, aggregatedAnalysis) {
  const { commits, signals, totalWeight, totalFilesChanged, specificContext } = aggregatedAnalysis;
  
  // Extract the actual feature being worked on
  const feature = extractFeatureFromCommits(commits);
  
  // Get specific tech details (NEW!)
  const techContext = formatSpecificContext(specificContext || {});
  const primaryTech = getPrimaryTech(specificContext || {});
  
  // Detect the specific problem
  const problem = detectProblem(signals, commits, feature);
  
  // Extract the solution approach
  const solution = extractSolution(signals, feature);
  
  // Generate impact statement
  const impact = generateImpact(feature, signals, totalWeight, idea);
  
  // Generate key insight/learning
  const insight = generateInsight(feature, signals, idea);
  
  // Generate hashtags (now includes tech-specific ones)
  const hashtags = generateHashtags(feature, signals, specificContext);
  
  // Generate call-to-action
  const cta = generateCTA(feature, idea);
  
  // Build the post based on idea type
  return buildLinkedInPost({
    feature,
    problem,
    solution,
    impact,
    insight,
    hashtags,
    cta,
    idea,
    commits,
    signals,
    totalWeight,
    techContext,    // NEW: formatted tech context
    primaryTech,    // NEW: main tech to emphasize
    specificContext // NEW: raw context data
  });
}

/**
 * Build the actual LinkedIn post with SPECIFIC TECH DETAILS
 */
function buildLinkedInPost({ 
  feature, problem, solution, impact, insight, hashtags, cta, idea, 
  commits, signals, totalWeight, techContext, primaryTech, specificContext 
}) {
  
  // Different post styles based on idea type
  if (idea.type === 'focused_technical') {
    return buildFocusedTechnicalPost({ 
      feature, problem, solution, impact, insight, hashtags, cta, idea,
      techContext, primaryTech, specificContext 
    });
  }
  
  if (idea.type === 'learning') {
    return buildLearningPost({ 
      feature, problem, solution, impact, insight, hashtags, cta, idea,
      techContext, primaryTech, specificContext 
    });
  }
  
  if (idea.type === 'build_in_public') {
    return buildDocumentationPost({ 
      feature, problem, solution, impact, insight, hashtags, cta, idea,
      techContext, primaryTech, specificContext 
    });
  }
  
  if (idea.type === 'technical_decision') {
    return buildTechnicalDecisionPost({ 
      feature, problem, solution, impact, insight, hashtags, cta, idea,
      techContext, primaryTech, specificContext 
    });
  }
  
  if (idea.type === 'engineering_practice') {
    return buildRefactorPost({ 
      feature, problem, solution, impact, insight, hashtags, cta, totalWeight, commits,
      techContext, primaryTech, specificContext 
    });
  }
  
  if (idea.type === 'quality') {
    return buildTestingPost({ 
      feature, problem, solution, impact, insight, hashtags, cta, idea,
      techContext, primaryTech, specificContext 
    });
  }
  
  if (idea.type === 'variety') {
    return buildFullStackPost({ 
      feature, problem, solution, impact, insight, hashtags, cta, signals,
      techContext, primaryTech, specificContext 
    });
  }
  
  // Default: daily summary style
  return buildDailySummaryPost({ 
    feature, problem, solution, impact, insight, hashtags, cta, commits, totalWeight,
    techContext, primaryTech, specificContext 
  });
}

function buildFocusedTechnicalPost({ 
  feature, problem, solution, impact, insight, hashtags, cta, 
  techContext, primaryTech, specificContext 
}) {
  // Add specific tech details to the opening
  let opening = `Built ${feature.toLowerCase()}`;
  
  if (primaryTech) {
    opening += ` with ${primaryTech}`;
  }
  
  if (specificContext.functions && specificContext.functions.length > 0) {
    const mainFunc = specificContext.functions[0];
    opening += ` (${mainFunc})`;
  }
  
  opening += ` that handles ${extractContext(problem)}.`;
  
  return `${opening}

The challenge: ${problem}

${solution}

Impact: ${impact}

Key learning: ${insight}

${cta}

${hashtags}`.trim();
}

function buildLearningPost({ 
  feature, problem, solution, impact, insight, hashtags, cta,
  techContext, primaryTech, specificContext 
}) {
  let opening = `Worked on ${feature.toLowerCase()}`;
  
  // Add tech stack if available
  if (specificContext.libraries && specificContext.libraries.length > 0) {
    const libs = specificContext.libraries.slice(0, 2).join(' and ');
    opening += ` using ${libs}`;
  }
  
  opening += ` today.`;
  
  return `${opening}

Hit a learning curve with ${extractContext(problem)}.

${solution}

${impact}

The thing about ${extractTopic(feature)}: ${insight}

${cta}

${hashtags}`.trim();
}

function buildDocumentationPost({ 
  feature, problem, solution, impact, insight, hashtags, cta,
  techContext, primaryTech, specificContext 
}) {
  const docCount = idea.metadata?.doc_changes || 'several';
  
  let opening = `Took a break from features today to focus on documentation`;
  
  if (specificContext.modules && specificContext.modules.length > 0) {
    opening += ` for ${specificContext.modules.join(' and ')}`;
  }
  
  opening += `.`;
  
  return `${opening}

${solution}

Why it matters: ${impact}

${insight}

${cta}

${hashtags}`.trim();
}

function buildTechnicalDecisionPost({ 
  feature, problem, solution, impact, insight, hashtags, cta,
  techContext, primaryTech, specificContext 
}) {
  let techDetail = '';
  if (primaryTech || (specificContext.libraries && specificContext.libraries.length > 0)) {
    const tech = primaryTech || specificContext.libraries[0];
    techDetail = ` involving ${tech}`;
  }
  
  return `Made some technical decisions${techDetail} today that needed extra thought.

Working on ${feature.toLowerCase()}: ${problem}

${solution}

${impact}

${insight}

${cta}

${hashtags}`.trim();
}

function buildRefactorPost({ 
  feature, problem, solution, impact, insight, hashtags, cta, totalWeight, commits,
  techContext, primaryTech, specificContext 
}) {
  let modulesAffected = '';
  if (specificContext.modules && specificContext.modules.length > 0) {
    modulesAffected = ` in ${specificContext.modules.slice(0, 2).join(' and ')}`;
  }
  
  return `${totalWeight} lines changed${modulesAffected} across ${commits.length} commits today.

What started as a small cleanup in ${feature.toLowerCase()} turned into a proper refactor.

The problem: ${problem}

${solution}

${impact}

${insight}

${cta}

${hashtags}`.trim();
}

function buildTestingPost({ 
  feature, problem, solution, impact, insight, hashtags, cta,
  techContext, primaryTech, specificContext 
}) {
  const testCount = idea.metadata?.testChanges || 'multiple';
  
  let testingTech = '';
  if (specificContext.keywords) {
    const testLibs = specificContext.keywords.filter(k => 
      ['jest', 'mocha', 'vitest', 'cypress', 'playwright'].includes(k.toLowerCase())
    );
    if (testLibs.length > 0) {
      testingTech = ` with ${testLibs[0]}`;
    }
  }
  
  return `Testing day${testingTech}. Added and updated ${testCount} tests for ${feature.toLowerCase()}.

Not the most glamorous work, but necessary.

${solution}

${impact}

${insight}

${cta}

${hashtags}`.trim();
}

function buildFullStackPost({ 
  feature, problem, solution, impact, insight, hashtags, cta, signals,
  techContext, primaryTech, specificContext 
}) {
  const areas = Object.keys(signals).slice(0, 4).map(formatSignalForReading).join(', ');
  
  let techStack = '';
  if (specificContext.libraries && specificContext.libraries.length > 0) {
    techStack = `\n\nTech: ${specificContext.libraries.slice(0, 3).join(', ')}`;
  }
  
  return `Full-stack kind of day.

Jumped between ${areas} while working on ${feature.toLowerCase()}.${techStack}

The challenge: ${problem}

${solution}

${impact}

${insight}

${cta}

${hashtags}`.trim();
}

function buildDailySummaryPost({ 
  feature, problem, solution, impact, insight, hashtags, cta, commits, totalWeight,
  techContext, primaryTech, specificContext 
}) {
  let techMention = '';
  if (techContext) {
    techMention = ` (${techContext})`;
  }
  
  return `Wrapped up today with ${commits.length} commits on ${feature.toLowerCase()}${techMention}.

${solution}

${impact}

${insight}

${cta}

${hashtags}`.trim();
}

/**
 * Generate realistic impact statements based on the feature
 */
function generateImpact(feature, signals, totalWeight, idea) {
  const impacts = {
    'Authentication System': [
      'Users can now stay logged in reliably across devices',
      'Reduced login failures by handling edge cases properly',
      'Smoother authentication flow for returning users',
      'Better session management prevents unexpected logouts'
    ],
    'Payment Processing': [
      'Zero failed payments due to timeout issues',
      'Customers get instant feedback on payment status',
      'Reduced checkout abandonment from payment errors',
      'Payment confirmations are now reliable even under load'
    ],
    'Real-time Chat': [
      'Messages sync instantly across all devices',
      'No more lost messages during network disconnections',
      'Better user experience in spotty network conditions',
      'Offline messages now deliver when connection returns'
    ],
    'File Management': [
      'Users can upload files up to 1GB reliably',
      'Failed uploads automatically resume from where they left off',
      'Faster uploads with parallel chunk processing',
      'Better progress feedback during large uploads'
    ],
    'Search Functionality': [
      'Search results now appear in under 200ms',
      'Users can find what they need with complex filters',
      'Search stays responsive even with 10K+ queries per minute',
      'Better relevance ranking shows the right results first'
    ],
    'Analytics Dashboard': [
      'Dashboard loads 3x faster with lazy loading',
      'Users see data even when some APIs are slow',
      'Reduced bounce rate from slow dashboards',
      'Better insights with real-time metric updates'
    ],
    'UI Components': [
      'Smoother interactions without UI lag',
      'Components work reliably across all screen sizes',
      'Better accessibility for keyboard and screen reader users',
      'Faster rendering on low-end devices'
    ],
    'Performance Optimization': [
      'Page load time improved significantly',
      'Better handling of concurrent users',
      'Reduced server load by 40%',
      'Smoother user experience overall'
    ],
    'API Development': [
      'API response time reduced',
      'Better error messages help developers debug faster',
      'More reliable API under high load',
      'Cleaner API design makes integration easier'
    ],
    'Testing Infrastructure': [
      'Can now refactor with confidence',
      'Catches bugs before they reach production',
      'Faster development cycle with test coverage',
      'Reduced debugging time significantly'
    ],
    'Notification System': [
      'Users receive notifications reliably',
      'Better notification delivery even when services are down',
      'Reduced notification delays',
      'More consistent notification experience'
    ],
    'Database Architecture': [
      'Faster query performance',
      'Better data consistency',
      'Easier to add new features',
      'Reduced database load'
    ],
    'DevOps Pipeline': [
      'Deployments are now faster and safer',
      'Caught issues before they reached production',
      'More confident in shipping changes',
      'Reduced deployment downtime'
    ],
    'Security Hardening': [
      'Better protection against common attacks',
      'User data is more secure',
      'Reduced security vulnerabilities',
      'More confident in the security posture'
    ],
    'Accessibility': [
      'Works better with screen readers',
      'Keyboard navigation is now smooth',
      'More users can use the product',
      'Better compliance with accessibility standards'
    ]
  };
  
  const featureImpacts = impacts[feature] || [
    'Improved reliability and user experience',
    'Better handling of edge cases',
    'More maintainable codebase',
    'Faster development velocity'
  ];
  
  // Pick impact based on idea type
  if (idea.type === 'quality' || idea.type === 'engineering_practice') {
    return featureImpacts[2] || featureImpacts[0];
  }
  
  return featureImpacts[0];
}

/**
 * Generate actionable, specific insights
 */
function generateInsight(feature, signals, idea) {
  const insights = {
    'Authentication System': {
      async_change: 'Token refresh is trickier than it looks - you need to handle edge cases like expired refresh tokens and concurrent requests trying to refresh simultaneously.',
      error_handling_change: 'Good auth UX means never showing cryptic error messages. Always guide users to what they should do next.',
      networking_change: 'OAuth flows need graceful degradation. What happens when the provider is down? Your users shouldn\'t be locked out.',
      test_change: 'Testing auth flows requires thinking about all the ways users might break the flow - expired tokens, network failures, browser quirks.',
      default: 'Authentication is never "done" - it\'s an ongoing balance between security and UX.'
    },
    'Payment Processing': {
      async_change: 'Payment webhooks are asynchronous nightmares. Idempotency isn\'t optional - it\'s the only way to prevent double charges.',
      error_handling_change: 'Never lose a payment. Every failure needs to be logged, retried automatically, and auditable.',
      networking_change: 'Payment gateways timeout. Your code needs to handle that gracefully without charging customers twice.',
      test_change: 'Testing payment flows without charging real money requires careful mocking and test environments.',
      default: 'Payment processing is where engineering meets money. Every edge case matters.'
    },
    'Real-time Chat': {
      async_change: 'WebSocket reconnection logic is where most chat apps fail. Test it by turning your WiFi on and off repeatedly.',
      promise_change: 'Message delivery guarantees require more than just "send and hope" - you need confirmations and retry logic.',
      networking_change: 'Offline-first design isn\'t optional for real-time apps. It\'s the only way to be reliable.',
      error_handling_change: 'Users don\'t care why their message didn\'t send. They just want it to work.',
      default: 'Real-time features are only "real-time" when the network cooperates. Plan for when it doesn\'t.'
    },
    'File Management': {
      async_change: 'Large file uploads need chunking. Loading everything into memory will crash your server.',
      error_handling_change: 'Upload resumption is what separates good file upload UX from frustrating ones.',
      networking_change: 'Never trust the network - especially for large files over cellular connections.',
      promise_change: 'Coordinating multi-part uploads requires careful promise management and cleanup.',
      default: 'File uploads are simple until they\'re not. Handle the edge cases before users find them.'
    },
    'Performance Optimization': {
      async_change: 'Moving work to background processes is easy. Making sure it actually completes is harder.',
      promise_change: 'Parallel operations are fast until one of them fails. Always have a rollback plan.',
      networking_change: 'Caching is great until the cache is stale. Invalidation is the hard part.',
      default: 'Performance optimization is finding the right balance between speed and reliability.'
    },
    'Search Functionality': {
      async_change: 'Debouncing search prevents API spam, but makes the UX feel slower. Finding the sweet spot (200-300ms) is key.',
      error_handling_change: 'Empty search results should show suggestions, not just "No results found". Guide users to success.',
      networking_change: 'Elasticsearch downtime shouldn\'t break your app. Always have a fallback - even if it\'s basic filtering.',
      function_change: 'Query optimization is 80% of search performance. Start there before throwing hardware at it.',
      test_change: 'Test search with typos, edge cases, and nonsense queries. Users will do worse.',
      promise_change: 'Cancel stale search requests when users type fast. Nobody cares about results from 3 keystrokes ago.',
      default: 'Good search is invisible. Users only notice when it fails.'
    },
    'Analytics Dashboard': {
      async_change: 'Lazy loading widgets prevents the "everything loads at once and crashes" problem.',
      promise_change: 'Fetch metrics in parallel, but show partial results if some are slow. Don\'t make users wait for everything.',
      error_handling_change: 'Missing data points should degrade gracefully. Show what you have, note what\'s missing.',
      default: 'Dashboard performance is about perceived speed, not actual speed. Show skeletons early.'
    },
    'UI Components': {
      async_change: 'React.memo and useMemo are powerful, but overuse them and debugging becomes hell.',
      error_handling_change: 'Component error boundaries prevent the whole app from crashing when one widget fails.',
      test_change: 'Test components with real user data - edge cases always live in production.',
      default: 'Good components are boring. They work predictably every time.'
    },
    'API Development': {
      async_change: 'Async/await makes API code readable, but don\'t forget error handling on every await.',
      error_handling_change: 'Good API error messages should tell developers exactly what went wrong and how to fix it.',
      networking_change: 'Rate limiting protects your API, but makes sure the error messages are helpful.',
      test_change: 'Test your API with bad inputs, slow responses, and timeouts - not just happy paths.',
      default: 'APIs are contracts. Breaking changes break other people\'s code.'
    },
    'Testing Infrastructure': {
      async_change: 'Testing async code is hard. Flaky tests are worse than no tests.',
      test_change: 'Test coverage numbers don\'t mean much if you\'re not testing the right things.',
      error_handling_change: 'Testing error scenarios is tedious but prevents 3am debugging sessions.',
      default: 'Tests are documentation that stays up to date. Write them for your future self.'
    },
    'Notification System': {
      async_change: 'Notifications should never block user actions. Queue them and move on.',
      error_handling_change: 'When notification delivery fails, log it and retry. Never silently fail.',
      networking_change: 'Notification services go down. Have a fallback strategy.',
      default: 'Users expect notifications to just work. The complexity is in making that happen reliably.'
    },
    'DevOps Pipeline': {
      async_change: 'Deployments need to be rollbackable. Things will break - plan for it.',
      error_handling_change: 'Good CI/CD catches errors before they reach production.',
      test_change: 'Automated testing in CI is the only way to ship with confidence.',
      default: 'DevOps is about making deployments boring. Boring is good.'
    },
    'Security Hardening': {
      error_handling_change: 'Security errors should be logged but never exposed to users. Don\'t leak information.',
      networking_change: 'Defense in depth means not trusting anything - including your own network.',
      test_change: 'Security testing finds vulnerabilities before attackers do.',
      default: 'Security isn\'t a feature. It\'s a requirement that never ends.'
    }
  };
  
  const dominantSignal = Object.keys(signals).sort((a,b) => signals[b] - signals[a])[0];
  const featureInsights = insights[feature] || {
    default: 'Every edge case you handle makes the product more reliable. Future you will thank present you.'
  };
  
  return featureInsights[dominantSignal] || featureInsights.default;
}

/**
 * Generate relevant hashtags (now includes tech-specific ones)
 */
function generateHashtags(feature, signals, specificContext) {
  const baseHashtags = ['#WebDev', '#SoftwareEngineering', '#DevLife', '#CodingLife'];
  const hashtags = new Set(baseHashtags);
  
  // Add tech-specific hashtags from libraries
  if (specificContext && specificContext.libraries) {
    const techHashtags = {
      'next-auth': '#NextAuth',
      'nextauth': '#NextAuth',
      'prisma': '#Prisma',
      'stripe': '#Stripe',
      'react': '#React',
      'next': '#NextJS',
      'express': '#ExpressJS',
      'fastify': '#Fastify',
      'postgresql': '#PostgreSQL',
      'postgres': '#PostgreSQL',
      'mongodb': '#MongoDB',
      'redis': '#Redis',
      'jwt': '#JWT',
      'bcrypt': '#Security',
      'jest': '#Testing',
      'cypress': '#Testing',
      'docker': '#Docker',
      'kubernetes': '#Kubernetes'
    };
    
    specificContext.libraries.forEach(lib => {
      const libLower = lib.toLowerCase();
      if (techHashtags[libLower]) {
        hashtags.add(techHashtags[libLower]);
      }
    });
  }
  
  // Add from keywords
  if (specificContext && specificContext.keywords) {
    const keywordHashtags = {
      'auth': '#Authentication',
      'authentication': '#Authentication',
      'payment': '#Payments',
      'stripe': '#Stripe',
      'websocket': '#WebSockets',
      'realtime': '#RealTime',
      'api': '#API',
      'testing': '#Testing'
    };
    
    specificContext.keywords.forEach(kw => {
      const kwLower = kw.toLowerCase();
      if (keywordHashtags[kwLower]) {
        hashtags.add(keywordHashtags[kwLower]);
      }
    });
  }
  
  // Convert to array and limit to 5
  return Array.from(hashtags).slice(0, 5).join(' ');
}

/**
 * Generate engaging call-to-action questions
 */
function generateCTA(feature, idea) {
  const ctas = {
    'Authentication System': [
      'How do you handle session management in your apps?',
      'What\'s your approach to OAuth implementation?',
      'Have you dealt with token refresh race conditions?'
    ],
    'Payment Processing': [
      'How do you test payment flows in development?',
      'What\'s your experience with payment webhooks?',
      'Any tips for handling payment gateway failures?'
    ],
    'Real-time Chat': [
      'How do you handle WebSocket reconnections?',
      'What\'s your approach to message delivery guarantees?',
      'Have you built offline-first chat features?'
    ],
    'File Management': [
      'How do you handle large file uploads in your apps?',
      'What\'s your approach to resumable uploads?',
      'Any tips for optimizing file upload UX?'
    ],
    'Performance Optimization': [
      'What\'s your go-to performance optimization strategy?',
      'How do you balance performance and reliability?',
      'What tools do you use for performance monitoring?'
    ],
    'Testing Infrastructure': [
      'How do you prevent flaky tests?',
      'What\'s your test coverage goal?',
      'TDD or test after? What works for you?'
    ],
    'API Development': [
      'What\'s your API error handling strategy?',
      'REST or GraphQL? What do you prefer?',
      'How do you version your APIs?'
    ],
    'Search Functionality': [
      'How do you handle search performance at scale?',
      'What\'s your approach to search relevance?',
      'Elasticsearch or something else? What works for you?',
      'How do you balance search speed with accuracy?'
    ],
    'Analytics Dashboard': [
      'How do you handle slow dashboard load times?',
      'What\'s your approach to dashboard performance?',
      'How do you decide what to lazy load?'
    ],
    'UI Components': [
      'How do you prevent component re-render issues?',
      'What\'s your component testing strategy?',
      'How do you handle component performance?'
    ],
    'default': [
      'What\'s your approach to handling this?',
      'Have you dealt with similar challenges?',
      'Curious how others solve this - any tips?',
      'What\'s your take on this approach?',
      'Would love to hear your thoughts on this'
    ]
  };
  
  const featureCTAs = ctas[feature] || ctas.default;
  return featureCTAs[Math.floor(Math.random() * featureCTAs.length)];
}

// Helper functions

function extractContext(problem) {
  const match = problem.match(/^(.*?)\s+(without|while|when|during|in|with)\s+/i);
  if (match) {
    return match[1].trim();
  }
  
  const firstPart = problem.split(/[,.]|$/)[0].trim();
  
  const cleaned = firstPart
    .replace(/^(Managing|Handling|Processing|Ensuring|Preventing|Optimizing|Coordinating|Running|Sending|Testing|Building|Creating|Implementing)\s+/i, '')
    .toLowerCase();
  
  return cleaned || firstPart.toLowerCase();
}

function extractTopic(feature) {
  return feature.split(' ')[0].toLowerCase();
}

function formatSignalForReading(signal) {
  const readableMap = {
    'async_change': 'async patterns',
    'networking_change': 'API calls',
    'error_handling_change': 'error handling',
    'test_change': 'testing',
    'promise_change': 'promise handling',
    'function_change': 'refactoring',
    'import_change': 'dependencies',
    'class_change': 'architecture',
    'logging_change': 'logging',
    'jsx_change': 'React components',
    'vue_change': 'Vue components',
    'doc_image_change': 'documentation',
    'doc_heading_change': 'docs structure',
    'doc_link_change': 'documentation',
    'env_variable_change': 'configuration',
  };
  
  return readableMap[signal] || signal.replace(/_/g, ' ');
}
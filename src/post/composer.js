import { extractFeatureFromCommits, detectProblem, extractSolution } from '../analyze/commitAnalyzer.js';

/**
 * Enhanced Post Composer - LinkedIn-Ready Version
 * Generates specific, copy-paste ready posts with:
 * - Clear feature/topic
 * - Specific problem solved
 * - Solution approach
 * - Impact/results
 * - Actionable insights
 * - Relevant hashtags
 * - Call-to-action
 */

export function composePost(idea, aggregatedAnalysis) {
  const { commits, signals, totalWeight, totalFilesChanged } = aggregatedAnalysis;
  
  // Extract the actual feature being worked on
  const feature = extractFeatureFromCommits(commits);
  
  // Detect the specific problem
  const problem = detectProblem(signals, commits, feature);
  
  // Extract the solution approach
  const solution = extractSolution(signals, feature);
  
  // Generate impact statement
  const impact = generateImpact(feature, signals, totalWeight, idea);
  
  // Generate key insight/learning
  const insight = generateInsight(feature, signals, idea);
  
  // Generate hashtags
  const hashtags = generateHashtags(feature, signals);
  
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
    totalWeight
  });
}

/**
 * Build the actual LinkedIn post
 * Structure: Hook → Problem → Solution → Impact → Insight → CTA → Hashtags
 */
function buildLinkedInPost({ feature, problem, solution, impact, insight, hashtags, cta, idea, commits, signals, totalWeight }) {
  
  // Different post styles based on idea type
  if (idea.type === 'focused_technical') {
    return buildFocusedTechnicalPost({ feature, problem, solution, impact, insight, hashtags, cta, idea });
  }
  
  if (idea.type === 'learning') {
    return buildLearningPost({ feature, problem, solution, impact, insight, hashtags, cta, idea });
  }
  
  if (idea.type === 'build_in_public') {
    return buildDocumentationPost({ feature, problem, solution, impact, insight, hashtags, cta, idea });
  }
  
  if (idea.type === 'technical_decision') {
    return buildTechnicalDecisionPost({ feature, problem, solution, impact, insight, hashtags, cta, idea });
  }
  
  if (idea.type === 'engineering_practice') {
    return buildRefactorPost({ feature, problem, solution, impact, insight, hashtags, cta, totalWeight, commits });
  }
  
  if (idea.type === 'quality') {
    return buildTestingPost({ feature, problem, solution, impact, insight, hashtags, cta, idea });
  }
  
  if (idea.type === 'variety') {
    return buildFullStackPost({ feature, problem, solution, impact, insight, hashtags, cta, signals });
  }
  
  // Default: daily summary style
  return buildDailySummaryPost({ feature, problem, solution, impact, insight, hashtags, cta, commits, totalWeight });
}

function buildFocusedTechnicalPost({ feature, problem, solution, impact, insight, hashtags, cta, idea }) {
  return `Built ${feature.toLowerCase()} that handles ${extractContext(problem)}.

The challenge: ${problem}

${solution}

Impact: ${impact}

Key learning: ${insight}

${cta}

${hashtags}`.trim();
}

function buildLearningPost({ feature, problem, solution, impact, insight, hashtags, cta, idea }) {
  return `Worked on ${feature.toLowerCase()} today.

Hit a learning curve with ${extractContext(problem)}.

${solution}

${impact}

The thing about ${extractTopic(feature)}: ${insight}

${cta}

${hashtags}`.trim();
}

function buildDocumentationPost({ feature, problem, solution, impact, insight, hashtags, cta, idea }) {
  const docCount = idea.metadata?.doc_changes || 'several';
  
  return `Took a break from features today to focus on documentation.

${solution}

Why it matters: ${impact}

${insight}

${cta}

${hashtags}`.trim();
}

function buildTechnicalDecisionPost({ feature, problem, solution, impact, insight, hashtags, cta, idea }) {
  return `Made some technical decisions today that needed extra thought.

Working on ${feature.toLowerCase()}: ${problem}

${solution}

${impact}

${insight}

${cta}

${hashtags}`.trim();
}

function buildRefactorPost({ feature, problem, solution, impact, insight, hashtags, cta, totalWeight, commits }) {
  return `${totalWeight} lines changed across ${commits.length} commits today.

What started as a small cleanup in ${feature.toLowerCase()} turned into a proper refactor.

The problem: ${problem}

${solution}

${impact}

${insight}

${cta}

${hashtags}`.trim();
}

function buildTestingPost({ feature, problem, solution, impact, insight, hashtags, cta, idea }) {
  const testCount = idea.metadata?.testChanges || 'multiple';
  
  return `Testing day. Added and updated ${testCount} tests for ${feature.toLowerCase()}.

Not the most glamorous work, but necessary.

${solution}

${impact}

${insight}

${cta}

${hashtags}`.trim();
}

function buildFullStackPost({ feature, problem, solution, impact, insight, hashtags, cta, signals }) {
  const areas = Object.keys(signals).slice(0, 4).map(formatSignalForReading).join(', ');
  
  return `Full-stack kind of day.

Jumped between ${areas} while working on ${feature.toLowerCase()}.

The challenge: ${problem}

${solution}

${impact}

${insight}

${cta}

${hashtags}`.trim();
}

function buildDailySummaryPost({ feature, problem, solution, impact, insight, hashtags, cta, commits, totalWeight }) {
  return `Wrapped up today with ${commits.length} commits on ${feature.toLowerCase()}.

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
    'Search Functionality': [
      'Search results appear faster',
      'More relevant search results',
      'Better handling of complex queries',
      'Improved search experience overall'
    ],
    'UI Components': [
      'Cleaner, more consistent UI',
      'Better mobile experience',
      'Improved accessibility for all users',
      'Faster rendering on slower devices'
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
 * These are the "key learnings" that make posts valuable
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
 * Generate relevant hashtags based on feature and signals
 */
function generateHashtags(feature, signals) {
  const baseHashtags = ['#WebDev', '#SoftwareEngineering', '#DevLife', '#CodingLife', '#TechTwitter'];
  
  const featureHashtags = {
    'Authentication System': ['#Auth', '#Security', '#JWT', '#OAuth', '#WebSecurity'],
    'Payment Processing': ['#Payments', '#Fintech', '#Stripe', '#Ecommerce', '#WebDev'],
    'Real-time Chat': ['#WebSockets', '#RealTime', '#Chat', '#JavaScript', '#NodeJS'],
    'File Management': ['#FileUpload', '#CloudStorage', '#AWS', '#S3', '#Backend'],
    'Performance Optimization': ['#Performance', '#WebPerf', '#Optimization', '#Speed', '#Engineering'],
    'API Development': ['#API', '#Backend', '#NodeJS', '#RestAPI', '#GraphQL'],
    'Testing Infrastructure': ['#Testing', '#QA', '#TDD', '#Jest', '#Automation'],
    'DevOps Pipeline': ['#DevOps', '#CI', '#Docker', '#Kubernetes', '#GitHubActions'],
    'Database Architecture': ['#Database', '#SQL', '#PostgreSQL', '#MongoDB', '#DataEngineering'],
    'UI Components': ['#React', '#Frontend', '#JavaScript', '#CSS', '#WebDesign'],
    'Search Functionality': ['#Search', '#Elasticsearch', '#Algolia', '#Backend', '#Performance'],
    'Notification System': ['#Notifications', '#WebHooks', '#Backend', '#RealTime', '#NodeJS'],
    'Security Hardening': ['#CyberSecurity', '#WebSecurity', '#InfoSec', '#AppSec', '#Security'],
    'Accessibility': ['#A11y', '#Accessibility', '#WebAccessibility', '#InclusiveDesign', '#WebDev'],
    'Analytics Dashboard': ['#DataViz', '#Analytics', '#Dashboard', '#Charts', '#Frontend'],
    'State Management': ['#Redux', '#StateManagement', '#React', '#JavaScript', '#Frontend'],
    'Responsive Design': ['#ResponsiveDesign', '#MobileFirst', '#CSS', '#WebDesign', '#Frontend'],
    'Internationalization': ['#i18n', '#Internationalization', '#Localization', '#WebDev', '#Frontend']
  };
  
  const signalHashtags = {
    async_change: ['#AsyncJS', '#JavaScript', '#Promises', '#NodeJS'],
    promise_change: ['#Promises', '#JavaScript', '#AsyncAwait'],
    networking_change: ['#API', '#Networking', '#HTTP', '#Backend'],
    test_change: ['#Testing', '#QualityCode', '#TDD'],
    error_handling_change: ['#ErrorHandling', '#Resilience', '#BestPractices'],
    doc_image_change: ['#Documentation', '#TechnicalWriting', '#OpenSource'],
    jsx_change: ['#React', '#JavaScript', '#Frontend'],
    vue_change: ['#VueJS', '#JavaScript', '#Frontend']
  };
  
  const dominantSignal = Object.keys(signals).sort((a,b) => signals[b] - signals[a])[0];
  
  // Combine: 2 base + 2-3 feature-specific + 1 signal-specific
  const selected = [
    ...baseHashtags.slice(0, 2),
    ...(featureHashtags[feature] || featureHashtags['API Development']).slice(0, 2),
    ...(signalHashtags[dominantSignal] || []).slice(0, 1)
  ];
  
  // Return max 5 hashtags
  return selected.slice(0, 5).join(' ');
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
  // Extract the core context from problem statement
  const match = problem.match(/^(.*?)(without|while|when|during|in|with)/i);
  return match ? match[1].trim() : problem.split('.')[0];
}

function extractTopic(feature) {
  // Convert "Authentication System" to "authentication"
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
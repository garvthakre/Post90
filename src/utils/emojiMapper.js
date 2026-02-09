/**
 * Emoji Mapper - Adds contextual emojis to posts
 * Maps features and signals to relevant emojis
 */

export const FEATURE_EMOJIS = {
  'Authentication System': '🔐',
  'Payment Processing': '💳',
  'Real-time Chat': '💬',
  'File Management': '📁',
  'Search Functionality': '🔍',
  'Analytics Dashboard': '📊',
  'UI Components': '🎨',
  'Performance Optimization': '⚡',
  'API Development': '🔌',
  'Testing Infrastructure': '✅',
  'Notification System': '🔔',
  'Database Architecture': '🗄️',
  'DevOps Pipeline': '🚀',
  'Security Hardening': '🛡️',
  'Accessibility': '♿',
  'State Management': '🔄',
  'Responsive Design': '📱',
  'Internationalization': '🌍',
  'Background Jobs': '⚙️',
  'Data Export': '📤',
  'Data Import': '📥',
  'Rate Limiting': '🚦',
  'Resilience Patterns': '🔁',
  'Feature Development': '✨',
};

export const SIGNAL_EMOJIS = {
  'async_change': '⏳',
  'promise_change': '🤝',
  'networking_change': '🌐',
  'error_handling_change': '🛟',
  'test_change': '🧪',
  'function_change': '🔧',
  'class_change': '🏗️',
  'import_change': '📦',
  'logging_change': '📝',
  'doc_image_change': '📸',
  'doc_heading_change': '📚',
  'doc_link_change': '🔗',
  'jsx_change': '⚛️',
  'vue_change': '💚',
  'env_variable_change': '⚙️',
  'todo_fixme_change': '📌',
};

export const IMPACT_EMOJIS = {
  'HIGH_RISK': '🔴',
  'MEDIUM_RISK': '🟡',
  'LOW_RISK': '🟢',
};

export const WORK_PATTERN_EMOJIS = {
  'iterative': '🔄',
  'big changes': '💥',
  'steady progress': '📈',
  'concentrated burst': '⚡',
  'full day': '🌅',
};

/**
 * Get emoji for a feature
 */
export function getFeatureEmoji(feature) {
  return FEATURE_EMOJIS[feature] || '💻';
}

/**
 * Get emoji for dominant signal
 */
export function getSignalEmoji(signal) {
  return SIGNAL_EMOJIS[signal] || '🔨';
}

/**
 * Get emoji for impact level
 */
export function getImpactEmoji(impact) {
  return IMPACT_EMOJIS[impact] || '⚪';
}

/**
 * Generate contextual emoji line for post
 */
export function generateEmojiContext(feature, dominantSignal, impact) {
  const emojis = [
    getFeatureEmoji(feature),
    getSignalEmoji(dominantSignal),
    getImpactEmoji(impact)
  ];
  
  return emojis.join(' ');
}

/**
 * Add emojis to post sections intelligently
 */
export function enrichPostWithEmojis(post, metadata) {
  const { feature, dominantSignal, impact } = metadata;
  
  // Add feature emoji to first mention of feature
  let enriched = post;
  
  // Add emoji to feature mentions (case insensitive, first occurrence only)
  const featureEmoji = getFeatureEmoji(feature);
  const featureLower = feature.toLowerCase();
  const regex = new RegExp(`\\b${featureLower}\\b`, 'i');
  enriched = enriched.replace(regex, `${featureEmoji} ${feature.toLowerCase()}`);
  
  // Add context emojis to impact/stats sections
  if (enriched.includes('Impact:')) {
    enriched = enriched.replace('Impact:', `${getImpactEmoji(impact)} Impact:`);
  }
  
  return enriched;
}

/**
 * Get emoji for time-based posts
 */
export function getTimeEmoji() {
  const hour = new Date().getHours();
  
  if (hour < 6) return '🌙'; // Night owl
  if (hour < 12) return '☀️'; // Morning
  if (hour < 17) return '🌤️'; // Afternoon
  if (hour < 21) return '🌆'; // Evening
  return '🌙'; // Night
}

/**
 * Get celebration emoji based on achievement
 */
export function getCelebrationEmoji(commits, filesChanged) {
  if (commits > 20) return '🎉'; // Big day
  if (commits > 10) return '👏'; // Productive
  if (filesChanged > 50) return '💪'; // Lots of changes
  return '✨'; // Normal progress
}
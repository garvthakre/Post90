/**
 * GitHub Stats Widget Generator
 * Creates visual stats summaries for posts
 */

import { getImpactEmoji, getCelebrationEmoji, getTimeEmoji } from './emojiMapper.js';

/**
 * Generate a compact stats widget for posts
 */
export function generateStatsWidget(analysis, options = {}) {
  const { 
    totalCommits, 
    totalFilesChanged, 
    totalWeight, 
    signals,
    impacts 
  } = analysis;
  
  const style = options.style || 'compact'; // compact, detailed, minimal
  const useEmojis = options.useEmojis !== false;
  
  if (style === 'minimal') {
    return generateMinimalStats(totalCommits, totalFilesChanged, totalWeight, useEmojis);
  }
  
  if (style === 'detailed') {
    return generateDetailedStats(analysis, useEmojis);
  }
  
  // Default: compact
  return generateCompactStats(totalCommits, totalFilesChanged, signals, useEmojis);
}

/**
 * Compact stats - one line
 */
function generateCompactStats(commits, files, signals, useEmojis) {
  const signalCount = Object.keys(signals).length;
  
  if (useEmojis) {
    return `📊 ${commits} commits • ${files} files • ${signalCount} focus areas`;
  }
  
  return `${commits} commits | ${files} files | ${signalCount} focus areas`;
}

/**
 * Minimal stats - super brief
 */
function generateMinimalStats(commits, files, weight, useEmojis) {
  if (useEmojis) {
    return `${getCelebrationEmoji(commits, files)} ${commits} commits, ${files} files`;
  }
  
  return `${commits} commits, ${files} files`;
}

/**
 * Detailed stats - multi-line breakdown
 */
function generateDetailedStats(analysis, useEmojis) {
  const { 
    totalCommits, 
    totalFilesChanged, 
    totalWeight, 
    signals,
    impacts 
  } = analysis;
  
  const topSignals = Object.entries(signals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([signal, count]) => formatSignalName(signal));
  
  const lines = [];
  
  if (useEmojis) {
    lines.push(`📊 Today's Work Summary:`);
    lines.push(`   • ${totalCommits} commits pushed`);
    lines.push(`   • ${totalFilesChanged} files modified`);
    lines.push(`   • ${totalWeight} lines changed`);
    
    if (topSignals.length > 0) {
      lines.push(`   • Focus: ${topSignals.join(', ')}`);
    }
    
    if (impacts.HIGH_RISK > 0) {
      lines.push(`   🔴 ${impacts.HIGH_RISK} high-impact changes`);
    }
  } else {
    lines.push(`Today's Work Summary:`);
    lines.push(`- ${totalCommits} commits`);
    lines.push(`- ${totalFilesChanged} files`);
    lines.push(`- ${totalWeight} lines changed`);
    
    if (topSignals.length > 0) {
      lines.push(`- Focus areas: ${topSignals.join(', ')}`);
    }
  }
  
  return lines.join('\n');
}

/**
 * Generate inline stats for within post text
 */
export function generateInlineStats(commits, files) {
  if (commits === 1) {
    return `1 commit, ${files} ${files === 1 ? 'file' : 'files'}`;
  }
  
  return `${commits} commits across ${files} ${files === 1 ? 'file' : 'files'}`;
}

/**
 * Generate visual progress bar
 */
export function generateProgressBar(percentage, width = 10) {
  const filled = Math.round((percentage / 100) * width);
  const empty = width - filled;
  
  return `[${'█'.repeat(filled)}${'░'.repeat(empty)}] ${percentage}%`;
}

/**
 * Generate commit frequency indicator
 */
export function generateCommitFrequency(commits, timeSpan) {
  if (timeSpan === 'concentrated burst') {
    return `${commits} commits in quick succession ⚡`;
  }
  
  if (timeSpan === 'full day') {
    return `${commits} commits throughout the day 🌅`;
  }
  
  return `${commits} commits over ${timeSpan} 📈`;
}

/**
 * Generate impact summary
 */
export function generateImpactSummary(impacts, useEmojis = true) {
  const parts = [];
  
  if (impacts.HIGH_RISK > 0) {
    parts.push(useEmojis 
      ? `${getImpactEmoji('HIGH_RISK')} ${impacts.HIGH_RISK} critical`
      : `${impacts.HIGH_RISK} high-impact`
    );
  }
  
  if (impacts.MEDIUM_RISK > 0) {
    parts.push(useEmojis
      ? `${getImpactEmoji('MEDIUM_RISK')} ${impacts.MEDIUM_RISK} moderate`
      : `${impacts.MEDIUM_RISK} medium-impact`
    );
  }
  
  if (impacts.LOW_RISK > 0) {
    parts.push(useEmojis
      ? `${getImpactEmoji('LOW_RISK')} ${impacts.LOW_RISK} minor`
      : `${impacts.LOW_RISK} low-impact`
    );
  }
  
  return parts.join(', ');
}

/**
 * Generate signal breakdown
 */
export function generateSignalBreakdown(signals, maxSignals = 5) {
  const entries = Object.entries(signals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxSignals);
  
  const total = Object.values(signals).reduce((a, b) => a + b, 0);
  
  return entries.map(([signal, count]) => {
    const percentage = Math.round((count / total) * 100);
    const name = formatSignalName(signal);
    return `${name} (${percentage}%)`;
  }).join(', ');
}

/**
 * Generate time-based greeting
 */
export function generateTimeGreeting() {
  const hour = new Date().getHours();
  const emoji = getTimeEmoji();
  
  if (hour < 6) return `Late night coding session ${emoji}`;
  if (hour < 12) return `Morning progress ${emoji}`;
  if (hour < 17) return `Afternoon work ${emoji}`;
  if (hour < 21) return `Evening coding ${emoji}`;
  return `Night owl mode ${emoji}`;
}

/**
 * Generate streak indicator (if you track daily commits)
 */
export function generateStreakIndicator(daysInRow) {
  if (daysInRow >= 30) return '🔥 30+ day streak!';
  if (daysInRow >= 7) return '🔥 Week streak!';
  if (daysInRow >= 3) return '⚡ Building momentum';
  return '✨ Making progress';
}

/**
 * Generate velocity indicator
 */
export function generateVelocity(commits, timeSpan) {
  // Calculate commits per hour
  const hours = {
    'concentrated burst': 2,
    'morning/afternoon': 4,
    'full day': 8
  }[timeSpan] || 8;
  
  const velocity = commits / hours;
  
  if (velocity > 3) return 'High velocity 🚀';
  if (velocity > 1.5) return 'Steady pace 📈';
  return 'Thoughtful progress 🎯';
}

/**
 * Helper: Format signal names for display
 */
function formatSignalName(signal) {
  const nameMap = {
    'async_change': 'async patterns',
    'networking_change': 'API work',
    'error_handling_change': 'error handling',
    'test_change': 'testing',
    'promise_change': 'promises',
    'function_change': 'refactoring',
    'import_change': 'dependencies',
    'class_change': 'architecture',
    'logging_change': 'logging',
    'jsx_change': 'React',
    'vue_change': 'Vue',
    'doc_image_change': 'documentation',
    'doc_heading_change': 'docs structure',
    'env_variable_change': 'configuration',
  };
  
  return nameMap[signal] || signal.replace(/_/g, ' ');
}

/**
 * Generate complete stats section for post
 */
export function generateCompleteStatsSection(analysis, options = {}) {
  const { style = 'compact', useEmojis = true, includeBreakdown = false } = options;
  
  const sections = [];
  
  // Main stats
  sections.push(generateStatsWidget(analysis, { style, useEmojis }));
  
  // Optional: Signal breakdown
  if (includeBreakdown && Object.keys(analysis.signals).length > 0) {
    sections.push('');
    sections.push(generateSignalBreakdown(analysis.signals, 3));
  }
  
  // Optional: Impact summary
  if (analysis.impacts && (analysis.impacts.HIGH_RISK > 0 || analysis.impacts.MEDIUM_RISK > 0)) {
    sections.push('');
    sections.push(generateImpactSummary(analysis.impacts, useEmojis));
  }
  
  return sections.join('\n');
}
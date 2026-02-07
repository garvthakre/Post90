import { mapIntent } from './intentMapper.js';

export function generatePostIdeas(aggregatedAnalysis) {
  const ideas = [];
  
  // Analyze the day's work and generate different angles
  const { totalCommits, signals, impacts, totalWeight } = aggregatedAnalysis;
  
  // Idea 1: High-level daily summary
  ideas.push({
    type: 'daily_summary',
    angle: 'productivity',
    title: `📊 Daily Summary: ${totalCommits} commits`,
    description: `Overview of the day's work with key metrics`,
    metadata: {
      commits: totalCommits,
      filesChanged: aggregatedAnalysis.totalFilesChanged,
      totalWeight,
      impacts
    }
  });
  
  // Idea 2: Focus on the most significant change type
  const topSignal = getTopSignal(signals);
  if (topSignal) {
    ideas.push({
      type: 'focused_technical',
      angle: topSignal.signal,
      title: `🔧 ${formatSignalName(topSignal.signal)}`,
      description: `Deep dive into the main technical work of the day`,
      metadata: {
        signal: topSignal.signal,
        count: topSignal.count,
        percentage: ((topSignal.count / Object.values(signals).reduce((a, b) => a + b, 0)) * 100).toFixed(0)
      }
    });
  }
  
  // Idea 3: Learning/growth angle (if async or error handling)
  if (signals.async_change || signals.promise_change || signals.error_handling_change) {
    ideas.push({
      type: 'learning',
      angle: 'async_mastery',
      title: `📚 Learning: Async Patterns`,
      description: `Share insights about async programming challenges`,
      metadata: {
        async_changes: signals.async_change || 0,
        promise_changes: signals.promise_change || 0,
        error_handling: signals.error_handling_change || 0
      }
    });
  }
  
  // Idea 4: Documentation/build in public (if doc changes)
  if (signals.doc_image_change || signals.doc_heading_change || signals.doc_link_change) {
    ideas.push({
      type: 'build_in_public',
      angle: 'documentation',
      title: `📝 Documentation Progress`,
      description: `Share the importance of good documentation`,
      metadata: {
        doc_changes: (signals.doc_image_change || 0) + (signals.doc_heading_change || 0) + (signals.doc_link_change || 0)
      }
    });
  }
  
  // Idea 5: High-stakes technical decision (if high risk changes)
  if (impacts.HIGH_RISK > 0) {
    ideas.push({
      type: 'technical_decision',
      angle: 'risk_management',
      title: `⚠️ Technical Decisions: Managing Risk`,
      description: `Discuss careful engineering decisions made today`,
      metadata: {
        highRiskCommits: impacts.HIGH_RISK,
        networking: signals.networking_change || 0,
        env_variables: signals.env_variable_change || 0
      }
    });
  }
  
  // Idea 6: Refactoring/code quality (if large weight)
  if (totalWeight > 500) {
    ideas.push({
      type: 'engineering_practice',
      angle: 'refactoring',
      title: `♻️ Big Refactor: ${totalWeight} lines changed`,
      description: `Share the story of a major code improvement`,
      metadata: {
        linesChanged: totalWeight,
        commits: totalCommits
      }
    });
  }
  
  // Idea 7: Testing focus (if test changes)
  if (signals.test_change) {
    ideas.push({
      type: 'quality',
      angle: 'testing',
      title: `✅ Testing & Quality`,
      description: `Emphasize the importance of testing`,
      metadata: {
        testChanges: signals.test_change
      }
    });
  }
  
  // Idea 8: Multi-faceted day (if many different signal types)
  const signalTypes = Object.keys(signals).length;
  if (signalTypes >= 5) {
    ideas.push({
      type: 'variety',
      angle: 'full_stack_day',
      title: `🌈 Full-Stack Day: ${signalTypes} different types of work`,
      description: `Highlight the variety of work accomplished`,
      metadata: {
        signalTypes,
        signals: Object.keys(signals)
      }
    });
  }
  
  return ideas;
}

function getTopSignal(signals) {
  const entries = Object.entries(signals);
  if (entries.length === 0) return null;
  
  entries.sort((a, b) => b[1] - a[1]);
  return {
    signal: entries[0][0],
    count: entries[0][1]
  };
}

function formatSignalName(signal) {
  return signal
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
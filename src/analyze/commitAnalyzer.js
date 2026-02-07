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
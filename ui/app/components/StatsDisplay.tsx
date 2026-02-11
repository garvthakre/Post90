'use client'

import { useState } from 'react'

interface StatsDisplayProps {
  stats: {
    totalCommits: number
    totalFilesChanged: number
    totalWeight: number
    signals: { [key: string]: number }
    impacts: {
      HIGH_RISK: number
      MEDIUM_RISK: number
      LOW_RISK: number
    }
    feature: string
    repoCount: number
    repos: string[]
  }
}

export default function StatsDisplay({ stats }: StatsDisplayProps) {
  const [expanded, setExpanded] = useState(false)

  const formatSignalName = (signal: string) => {
    const nameMap: { [key: string]: string } = {
      async_change: 'Async Patterns',
      networking_change: 'API Work',
      error_handling_change: 'Error Handling',
      test_change: 'Testing',
      promise_change: 'Promises',
      function_change: 'Refactoring',
      import_change: 'Dependencies',
      class_change: 'Architecture',
      logging_change: 'Logging',
      jsx_change: 'React',
      vue_change: 'Vue',
      doc_image_change: 'Documentation',
      doc_heading_change: 'Docs Structure',
      env_variable_change: 'Configuration',
    }
    return nameMap[signal] || signal.replace(/_/g, ' ')
  }

  const getSignalIcon = (signal: string) => {
    const iconMap: { [key: string]: string } = {
      async_change: '⏳',
      networking_change: '🌐',
      error_handling_change: '🛟',
      test_change: '🧪',
      promise_change: '🤝',
      function_change: '🔧',
      class_change: '🏗️',
      import_change: '📦',
      logging_change: '📝',
      jsx_change: '⚛️',
      vue_change: '💚',
      doc_image_change: '📸',
      doc_heading_change: '📚',
      env_variable_change: '⚙️',
    }
    return iconMap[signal] || '🔨'
  }

  const topSignals = Object.entries(stats.signals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, expanded ? 10 : 5)

  const totalSignals = Object.values(stats.signals).reduce((a, b) => a + b, 0)

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden sticky top-24">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
        <h3 className="text-xl font-bold mb-2">Commit Analysis</h3>
        <p className="text-blue-100 text-sm">
          Based on your GitHub activity
        </p>
      </div>

      {/* Main Stats */}
      <div className="p-6 space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <div className="text-2xl font-bold text-blue-900">
              {stats.totalCommits}
            </div>
            <div className="text-xs text-blue-700 font-medium">
              Commits
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-100">
            <div className="text-2xl font-bold text-green-900">
              {stats.totalFilesChanged}
            </div>
            <div className="text-xs text-green-700 font-medium">
              Files Changed
            </div>
          </div>
        </div>

        {/* Feature Detected */}
        <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
          <div className="text-xs text-purple-700 font-semibold mb-1">
            DETECTED FEATURE
          </div>
          <div className="text-lg font-bold text-purple-900">
            {stats.feature}
          </div>
        </div>

        {/* Lines Changed */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-slate-700">
              Lines Changed
            </span>
            <span className="text-sm font-bold text-slate-900">
              {stats.totalWeight}
            </span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-cyan-600"
              style={{ 
                width: `${Math.min((stats.totalWeight / 1000) * 100, 100)}%` 
              }}
            />
          </div>
        </div>

        {/* Impact Distribution */}
        <div>
          <h4 className="text-sm font-semibold text-slate-700 mb-3">
            Risk Distribution
          </h4>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-red-700">
                    🔴 High Risk
                  </span>
                  <span className="text-xs font-bold text-slate-900">
                    {stats.impacts.HIGH_RISK}
                  </span>
                </div>
                <div className="h-1.5 bg-red-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-600"
                    style={{ 
                      width: `${(stats.impacts.HIGH_RISK / stats.totalCommits) * 100}%` 
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-orange-700">
                    🟡 Medium Risk
                  </span>
                  <span className="text-xs font-bold text-slate-900">
                    {stats.impacts.MEDIUM_RISK}
                  </span>
                </div>
                <div className="h-1.5 bg-orange-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-600"
                    style={{ 
                      width: `${(stats.impacts.MEDIUM_RISK / stats.totalCommits) * 100}%` 
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-green-700">
                    🟢 Low Risk
                  </span>
                  <span className="text-xs font-bold text-slate-900">
                    {stats.impacts.LOW_RISK}
                  </span>
                </div>
                <div className="h-1.5 bg-green-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-600"
                    style={{ 
                      width: `${(stats.impacts.LOW_RISK / stats.totalCommits) * 100}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Signals */}
        <div>
          <h4 className="text-sm font-semibold text-slate-700 mb-3">
            Code Patterns
          </h4>
          <div className="space-y-2">
            {topSignals.map(([signal, count]) => (
              <div key={signal} className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-lg flex-shrink-0">
                    {getSignalIcon(signal)}
                  </span>
                  <span className="text-xs text-slate-700 truncate">
                    {formatSignalName(signal)}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="text-xs font-bold text-slate-900">
                    {count}
                  </div>
                  <div className="text-xs text-slate-500">
                    ({Math.round((count / totalSignals) * 100)}%)
                  </div>
                </div>
              </div>
            ))}
          </div>

          {Object.keys(stats.signals).length > 5 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-full mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {expanded ? 'Show Less' : `Show All (${Object.keys(stats.signals).length})`}
            </button>
          )}
        </div>

        {/* Repositories */}
        {stats.repoCount > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-slate-700 mb-2">
              Repositories ({stats.repoCount})
            </h4>
            <div className="space-y-1">
              {stats.repos.map((repo, idx) => (
                <div
                  key={idx}
                  className="text-xs text-slate-600 bg-slate-50 rounded px-3 py-2 border border-slate-200"
                >
                  📁 {repo}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 text-center">
        <p className="text-xs text-slate-500">
          Analysis based on last 24 hours
        </p>
      </div>
    </div>
  )
}
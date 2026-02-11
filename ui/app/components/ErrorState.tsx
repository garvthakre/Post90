'use client'

interface ErrorStateProps {
  error: string
  onRetry: () => void
}

export default function ErrorState({ error, onRetry }: ErrorStateProps) {
  const commonErrors = [
    {
      pattern: /user not found|404/i,
      title: 'User Not Found',
      message: 'The GitHub username you entered doesn\'t exist. Please check the spelling and try again.',
      icon: '🔍'
    },
    {
      pattern: /no commits|no activity/i,
      title: 'No Recent Activity',
      message: 'No commits found in the last 24 hours. Try again after you make some commits!',
      icon: '📅'
    },
    {
      pattern: /rate limit|too many requests/i,
      title: 'Rate Limit Reached',
      message: 'GitHub API rate limit reached. Please try again in a few minutes.',
      icon: '⏰'
    },
    {
      pattern: /network|timeout|fetch/i,
      title: 'Connection Error',
      message: 'Unable to connect to GitHub. Please check your internet connection and try again.',
      icon: '🌐'
    }
  ]

  const matchedError = commonErrors.find(e => e.pattern.test(error))
  const errorInfo = matchedError || {
    title: 'Something Went Wrong',
    message: 'We encountered an unexpected error. Please try again.',
    icon: '⚠️'
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-red-200 p-8 md:p-12">
        {/* Error Icon */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-3xl">{errorInfo.icon}</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            {errorInfo.title}
          </h2>
          <p className="text-slate-600">
            {errorInfo.message}
          </p>
        </div>

        {/* Error Details */}
        <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-100">
          <div className="text-sm font-mono text-red-700">
            {error}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onRetry}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all font-semibold shadow-lg"
          >
            Try Again
          </button>
          <a
            href="/"
            className="flex-1 px-6 py-3 bg-white text-slate-700 rounded-lg border-2 border-slate-300 hover:border-slate-400 transition-all font-semibold text-center"
          >
            Go Home
          </a>
        </div>

        {/* Help Section */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <div className="flex items-start gap-3">
            <div className="text-xl">💡</div>
            <div>
              <div className="font-semibold text-blue-900 text-sm mb-2">Quick Tips:</div>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Make sure the GitHub username is spelled correctly</li>
                <li>• Ensure you have public commits in the last 24 hours</li>
                <li>• Check if your repositories are public</li>
                <li>• Try again in a few minutes if rate limited</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
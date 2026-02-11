'use client'

import { useEffect, useState } from 'react'

interface LoadingStateProps {
  progress: number
}

export default function LoadingState({ progress }: LoadingStateProps) {
  const [currentStep, setCurrentStep] = useState(0)

  const steps = [
    { label: 'Fetching commits', description: 'Analyzing your GitHub activity', icon: '📡' },
    { label: 'Analyzing changes', description: 'Detecting code patterns', icon: '🔍' },
    { label: 'Detecting features', description: 'Identifying what you built', icon: '🎯' },
    { label: 'Generating posts', description: 'Creating engaging content', icon: '✨' }
  ]

  useEffect(() => {
    if (progress >= 25 && progress < 50) setCurrentStep(1)
    else if (progress >= 50 && progress < 75) setCurrentStep(2)
    else if (progress >= 75) setCurrentStep(3)
    else setCurrentStep(0)
  }, [progress])

  return (
    <div className="max-w-2xl mx-auto">
      {/* Main Card */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 md:p-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full mx-auto mb-4 flex items-center justify-center animate-pulse">
            <svg className="w-8 h-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Analyzing Your Work
          </h2>
          <p className="text-slate-600">
            This usually takes less than 30 seconds
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-slate-700">
              {steps[currentStep].label}
            </span>
            <span className="text-sm font-bold text-blue-600">
              {progress}%
            </span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-cyan-600 transition-all duration-500 ease-out rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-slate-500 mt-2">
            {steps[currentStep].description}
          </p>
        </div>

        {/* Steps Indicator */}
        <div className="space-y-3">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`flex items-center gap-4 p-3 rounded-lg transition-all ${
                index === currentStep
                  ? 'bg-blue-50 border-2 border-blue-200'
                  : index < currentStep
                  ? 'bg-green-50 border-2 border-green-200'
                  : 'bg-slate-50 border-2 border-slate-100'
              }`}
            >
              <div className={`text-2xl ${
                index === currentStep ? 'animate-bounce' : ''
              }`}>
                {index < currentStep ? '✅' : step.icon}
              </div>
              <div className="flex-1">
                <div className={`font-semibold text-sm ${
                  index === currentStep
                    ? 'text-blue-900'
                    : index < currentStep
                    ? 'text-green-900'
                    : 'text-slate-500'
                }`}>
                  {step.label}
                </div>
                <div className={`text-xs ${
                  index === currentStep
                    ? 'text-blue-700'
                    : index < currentStep
                    ? 'text-green-700'
                    : 'text-slate-400'
                }`}>
                  {step.description}
                </div>
              </div>
              {index === currentStep && (
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
                </div>
              )}
              {index < currentStep && (
                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          ))}
        </div>

        {/* Fun Facts */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <div className="flex items-start gap-3">
            <div className="text-xl">💡</div>
            <div>
              <div className="font-semibold text-blue-900 text-sm mb-1">Did you know?</div>
              <div className="text-sm text-blue-700">
                We analyze your commit patterns, code changes, and technical decisions to create authentic posts that showcase your real engineering work.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Option */}
      <div className="text-center mt-6">
        <button className="text-sm text-slate-500 hover:text-slate-700 transition-colors">
          Cancel generation
        </button>
      </div>
    </div>
  )
}
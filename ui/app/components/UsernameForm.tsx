'use client'

import { useState } from 'react'

interface UsernameFormProps {
  onGenerate: (data: {
    username: string
    repo?: string
    tones: string[]
    useEmojis: boolean
    statsStyle: string
    postLength: 'quick' | 'standard' | 'detailed'
  }) => void
}

export default function UsernameForm({ onGenerate }: UsernameFormProps) {
  const [username, setUsername] = useState('')
  const [repo, setRepo] = useState('')
  const [selectedTones, setSelectedTones] = useState<string[]>(['pro', 'fun', 'concise'])
  const [useEmojis, setUseEmojis] = useState(true)
  const [statsStyle, setStatsStyle] = useState('compact')
  const [postLength, setPostLength] = useState<'quick' | 'standard' | 'detailed'>('standard')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [errors, setErrors] = useState<{ username?: string; repo?: string }>({})

  const toneOptions = [
    { value: 'pro', label: 'Professional', description: 'Clear, industry-standard tone' },
    { value: 'fun', label: 'Playful', description: 'Light and witty' },
    { value: 'concise', label: 'Concise', description: 'No fluff, just essentials' },
    { value: 'devlife', label: 'DevLife', description: 'Casual developer tone' },
    { value: 'detailed', label: 'Detailed', description: 'Explanatory with context' },
    { value: 'optimistic', label: 'Optimistic', description: 'Positive and upbeat' }
  ]

  const lengthOptions = [
    { 
      value: 'quick' as const, 
      label: 'Quick', 
      description: 'Punchy & concise',
      range: '300-600 chars',
      icon: '⚡',
      color: 'green'
    },
    { 
      value: 'standard' as const, 
      label: 'Standard', 
      description: 'Balanced detail',
      range: '800-1200 chars',
      icon: '📝',
      color: 'blue'
    },
    { 
      value: 'detailed' as const, 
      label: 'Detailed', 
      description: 'Deep dive',
      range: '1500-2500 chars',
      icon: '📚',
      color: 'purple'
    }
  ]

  const exampleUsernames = ['garvthakre', 'torvalds', 'defunkt']

  const validateForm = () => {
    const newErrors: { username?: string; repo?: string } = {}

    if (!username.trim()) {
      newErrors.username = 'Username is required'
    } else if (!/^[a-zA-Z0-9-]+$/.test(username)) {
      newErrors.username = 'Invalid GitHub username format'
    }

    if (repo && !/^[a-zA-Z0-9-]+\/[a-zA-Z0-9-_.]+$/.test(repo)) {
      newErrors.repo = 'Format should be: username/repo-name'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      onGenerate({
        username: username.trim(),
        repo: repo.trim() || undefined,
        tones: selectedTones,
        useEmojis,
        statsStyle,
        postLength
      })
    }
  }

  const toggleTone = (tone: string) => {
    if (selectedTones.includes(tone)) {
      if (selectedTones.length > 1) {
        setSelectedTones(selectedTones.filter(t => t !== tone))
      }
    } else {
      if (selectedTones.length < 5) {
        setSelectedTones([...selectedTones, tone])
      }
    }
  }

  const fillExample = (exampleUsername: string) => {
    setUsername(exampleUsername)
    setErrors({})
  }

  const getLengthColor = (value: string) => {
    if (value === 'quick') return 'green'
    if (value === 'standard') return 'blue'
    return 'purple'
  }

  const getLengthColorClasses = (value: string, isSelected: boolean) => {
    const color = getLengthColor(value)
    const colors = {
      green: isSelected 
        ? 'border-green-600 bg-green-50' 
        : 'border-slate-200 hover:border-green-300',
      blue: isSelected 
        ? 'border-blue-600 bg-blue-50' 
        : 'border-slate-200 hover:border-blue-300',
      purple: isSelected 
        ? 'border-purple-600 bg-purple-50' 
        : 'border-slate-200 hover:border-purple-300',
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
          Generate Your LinkedIn Posts
        </h1>
        <p className="text-xl text-slate-600">
          Enter your GitHub username and let AI turn your commits into engaging posts
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
        {/* GitHub Username */}
        <div className="mb-6">
          <label htmlFor="username" className="block text-sm font-semibold text-slate-900 mb-2">
            GitHub Username *
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value)
              setErrors({ ...errors, username: undefined })
            }}
            placeholder="e.g., garvthakre"
            className={`w-full px-4 py-3 rounded-lg border ${
              errors.username ? 'border-red-500' : 'border-slate-300'
            } focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent`}
          />
          {errors.username && (
            <p className="mt-2 text-sm text-red-600">{errors.username}</p>
          )}
          
          {/* Example usernames */}
          <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
            <span>Try:</span>
            {exampleUsernames.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => fillExample(example)}
                className="text-blue-600 hover:text-blue-700 hover:underline"
              >
                {example}
              </button>
            ))}
          </div>
        </div>

        {/* Repository (Optional) */}
        <div className="mb-6">
          <label htmlFor="repo" className="block text-sm font-semibold text-slate-900 mb-2">
            Specific Repository <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <input
            id="repo"
            type="text"
            value={repo}
            onChange={(e) => {
              setRepo(e.target.value)
              setErrors({ ...errors, repo: undefined })
            }}
            placeholder="Leave blank for all repos from last 24h"
            className={`w-full px-4 py-3 rounded-lg border ${
              errors.repo ? 'border-red-500' : 'border-slate-300'
            } focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent`}
          />
          {errors.repo && (
            <p className="mt-2 text-sm text-red-600">{errors.repo}</p>
          )}
          <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-start gap-2">
              <span className="text-lg">💡</span>
              <div className="text-sm text-blue-900">
                <strong>Leave blank:</strong> Analyzes all repos with commits in last 24 hours
                <br />
                <strong>Specify repo:</strong> Analyzes only that repo (format: username/repo-name)
              </div>
            </div>
          </div>
        </div>

        {/* Post Length Selector - NEW! */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-900 mb-3">
            Post Length
          </label>
          <div className="grid grid-cols-3 gap-3">
            {lengthOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setPostLength(option.value)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  getLengthColorClasses(option.value, postLength === option.value)
                }`}
              >
                <div className="flex flex-col items-center text-center gap-2">
                  <span className="text-3xl">{option.icon}</span>
                  <div>
                    <div className="font-semibold text-slate-900 text-sm">
                      {option.label}
                    </div>
                    <div className="text-xs text-slate-600 mt-1">
                      {option.description}
                    </div>
                    <div className="text-xs text-slate-500 mt-1 font-mono">
                      {option.range}
                    </div>
                  </div>
                  {postLength === option.value && (
                    <svg className="w-5 h-5 text-current" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </button>
            ))}
          </div>
          <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-start gap-2 text-sm text-slate-700">
              <span className="text-lg">ℹ️</span>
              <div>
                <strong>Quick:</strong> Twitter-like, punchy posts for high engagement
                <br />
                <strong>Standard:</strong> Balanced posts with enough detail
                <br />
                <strong>Detailed:</strong> In-depth posts showing technical depth
              </div>
            </div>
          </div>
        </div>

        {/* Tone Selection */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-900 mb-3">
            Select Tones ({selectedTones.length}/5)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {toneOptions.map((tone) => (
              <button
                key={tone.value}
                type="button"
                onClick={() => toggleTone(tone.value)}
                className={`p-3 rounded-lg border-2 text-left transition-all ${
                  selectedTones.includes(tone.value)
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900 text-sm">
                      {tone.label}
                    </div>
                    <div className="text-xs text-slate-600 mt-1">
                      {tone.description}
                    </div>
                  </div>
                  {selectedTones.includes(tone.value) && (
                    <svg className="w-5 h-5 text-blue-600 flex-shrink-0 ml-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </button>
            ))}
          </div>
          <p className="mt-2 text-sm text-slate-500">
            Select 1-5 tones to generate different variations
          </p>
        </div>

        {/* Advanced Options */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors"
          >
            <svg
              className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-90' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            Advanced Options
          </button>

          {showAdvanced && (
            <div className="mt-4 p-4 bg-slate-50 rounded-lg space-y-4">
              {/* Emoji Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-slate-900 text-sm">Use Emojis</div>
                  <div className="text-xs text-slate-600">Add contextual emojis to posts</div>
                </div>
                <button
                  type="button"
                  onClick={() => setUseEmojis(!useEmojis)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    useEmojis ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      useEmojis ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Stats Style */}
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Stats Display Style
                </label>
                <select
                  value={statsStyle}
                  onChange={(e) => setStatsStyle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm"
                >
                  <option value="compact">Compact</option>
                  <option value="detailed">Detailed</option>
                  <option value="minimal">Minimal</option>
                  <option value="none">None</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all font-semibold text-lg shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 hover:scale-[1.02]"
        >
          Generate Posts →
        </button>
      </form>

      {/* Info Cards */}
      <div className="mt-8 grid md:grid-cols-3 gap-4">
        <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 border border-slate-200">
          <div className="text-2xl mb-2">⚡</div>
          <div className="font-semibold text-slate-900 text-sm">Fast Generation</div>
          <div className="text-xs text-slate-600">Get results in under 30 seconds</div>
        </div>
        <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 border border-slate-200">
          <div className="text-2xl mb-2">🎯</div>
          <div className="font-semibold text-slate-900 text-sm">Smart Analysis</div>
          <div className="text-xs text-slate-600">AI detects features & patterns</div>
        </div>
        <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 border border-slate-200">
          <div className="text-2xl mb-2">✨</div>
          <div className="font-semibold text-slate-900 text-sm">Ready to Post</div>
          <div className="text-xs text-slate-600">Copy & paste to LinkedIn</div>
        </div>
      </div>
    </div>
  )
}
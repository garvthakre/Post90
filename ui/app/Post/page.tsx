'use client'

import { useState } from 'react'
import UsernameForm from '../components/UsernameForm'
import LoadingState from '../components/LoadingState'
import PostResults from '../components/PostResults'
import ErrorState from '../components/ErrorState'

type GenerateState = 'input' | 'loading' | 'results' | 'error'

interface GenerationData {
  username: string
  repo?: string
  tones: string[]
  posts: any[]
  stats: any
}

export default function GeneratePage() {
  const [state, setState] = useState<GenerateState>('input')
  const [generationData, setGenerationData] = useState<GenerationData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  const handleGenerate = async (formData: {
    username: string
    repo?: string
    tones: string[]
    useEmojis: boolean
    statsStyle: string
  }) => {
    setState('loading')
    setProgress(0)
    setError(null)

    try {
      // Step 1: Fetch commits (25%)
      setProgress(25)
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulated delay

      // Step 2: Analyze changes (50%)
      setProgress(50)
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Step 3: Detect features (75%)
      setProgress(75)
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Step 4: Generate posts (100%)
      setProgress(100)
      
      // TODO: Replace with actual API call
      const mockPosts = [
        {
          id: 1,
          tone: 'pro',
          content: `Built authentication system that handles concurrent login sessions without race conditions.

The challenge: Managing concurrent login sessions without race conditions

Implemented token refresh logic with automatic retry and race condition handling

Impact: Users can now stay logged in reliably across devices

Key learning: Token refresh is trickier than it looks - you need to handle edge cases like expired refresh tokens and concurrent requests trying to refresh simultaneously.

How do you handle session management in your apps?

#WebDev #SoftwareEngineering #DevLife #Auth #Security`,
          length: 456,
          hashtags: ['#WebDev', '#SoftwareEngineering', '#DevLife', '#Auth', '#Security']
        },
        {
          id: 2,
          tone: 'fun',
          content: `Just wrapped up some auth magic ✨

Ever tried to handle multiple login sessions at once? It's like herding cats 🐱

Built a token refresh system that actually works (after many tries 😅)

The best part? Users don't even notice it's there. That's the dream, right?

Pro tip: Edge cases are called that for a reason. They'll find you.

What's your most challenging auth bug story?

#WebDev #Auth #DevLife #JavaScript #Coding`,
          length: 398,
          hashtags: ['#WebDev', '#Auth', '#DevLife', '#JavaScript', '#Coding']
        },
        {
          id: 3,
          tone: 'concise',
          content: `Shipped: Concurrent session handling for auth system

Problem: Race conditions on token refresh
Solution: Automatic retry with request queuing
Result: Reliable cross-device login

Token refresh is harder than it looks.

Thoughts on handling auth at scale?

#Auth #WebDev #Engineering`,
          length: 267,
          hashtags: ['#Auth', '#WebDev', '#Engineering']
        }
      ]

      const mockStats = {
        totalCommits: 8,
        totalFilesChanged: 15,
        totalWeight: 342,
        signals: {
          async_change: 5,
          error_handling_change: 3,
          networking_change: 2,
          test_change: 4
        },
        impacts: {
          HIGH_RISK: 1,
          MEDIUM_RISK: 4,
          LOW_RISK: 3
        },
        feature: 'Authentication System',
        repoCount: 1,
        repos: [formData.repo || `${formData.username}/repo`]
      }

      setGenerationData({
        username: formData.username,
        repo: formData.repo,
        tones: formData.tones,
        posts: mockPosts,
        stats: mockStats
      })

      setState('results')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate posts')
      setState('error')
    }
  }

  const handleRetry = () => {
    setState('input')
    setError(null)
    setGenerationData(null)
  }

  const handleBack = () => {
    setState('input')
    setGenerationData(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <a href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">P90</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                POST90
              </span>
            </a>
            
            {state === 'results' && (
              <button
                onClick={handleBack}
                className="px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors"
              >
                ← Generate New
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {state === 'input' && (
          <UsernameForm onGenerate={handleGenerate} />
        )}

        {state === 'loading' && (
          <LoadingState progress={progress} />
        )}

        {state === 'results' && generationData && (
          <PostResults data={generationData} onBack={handleBack} />
        )}

        {state === 'error' && (
          <ErrorState error={error || 'Unknown error'} onRetry={handleRetry} />
        )}
      </main>
    </div>
  )
}
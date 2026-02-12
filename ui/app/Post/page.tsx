'use client'

import { useState } from 'react'
import UsernameForm from '../components/UsernameForm'
import LoadingState from '../components/LoadingState'
import PostResults from '../components/PostResults'
import ErrorState from '../components/ErrorState'
import { useGeneratePosts } from '@/lib/hooks'

type GenerateState = 'input' | 'loading' | 'results' | 'error'

interface GenerateParams {
  username: string
  repo?: string
  tones: string[]
  useEmojis: boolean
  statsStyle: string
  seed?: number
}

export default function GeneratePage() {
  const [state, setState] = useState<GenerateState>('input')
  const [lastParams, setLastParams] = useState<GenerateParams | null>(null)
  const generateMutation = useGeneratePosts()

  const handleGenerate = async (formData: GenerateParams) => {
    setState('loading')
    setLastParams(formData) // Save for regenerate

    try {
      const result = await generateMutation.mutateAsync(formData)
      
      if (result.success) {
        setState('results')
      } else {
        throw new Error(result.error || 'Failed to generate posts')
      }
    } catch (err) {
      setState('error')
    }
  }

  const handleRegenerate = async () => {
    if (!lastParams) return

    setState('loading')

    try {
      // Add seed to force new variation
      const result = await generateMutation.mutateAsync({
        ...lastParams,
        seed: Date.now(), // Force new variation
      })
      
      if (result.success) {
        setState('results')
      } else {
        throw new Error(result.error || 'Failed to regenerate posts')
      }
    } catch (err) {
      setState('error')
    }
  }

  const handleRetry = () => {
    setState('input')
    generateMutation.reset()
  }

  const handleBack = () => {
    setState('input')
    generateMutation.reset()
  }

  const getProgress = () => {
    if (generateMutation.isPending) {
      // Simulate progress based on time
      return 75
    }
    return 0
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
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Posts generated successfully</span>
              </div>
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
          <LoadingState progress={getProgress()} />
        )}

        {state === 'results' && generateMutation.data && (
          <PostResults 
            data={generateMutation.data.data} 
            onBack={handleBack}
            onRegenerate={handleRegenerate}
            isRegenerating={generateMutation.isPending}
          />
        )}

        {state === 'error' && (
          <ErrorState 
            error={generateMutation.error?.message || 'Unknown error'} 
            onRetry={handleRetry} 
          />
        )}
      </main>

      {/* Footer hint */}
      {state === 'input' && (
        <div className="max-w-3xl mx-auto px-6 pb-12">
          <div className="text-center text-sm text-slate-500">
            <p className="mb-2">💡 <strong>Pro tip:</strong> Leave repository blank to analyze all your recent activity</p>
            <p>Posts are generated from commits in the last 24 hours</p>
          </div>
        </div>
      )}
    </div>
  )
}
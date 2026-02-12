'use client'

import { useState } from 'react'
import UsernameForm from '../components/UsernameForm'
import LoadingState from '../components/LoadingState'
import PostResults from '../components/PostResults'
import ErrorState from '../components/ErrorState'
import { useGeneratePosts } from '@/lib/hooks'

type GenerateState = 'input' | 'loading' | 'results' | 'error'

export default function GeneratePage() {
  const [state, setState] = useState<GenerateState>('input')
  const generateMutation = useGeneratePosts()

  const handleGenerate = async (formData: {
    username: string
    repo?: string
    tones: string[]
    useEmojis: boolean
    statsStyle: string
  }) => {
    setState('loading')

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
          <LoadingState progress={getProgress()} />
        )}

        {state === 'results' && generateMutation.data && (
          <PostResults data={generateMutation.data.data} onBack={handleBack} />
        )}

        {state === 'error' && (
          <ErrorState 
            error={generateMutation.error?.message || 'Unknown error'} 
            onRetry={handleRetry} 
          />
        )}
      </main>
    </div>
  )
}
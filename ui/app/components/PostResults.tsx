'use client'

import { useState } from 'react'
import PostCard from './PostCard'
import StatsDisplay from './StatsDisplay'
import ToneSelector from './ToneSelector'

interface PostResultsProps {
  data: {
    username: string
    repo?: string
    tones: string[]
    posts: any[]
    stats: any
  }
  onBack: () => void
  onRegenerate: () => void
  isRegenerating?: boolean
}

export default function PostResults({ data, onBack, onRegenerate, isRegenerating = false }: PostResultsProps) {
  const [selectedPostIndex, setSelectedPostIndex] = useState(0)
  const [viewMode, setViewMode] = useState<'single' | 'compare'>('single')
  const [compareIndices, setCompareIndices] = useState<[number, number]>([0, 1])
  const [showStats, setShowStats] = useState(true)
  const [regenerateStatus, setRegenerateStatus] = useState<'idle' | 'loading' | 'success'>('idle')

  const selectedPost = data.posts[selectedPostIndex]

  const handleCompareSelect = (index: number, position: 0 | 1) => {
    const newIndices: [number, number] = [...compareIndices]
    newIndices[position] = index
    setCompareIndices(newIndices)
  }

  const handleRegenerate = async () => {
    setRegenerateStatus('loading')
    await onRegenerate()
    setRegenerateStatus('success')
    
    // Flash success state for 2 seconds
    setTimeout(() => {
      setRegenerateStatus('idle')
    }, 2000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              Posts Generated! 🎉
            </h1>
            <p className="text-slate-600">
              From <span className="font-semibold">@{data.username}</span>
              {data.repo && <span className="text-slate-400"> / {data.repo}</span>}
              {!data.repo && <span className="text-slate-400"> (last 24 hours)</span>}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onBack}
              className="px-4 py-2 text-slate-600 hover:text-slate-900 border border-slate-300 rounded-lg hover:border-slate-400 transition-colors"
            >
              ← New
            </button>
            <button
              onClick={handleRegenerate}
              disabled={regenerateStatus === 'loading' || isRegenerating}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                regenerateStatus === 'success'
                  ? 'bg-green-600 text-white'
                  : regenerateStatus === 'loading' || isRegenerating
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {(regenerateStatus === 'loading' || isRegenerating) && (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Regenerating...
                </span>
              )}
              {regenerateStatus === 'success' && '✨ Regenerated!'}
              {regenerateStatus === 'idle' && !isRegenerating && '🔄 Regenerate'}
            </button>
          </div>
        </div>

        {/* Info Banner */}
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
          <div className="flex items-start gap-2 text-sm text-blue-900">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <strong>💡 Not feeling these?</strong> Click Regenerate to get new variations with different angles and wording.
            </div>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-4 mt-4">
          <div className="flex bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('single')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'single'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Single View
            </button>
            <button
              onClick={() => setViewMode('compare')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'compare'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Compare
            </button>
          </div>

          <button
            onClick={() => setShowStats(!showStats)}
            className="ml-auto px-4 py-2 text-sm text-slate-600 hover:text-slate-900 border border-slate-300 rounded-lg hover:border-slate-400 transition-colors"
          >
            {showStats ? 'Hide' : 'Show'} Stats
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {viewMode === 'single' ? (
            <>
              {/* Tone Selector */}
              <ToneSelector
                posts={data.posts}
                selectedIndex={selectedPostIndex}
                onSelect={setSelectedPostIndex}
              />

              {/* Post Card */}
              <PostCard post={selectedPost} />
            </>
          ) : (
            <>
              {/* Compare Mode Header */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-blue-900">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span className="font-semibold text-sm">
                    Compare two posts side-by-side to find your favorite
                  </span>
                </div>
              </div>

              {/* Compare View */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <select
                    value={compareIndices[0]}
                    onChange={(e) => handleCompareSelect(Number(e.target.value), 0)}
                    className="w-full mb-3 px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm font-medium"
                  >
                    {data.posts.map((post, idx) => (
                      <option key={idx} value={idx}>
                        {post.tone.charAt(0).toUpperCase() + post.tone.slice(1)} Tone
                      </option>
                    ))}
                  </select>
                  <PostCard post={data.posts[compareIndices[0]]} compact />
                </div>
                <div>
                  <select
                    value={compareIndices[1]}
                    onChange={(e) => handleCompareSelect(Number(e.target.value), 1)}
                    className="w-full mb-3 px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm font-medium"
                  >
                    {data.posts.map((post, idx) => (
                      <option key={idx} value={idx}>
                        {post.tone.charAt(0).toUpperCase() + post.tone.slice(1)} Tone
                      </option>
                    ))}
                  </select>
                  <PostCard post={data.posts[compareIndices[1]]} compact />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Sidebar - Stats */}
        {showStats && (
          <div className="lg:col-span-1">
            <StatsDisplay stats={data.stats} />
          </div>
        )}
      </div>

      {/* All Posts Grid (Bottom) */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">
          All Generated Posts ({data.posts.length})
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.posts.map((post, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSelectedPostIndex(idx)
                setViewMode('single')
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              className={`text-left p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                selectedPostIndex === idx && viewMode === 'single'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-slate-900 text-sm">
                  {post.tone.charAt(0).toUpperCase() + post.tone.slice(1)}
                </span>
                <span className="text-xs text-slate-500">
                  {post.length} chars
                </span>
              </div>
              <p className="text-xs text-slate-600 line-clamp-3">
                {post.content}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
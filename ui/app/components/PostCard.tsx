'use client'

import { useState } from 'react'

interface PostCardProps {
  post: {
    id: number
    tone: string
    content: string
    length: number
    hashtags: string[]
  }
  compact?: boolean
}

export default function PostCard({ post, compact = false }: PostCardProps) {
  const [copied, setCopied] = useState(false)
  const [showLinkedInPreview, setShowLinkedInPreview] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(post.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleDownload = () => {
    const blob = new Blob([post.content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `linkedin-post-${post.tone}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getCharacterCountColor = () => {
    if (post.length > 2800) return 'text-red-600'
    if (post.length > 2500) return 'text-orange-600'
    return 'text-green-600'
  }

  return (
    <div className={`bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden ${
      compact ? '' : ''
    }`}>
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {post.tone.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="font-bold text-slate-900">
                {post.tone.charAt(0).toUpperCase() + post.tone.slice(1)} Tone
              </h3>
              <p className="text-xs text-slate-500">LinkedIn Post</p>
            </div>
          </div>
          
          {!compact && (
            <button
              onClick={() => setShowLinkedInPreview(!showLinkedInPreview)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {showLinkedInPreview ? 'Hide' : 'Show'} Preview
            </button>
          )}
        </div>

        {/* Character Count */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">
            {post.hashtags.length} hashtags
          </span>
          <span className={`font-semibold ${getCharacterCountColor()}`}>
            {post.length} / 3,000 characters
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-2 h-1 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              post.length > 2800 ? 'bg-red-600' :
              post.length > 2500 ? 'bg-orange-600' :
              'bg-green-600'
            }`}
            style={{ width: `${(post.length / 3000) * 100}%` }}
          />
        </div>
      </div>

      {/* LinkedIn Preview */}
      {showLinkedInPreview && !compact && (
        <div className="p-6 bg-slate-50 border-b border-slate-200">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">U</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-slate-900">Your Name</div>
                <div className="text-sm text-slate-500">Your Title • Now</div>
              </div>
              <svg className="w-5 h-5 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </div>
            <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
              {post.content.split('\n').slice(0, 5).join('\n')}
              {post.content.split('\n').length > 5 && '...'}
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2 text-center">
            Preview of how this will look on LinkedIn
          </p>
        </div>
      )}

      {/* Post Content */}
      <div className={`${compact ? 'p-4' : 'p-6'}`}>
        <div className={`bg-slate-50 rounded-lg p-4 border border-slate-200 ${
          compact ? 'max-h-60' : 'max-h-96'
        } overflow-y-auto`}>
          <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">
            {post.content}
          </pre>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 md:p-6 bg-slate-50 border-t border-slate-200">
        <div className={`grid ${compact ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4'} gap-3`}>
          <button
            onClick={handleCopy}
            className={`px-4 py-3 rounded-lg font-semibold transition-all text-sm ${
              copied
                ? 'bg-green-600 text-white'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {copied ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Copied!
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                  <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                </svg>
                Copy
              </span>
            )}
          </button>

          {!compact && (
            <>
              <button
                onClick={handleDownload}
                className="px-4 py-3 bg-white text-slate-700 rounded-lg border-2 border-slate-300 hover:border-slate-400 hover:bg-slate-50 font-semibold transition-all text-sm"
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Download
                </span>
              </button>

              <button
                className="px-4 py-3 bg-white text-slate-700 rounded-lg border-2 border-slate-300 hover:border-slate-400 hover:bg-slate-50 font-semibold transition-all text-sm"
                title="Coming soon!"
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                  </svg>
                  Share
                </span>
              </button>

              <button
                className="px-4 py-3 bg-gradient-to-r from-[#0077B5] to-[#00A0DC] text-white rounded-lg hover:from-[#006399] hover:to-[#0077B5] font-semibold transition-all text-sm"
                onClick={() => window.open('https://www.linkedin.com/feed/', '_blank')}
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z" clipRule="evenodd" />
                  </svg>
                  Post
                </span>
              </button>
            </>
          )}
        </div>

        {compact && (
          <button
            onClick={handleDownload}
            className="w-full mt-3 px-4 py-2 bg-white text-slate-700 rounded-lg border border-slate-300 hover:border-slate-400 hover:bg-slate-50 font-medium transition-all text-sm"
          >
            Download
          </button>
        )}
      </div>
    </div>
  )
}
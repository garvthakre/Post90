'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const SAMPLE_POST = `Built a 🔐 authentication system with next-auth today that handles concurrent login sessions without race conditions.

The challenge: Token refresh is trickier than it looks — you need to handle edge cases like expired refresh tokens and multiple requests trying to refresh simultaneously.

Implemented token refresh logic with automatic retry and race condition handling.

Impact: Users can now stay logged in reliably across devices with zero unexpected logouts.

Key learning: OAuth flows need graceful degradation. What happens when the provider is down? Your users shouldn't be locked out.

How do you handle session management in your apps?

#WebDev #SoftwareEngineering #NextJS #Authentication #DevLife`

const TONES = ['pro', 'fun', 'concise']

export default function DemoPreview() {
  const [activeTone, setActiveTone] = useState(0)
  const [copied, setCopied] = useState(false)
  const router = useRouter()

  const handleCopy = () => {
    navigator.clipboard.writeText(SAMPLE_POST)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section className="py-20 px-6 lg:px-8 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-100 rounded-full mb-4">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-sm font-medium text-green-700">Live Demo</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            See It In Action
          </h2>
          <p className="text-lg text-slate-600">
            Here's a real post generated from a developer's GitHub commits
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid md:grid-cols-5 gap-6 items-start">
          {/* Input Side */}
          <div className="md:col-span-2 space-y-4">
            {/* Commit card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3 bg-slate-800 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 bg-red-500 rounded-full" />
                  <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                </div>
                <span className="text-slate-400 text-xs font-mono ml-1">github.com</span>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium uppercase tracking-wide">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 5.323V3a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Recent Commits
                </div>
                {[
                  { msg: 'Add JWT token refresh with retry logic', time: '2h ago', tag: 'feat' },
                  { msg: 'Fix race condition in session handler', time: '3h ago', tag: 'fix' },
                  { msg: 'Add OAuth provider fallback support', time: '5h ago', tag: 'feat' },
                ].map((commit, i) => (
                  <div key={i} className="flex items-start gap-2 py-2 border-b border-slate-100 last:border-0">
                    <span className={`text-xs px-1.5 py-0.5 rounded font-mono flex-shrink-0 mt-0.5 ${
                      commit.tag === 'fix' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {commit.tag}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-700 truncate">{commit.msg}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{commit.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Arrow */}
            <div className="flex justify-center">
              <div className="flex flex-col items-center gap-1">
                <div className="w-px h-6 bg-gradient-to-b from-slate-300 to-blue-500" />
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-600/30">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="w-px h-6 bg-gradient-to-b from-blue-500 to-slate-300" />
              </div>
            </div>

            {/* Analysis badge */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-2">
              <div className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-3">AI Analysis</div>
              {[
                { label: 'Feature', value: 'Authentication System', color: 'purple' },
                { label: 'Pattern', value: 'Async + Error Handling', color: 'blue' },
                { label: 'Impact', value: 'High Risk Changes', color: 'red' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">{item.label}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    item.color === 'purple' ? 'bg-purple-100 text-purple-700' :
                    item.color === 'red' ? 'bg-red-100 text-red-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Output Side */}
          <div className="md:col-span-3">
            <div className="bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden">
              {/* Header */}
              <div className="px-5 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">Li</span>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 text-sm">Generated LinkedIn Post</div>
                    <div className="text-xs text-slate-500">3 variations ready</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {TONES.map((tone, i) => (
                    <button
                      key={tone}
                      onClick={() => setActiveTone(i)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${
                        activeTone === i
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {tone}
                    </button>
                  ))}
                </div>
              </div>

              {/* Post content */}
              <div className="p-5">
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 max-h-72 overflow-y-auto">
                  <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">
                    {SAMPLE_POST}
                  </pre>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-slate-500">
                    {SAMPLE_POST.length} / 3,000 characters
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCopy}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                        copied ? 'bg-green-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {copied ? '✓ Copied!' : 'Copy Post'}
                    </button>
                    <button
                      onClick={() => router.push('/Post')}
                      className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-200 transition-all"
                    >
                      Try Yours →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
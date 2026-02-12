'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const POSTS: Record<string, string> = {
  pro: `Built an authentication system with next-auth that handles concurrent login sessions without race conditions.

The challenge: Token refresh is trickier than it looks — expired refresh tokens and multiple simultaneous requests trying to refresh create hard-to-reproduce bugs in production.

Implemented token refresh logic with automatic retry and race condition prevention using a queue-based approach.

Impact: Users stay logged in reliably across devices with zero unexpected logouts.

Key learning: OAuth flows need graceful degradation. What happens when the provider is down? Build for failure first.

How do you handle session management in your apps?

#WebDev #SoftwareEngineering #NextJS #Authentication #DevLife`,

  fun: `JWT tokens tried to gaslight me today and honestly? I almost let them win. 🔐

Built auth with next-auth and discovered the fun world of race conditions — when 5 requests all try to refresh the token at the exact same time. Classic.

Fixed it with a request queue. Now they wait in line like civilized tokens.

The app now stays logged in instead of randomly yeeting users out. Small win, big relief.

Shoutout to everyone debugging token expiry issues at 2am — you're not alone 🫡

What's the most unhinged auth bug you've had to fix?

#WebDev #DevLife #Authentication #NextJS #BuildingInPublic`,

  concise: `Shipped: race-condition-safe token refresh for next-auth.

Root cause: multiple parallel requests all tried to refresh on expiry simultaneously.
Fix: request queue — only one refresh runs, others wait and reuse the result.

Result: zero unexpected logouts.

#WebDev #Authentication #NextJS`,
}

const TONE_META = {
  pro:     { emoji: '💼', label: 'Pro' },
  fun:     { emoji: '😄', label: 'Fun' },
  concise: { emoji: '⚡', label: 'Concise' },
}

const TONES = ['pro', 'fun', 'concise'] as const
type Tone = typeof TONES[number]

const COMMITS = [
  { msg: 'Add JWT token refresh with retry logic', time: '2h ago', tag: 'feat' },
  { msg: 'Fix race condition in session handler',  time: '3h ago', tag: 'fix'  },
  { msg: 'Add OAuth provider fallback support',    time: '5h ago', tag: 'feat' },
]

const ANALYSIS = [
  { label: 'Feature', value: 'Auth System',           color: 'purple' },
  { label: 'Pattern', value: 'Async + Error Handling', color: 'blue'   },
  { label: 'Impact',  value: 'High Risk',              color: 'red'    },
]

export default function DemoPreview() {
  const [activeTone, setActiveTone] = useState<Tone>('pro')
  const [copied, setCopied] = useState(false)
  const router = useRouter()

  const currentPost = POSTS[activeTone]

  const handleCopy = () => {
    navigator.clipboard.writeText(currentPost)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-5xl mx-auto">

        {/* Section header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-100 rounded-full mb-4">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-green-700">Live Demo</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
            See It In Action
          </h2>
          <p className="text-base text-slate-600 max-w-xl mx-auto">
            Real post generated from GitHub commits — switch tones to see how the writing style changes
          </p>
        </div>

        {/* Layout: stacked on mobile, 2-col on md+ */}
        <div className="flex flex-col md:grid md:grid-cols-5 gap-4 md:gap-6 items-start">

          {/* LEFT: Commits + Analysis */}
          <div className="md:col-span-2 flex flex-col gap-4">

            {/* Commit card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-4 py-2.5 bg-slate-800 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 bg-red-500 rounded-full" />
                  <div className="w-2.5 h-2.5 bg-yellow-500 rounded-full" />
                  <div className="w-2.5 h-2.5 bg-green-500 rounded-full" />
                </div>
                <span className="text-slate-400 text-xs font-mono ml-1">github.com</span>
              </div>
              <div className="p-4">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-3">Recent Commits</p>
                {COMMITS.map((commit, i) => (
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

            {/* Arrow: horizontal on mobile, vertical on desktop */}
            <div className="flex items-center justify-center">
              {/* Mobile: horizontal */}
              <div className="flex md:hidden items-center gap-2 w-full">
                <div className="flex-1 h-px bg-gradient-to-r from-slate-200 to-blue-500" />
                <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center shadow-md shadow-blue-600/30 flex-shrink-0">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="flex-1 h-px bg-gradient-to-r from-blue-500 to-slate-200" />
              </div>
              {/* Desktop: vertical */}
              <div className="hidden md:flex flex-col items-center gap-1">
                <div className="w-px h-5 bg-gradient-to-b from-slate-300 to-blue-500" />
                <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center shadow-md shadow-blue-600/30">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="w-px h-5 bg-gradient-to-b from-blue-500 to-slate-300" />
              </div>
            </div>

            {/* AI Analysis card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-3">AI Analysis</p>
              <div className="space-y-2">
                {ANALYSIS.map((item, i) => (
                  <div key={i} className="flex items-center justify-between gap-2">
                    <span className="text-xs text-slate-500">{item.label}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${
                      item.color === 'purple' ? 'bg-purple-100 text-purple-700' :
                      item.color === 'red'    ? 'bg-red-100 text-red-700'       :
                                                'bg-blue-100 text-blue-700'
                    }`}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: Generated Post */}
          <div className="md:col-span-3">
            <div className="bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden">

              {/* Card header */}
              <div className="px-4 py-3 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-xs">Li</span>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm leading-tight">Generated Post</p>
                      <p className="text-xs text-slate-500">Switch tones to compare ↓</p>
                    </div>
                  </div>

                  {/* Tone tabs */}
                  <div className="flex gap-1.5 flex-shrink-0">
                    {TONES.map((tone) => {
                      const meta = TONE_META[tone]
                      const isActive = activeTone === tone
                      return (
                        <button
                          key={tone}
                          onClick={() => setActiveTone(tone)}
                          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            isActive
                              ? 'bg-blue-600 text-white shadow-sm scale-105'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          <span>{meta.emoji}</span>
                          <span className="capitalize">{meta.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Post body — key prop forces remount + fade-in on tone switch */}
              <div className="p-4">
                <div
                  key={activeTone}
                  className="bg-slate-50 rounded-lg p-4 border border-slate-100 max-h-64 overflow-y-auto"
                  style={{ animation: 'fadeSlideIn 0.2s ease-out' }}
                >
                  <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">
                    {currentPost}
                  </pre>
                </div>

                {/* Footer row */}
                <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                  <span className="text-xs text-slate-400">
                    {TONE_META[activeTone].emoji} {activeTone} · {currentPost.length} chars
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCopy}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        copied
                          ? 'bg-green-600 text-white'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {copied ? '✓ Copied!' : 'Copy Post'}
                    </button>
                    <button
                      onClick={() => router.push('/Post')}
                      className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200 transition-all"
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

      <style jsx>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(5px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  )
}
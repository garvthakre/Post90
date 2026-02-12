'use client'

import { useRouter } from 'next/navigation'

export default function Hero() {
  const router = useRouter()

  const stats = [
    { value: "10+", label: "Feature Patterns" },
    { value: "6", label: "Tone Options" },
    { value: "< 30s", label: "Generation Time" }
  ]

  return (
    <section className="pt-32 pb-20 px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full mb-8">
            <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
            <span className="text-sm font-medium text-blue-600">
              Transform commits into LinkedIn posts
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 mb-6 leading-tight">
            Turn Your
            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              {" "}GitHub Work{" "}
            </span>
            Into LinkedIn Posts
          </h1>

          <p className="text-xl text-slate-600 mb-12 leading-relaxed">
            Automatically generate authentic, engaging LinkedIn posts from your daily commits.
            No more staring at blank screens.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => router.push('/Post')}
              className="w-full sm:w-auto px-10 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold text-lg shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 hover:scale-105"
            >
              Try It Free →
            </button>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto px-10 py-4 bg-white text-slate-700 rounded-lg border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all font-semibold text-lg"
            >
              See How It Works
            </a>
          </div>

          <p className="text-sm text-slate-500 mt-4">
            No sign-up required · Works with public GitHub repos
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 max-w-4xl mx-auto">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl font-bold text-slate-900 mb-2">{stat.value}</div>
              <div className="text-slate-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
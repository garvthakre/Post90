'use client'

import { useRouter } from 'next/navigation'

export default function CTA() {
  const router = useRouter()

  return (
    <section className="py-20 px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-3xl p-12 lg:p-16 shadow-2xl">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Start Sharing Your Work Today
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join developers who are building their online presence with authentic posts about their real work
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push('/Post')}
              className="px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-slate-100 transition-all font-semibold shadow-lg hover:scale-105"
            >
              Generate My Posts →
            </button>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-transparent text-white border-2 border-white rounded-lg hover:bg-white/10 transition-all font-semibold"
            >
              View on GitHub
            </a>
          </div>
          <p className="text-blue-200 text-sm mt-6">
            No sign-up · No credit card · Works instantly with your GitHub username
          </p>
        </div>
      </div>
    </section>
  )
}
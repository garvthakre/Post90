'use client'

interface ToneSelectorProps {
  posts: Array<{
    id: number
    tone: string
    content: string
    length: number
    hashtags: string[]
  }>
  selectedIndex: number
  onSelect: (index: number) => void
}

export default function ToneSelector({ posts, selectedIndex, onSelect }: ToneSelectorProps) {
  const toneInfo = {
    pro: {
      emoji: '💼',
      color: 'blue',
      description: 'Professional & Clear'
    },
    fun: {
      emoji: '😄',
      color: 'purple',
      description: 'Playful & Witty'
    },
    concise: {
      emoji: '⚡',
      color: 'green',
      description: 'Brief & Direct'
    },
    devlife: {
      emoji: '👨‍💻',
      color: 'cyan',
      description: 'Casual Developer'
    },
    detailed: {
      emoji: '📖',
      color: 'orange',
      description: 'Explanatory'
    },
    optimistic: {
      emoji: '✨',
      color: 'pink',
      description: 'Positive & Upbeat'
    }
  }

  const getColorClasses = (color: string, isSelected: boolean) => {
    const colors = {
      blue: isSelected 
        ? 'border-blue-600 bg-blue-50' 
        : 'border-slate-200 hover:border-blue-300',
      purple: isSelected 
        ? 'border-purple-600 bg-purple-50' 
        : 'border-slate-200 hover:border-purple-300',
      green: isSelected 
        ? 'border-green-600 bg-green-50' 
        : 'border-slate-200 hover:border-green-300',
      cyan: isSelected 
        ? 'border-cyan-600 bg-cyan-50' 
        : 'border-slate-200 hover:border-cyan-300',
      orange: isSelected 
        ? 'border-orange-600 bg-orange-50' 
        : 'border-slate-200 hover:border-orange-300',
      pink: isSelected 
        ? 'border-pink-600 bg-pink-50' 
        : 'border-slate-200 hover:border-pink-300',
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-slate-900 mb-1">
          Select Tone
        </h3>
        <p className="text-sm text-slate-600">
          Choose the style that matches your personal brand
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {posts.map((post, index) => {
          const tone = post.tone
          const info = toneInfo[tone as keyof typeof toneInfo] || toneInfo.pro
          const isSelected = selectedIndex === index

          return (
            <button
              key={post.id}
              onClick={() => onSelect(index)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                getColorClasses(info.color, isSelected)
              }`}
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{info.emoji}</span>
                  {isSelected && (
                    <svg className="w-5 h-5 text-current" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div>
                  <div className="font-semibold text-slate-900 text-sm capitalize">
                    {tone}
                  </div>
                  <div className="text-xs text-slate-600 mt-1">
                    {info.description}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {post.length} chars
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
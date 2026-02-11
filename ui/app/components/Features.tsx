export default function Features() {
  const features = [
    {
      icon: "⚡",
      title: "Smart Analysis",
      description: "Automatically analyzes your commits to detect features, patterns, and technical decisions"
    },
    {
      icon: "✍️",
      title: "Multiple Tones",
      description: "Generate posts in professional, casual, fun, or concise tones to match your style"
    },
    {
      icon: "✅",
      title: "Copy-Paste Ready",
      description: "Get polished, authentic posts ready to share on LinkedIn in seconds"
    }
  ]

  return (
    <section id="features" className="py-20 px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Everything You Need to Share Your Work
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            POST90 analyzes your commits and creates authentic posts that showcase your engineering work
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-white p-8 rounded-2xl border border-slate-200 hover:border-blue-600 hover:shadow-lg transition-all group"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:bg-blue-600 transition-colors">
                <span className="group-hover:scale-110 transition-transform">
                  {feature.icon}
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-slate-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
export default function HowItWorks() {
  const steps = [
    {
      step: "01",
      title: "Connect GitHub",
      description: "Link your GitHub account securely. We analyze your commits from the last 24 hours."
    },
    {
      step: "02",
      title: "AI Analysis",
      description: "Our AI detects features, technical decisions, and patterns in your work automatically."
    },
    {
      step: "03",
      title: "Copy & Post",
      description: "Get multiple post variations in different tones. Pick your favorite and share!"
    }
  ]

  return (
    <section id="how-it-works" className="py-20 px-6 lg:px-8 bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            How It Works
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Three simple steps to turn your commits into engaging posts
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((item, index) => (
            <div key={index} className="relative">
              <div className="text-6xl font-bold text-slate-800 mb-4">
                {item.step}
              </div>
              <h3 className="text-2xl font-bold mb-3">
                {item.title}
              </h3>
              <p className="text-slate-400 leading-relaxed">
                {item.description}
              </p>
              {index < 2 && (
                <div className="hidden md:block absolute top-8 -right-4 w-8 h-0.5 bg-slate-800"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
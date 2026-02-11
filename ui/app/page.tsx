import Navbar from './components/Navbar'
import Hero from './components/Hero'
import DemoPreview from './components/DemoPreview'
import Features from './components/Features'
import HowItWorks from './components/HowitWorks'
import CTA from './components/CTA'
import Footer from './components/Footer'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <Navbar />
      <Hero />
      <DemoPreview />
      <Features />
      <HowItWorks />
      <CTA />
      <Footer />
    </div>
  )
}
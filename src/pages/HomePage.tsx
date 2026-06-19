import { BrowseByCategory } from '../components/BrowseByCategory'
import { CoffeeCTA } from '../components/CoffeeCTA'
import { FAQ } from '../components/FAQ'
import { Footer } from '../components/Footer'
import { Header } from '../components/Header'
import { Hero } from '../components/Hero'
import { HowItWorks } from '../components/HowItWorks'
import { PopularTools } from '../components/PopularTools'
import { PrivacyFeatures } from '../components/PrivacyFeatures'
import { StatsSection } from '../components/StatsSection'

export function HomePage() {
  return (
    <div className="app">
      <Header />
      <main>
        <Hero />
        <PopularTools />
        <BrowseByCategory />
        <PrivacyFeatures />
        <StatsSection />
        <HowItWorks />
        <FAQ />
        <CoffeeCTA />
      </main>
      <Footer />
    </div>
  )
}

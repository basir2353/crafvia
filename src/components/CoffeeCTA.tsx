import { Coffee, Heart } from 'lucide-react'
import { openDonatePage } from '../api/config'

export function CoffeeCTA() {
  return (
    <section className="coffee-cta-section">
      <div className="coffee-cta-card">
        <Coffee className="coffee-cta-icon" size={40} strokeWidth={1.5} aria-hidden />
        <h2 className="coffee-cta-title">Enjoying Crafvia?</h2>
        <p className="coffee-cta-text">
          Our tools are free for everyone. If they saved you time, consider buying
          us a coffee to keep the lights on!
        </p>
        <button
          type="button"
          className="coffee-cta-btn"
          onClick={() => openDonatePage().catch(() => {})}
        >
          <Heart size={18} fill="currentColor" aria-hidden />
          Buy Us a Coffee
        </button>
      </div>
    </section>
  )
}

'use client'
import { Reveal } from './Reveal'

const items = [
  { feature: true, quote: 'Bitlabs took our messy internal process and turned it into software our whole team actually enjoys using. Genuinely the most reliable dev partner we\'ve worked with.', name: 'Nimal Perera', role: 'Operations Director, Logistics', initials: 'NP' },
  { quote: 'Shipped our app ahead of schedule and the quality was outstanding. Clean code, clear communication.', name: 'Sarah Chen', role: 'Founder, Retail Startup', initials: 'SC' },
  { quote: 'The AI integration they built saves us hours every day. Smart team, no over-engineering.', name: 'Ravi Kumar', role: 'CTO, Fintech', initials: 'RK' },
  { quote: 'Beautiful UI and rock-solid performance. They cared about the details we didn\'t even think of.', name: 'Amaya Silva', role: 'Product Lead', initials: 'AS' },
]

export function Testimonials() {
  return (
    <section className="section-pad" id="testimonials" style={{ background: 'var(--bg-2)' }}>
      <div className="wrap">
        <div className="services-head">
          <div>
            <Reveal><span className="eyebrow">Social proof</span></Reveal>
            <Reveal delay={0.05}>
              <h2 className="h2" style={{ marginTop: 22, maxWidth: '15ch' }}>
                Teams that build <span style={{ color: 'var(--orange)', fontStyle: 'italic' }}>with us, stay with us.</span>
              </h2>
            </Reveal>
          </div>
        </div>
        <div className="t-grid">
          {items.map((t, i) => (
            <Reveal key={i} delay={(i % 3) * 0.08} className={t.feature ? 'feature-wrap' : ''}>
              <div className={'tcard' + (t.feature ? ' feature' : '')}>
                <div className="quote-mark">&ldquo;</div>
                <p>{t.quote}</p>
                <div className="who">
                  <span className="avatar">{t.initials}</span>
                  <span>
                    <span className="name" style={{ display: 'block' }}>{t.name}</span>
                    <span className="role">{t.role}</span>
                  </span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

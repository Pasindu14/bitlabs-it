'use client'
import { Counter } from './Counter'
import { Reveal } from './Reveal'

const stats = [
  { to: 80, suffix: '+', label: 'Projects delivered across web, mobile & AI' },
  { to: 45, suffix: '+', label: 'Businesses served in Sri Lanka & beyond' },
  { to: 7, suffix: '', label: 'Years building production software' },
  { to: 99, suffix: '%', label: 'On-time delivery & client retention' },
]

export function Trust() {
  return (
    <section className="trust section-pad" id="trust">
      <div className="wrap">
        <Reveal><span className="eyebrow">Trusted partner</span></Reveal>
        <Reveal delay={0.05}>
          <h2 className="h2" style={{ marginTop: 22, maxWidth: '16ch' }}>
            Trusted by businesses in Sri Lanka and beyond.
          </h2>
        </Reveal>
        <div className="stats-grid">
          {stats.map((s, i) => (
            <Reveal key={i} delay={0.1 + i * 0.08}>
              <div className="stat">
                <div className="num"><Counter to={s.to} suffix={s.suffix} /></div>
                <div className="label">{s.label}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

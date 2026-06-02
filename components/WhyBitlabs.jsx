'use client'
import { motion } from 'framer-motion'
import { Reveal } from './Reveal'

const values = [
  { n: '01', title: 'Clean, maintainable code', desc: 'Well-architected and documented — easy to extend, audit and hand over. No black boxes, ever.' },
  { n: '02', title: 'Performance-optimized', desc: 'Built for speed: fast load times, smooth interactions and efficient systems that scale under load.' },
  { n: '03', title: 'On-time delivery', desc: 'Transparent timelines and steady sprint cadence. We ship when we say we will.' },
  { n: '04', title: 'Ongoing support', desc: "We don't disappear at launch — count on us for maintenance, improvements and long-term partnership." },
]

export function WhyBitlabs() {
  return (
    <section className="section-pad" id="why">
      <div className="wrap why-grid">
        <div>
          <Reveal><span className="eyebrow">Why Bitlabs</span></Reveal>
          <Reveal delay={0.05}>
            <h2 className="h2" style={{ marginTop: 22, marginBottom: 18 }}>
              Built right, <span style={{ color: 'var(--orange)', fontStyle: 'italic' }}>built to last.</span>
            </h2>
          </Reveal>
          <div className="value-list">
            {values.map((v, i) => (
              <Reveal key={v.n} delay={i * 0.06} y={18}>
                <div className="value">
                  <div className="value-num">{v.n}</div>
                  <div>
                    <h3>{v.title}</h3>
                    <p>{v.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal delay={0.1}>
          <motion.div
            className="why-visual"
            whileHover={{ y: -6 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          >
            <div className="glow" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, position: 'relative', zIndex: 2 }}>
              <div className="code-row"><b>›</b> npm run build</div>
              <div className="code-row" style={{ color: 'var(--on-dark-40)' }}>compiling production bundle…</div>
              <div className="code-row"><b>✓</b> built in 1.42s · 0 errors</div>
              <div className="code-row"><b>✓</b> lighthouse · 100 / 100</div>
            </div>
            <div>
              <div className="why-stat-big">100<span style={{ color: 'var(--orange)' }}>%</span></div>
              <p style={{ color: 'var(--on-dark-60)', marginTop: 10, fontSize: 16, position: 'relative', zIndex: 2 }}>
                Of projects shipped with performance budgets met and a clean handover.
              </p>
            </div>
          </motion.div>
        </Reveal>
      </div>
    </section>
  )
}

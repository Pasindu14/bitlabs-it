'use client'
import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { Reveal } from './Reveal'
import { Counter } from './Counter'

// A chrome gimbal, one ring per value. Deliberately smooth/metallic — a different
// visual language from the voxel scenes elsewhere on the page. Client-only, lazy.
const WhyScene = dynamic(() => import('./hero3d/why/WhyScene'), { ssr: false })

const values = [
  { n: '01', title: 'Clean, maintainable code', desc: 'Well-architected and documented — easy to extend, audit and hand over. No black boxes, ever.', tag: 'Precision' },
  { n: '02', title: 'Performance-optimized', desc: 'Built for speed: fast load times, smooth interactions and efficient systems that scale under load.', tag: 'Speed' },
  { n: '03', title: 'On-time delivery', desc: 'Transparent timelines and steady sprint cadence. We ship when we say we will.', tag: 'Cadence' },
  { n: '04', title: 'Ongoing support', desc: "We don't disappear at launch — count on us for maintenance, improvements and long-term partnership.", tag: 'Orbit' },
]

const CYCLE_MS = 3800

export function WhyBitlabs() {
  const section = useRef(null)
  const card = useRef(null)
  const activeRef = useRef(0)
  const [active, setActive] = useState(0)
  const [held, setHeld] = useState(false) // pointer is on the list → stop auto-cycling
  const [inView, setInView] = useState(false)

  activeRef.current = active

  useEffect(() => {
    const el = section.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.25 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // Walk through the four values on their own until the visitor takes over.
  useEffect(() => {
    if (held || !inView) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return
    const id = setTimeout(() => setActive((a) => (a + 1) % values.length), CYCLE_MS)
    return () => clearTimeout(id)
  }, [active, held, inView])

  return (
    <section className="section-pad" id="why" ref={section}>
      <div className="wrap why-grid">
        <div>
          <Reveal><span className="eyebrow">Why Bitlabs</span></Reveal>
          <Reveal delay={0.05}>
            <h2 className="h2" style={{ marginTop: 22, marginBottom: 18 }}>
              Built right, <span style={{ color: 'var(--orange)', fontStyle: 'italic' }}>built to last.</span>
            </h2>
          </Reveal>
          <div
            className="value-list"
            onMouseEnter={() => setHeld(true)}
            onMouseLeave={() => setHeld(false)}
          >
            {values.map((v, i) => (
              <Reveal key={v.n} delay={i * 0.06} y={18}>
                <div
                  className={'value' + (i === active ? ' active' : '') + (held && i === active ? ' hold' : '')}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  tabIndex={0}
                >
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
            ref={card}
            whileHover={{ y: -6 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          >
            <WhyScene cardRef={card} activeRef={activeRef} />
            <div className="glow" />

            <div className="why-term">
              {[
                [<><b>›</b> npm run build</>, 0.3],
                [<>compiling production bundle…</>, 0.9, true],
                [<><b>✓</b> built in 1.42s · 0 errors</>, 1.6],
                [<><b>✓</b> lighthouse · 100 / 100</>, 2.2],
              ].map(([node, delay, dim], i) => (
                <motion.div
                  className="code-row"
                  key={i}
                  style={dim ? { color: 'var(--on-dark-40)' } : undefined}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
                >
                  {node}
                </motion.div>
              ))}
            </div>

            <div className="why-chip" aria-live="polite">
              <span className="why-chip-n">Ring {values[active].n}</span>
              <span className="why-chip-t" key={active}>{values[active].tag}</span>
            </div>

            <div className="why-foot">
              <div className="why-stat-big">
                <Counter to={100} suffix="%" duration={2.2} />
              </div>
              <p>Of projects shipped with performance budgets met and a clean handover.</p>
            </div>
          </motion.div>
        </Reveal>
      </div>
    </section>
  )
}

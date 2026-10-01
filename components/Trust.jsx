'use client'
import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'

/* ------------------------------------------------------------------ *
 * Trust — "Proof, in bits"
 *
 * A pinned, scroll-scrubbed stage. One field of glowing cubes (Three.js,
 * a single InstancedMesh) rebuilds itself for every number:
 *   80+  projects   → a skyline that grows tower by tower
 *   45+  businesses → a constellation joined by strings of bits
 *   7    years      → growth rings, one per year
 *   99%  on-time    → a gauge that fills, one segment left empty
 * The ledger on the left tallies live with the scene. Nothing is stored
 * between frames, so scrubbing backwards un-builds it.
 *
 * The copy and numbers are real HTML (screen-reader text included); the
 * 3D scene is a progressive enhancement that is skipped if WebGL is absent.
 * ------------------------------------------------------------------ */

const ProofScene = dynamic(() => import('./hero3d/proof/ProofScene'), { ssr: false })

const STATS = [
  { to: 80, suffix: '+', label: 'Projects delivered across web, mobile & AI', note: 'Every tower is a product we shipped.' },
  { to: 45, suffix: '+', label: 'Businesses served in Sri Lanka & beyond', note: 'Each node is a business. Each line, a working relationship.' },
  { to: 7, suffix: '', label: 'Years building production software', note: 'One ring for every year in production.' },
  { to: 99, suffix: '%', label: 'On-time delivery & client retention', note: 'We ship when we say we will — and clients stay.' },
]

const statement =
  'From first-time founders to established enterprises, teams choose us to design, build and ship software that performs in production.'
const ACCENT = new Set(['founders', 'enterprises,', 'ship', 'production.'])
const words = statement.split(' ')

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const smooth = (a, b, v) => {
  const t = clamp((v - a) / (b - a))
  return t * t * (3 - 2 * t)
}

export function Trust() {
  const root = useRef(null)
  const stage = useRef(null)
  const state = useMemo(() => ({ s: 0 }), [])
  const [active, setActive] = useState(0)

  useEffect(() => {
    const rootEl = root.current
    if (!rootEl) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const nums = Array.from(rootEl.querySelectorAll('[data-num]'))
    const rows = Array.from(rootEl.querySelectorAll('[data-row]'))
    const hl = Array.from(rootEl.querySelectorAll('[data-hl]'))
    const fill = rootEl.querySelector('[data-rail-fill]')
    const hint = rootEl.querySelector('[data-hint]')

    let target = 0
    let raf = 0
    let last = 0
    let running = false
    let lastIdx = -1
    let lastLit = -1
    const shown = STATS.map(() => -1)

    const measure = () => {
      const r = rootEl.getBoundingClientRect()
      const total = Math.max(1, r.height - window.innerHeight)
      target = clamp(-r.top / total) * 4
    }

    const paint = () => {
      const s = Number.isFinite(state.s) ? state.s : 0
      const idx = clamp(Math.floor(s), 0, 3)
      const tt = s - idx
      STATS.forEach((st, i) => {
        const g = i < idx ? 1 : i === idx ? smooth(0, 0.55, tt) : 0
        const v = Math.round(st.to * g)
        if (v !== shown[i]) {
          shown[i] = v
          nums[i].firstChild.nodeValue = v
        }
      })
      if (idx !== lastIdx) {
        lastIdx = idx
        rows.forEach((r, i) => r.classList.toggle('is-active', i === idx))
        setActive(idx)
      }
      // reading highlight over the first stretch of the scroll
      const lit = Math.floor(clamp(s / 0.7) * hl.length)
      if (lit !== lastLit) {
        lastLit = lit
        hl.forEach((w, i) => w.classList.toggle('on', i < lit))
      }
      if (fill) fill.style.transform = `scaleY(${(s / 4).toFixed(4)})`
      if (hint) hint.style.opacity = s > 0.05 ? '0' : '1'
    }

    const frame = (now) => {
      if (!running) return
      raf = requestAnimationFrame(frame)
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      measure()
      state.s = reduced ? target : state.s + (target - state.s) * (1 - Math.exp(-dt * 7))
      paint()
    }
    const start = () => {
      if (running) return
      running = true
      last = performance.now()
      raf = requestAnimationFrame(frame)
    }
    const stop = () => {
      running = false
      cancelAnimationFrame(raf)
    }

    measure()
    state.s = target
    paint()

    const io = new IntersectionObserver(([e]) => (e.isIntersecting && !document.hidden ? start() : stop()), {
      rootMargin: '25% 0px 25% 0px',
    })
    io.observe(rootEl)
    const inRange = () => {
      const r = rootEl.getBoundingClientRect()
      return r.bottom > -window.innerHeight * 0.25 && r.top < window.innerHeight * 1.25
    }
    const onVis = () => (document.hidden || !inRange() ? stop() : start())
    document.addEventListener('visibilitychange', onVis)
    return () => {
      stop()
      io.disconnect()
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [state])

  return (
    <section className="proof" id="trust" ref={root}>
      <div className="proof-stick" ref={stage}>
        <div className="proof-bg" aria-hidden="true" />
        <ProofScene stageRef={stage} rootRef={root} state={state} />
        <div className="proof-scrim" aria-hidden="true" />

        <div className="wrap proof-inner">
          <div className="proof-copy">
            <motion.span
              className="eyebrow"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Trusted partner
            </motion.span>

            {/* Trigger sits on the unclipped h2; the masked lines inherit its variants. */}
            <motion.h2
              className="h2 proof-title"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.08 } } }}
            >
              {['Trusted by businesses in', 'Sri Lanka and beyond.'].map((line, i) => (
                <span className="line-mask" key={i}>
                  <motion.span
                    variants={{
                      hidden: { y: '115%' },
                      show: { y: '0%', transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } },
                    }}
                  >
                    {i === 1 ? (
                      <>
                        Sri Lanka <em className="italic-accent">and beyond.</em>
                      </>
                    ) : (
                      line
                    )}
                  </motion.span>
                </span>
              ))}
            </motion.h2>

            <p className="proof-statement">
              {words.map((w, i) => (
                <Fragment key={i}>
                  <span data-hl className={ACCENT.has(w) ? 'accent' : ''}>
                    {w}
                  </span>
                  {i < words.length - 1 ? ' ' : ''}
                </Fragment>
              ))}
            </p>

            <div className="proof-ledger" role="list">
              {STATS.map((s, i) => (
                <div className={'proof-row' + (i === 0 ? ' is-active' : '')} data-row role="listitem" key={i}>
                  <span className="sr-only">
                    {s.to}
                    {s.suffix} — {s.label}
                  </span>
                  <span className="proof-idx" aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="proof-num" aria-hidden="true">
                    <span data-num>0</span>
                    {s.suffix && <span className="proof-suffix">{s.suffix}</span>}
                  </span>
                  <span className="proof-label" aria-hidden="true">
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="proof-note" aria-hidden="true">
          <span className="proof-note-k">0{(STATS[active] ? active : 0) + 1} / 04</span>
          <span className="proof-note-t" key={active}>
            {(STATS[active] || STATS[0]).note}
          </span>
        </div>
        <span className="proof-hint" data-hint aria-hidden="true">
          Scroll to build
        </span>
        <div className="proof-rail" aria-hidden="true">
          <span data-rail-fill />
        </div>
      </div>
    </section>
  )
}

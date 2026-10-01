'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { ArrowR } from './ArrowR'

/* ------------------------------------------------------------------ *
 * How we work — "From plot to launch"
 *
 * A pinned, scroll-scrubbed isometric scene. Four plots on a reflective
 * floor, joined by glowing orange lines; the camera follows the path as you
 * scroll and each plot comes alive:
 *   01 Discover → 02 Design → 03 Build → 04 Deploy → "Ready to start?"
 * The copy is plain HTML (the scene is a progressive enhancement and the
 * four steps stay readable without WebGL).
 * ------------------------------------------------------------------ */

const HowScene = dynamic(() => import('./hero3d/how/HowScene'), { ssr: false })

const steps = [
  { n: '01', title: 'Discover', desc: 'We start by understanding your goals, users and constraints — mapping the problem before writing a line of code.', meta: ['Workshops', 'Scoping', 'Strategy'] },
  { n: '02', title: 'Design', desc: 'Wireframes become polished, validated interfaces. We prototype fast and refine with your feedback at every step.', meta: ['UX flows', 'Prototyping', 'Design system'] },
  { n: '03', title: 'Build', desc: 'Clean, tested, production-grade code shipped in tight iterations — so you see real progress every single sprint.', meta: ['Agile sprints', 'QA', 'Reviews'] },
  { n: '04', title: 'Deploy', desc: 'We launch, monitor and optimise — then stay on as your long-term partner for support, updates and scaling.', meta: ['CI/CD', 'Monitoring', 'Support'] },
]

// Keep in sync with hero3d/how/timeline.js (duplicated so three.js stays out of this bundle)
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const ss = (a, b, v) => {
  const t = clamp((v - a) / (b - a))
  return t * t * (3 - 2 * t)
}
function stageOf(sRaw) {
  const s = clamp(sRaw, 0, 4)
  let f = 3
  if (s < 3) {
    const k = Math.floor(s)
    f = k + ss(k + 0.45, k + 1, s)
  }
  return { idx: Math.min(3, Math.round(f)), cta: ss(3.45, 4, s) > 0.55 }
}

export function HowWeWork() {
  const root = useRef(null)
  const stage = useRef(null)
  const labels = useRef([])
  const state = useMemo(() => ({ s: 0 }), [])
  const [idx, setIdx] = useState(0)
  const [cta, setCta] = useState(false)

  useEffect(() => {
    const el = root.current
    if (!el) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const fill = el.querySelector('[data-how-fill]')
    let target = 0
    let raf = 0
    let last = 0
    let running = false
    let lastIdx = -1
    let lastCta = null

    const measure = () => {
      const r = el.getBoundingClientRect()
      target = clamp(-r.top / Math.max(1, r.height - window.innerHeight)) * 4
    }
    const frame = (now) => {
      if (!running) return
      raf = requestAnimationFrame(frame)
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      measure()
      state.s = reduced ? target : state.s + (target - state.s) * (1 - Math.exp(-dt * 6))
      const st = stageOf(state.s)
      if (st.idx !== lastIdx) {
        lastIdx = st.idx
        setIdx(st.idx)
      }
      if (st.cta !== lastCta) {
        lastCta = st.cta
        setCta(st.cta)
      }
      if (fill) fill.style.transform = `scaleX(${(state.s / 4).toFixed(4)})`
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
    const inRange = () => {
      const r = el.getBoundingClientRect()
      return r.bottom > -window.innerHeight * 0.25 && r.top < window.innerHeight * 1.25
    }
    const io = new IntersectionObserver(([e]) => (e.isIntersecting && !document.hidden ? start() : stop()), {
      rootMargin: '25% 0px 25% 0px',
    })
    io.observe(el)
    const onVis = () => (document.hidden || !inRange() ? stop() : start())
    document.addEventListener('visibilitychange', onVis)
    return () => {
      stop()
      io.disconnect()
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [state])

  // jump to a step: scroll so that plot k is built and in focus
  const goTo = (k) => {
    const el = root.current
    if (!el) return
    const total = el.offsetHeight - window.innerHeight
    const top = el.getBoundingClientRect().top + window.scrollY
    window.scrollTo({ top: top + (total * (k + 0.55)) / 4, behavior: 'smooth' })
  }

  const step = steps[idx]

  return (
    <section className="how" id="process" ref={root}>
      <div className="how-stick" ref={stage}>
        <div className="how-bg" aria-hidden="true" />
        <HowScene stageRef={stage} rootRef={root} state={state} labelRefs={labels} />

        {/* plot tags that follow the 3D plots on screen */}
        {steps.map((s, i) => (
          <div className="how-tag" key={s.n} ref={(el) => (labels.current[i] = el)} aria-hidden="true">
            <span className="how-tag-n">{s.n}</span>
            <span className="how-tag-t">{s.title}</span>
          </div>
        ))}

        <div className="how-shade" aria-hidden="true" />

        <div className="wrap how-ui">
          <div className="how-head">
            <span className="eyebrow">How we work</span>
            <h2 className="h2">A clear path from idea to launch.</h2>
          </div>

          <div className={'how-panel' + (cta ? ' is-cta' : '')}>
            <div className="how-panel-step" key={'s' + idx} aria-live="polite">
              <div className="how-n">
                <em>{step.n.slice(0, 1)}</em>
                {step.n.slice(1)}
              </div>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
              <div className="how-meta">
                {step.meta.map((m) => (
                  <span className="tag" key={m}>{m}</span>
                ))}
              </div>
            </div>

            <div className="how-panel-cta">
              <h3>Ready to start?</h3>
              <p>Let&#39;s turn your idea into a product people love to use.</p>
              <a className="btn btn-primary" href="#contact">
                Start a Project <ArrowR />
              </a>
            </div>
          </div>

          <div className="how-steps" role="tablist" aria-label="Process steps">
            {steps.map((s, i) => (
              <button
                key={s.n}
                type="button"
                role="tab"
                aria-selected={!cta && i === idx}
                className={'how-step-btn' + (!cta && i === idx ? ' on' : '') + (i < idx || cta ? ' done' : '')}
                onClick={() => goTo(i)}
              >
                <span>{s.n}</span><i className="how-step-t">{s.title}</i>
              </button>
            ))}
            <div className="how-rail" aria-hidden="true">
              <span data-how-fill />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

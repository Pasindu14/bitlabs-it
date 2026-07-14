'use client'
import { Fragment, useRef, useEffect } from 'react'

/* ------------------------------------------------------------------ *
 * Trust — "The Proof Ledger"
 *
 * A light, editorial credibility section. Instead of a flat stat grid,
 * the metrics are a numbered ledger that visibly *tallies up* as the
 * section enters view. Two signature moments:
 *   1. A scroll-scrubbed reading highlight on the value statement
 *      (words shift muted -> ink / orange as you scroll through).
 *   2. The ledger: each row's number rises from behind a mask and
 *      counts up while its connector rule draws and dividers wipe in.
 *
 * Everything is server-rendered as readable static HTML; motion is a
 * progressive enhancement layered on from this Client Component, and is
 * fully replaced under reduced-motion.
 * ------------------------------------------------------------------ */

const stats = [
  { to: 80, suffix: '+', label: 'Projects delivered across web, mobile & AI' },
  { to: 45, suffix: '+', label: 'Businesses served in Sri Lanka & beyond' },
  { to: 7, suffix: '', label: 'Years building production software' },
  { to: 99, suffix: '%', label: 'On-time delivery & client retention' },
]

// Value statement, tokenised for the scroll reading-highlight.
// Words in ACCENT settle to orange; the rest settle to full ink.
const statement =
  'From first-time founders to established enterprises, teams choose us to design, build and ship software that performs in production.'
const ACCENT = new Set(['founders', 'enterprises,', 'ship', 'production.'])
const statementWords = statement.split(' ')

const MUTED = 'rgba(17,17,17,0.28)'
const INK = '#111111'
const ORANGE = '#FF4D00'

export function Trust() {
  const root = useRef(null)

  useEffect(() => {
    let cancelled = false
    let ctx
    let glowTween = null
    let onVisibility = null

    async function init() {
      const gsapModule = await import('gsap')
      const gsap = gsapModule.gsap || gsapModule.default
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')
      gsap.registerPlugin(ScrollTrigger)
      if (cancelled || !root.current) return

      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const el = (sel) => root.current.querySelector(sel)
      const all = (sel) => Array.from(root.current.querySelectorAll(sel))

      // Reduced motion: settle the highlight to its final colours and leave
      // every other element in its already-visible markup state.
      if (prefersReduced) {
        all('[data-hl]').forEach((w) => {
          w.style.color = w.dataset.accent === '1' ? ORANGE : INK
        })
        return
      }

      ctx = gsap.context(() => {
        const mobile = window.matchMedia('(max-width: 767px)').matches
        const dist = mobile ? 14 : 26
        const countDur = mobile ? 1.0 : 1.4

        /* -------- Signature 1: scroll reading-highlight -------- */
        const words = all('[data-hl]')
        gsap.set(words, { color: MUTED })
        words.forEach((w) => {
          const target = w.dataset.accent === '1' ? ORANGE : INK
          gsap.to(w, {
            color: target,
            ease: 'none',
            scrollTrigger: {
              trigger: w,
              start: 'top 78%',
              end: 'top 46%',
              scrub: true,
            },
          })
        })

        /* -------- Ambient glow drift (Pattern 20) -------- */
        const glow = el('[data-glow]')
        if (glow) {
          glowTween = gsap.to(glow, {
            yPercent: -16,
            xPercent: 8,
            opacity: 0.85,
            duration: 7,
            ease: 'sine.inOut',
            repeat: -1,
            yoyo: true,
          })

          let inView = false
          const updateGlow = () => {
            if (!glowTween) return
            if (inView && !document.hidden) glowTween.play()
            else glowTween.pause()
          }
          ScrollTrigger.create({
            trigger: root.current,
            start: 'top bottom',
            end: 'bottom top',
            onToggle: (self) => {
              inView = self.isActive
              updateGlow()
            },
          })
          onVisibility = updateGlow
          document.addEventListener('visibilitychange', onVisibility)
        }

        /* -------- Entrance: headline + tallying ledger -------- */
        let hasRun = false
        const runEntrance = () => {
          if (hasRun) return
          hasRun = true

          const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

          tl.from(el('[data-eyebrow]'), { autoAlpha: 0, y: dist * 0.55, duration: 0.5 })
            // Pattern 02 — masked headline lines rise from behind the mask.
            .from(
              all('[data-line]'),
              { yPercent: 115, duration: 0.72, stagger: 0.08 },
              0.06
            )
            // Top border of the ledger draws across.
            .from(
              el('[data-ledger-top]'),
              { scaleX: 0, duration: 0.7, ease: 'power2.inOut' },
              0.36
            )

          // Each row tallies: index + label settle, connector draws, number
          // rises from its mask and counts up, then the row divider wipes.
          all('[data-row]').forEach((row, i) => {
            const at = 0.5 + i * (mobile ? 0.14 : 0.11)
            const index = row.querySelector('[data-index]')
            const numMask = row.querySelector('[data-num]')
            const numVal = row.querySelector('[data-num-val]')
            const connector = row.querySelector('[data-connector]')
            const label = row.querySelector('[data-label]')
            const divider = row.querySelector('[data-divider]')
            const to = Number(numVal.dataset.to || 0)
            const proxy = { v: 0 }

            numVal.firstChild.nodeValue = '0'

            tl.from(index, { autoAlpha: 0, x: -10, duration: 0.5 }, at)
              .from(numMask, { yPercent: 105, autoAlpha: 0, duration: 0.6 }, at + 0.02)
              .to(
                proxy,
                {
                  v: to,
                  duration: countDur,
                  ease: 'power2.out',
                  snap: { v: 1 },
                  onUpdate: () => {
                    numVal.firstChild.nodeValue = Math.round(proxy.v)
                  },
                },
                at + 0.02
              )
              .from(
                connector,
                { scaleX: 0, duration: 0.7, ease: 'power2.inOut' },
                at + 0.06
              )
              .from(label, { autoAlpha: 0, y: dist * 0.45, duration: 0.5 }, at + 0.14)
              .from(
                divider,
                { scaleX: 0, duration: 0.6, ease: 'power2.inOut' },
                at + 0.2
              )
          })
        }

        // Fire once when the section enters the viewport.
        ScrollTrigger.create({
          trigger: root.current,
          start: 'top 82%',
          once: true,
          onEnter: runEntrance,
        })

        // If the section is already in/above the viewport on load (deep link,
        // fast scroll), run immediately so the entrance is never skipped.
        const rect = root.current.getBoundingClientRect()
        if (rect.top < window.innerHeight * 0.82) runEntrance()
      }, root)
    }

    init()

    return () => {
      cancelled = true
      if (onVisibility) document.removeEventListener('visibilitychange', onVisibility)
      if (glowTween) glowTween.kill()
      if (ctx) ctx.revert()
    }
  }, [])

  return (
    <section className="trust section-pad" id="trust" ref={root}>
      <div className="trust-glow" data-glow aria-hidden="true" />
      <div className="wrap">
        <div className="trust-head">
          <div className="trust-head-lead">
            <span className="eyebrow" data-eyebrow>
              Trusted partner
            </span>
            <h2 className="h2 trust-title">
              <span className="line-mask">
                <span data-line>Trusted by businesses in</span>
              </span>
              <span className="line-mask">
                <span data-line>
                  Sri Lanka <em className="italic-accent">and beyond.</em>
                </span>
              </span>
            </h2>
          </div>

          <p className="trust-statement">
            {statementWords.map((word, i) => (
              <Fragment key={i}>
                <span data-hl data-accent={ACCENT.has(word) ? '1' : '0'}>
                  {word}
                </span>
                {i < statementWords.length - 1 ? ' ' : ''}
              </Fragment>
            ))}
          </p>
        </div>

        <div className="ledger">
          <span className="ledger-top" data-ledger-top aria-hidden="true" />
          {stats.map((s, i) => (
            <div className="ledger-row" data-row key={i}>
              <span className="ledger-index" data-index>
                {String(i + 1).padStart(2, '0')}
              </span>

              <span className="ledger-num-wrap">
                <span className="ledger-num-mask">
                  <span className="ledger-num" data-num>
                    <span className="ledger-num-val" data-num-val data-to={s.to}>
                      {s.to}
                    </span>
                    {s.suffix && <span className="ledger-suffix">{s.suffix}</span>}
                  </span>
                </span>
              </span>

              <span className="ledger-connector" aria-hidden="true">
                <span className="ledger-connector-fill" data-connector />
              </span>

              <span className="ledger-label" data-label>
                {s.label}
              </span>

              <span className="ledger-divider" data-divider aria-hidden="true" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

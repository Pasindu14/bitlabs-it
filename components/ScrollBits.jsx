'use client'
import { useEffect, useRef } from 'react'

/* ------------------------------------------------------------------ *
 * ScrollBits — page progress as a dock of "bits".
 *
 * One small cell per section of the page. Each cell fills from the bottom
 * as you scroll through its section, turns solid orange once passed, and
 * the current one glows and shows its name. Hover the dock to see them all;
 * click a cell to jump. (Replaces the old curved scroll line.)
 * ------------------------------------------------------------------ */

const SECTIONS = [
  { id: 'top', name: 'Intro' },
  { id: 'trust', name: 'Proof' },
  { id: 'services', name: 'Services' },
  { id: 'process', name: 'Process' },
  { id: 'why', name: 'Why us' },
  { id: 'projects', name: 'Projects' },
  { id: 'testimonials', name: 'Voices' },
  { id: 'contact', name: 'Contact' },
]

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))

export function ScrollBits() {
  const nav = useRef(null)

  useEffect(() => {
    const root = nav.current
    if (!root) return
    const items = Array.from(root.querySelectorAll('[data-bit]'))
    const fills = items.map((el) => el.querySelector('[data-fill]'))
    const els = SECTIONS.map((s) => document.getElementById(s.id))
    let raf = 0
    let last = -1

    const update = () => {
      raf = 0
      const line = window.innerHeight * 0.5
      let active = 0
      els.forEach((el, i) => {
        if (!el) return
        const r = el.getBoundingClientRect()
        const p = clamp((line - r.top) / Math.max(1, r.height))
        if (r.top <= line) active = i
        fills[i].style.transform = `scaleY(${p.toFixed(3)})`
        items[i].classList.toggle('is-done', p >= 0.999)
      })
      if (active !== last) {
        last = active
        items.forEach((el, i) => el.classList.toggle('is-active', i === active))
      }
    }
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    // pinned scenes change page height after load — re-measure once things settle
    const t = setTimeout(update, 1500)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(t)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [])

  return (
    <nav className="sbits" ref={nav} aria-label="Page sections">
      {SECTIONS.map((s, i) => (
        <a className="sbit" href={'#' + s.id} data-bit key={s.id} aria-label={s.name}>
          <span className="sbit-label">
            <b>{String(i + 1).padStart(2, '0')}</b>
            {s.name}
          </span>
          <span className="sbit-cell">
            <span className="sbit-fill" data-fill />
          </span>
        </a>
      ))}
    </nav>
  )
}

'use client'
import { useEffect } from 'react'

export function MotionInit() {
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let cancelled = false
    let raf1

    async function init() {
      if (cancelled) return

      const gsapModule = await import('gsap')
      const gsap = gsapModule.gsap || gsapModule.default
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')
      gsap.registerPlugin(ScrollTrigger)

      if (cancelled) return

      let lenis
      if (!prefersReduced) {
        const LenisModule = await import('lenis')
        const Lenis = LenisModule.default
        lenis = new Lenis({ lerp: 0.1, smoothWheel: true, wheelMultiplier: 1 })
        lenis.on('scroll', ScrollTrigger.update)
        gsap.ticker.add((time) => lenis.raf(time * 1000))
        gsap.ticker.lagSmoothing(0)
        document.documentElement.classList.add('lenis')
      }

      document.querySelectorAll('a[href^="#"]').forEach((a) => {
        a.addEventListener('click', (e) => {
          const id = a.getAttribute('href')
          if (id.length < 2) return
          const el = document.querySelector(id)
          if (!el) return
          e.preventDefault()
          if (lenis) lenis.scrollTo(el, { offset: -70, duration: 1.2 })
          else el.scrollIntoView()
        })
      })

      if (prefersReduced) return

      const track = document.querySelector('[data-marquee]')
      if (track) {
        const groupWidth = track.scrollWidth / 3
        gsap.to(track, {
          x: -groupWidth,
          duration: 22,
          ease: 'none',
          repeat: -1,
          modifiers: {
            x: gsap.utils.unitize((x) => parseFloat(x) % groupWidth),
          },
        })
      }

      gsap.utils.toArray('.card[data-depth]').forEach((card) => {
        const depth = parseFloat(card.dataset.depth) || 0
        if (!depth) return
        gsap.fromTo(
          card,
          { y: depth * 26 },
          {
            y: depth * -26,
            ease: 'none',
            scrollTrigger: {
              trigger: card.closest('.cards-grid'),
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1,
            },
          }
        )
      })

      const how = document.querySelector('[data-how]')
      const htrack = document.querySelector('[data-how-track]')
      const hbar = document.querySelector('[data-how-bar]')
      if (how && htrack && window.innerWidth >= 768) {
        const getScroll = () => htrack.scrollWidth - htrack.parentElement.offsetWidth + 40
        gsap.to(htrack, {
          x: () => -getScroll(),
          ease: 'none',
          scrollTrigger: {
            trigger: how,
            start: 'top top',
            end: () => '+=' + (getScroll() + window.innerHeight * 0.4),
            pin: '.how-pin',
            scrub: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              if (hbar) hbar.style.width = (self.progress * 100).toFixed(1) + '%'
            },
          },
        })
      }

      ScrollTrigger.refresh()
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => ScrollTrigger.refresh())
      }
      window.addEventListener('load', () => ScrollTrigger.refresh())
    }

    raf1 = requestAnimationFrame(() => requestAnimationFrame(init))

    ;(function revealFailsafe() {
      let rafFired = false
      requestAnimationFrame(() => { rafFired = true })
      setTimeout(() => {
        if (rafFired) return
        document.querySelectorAll('[style*="opacity"], [style*="transform"]').forEach((el) => {
          el.style.opacity = ''
          el.style.transform = ''
        })
        document.querySelectorAll('.scroll-curve-arrow path, .scroll-curve-arrow line').forEach((el) => {
          el.style.strokeDashoffset = '0'
          el.style.strokeDasharray = ''
          el.style.opacity = '0.9'
        })
        document.querySelectorAll('[data-counter]').forEach((el) => {
          el.innerHTML =
            el.getAttribute('data-counter') +
            '<span class="suffix">' +
            (el.getAttribute('data-suffix') || '') +
            '</span>'
        })
        document.documentElement.classList.add('anim-skipped')
      }, 1500)
    })()

    return () => {
      cancelled = true
      cancelAnimationFrame(raf1)
    }
  }, [])

  return null
}

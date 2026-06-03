'use client'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Magnetic } from './Magnetic'
import { ArrowR } from './ArrowR'

const links = [
  ['Services', '#services'],
  ['Process', '#process'],
  ['Why Bitlabs', '#why'],
  ['Projects', '#projects'],
  ['Work', '#testimonials'],
  ['Founder', '/founder'],
]

export function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const isHome = pathname === '/'

  // Prefix anchor links with '/' when not on the home page
  const href = (h) => h.startsWith('#') && !isHome ? '/' + h : h

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  return (
    <motion.nav
      className={'nav' + (scrolled ? ' scrolled' : '')}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
    >
      <div className="nav-pill">
        <a className="brand" href="/">
          <span className="brand-mark"><span /></span>
          <span className="brand-word">Bit<b>labs</b></span>
        </a>
        <span className="nav-avail">
          <span className="nav-avail-dot" />
          <span>Available</span>
        </span>
        <div className="nav-rule" />
        <div className="nav-links">
          {links.map(([t, h]) => <a key={t} href={href(h)}>{t}</a>)}
        </div>
        <div className="nav-cta">
          <Magnetic>
            <a className="btn btn-primary btn-sm" href={href('#contact')}>
              Get in Touch <ArrowR s={16} />
            </a>
          </Magnetic>
          <button className="nav-burger" aria-label="Menu">
            <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round">
              <path d="M3 7h18M3 12h18M3 17h18" />
            </svg>
          </button>
        </div>
      </div>
    </motion.nav>
  )
}

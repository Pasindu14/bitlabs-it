'use client'
import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Magnetic } from './Magnetic'
import { ArrowR } from './ArrowR'

const EASE = [0.22, 1, 0.36, 1]

function WordReveal({ text, className = '', delay = 0 }) {
  const words = text.split(' ')
  return (
    <span className={className}>
      {words.map((w, i) => (
        <span className="word-line" key={i}>
          <motion.span
            className="word"
            initial={{ y: '110%' }}
            animate={{ y: '0%' }}
            transition={{ duration: 1.0, ease: EASE, delay: delay + i * 0.075 }}
            dangerouslySetInnerHTML={{ __html: w + (i < words.length - 1 ? '&nbsp;' : '') }}
          />
        </span>
      ))}
    </span>
  )
}

export function Hero() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y1 = useTransform(scrollYProgress, [0, 1], [0, 160])
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -120])
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0])
  const orbitY = useTransform(scrollYProgress, [0, 1], [0, 220])

  return (
    <header className="hero" id="top" ref={ref}>
      <div className="hero-bg">
        <motion.div
          className="blob b1"
          style={{ y: y1 }}
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="blob b2"
          style={{ y: y2 }}
          animate={{ scale: [1, 1.12, 1] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="grid-lines" />
      </div>

      <motion.div className="hero-orbit" style={{ y: orbitY }}>
        <motion.div
          className="orbit-ring"
          animate={{ rotate: 360 }}
          transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
        >
          <span className="orbit-dot" />
        </motion.div>
        <motion.div
          className="orbit-ring r2"
          animate={{ rotate: -360 }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        >
          <span className="orbit-dot" style={{ background: '#111' }} />
        </motion.div>
        <div className="orbit-core">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
          </svg>
        </div>
      </motion.div>

      <motion.div className="wrap hero-inner" style={{ opacity: fade }}>
        <motion.span
          className="eyebrow"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          Software Studio · Sri Lanka
        </motion.span>

        <h1 className="display">
          <WordReveal text="We design and" delay={0.35} />
          <WordReveal text="build software" delay={0.5} />
          <span className="word-line">
            <motion.span
              className="word"
              initial={{ y: '110%' }}
              animate={{ y: '0%' }}
              transition={{ duration: 1, ease: EASE, delay: 0.66 }}
            >
              that <span className="accent">drives growth.</span>
            </motion.span>
          </span>
        </h1>

        <div className="hero-sub">
          <motion.p
            className="lead"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.9, ease: EASE }}
          >
            Bitlabs crafts custom digital products — from mobile and web apps to
            AI-driven systems — engineered for efficiency, performance and scale.
          </motion.p>
          <motion.div
            className="hero-cta"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.05, duration: 0.9, ease: EASE }}
          >
            <Magnetic>
              <a className="btn btn-primary" href="#contact">Start a Project <ArrowR /></a>
            </Magnetic>
            <Magnetic strength={0.25}>
              <a className="btn btn-ghost" href="#services">Explore Services</a>
            </Magnetic>
          </motion.div>
        </div>
      </motion.div>
    </header>
  )
}

'use client'
import { useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Magnetic } from './Magnetic'
import { ArrowR } from './ArrowR'
import { Marquee } from './Marquee'

// "Bit by Bit": thousands of cubes that assemble into what we build. Client-only and heavy —
// keep it out of the server render and the first paint.
const BitsScene = dynamic(() => import('./hero3d/bits/BitsScene'), { ssr: false })

const SCENE_LABELS = [
  ['Bitlabs', 'Software studio · Sri Lanka'],
  ['Mobile apps', 'Flutter · iOS & Android'],
  ['Sales dashboards', 'SFA · field sales automation'],
  ['HR platforms', 'HRIS · people & org charts'],
  ['WhatsApp SaaS', 'Conversational business tools'],
]

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
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0])
  const control = useRef(null)
  const [scene, setScene] = useState(0)

  return (
    <header className="hero hero--bits" id="top" ref={ref}>
      <div className="hero-bg">
        <BitsScene heroRef={ref} control={control} onScene={(i) => setScene(i)} />
        <div className="hero-scrim" />
      </div>

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
      <motion.div
        className="bits-caption"
        style={{ opacity: fade }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4, duration: 0.8, ease: EASE }}
      >
        <span className="bits-caption-kicker">Now building</span>
        <span className="bits-caption-title" key={scene}>{SCENE_LABELS[scene][0]}</span>
        <span className="bits-caption-sub" key={'s' + scene}>{SCENE_LABELS[scene][1]}</span>
        <div className="bits-dots" role="tablist" aria-label="What we build">
          {SCENE_LABELS.map(([name], i) => (
            <button
              key={name}
              type="button"
              role="tab"
              aria-selected={i === scene}
              aria-label={name}
              className={'bits-dot' + (i === scene ? ' on' : '')}
              onClick={() => control.current?.goTo(i)}
            />
          ))}
        </div>
      </motion.div>

      {/* Service ticker lives on the hero's bottom edge */}
      <Marquee />
    </header>
  )
}

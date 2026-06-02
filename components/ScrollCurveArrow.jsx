'use client'
import { motion, useScroll, useSpring, useTransform } from 'framer-motion'

const d = [
  'M 30 5',
  'C 52 55, 52 115, 30 160',
  'C 8 198, 10 218, 30 230',
  'C 44 230, 55 241, 55 255',
  'C 55 269, 44 280, 30 280',
  'C 16 280, 5 269, 5 255',
  'C 5 241, 16 230, 30 230',
  'C 30 222, 30 330, 30 492',
].join(' ')

export function ScrollCurveArrow() {
  const { scrollYProgress } = useScroll()
  const rawPL = useSpring(scrollYProgress, { stiffness: 80, damping: 22, mass: 0.5 })
  const headOp = useTransform(rawPL, [0.88, 1], [0, 1])

  return (
    <motion.div
      className="scroll-curve-arrow"
      aria-hidden="true"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.2, duration: 0.8 }}
    >
      <svg viewBox="0 0 60 500" fill="none" xmlns="http://www.w3.org/2000/svg" overflow="visible">
        <defs>
          <filter id="sc-glow" x="-60%" y="-10%" width="220%" height="120%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <path
          d={d}
          stroke="var(--ink-06)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <motion.path
          d={d}
          stroke="var(--orange)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#sc-glow)"
          style={{ pathLength: rawPL, opacity: 0.9 }}
        />

        <motion.g style={{ opacity: headOp }}>
          <line x1="20" y1="478" x2="30" y2="494" stroke="var(--orange)" strokeWidth="2.5" strokeLinecap="round" filter="url(#sc-glow)" />
          <line x1="40" y1="478" x2="30" y2="494" stroke="var(--orange)" strokeWidth="2.5" strokeLinecap="round" filter="url(#sc-glow)" />
        </motion.g>
      </svg>
    </motion.div>
  )
}

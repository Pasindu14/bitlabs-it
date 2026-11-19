'use client'
import { useRef, useEffect, useState } from 'react'
import { useInView, animate } from 'framer-motion'

export function Counter({ to, suffix = '', duration = 2 }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  // Server HTML carries the real number so crawlers/no-JS never see "0".
  // On mount, drop to 0 if still off-screen so the count-up still plays.
  const [val, setVal] = useState(to)

  useEffect(() => {
    if (!inView) setVal(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!inView) return
    const controls = animate(0, to, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setVal(v),
    })
    return () => controls.stop()
  }, [inView, to, duration])

  return (
    <span ref={ref} data-counter={to} data-suffix={suffix}>
      {Math.round(val)}<span className="suffix">{suffix}</span>
    </span>
  )
}

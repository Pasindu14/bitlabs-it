'use client'
import { useRef, useEffect, useState } from 'react'
import { useInView, animate } from 'framer-motion'

export function Counter({ to, suffix = '', duration = 2 }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const [val, setVal] = useState(0)

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

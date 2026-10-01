'use client'
import { useRef } from 'react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { Reveal } from './Reveal'

// Live 3D voxel icons for the cards (one shared canvas) — client-only, lazy.
const ServiceIcons = dynamic(() => import('./hero3d/services/ServiceIcons'), { ssr: false })

const EASE = [0.22, 1, 0.36, 1]

const Icon = {
  mobile: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="2" width="12" height="20" rx="3"/><path d="M11 18h2"/>
    </svg>
  ),
  web: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="15" rx="2"/><path d="M2 9h20M6 22h12"/>
    </svg>
  ),
  ai: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="7" width="14" height="12" rx="3"/><path d="M12 7V3M9 3h6M9 13h.01M15 13h.01M2 11v3M22 11v3"/>
    </svg>
  ),
  custom: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m8 7-5 5 5 5M16 7l5 5-5 5"/>
    </svg>
  ),
  uiux: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="13" cy="11" r="8"/><path d="m9 7-4 4 4 4M3 21l3-3"/>
    </svg>
  ),
  api: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="6" r="3"/><circle cx="18" cy="18" r="3"/><circle cx="18" cy="6" r="3"/><path d="M6 9v6a3 3 0 0 0 3 3h6"/>
    </svg>
  ),
}

const data = [
  { icon: 'mobile', title: 'Mobile App Development', desc: 'Fast, native-feeling Android apps built for reliability and a polished user experience your customers will love.', tags: ['Android', 'Kotlin', 'Cross-platform'] },
  { icon: 'web', title: 'Web Application Development', desc: 'Scalable, secure web platforms and dashboards — engineered for performance and built to grow with your business.', tags: ['React', 'Node', 'Cloud'] },
  { icon: 'ai', title: 'AI Solutions & Integration', desc: 'Put intelligence to work: chat assistants, automation and predictive features integrated into your existing products.', tags: ['LLMs', 'Automation', 'RAG'] },
  { icon: 'custom', title: 'Custom Software Solutions', desc: 'Bespoke systems tailored to how your team actually works — replacing spreadsheets and manual processes with one tool.', tags: ['ERP', 'Internal tools', 'Workflow'] },
  { icon: 'uiux', title: 'UI / UX Design', desc: 'Research-led interfaces that are intuitive, accessible and beautiful — turning complex flows into effortless journeys.', tags: ['Product', 'Design systems', 'Prototyping'] },
  { icon: 'api', title: 'API & System Integration', desc: 'Connect your tools and data. We integrate payments, CRMs and third-party services into seamless, reliable pipelines.', tags: ['REST', 'Webhooks', 'Payments'] },
]

function ServiceCard({ item, i }) {
  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`)
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`)
  }
  return (
    <motion.div
      className="card"
      data-depth={String((i % 3) - 1)}
      onMouseMove={onMove}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, ease: EASE, delay: (i % 3) * 0.09 }}
    >
      <div className="card-num">{String(i + 1).padStart(2, '0')}</div>
      <div className="card-icon">{Icon[item.icon]}</div>
      <h3>{item.title}</h3>
      <p>{item.desc}</p>
      <div className="card-tags">
        {item.tags.map((t) => <span className="tag" key={t}>{t}</span>)}
      </div>
    </motion.div>
  )
}

export function Services() {
  const grid = useRef(null)
  return (
    <section className="section-pad" id="services">
      <div className="wrap">
        <div className="services-head">
          <div>
            <Reveal><span className="eyebrow">What we do</span></Reveal>
            <Reveal delay={0.06}>
              <h2 className="h2" style={{ marginTop: 22, maxWidth: '13ch' }}>
                Services engineered <span style={{ color: 'var(--orange)', fontStyle: 'italic' }}>around outcomes.</span>
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.12}>
            <p className="lead" style={{ maxWidth: '30ch' }}>
              One studio, full-stack capability — from first sketch to deployed, maintained product.
            </p>
          </Reveal>
        </div>
        <div className="cards-grid" ref={grid}>
          {data.map((d, i) => <ServiceCard item={d} i={i} key={i} />)}
          <ServiceIcons gridRef={grid} />
        </div>
      </div>
    </section>
  )
}

'use client'
import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { Reveal } from './Reveal'
import { ArrowR } from './ArrowR'
import { projects as allProjects, STATUS } from './projectsData'

// Home page shows the strongest five; the full list stays in projectsData.js
const FEATURED = ['hris', 'sfa', 'whatsapp-crm', 'erp-system', 'concentration-gym']
const projects = FEATURED.map((id) => allProjects.find((p) => p.id === id)).filter(Boolean)

/* ------------------------------------------------------------------ *
 * Our Projects — "Product Lab"
 *
 * An editorial index of the products on the left; on the right a 3D stage
 * with one floating screen. Pick a product and the slab flips to a UI board
 * drawn from that product's own modules, which float in front as chips.
 * It walks through the products on its own until the visitor takes over.
 * Project copy lives in ./projectsData.js; everything here is plain HTML
 * (the stage is a progressive enhancement).
 * ------------------------------------------------------------------ */

const ProjectsStage = dynamic(() => import('./hero3d/projects/ProjectsStage'), { ssr: false })

const AUTO_MS = 6500
const IDLE_MS = 14000

export function OurProjects() {
  const section = useRef(null)
  const box = useRef(null)
  const activeRef = useRef(0)
  const [active, setActive] = useState(0)
  const [takenOver, setTakenOver] = useState(false)
  const [inView, setInView] = useState(false)
  const idle = useRef(null)

  activeRef.current = active

  useEffect(() => {
    const el = section.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.2 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // auto-walk through the products until the visitor takes over (resumes after a long idle)
  useEffect(() => {
    if (takenOver || !inView) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = setTimeout(() => setActive((a) => (a + 1) % projects.length), AUTO_MS)
    return () => clearTimeout(id)
  }, [active, takenOver, inView])

  const choose = (i) => {
    setActive((i + projects.length) % projects.length)
    setTakenOver(true)
    clearTimeout(idle.current)
    idle.current = setTimeout(() => setTakenOver(false), IDLE_MS)
  }
  useEffect(() => () => clearTimeout(idle.current), [])

  const cur = projects[active]

  return (
    <section className="proj" id="projects" ref={section}>
      <div className="wrap">
        <div className="proj-head">
          <div>
            <Reveal><span className="eyebrow">Our Projects</span></Reveal>
            <Reveal delay={0.06}>
              <h2 className="h2" style={{ marginTop: 22, maxWidth: '16ch' }}>
                Products we <span style={{ color: 'var(--orange)', fontStyle: 'italic' }}>build &amp; own.</span>
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.12}>
            <p className="lead" style={{ maxWidth: '32ch' }}>
              Alongside client work, we invest in our own software — shipping real products that solve real problems.
            </p>
          </Reveal>
        </div>

        <div className="proj-lab">
          <ol className="proj-index">
            {projects.map((p, i) => {
              const st = STATUS[p.statusType] || STATUS.soon
              const on = i === active
              return (
                <li className={'pi' + (on ? ' on' : '')} key={p.id}>
                  <button type="button" className="pi-row" onClick={() => choose(i)} aria-expanded={on}>
                    <span className="pi-n">{String(i + 1).padStart(2, '0')}</span>
                    <span className="pi-name">{p.name}</span>
                    <span className="pi-status" style={{ '--c': st.color }}>
                      <i data-pulse={p.statusType === 'dev' ? '' : undefined} />
                      {st.label}
                    </span>
                  </button>
                  <div className="pi-body">
                    <div className="pi-inner">
                      <p className="pi-sub">{p.subtitle}</p>
                      <p className="pi-desc">{p.desc}</p>
                      <div className="pi-tags">
                        {p.tags.map((t) => (
                          <span className="tag" key={t}>{t}</span>
                        ))}
                      </div>
                      {p.link && (
                        <a className="btn btn-sm btn-on-dark-ghost" href={p.link} target="_blank" rel="noopener noreferrer">
                          View Project <ArrowR s={15} />
                        </a>
                      )}
                    </div>
                  </div>
                </li>
              )
            })}
          </ol>

          <div className="proj-stage-col">
            <div className="proj-stage" ref={box}>
              <ProjectsStage boxRef={box} projects={projects} activeRef={activeRef} />
              <div className="proj-cap" aria-hidden="true">
                <span className="proj-cap-n">
                  {String(active + 1).padStart(2, '0')} <em>/ {String(projects.length).padStart(2, '0')}</em>
                </span>
                <span className="proj-cap-t" key={active}>{cur.name}</span>
              </div>
              <div className="proj-nav">
                <button type="button" aria-label="Previous project" onClick={() => choose(active - 1)}>
                  <ArrowR s={16} />
                </button>
                <button type="button" aria-label="Next project" onClick={() => choose(active + 1)}>
                  <ArrowR s={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

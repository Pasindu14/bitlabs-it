'use client'
import { motion } from 'framer-motion'
import { Reveal } from './Reveal'
import { ArrowR } from './ArrowR'

const EASE = [0.22, 1, 0.36, 1]

const Icon = {
  employees: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  attendance: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  leave: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="m9 16 2 2 4-4"/>
    </svg>
  ),
  payroll: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
    </svg>
  ),
  shifts: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
    </svg>
  ),
  departments: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="6" height="14"/><rect x="9" y="3" width="6" height="18"/><rect x="16" y="10" width="6" height="11"/>
    </svg>
  ),
  calendar: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  audit: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
    </svg>
  ),
}

const STATUS_STYLES = {
  dev:  { bg: 'rgba(255,77,0,0.1)',  color: 'var(--orange)', dot: 'var(--orange)' },
  live: { bg: 'rgba(34,197,94,0.1)', color: '#16a34a',       dot: '#22c55e' },
  soon: { bg: 'rgba(17,17,17,0.07)', color: 'var(--ink-60)', dot: 'var(--ink-40)' },
}

// ── Add new projects here ──────────────────────────────────────────────────
const projects = [
  {
    id: 'hris',
    name: 'Bitlabs HRIS',
    subtitle: 'Human Resource Information System',
    desc: 'A full-stack HRIS platform built for Sri Lankan enterprises. Manages the complete employee lifecycle — from onboarding and department assignment to attendance tracking, leave management, shift scheduling and payroll processing. Designed with real-world compliance requirements and multi-role access control in mind.',
    status: 'In Development',
    statusType: 'dev',
    tags: ['Next.js', 'TypeScript', 'PostgreSQL', 'Drizzle ORM', 'NextAuth', 'Sentry'],
    modules: [
      { icon: Icon.employees,   label: 'Employees' },
      { icon: Icon.attendance,  label: 'Attendance' },
      { icon: Icon.leave,       label: 'Leave' },
      { icon: Icon.payroll,     label: 'Payroll' },
      { icon: Icon.shifts,      label: 'Shifts' },
      { icon: Icon.departments, label: 'Departments' },
      { icon: Icon.calendar,    label: 'Calendar' },
      { icon: Icon.audit,       label: 'Audit Trail' },
    ],
    link: null,
  },
  // ── Add more projects below ──────────────────────────────────────────────
  // {
  //   id: 'my-app',
  //   name: 'My App',
  //   subtitle: 'Short subtitle',
  //   desc: 'Description of the project.',
  //   status: 'Coming Soon',   // or 'Live'
  //   statusType: 'soon',      // 'dev' | 'live' | 'soon'
  //   tags: ['React', 'Node'],
  //   modules: [],
  //   link: null,              // or 'https://...'
  // },
]
// ────────────────────────────────────────────────────────────────────────────

function StatusBadge({ status, type }) {
  const s = STATUS_STYLES[type] || STATUS_STYLES.soon
  return (
    <span className="proj-status" style={{ background: s.bg, color: s.color }}>
      <span
        className="proj-status-dot"
        style={{ background: s.dot }}
        data-pulse={type === 'dev' ? '' : undefined}
      />
      {status}
    </span>
  )
}

function ProjectCard({ project, i }) {
  const isFeatured = i === 0
  return (
    <motion.div
      className={'proj-card' + (isFeatured ? ' proj-card--featured' : '')}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, ease: EASE, delay: i * 0.08 }}
    >
      <div className="proj-card-body">
        <div className="proj-card-top">
          <StatusBadge status={project.status} type={project.statusType} />
        </div>
        <h3 className="proj-name">{project.name}</h3>
        <p className="proj-subtitle">{project.subtitle}</p>
        <p className="proj-desc">{project.desc}</p>

        {project.modules.length > 0 && (
          <div className="proj-modules">
            {project.modules.map((m) => (
              <div className="proj-module" key={m.label}>
                <span className="proj-module-icon">{m.icon}</span>
                <span>{m.label}</span>
              </div>
            ))}
          </div>
        )}

        <div className="proj-tags">
          {project.tags.map((t) => <span className="tag" key={t}>{t}</span>)}
        </div>

        {project.link && (
          <a className="btn btn-ghost btn-sm proj-link" href={project.link} target="_blank" rel="noopener noreferrer">
            View Project <ArrowR s={15} />
          </a>
        )}
      </div>

      {isFeatured && (
        <div className="proj-visual" aria-hidden>
          <div className="proj-visual-glow" />
          <div className="proj-visual-header">
            <div className="proj-visual-dot" style={{ background: '#FF5F57' }} />
            <div className="proj-visual-dot" style={{ background: '#FEBC2E' }} />
            <div className="proj-visual-dot" style={{ background: '#28C840' }} />
            <span className="proj-visual-title">bitlabs-hris · dashboard</span>
          </div>
          <div className="proj-visual-grid">
            {project.modules.map((m, idx) => (
              <motion.div
                key={m.label}
                className="proj-visual-tile"
                initial={{ opacity: 0, scale: 0.88 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: EASE, delay: 0.3 + idx * 0.055 }}
              >
                <span className="proj-visual-tile-icon">{m.icon}</span>
                <span className="proj-visual-tile-label">{m.label}</span>
              </motion.div>
            ))}
          </div>
          <div className="proj-visual-footer">
            <span><b style={{ color: 'var(--orange)' }}>✓</b> Role-based access control</span>
            <span><b style={{ color: 'var(--orange)' }}>✓</b> Multi-company ready</span>
          </div>
        </div>
      )}
    </motion.div>
  )
}

export function OurProjects() {
  return (
    <section className="section-pad" id="projects">
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

        <div className="proj-list">
          {projects.map((p, i) => <ProjectCard key={p.id} project={p} i={i} />)}
        </div>
      </div>
    </section>
  )
}

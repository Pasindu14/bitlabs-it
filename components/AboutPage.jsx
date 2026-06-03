'use client'
import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

const EASE = [0.22, 1, 0.36, 1]

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } },
}
const rise = {
  hidden: { opacity: 0, y: 36 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE } },
}
const slide = {
  hidden: { opacity: 0, x: -24 },
  show: { opacity: 1, x: 0, transition: { duration: 0.9, ease: EASE } },
}

const STACK = [
  { cat: 'Frontend',  tags: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Framer Motion'] },
  { cat: 'Backend',   tags: ['.NET 8', 'C#', 'Node.js', 'SignalR', 'ASP.NET MVC'] },
  { cat: 'Mobile',    tags: ['Flutter', 'Dart', 'BLoC'] },
  { cat: 'Data',      tags: ['PostgreSQL', 'Supabase', 'Redis', 'MySQL', 'Drizzle ORM'] },
  { cat: 'Tooling',   tags: ['TanStack Query', 'Zustand', 'Docker', 'Entity Framework'] },
]

const EXPERIENCE = [
  {
    role: 'Software Engineer',
    org: 'General Sir John Kotelawala Defence University',
    period: 'Sep 2019 — 2023',
    bullets: [
      'Built Transcript Generation, Exam Results Management, and Venue Management systems',
      'Optimised performance at code & architecture level; integrated CI/CD and Agile workflows',
      'Collaborated across teams to maintain high software quality and zero-defect delivery',
    ],
  },
  {
    role: 'Software Engineer',
    org: 'Elements (Pvt) Ltd',
    period: 'Aug 2017 — Aug 2019',
    bullets: [
      'Delivered full-stack solutions in C#, .NET Core, Flutter, and ReactJS',
      'Engaged directly with clients to refine requirements and ship tailored products',
      'Drove code optimisation initiatives that measurably improved system responsiveness',
    ],
  },
  {
    role: 'Associate Software Engineer',
    org: 'Eutech Cybernetics',
    period: 'Jan 2017 — Jul 2017',
    bullets: [
      'Contributed to an Integrated Building Management System (IBMS)',
      'Applied OOP principles to improve scalability and code maintainability',
    ],
  },
]

export function AboutPage() {
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })
  const ghostY   = useTransform(scrollYProgress, [0, 1], ['0%', '28%'])
  const ghostOp  = useTransform(scrollYProgress, [0, 0.7], [1, 0])
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '12%'])

  return (
    <div className="ab-root">

      {/* ─── HERO ─────────────────────────────────────────── */}
      <section ref={heroRef} className="ab-hero">
        {/* Ghost name backdrop */}
        <motion.div className="ab-ghost-wrap" style={{ y: ghostY, opacity: ghostOp }}>
          <span className="ab-ghost">PASI</span>
        </motion.div>

        {/* Noise overlay */}
        <div className="ab-hero-noise" />

        {/* Content */}
        <motion.div className="ab-hero-body" style={{ y: contentY }}>
          <motion.div
            className="ab-hero-meta"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.15 }}
          >
            <span className="ab-eyebrow">01 — Profile</span>
            <span className="ab-avail-pill">
              <span className="ab-avail-dot" />
              Available for projects
            </span>
          </motion.div>

          <div className="ab-hero-name-block">
            <motion.h1
              className="ab-hero-h1"
              initial={{ opacity: 0, y: 48 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.1, ease: EASE, delay: 0.25 }}
            >
              Pasindu
              <br />
              <em>Dulanjaya</em>
            </motion.h1>

            <motion.div
              className="ab-hero-aside"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: EASE, delay: 0.5 }}
            >
              <div className="ab-hero-role">
                Founder &amp;<br />Full-stack Developer
              </div>
              <p className="ab-hero-desc">
                Building web platforms, mobile apps, and AI tools — from Sri Lanka to the world.
              </p>
              <div className="ab-hero-actions">
                <a href="https://github.com/Pasindu14" target="_blank" rel="noopener noreferrer" className="ab-action-link">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/></svg>
                  GitHub
                </a>
                <a href="mailto:bitlabs.solutions@gmail.com" className="ab-action-link">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>
                  Email
                </a>
                <a href="/" className="ab-action-link">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                  Bitlabs
                </a>
              </div>
            </motion.div>
          </div>

          <motion.div
            className="ab-hero-foot"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.85 }}
          >
            <span>🇱🇰 Colombo, Sri Lanka</span>
            <span className="ab-hero-foot-div" />
            <span>University of Moratuwa</span>
            <span className="ab-hero-foot-div" />
            <span>Bitlabs Studio</span>
          </motion.div>
        </motion.div>
      </section>

      {/* ─── BIO ─────────────────────────────────────────── */}
      <section className="ab-section">
        <div className="ab-section-wrap">
          <motion.header
            className="ab-section-hd"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className="ab-num">02</span>
            <div className="ab-rule" />
            <span className="ab-eyebrow">About</span>
          </motion.header>

          <motion.div
            className="ab-bio-grid"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
          >
            <motion.blockquote className="ab-pullquote" variants={rise}>
              "I build software<br />
              <span>that actually ships.</span>"
            </motion.blockquote>
            <motion.p className="ab-bio-body" variants={rise}>
              Pasi is a Sri Lankan full-stack developer and the founder of Bitlabs — a software studio crafting web platforms, mobile apps, and AI-powered products for businesses in Sri Lanka and beyond.
              <br /><br />
              With an MSc and BSc in Information Technology from the University of Moratuwa — graduating at the top of his batch in both programmes — he brings both academic rigour and hands-on product experience to every problem he tackles.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ─── STATS ────────────────────────────────────────── */}
      <div className="ab-stats-row">
        {[
          { v: '9+',  l: 'Projects\nShipped' },
          { v: '5+',  l: 'Years\nBuilding' },
          { v: '2',   l: 'Batch-Top\nDegrees' },
          { v: '3×',  l: 'District\nChampion' },
        ].map((s, i) => (
          <motion.div
            key={s.l}
            className="ab-stat-cell"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: EASE, delay: i * 0.07 }}
          >
            <span className="ab-stat-v">{s.v}</span>
            <span className="ab-stat-l">{s.l}</span>
          </motion.div>
        ))}
      </div>

      {/* ─── EDUCATION ────────────────────────────────────── */}
      <section className="ab-section ab-section--alt">
        <div className="ab-section-wrap">
          <motion.header
            className="ab-section-hd"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className="ab-num">03</span>
            <div className="ab-rule" />
            <span className="ab-eyebrow">Education</span>
          </motion.header>

          <motion.div
            className="ab-edu-list"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
          >
            {[
              {
                deg: 'Master of Science',
                sub: 'Information Technology',
                school: 'University of Moratuwa',
                yr: '2024',
                badges: ['Batch Top'],
                award: null,
              },
              {
                deg: 'Bachelor of Science',
                sub: 'Information Technology',
                school: 'SLIIT',
                yr: '2017',
                badges: ['Batch Top'],
                award: 'Best Overall Performance · Epic Excellence Award (Epic Technology Group) 2017',
              },
            ].map((e) => (
              <motion.div key={e.deg} className="ab-edu-row" variants={slide}>
                <div className="ab-edu-yr">{e.yr}</div>
                <div className="ab-edu-connector">
                  <div className="ab-edu-dot" />
                  <div className="ab-edu-line" />
                </div>
                <div className="ab-edu-info">
                  <p className="ab-edu-deg">{e.deg}</p>
                  <p className="ab-edu-sub">{e.sub}</p>
                  <p className="ab-edu-school">{e.school}</p>
                  <div className="ab-edu-badges">
                    {e.badges.map(b => <span key={b} className="ab-edu-badge">{b}</span>)}
                  </div>
                  {e.award && <p className="ab-edu-award">🏆 {e.award}</p>}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── BADMINTON ────────────────────────────────────── */}
      <section className="ab-section ab-section--sport">
        <div className="ab-section-wrap">
          <motion.header
            className="ab-section-hd"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className="ab-num">04</span>
            <div className="ab-rule" />
            <span className="ab-eyebrow">Beyond Code</span>
          </motion.header>

          <motion.div
            className="ab-sport-layout"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
          >
            <motion.div className="ab-sport-heading" variants={rise}>
              <span className="ab-sport-emoji">🏸</span>
              <h2 className="ab-sport-h2">Competitive<br />Badminton</h2>
            </motion.div>

            <motion.p className="ab-sport-copy" variants={rise}>
              Pasi competed at the national level in Sri Lanka, ranking among the top under-19 players in the country. Discipline, strategic thinking, and performing under pressure — these aren't just athletic traits. They're the foundations of how he approaches engineering.
            </motion.p>

            <motion.div className="ab-achievements" variants={rise}>
              {[
                { v: 'Top 16',     l: 'Sri Lanka · Under-19' },
                { v: 'Runners-up', l: 'SSC Open U19 · 2010' },
                { v: '3×',         l: 'District Champion' },
              ].map((a) => (
                <div key={a.l} className="ab-ach">
                  <span className="ab-ach-v">{a.v}</span>
                  <span className="ab-ach-l">{a.l}</span>
                </div>
              ))}
            </motion.div>

            <motion.ul className="ab-sport-list" variants={rise}>
              {[
                'Captain — Men\'s Badminton Team, SLIIT (2016)',
                'SLIIT Colors Badminton (2015)',
                'All Island School Badminton Colors (2008 – 2012)',
                'Kalutara District Champion Under-19 (2009 & 2010)',
                'SSC Open Badminton Championship U19 Runners-up (2010)',
                'Ministry of Sports XL National Sports Festival District Champion (2014)',
                'School Badminton Captain (2008)',
              ].map(item => (
                <li key={item}>{item}</li>
              ))}
            </motion.ul>
          </motion.div>
        </div>
      </section>

      {/* ─── STACK ────────────────────────────────────────── */}
      <section className="ab-section">
        <div className="ab-section-wrap">
          <motion.header
            className="ab-section-hd"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className="ab-num">05</span>
            <div className="ab-rule" />
            <span className="ab-eyebrow">Tech Stack</span>
          </motion.header>

          <div className="ab-stack-grid">
            {STACK.map(({ cat, tags }, i) => (
              <motion.div
                key={cat}
                className="ab-stack-group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, ease: EASE, delay: i * 0.07 }}
              >
                <span className="ab-stack-cat">{cat}</span>
                <div className="ab-tags">
                  {tags.map(t => <span key={t} className="ab-tag">{t}</span>)}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── EXPERIENCE ───────────────────────────────────── */}
      <section className="ab-section ab-section--alt">
        <div className="ab-section-wrap">
          <motion.header
            className="ab-section-hd"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className="ab-num">06</span>
            <div className="ab-rule" />
            <span className="ab-eyebrow">Experience</span>
          </motion.header>

          <div className="ab-exp-list">
            {EXPERIENCE.map((e, i) => (
              <motion.div
                key={e.org}
                className="ab-exp-row"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: EASE, delay: i * 0.1 }}
              >
                <div className="ab-exp-meta">
                  <span className="ab-exp-period">{e.period}</span>
                </div>
                <div className="ab-exp-content">
                  <p className="ab-exp-role">{e.role}</p>
                  <p className="ab-exp-org">{e.org}</p>
                  <ul className="ab-exp-bullets">
                    {e.bullets.map(b => <li key={b}>{b}</li>)}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── AFFILIATIONS ─────────────────────────────────── */}
      <section className="ab-section">
        <div className="ab-section-wrap">
          <motion.header
            className="ab-section-hd"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className="ab-num">07</span>
            <div className="ab-rule" />
            <span className="ab-eyebrow">Affiliations</span>
          </motion.header>

          <motion.div
            className="ab-affiliations"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: EASE }}
          >
            <div className="ab-affil">
              <span className="ab-affil-name">The Australian Computer Society</span>
              <span className="ab-affil-detail">Migration Skills Assessment · EA ID: 4396724</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────────────────── */}
      <section className="ab-cta">
        <motion.div
          className="ab-cta-inner"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: EASE }}
        >
          <span className="ab-eyebrow" style={{ color: 'var(--on-dark-40)' }}>08 — Contact</span>
          <a href="mailto:bitlabs.solutions@gmail.com" className="ab-cta-link">
            Let's build something.
            <span className="ab-cta-arr">↗</span>
          </a>
          <p className="ab-cta-sub">bitlabs.solutions@gmail.com</p>
        </motion.div>
      </section>

    </div>
  )
}

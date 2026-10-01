'use client'
import { useRef, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import gsap from 'gsap'

// The Japanese-minka dusk scene (procedural Three.js) — client-only, loaded lazily.
const HeroScene = dynamic(() => import('./hero3d/HeroScene'), { ssr: false })

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
  const orbRef  = useRef(null)

  useEffect(() => {
    /* ── cursor orb ─────────────────────────────────────── */
    const orb = orbRef.current
    const moveOrb = (e) => {
      gsap.to(orb, { x: e.clientX, y: e.clientY, duration: 0.9, ease: 'power3.out', overwrite: true })
    }
    window.addEventListener('mousemove', moveOrb)

    /* ── scramble helper ────────────────────────────────── */
    const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    function scramble(el, finalText, startDelay, dur = 1.1) {
      gsap.set(el, { opacity: 1 })
      gsap.delayedCall(startDelay, () => {
        const t0 = gsap.ticker.time
        function tick() {
          const p = Math.min((gsap.ticker.time - t0) / dur, 1)
          const revealed = Math.floor(p * finalText.length * 1.5)
          el.textContent = Array.from(finalText).map((ch, i) => {
            if (ch === ' ') return ' '
            if (i < revealed) return finalText[i]
            return CHARS[Math.floor(Math.random() * CHARS.length)]
          }).join('')
          if (p >= 1) { el.textContent = finalText; gsap.ticker.remove(tick) }
        }
        gsap.ticker.add(tick)
      })
    }

    /* ── count-up helper ────────────────────────────────── */
    function countUp(el, end, suffix, delay) {
      const obj = { n: 0 }
      gsap.to(obj, {
        n: end, delay, duration: 1.6, ease: 'power2.out',
        onUpdate() { el.textContent = Math.ceil(obj.n) + suffix },
        onComplete() { el.textContent = end + suffix },
      })
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } })

      /* SVG paths draw */
      tl.fromTo('.ab-svg-path',
        { strokeDashoffset: 1800 },
        { strokeDashoffset: 0, duration: 1.8, stagger: 0.18, ease: 'power2.inOut' },
        0
      )

      /* top bar */
      tl.fromTo('.ab-hero-topbar', { opacity: 0 }, { opacity: 1, duration: 0.01 }, 0)
      tl.fromTo('.ab-tlabel',      { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.7 }, 0.1)
      tl.fromTo('.ab-avail-pill',  { opacity: 0, x: 20  }, { opacity: 1, x: 0, duration: 0.7 }, 0.1)

      /* scramble names */
      const w1 = heroRef.current?.querySelector('.ab-scramble-1')
      const w2 = heroRef.current?.querySelector('.ab-scramble-2')
      if (w1) scramble(w1, 'PASINDU',    0.28, 1.1)
      if (w2) scramble(w2, 'DULANJAYA',  0.58, 1.2)

      /* orange rule */
      tl.fromTo('.ab-hdivider',
        { scaleX: 0 },
        { scaleX: 1, duration: 1.0, transformOrigin: 'left', ease: 'expo.out' },
        0.72
      )

      /* right panel */
      tl.fromTo('.ab-hside-role', { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.7 }, 0.8)
      tl.fromTo('.ab-hside-desc', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6 }, 0.94)
      tl.fromTo('.ab-hside-link', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.09 }, 1.06)

      /* stats count-up */
      const statEls = heroRef.current?.querySelectorAll('.ab-hstat-num') ?? []
      const statDefs = [{ v: 9, s: '+' }, { v: 5, s: '+' }, { v: 2, s: '' }, { v: 3, s: '×' }]
      statEls.forEach((el, i) => {
        gsap.set(el.closest('.ab-hstat'), { opacity: 0, y: 14 })
        gsap.to(el.closest('.ab-hstat'), { opacity: 1, y: 0, duration: 0.55, delay: 1.0 + i * 0.09 })
        countUp(el, statDefs[i].v, statDefs[i].s, 1.05 + i * 0.09)
      })

      /* bottom bar */
      tl.fromTo('.ab-bbot-item', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.07 }, 0.95)

    }, heroRef)

    /* ── mouse parallax ─────────────────────────────────── */
    const onMove = (e) => {
      const xp = (e.clientX / window.innerWidth  - 0.5)
      const yp = (e.clientY / window.innerHeight - 0.5)
      gsap.to('.ab-hero-h1',   { x: xp * 28,  y: yp * 14, duration: 1.4, ease: 'power3.out', overwrite: true })
      gsap.to('.ab-hdivider',  { x: xp * -16,             duration: 1.4, ease: 'power3.out', overwrite: true })
      gsap.to('.ab-hero-right',{ x: xp * -18, y: yp * -9, duration: 1.4, ease: 'power3.out', overwrite: true })
      gsap.to('.ab-hero-svg',  { x: xp * 10,  y: yp * 6,  duration: 2.0, ease: 'power3.out', overwrite: true })
    }
    window.addEventListener('mousemove', onMove)

    return () => {
      ctx.revert()
      window.removeEventListener('mousemove', moveOrb)
      window.removeEventListener('mousemove', onMove)
    }
  }, [])

  return (
    <div className="ab-root">

      {/* ── cursor orb ── */}
      <div ref={orbRef} className="ab-orb" aria-hidden />

      {/* ─── HERO ─────────────────────────────────────────── */}
      <section ref={heroRef} className="ab-hero ab-hero--scene">

        {/* Live 3D backdrop: a minka at dusk */}
        <div className="ab-scene" aria-hidden>
          <HeroScene heroRef={heroRef} compose="center" />
          <div className="ab-scene-scrim" />
        </div>

        {/* Decorative SVG background lines */}
        <svg className="ab-hero-svg" aria-hidden viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
          <line className="ab-svg-path" x1="-50"  y1="950" x2="600"  y2="-50"  strokeDasharray="1800" strokeDashoffset="1800" />
          <line className="ab-svg-path" x1="200"  y1="950" x2="850"  y2="-50"  strokeDasharray="1800" strokeDashoffset="1800" />
          <line className="ab-svg-path" x1="500"  y1="950" x2="1150" y2="-50"  strokeDasharray="1800" strokeDashoffset="1800" />
          <line className="ab-svg-path" x1="800"  y1="950" x2="1450" y2="-50"  strokeDasharray="1800" strokeDashoffset="1800" />
          <line className="ab-svg-path" x1="1100" y1="950" x2="1750" y2="-50"  strokeDasharray="1800" strokeDashoffset="1800" />
        </svg>

        {/* Top bar */}
        <div className="ab-hero-topbar" style={{ opacity: 0 }}>
          <span className="ab-tlabel ab-eyebrow" style={{ opacity: 0 }}>01 — Profile</span>
          <span className="ab-avail-pill" style={{ opacity: 0 }}>
            <span className="ab-avail-dot" />
            Available for projects
          </span>
        </div>

        {/* Centre */}
        <div className="ab-hero-mid">
          <div className="ab-hero-left">
            <h1 className="ab-hero-h1">
              <div className="ab-name-line">
                <span className="ab-scramble-1" style={{ opacity: 0 }}>PASINDU</span>
              </div>
              <div className="ab-name-line ab-name-line--2">
                <span className="ab-scramble-2 ab-name-thin" style={{ opacity: 0 }}>DULANJAYA</span>
              </div>
            </h1>
            <div className="ab-hdivider" />
          </div>

          <div className="ab-hero-right">
            <p className="ab-hside-role" style={{ opacity: 0 }}>
              Founder &amp; Full-stack Developer
            </p>
            <p className="ab-hside-desc" style={{ opacity: 0 }}>
              Building web platforms, mobile apps, and AI-powered tools — from Sri Lanka to the world.
            </p>
            <div className="ab-hside-links">
              {[
                { href: 'https://github.com/Pasindu14', label: 'GitHub', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/></svg>, target: '_blank' },
                { href: 'mailto:bitlabs.solutions@gmail.com', label: 'Email', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg> },
                { href: '/', label: 'Bitlabs', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
              ].map(({ href, label, icon, target }) => (
                <a key={label} href={href} target={target} rel={target ? 'noopener noreferrer' : undefined}
                  className="ab-hside-link ab-action-link" style={{ opacity: 0 }}>
                  {icon}{label}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div className="ab-hero-stats">
          {[
            { label: 'Projects Shipped', suffix: '+' },
            { label: 'Years Building',   suffix: '+' },
            { label: 'Batch-Top Degrees', suffix: '' },
            { label: 'District Champion', suffix: '×' },
          ].map(({ label, suffix }) => (
            <div key={label} className="ab-hstat">
              <span className="ab-hstat-num">0{suffix}</span>
              <span className="ab-hstat-label">{label}</span>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="ab-hero-botbar">
          {['🇱🇰 Colombo, Sri Lanka', 'Bitlabs Studio', 'University of Moratuwa', 'SLIIT'].map((item, i) => (
            <span key={item} className="ab-bbot-item" style={{ opacity: 0 }}>
              {i > 0 && <span className="ab-hero-foot-div" />}
              {item}
            </span>
          ))}
        </div>

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

      {/* ─── CTA ──────────────────────────────────────────── */}
      <section className="ab-cta">
        <motion.div
          className="ab-cta-inner"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: EASE }}
        >
          <span className="ab-eyebrow">07 — Contact</span>
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

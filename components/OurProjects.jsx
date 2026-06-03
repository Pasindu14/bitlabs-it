'use client'
import { useRef, useState, useEffect } from 'react'
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
  distributors: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="5" r="2"/><circle cx="5" cy="19" r="2"/><circle cx="19" cy="19" r="2"/><path d="M12 7v4M9.5 17.5 12 11l2.5 6.5"/>
    </svg>
  ),
  routes: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 17h4l2-6h6l2 4h4"/><circle cx="7" cy="19" r="2"/><circle cx="17" cy="19" r="2"/>
    </svg>
  ),
  outlets: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  products: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    </svg>
  ),
  orders: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  ),
  territories: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  mobile: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>
    </svg>
  ),
  reports: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  ),
  grid: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
    </svg>
  ),
  reaction: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/>
    </svg>
  ),
  drill: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/><path d="m9 9 1 1 2-2"/>
    </svg>
  ),
  analytics: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
    </svg>
  ),
  premium: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  history: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8"/>
      <polyline points="12 7 12 12 15 15"/>
    </svg>
  ),
  trophy: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4a2 2 0 0 1-2-2V5h4"/><path d="M18 9h2a2 2 0 0 0 2-2V5h-4"/><path d="M12 17c-3.31 0-6-2.69-6-6V3h12v8c0 3.31-2.69 6-6 6z"/><path d="M8 21h8"/><path d="M12 17v4"/>
    </svg>
  ),
  zap: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  ),
  users: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  video: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>
    </svg>
  ),
  graduation: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10v6M2 10l10-5 10 5-10 5-10-5z"/><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/>
    </svg>
  ),
  badge: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>
    </svg>
  ),
  message: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  webhook: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 16.98h-5.99c-1.1 0-1.95.94-2.48 1.9A4 4 0 0 1 2 17c.01-.7.2-1.4.57-2"/><path d="m6 17 3.13-5.78c.53-.97.1-2.18-.5-3.1a4 4 0 1 1 6.89-4.06"/><path d="m12 6 3.13 5.73C15.66 12.7 16.9 13 18 13a4 4 0 0 1 0 8"/>
    </svg>
  ),
  contacts: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
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
    visual: { title: 'bitlabs-hris · dashboard', footer: ['Role-based access control', 'Multi-company ready'] },
    link: null,
  },
  {
    id: 'sfa',
    name: 'Bitlabs SFA',
    subtitle: 'Sales Force Automation',
    desc: 'An enterprise-grade Sales Force Automation platform built for field sales operations across Sri Lanka. Covers distributor network management, territory hierarchies, route planning, outlet visits, and real-time inventory — with a Flutter mobile app for field reps and a Next.js web dashboard for managers and executives.',
    status: 'In Development',
    statusType: 'dev',
    tags: ['.NET 8', 'Next.js', 'Flutter', 'PostgreSQL', 'Redis', 'TypeScript'],
    modules: [
      { icon: Icon.distributors, label: 'Distributors' },
      { icon: Icon.territories,  label: 'Territories' },
      { icon: Icon.routes,       label: 'Routes' },
      { icon: Icon.outlets,      label: 'Outlets' },
      { icon: Icon.products,     label: 'Products' },
      { icon: Icon.orders,       label: 'Orders' },
      { icon: Icon.mobile,       label: 'Mobile Sync' },
      { icon: Icon.reports,      label: 'Reports' },
    ],
    visual: { title: 'bitlabs-sfa · dashboard', footer: ['Offline-first mobile app', 'Multi-territory ready'] },
    link: null,
  },
  {
    id: 'goalie-gym',
    name: 'Goalie Concentration Gym',
    subtitle: 'Sports Cognitive Training App',
    desc: 'A Flutter mobile app that sharpens goalies\' reaction time and situational awareness through interactive grid-based training drills. Players race through number-sequence grids with animated distractions, while the app tracks reaction time, accuracy, and inter-tap intervals across every session.',
    status: 'In Development',
    statusType: 'dev',
    tags: ['Flutter', 'Dart', 'Supabase', 'PostgreSQL', 'Stripe', 'BLoC'],
    modules: [
      { icon: Icon.grid,      label: 'Grid Training' },
      { icon: Icon.reaction,  label: 'Reaction Time' },
      { icon: Icon.drill,     label: 'Drill Plans' },
      { icon: Icon.analytics, label: 'Analytics' },
      { icon: Icon.history,   label: 'History' },
      { icon: Icon.premium,   label: 'Premium' },
      { icon: Icon.reports,   label: 'Statistics' },
      { icon: Icon.mobile,    label: 'Multi-platform' },
    ],
    visual: { title: 'goalie-gym · training', footer: ['Reaction time analytics', 'Stripe subscriptions'] },
    link: null,
  },
  {
    id: 'concentration-gym',
    name: 'Concentration Gym',
    subtitle: 'Competitive Mental Training Platform',
    desc: 'A full-stack web platform where athletes sharpen focus through concentration grid exercises. Players compete in real-time live sessions and tournaments, track performance across leaderboards, and follow structured weekly workout plans — all powered by SignalR multiplayer.',
    status: 'Live',
    statusType: 'live',
    tags: ['ASP.NET Core', 'C#', 'MySQL', 'SignalR', 'Razor', 'Entity Framework'],
    modules: [
      { icon: Icon.grid,      label: 'Grid Training' },
      { icon: Icon.trophy,    label: 'Tournaments' },
      { icon: Icon.zap,       label: 'Live Sessions' },
      { icon: Icon.users,     label: 'Gamerooms' },
      { icon: Icon.reports,   label: 'Leaderboards' },
      { icon: Icon.drill,     label: 'Workout Plans' },
      { icon: Icon.analytics, label: 'Statistics' },
      { icon: Icon.reaction,  label: 'Reaction Time' },
    ],
    visual: { title: 'concentration-gym · live', footer: ['Real-time multiplayer', 'Tournament leaderboards'] },
    link: null,
  },
  {
    id: 'eminds',
    name: 'Eminds Academy',
    subtitle: 'Learning Management System',
    desc: 'A full-stack LMS for Eminds Academy powering both admin and student portals. Covers course and batch management, live Zoom sessions, exam tracking, attendance, Stripe payments, and achievement badges — with multi-device locking and role-based access control.',
    status: 'In Development',
    statusType: 'dev',
    tags: ['Next.js', 'TypeScript', 'Supabase', 'Stripe', 'Zoom SDK', 'NextAuth'],
    modules: [
      { icon: Icon.graduation, label: 'Courses' },
      { icon: Icon.video,      label: 'Live Sessions' },
      { icon: Icon.drill,      label: 'Exams' },
      { icon: Icon.calendar,   label: 'Attendance' },
      { icon: Icon.users,      label: 'Students' },
      { icon: Icon.payroll,    label: 'Payments' },
      { icon: Icon.badge,      label: 'Badges' },
      { icon: Icon.analytics,  label: 'Reports' },
    ],
    visual: { title: 'eminds-academy · dashboard', footer: ['Zoom live sessions', 'Role-based access'] },
    link: null,
  },
  {
    id: 'whatsapp-crm',
    name: 'WhatsApp CRM',
    subtitle: 'Business Messaging Platform',
    desc: 'A multi-tenant CRM built around the WhatsApp Business API. Teams manage conversations, assign threads to agents, track message delivery, and maintain full audit logs — all from a unified inbox with role-based access and real-time webhook integration.',
    status: 'In Development',
    statusType: 'dev',
    tags: ['Next.js', 'TypeScript', 'PostgreSQL', 'Drizzle ORM', 'NextAuth', 'TanStack Query'],
    modules: [
      { icon: Icon.message,   label: 'Conversations' },
      { icon: Icon.webhook,   label: 'WhatsApp API' },
      { icon: Icon.contacts,  label: 'Contacts' },
      { icon: Icon.users,     label: 'Team' },
      { icon: Icon.audit,     label: 'Audit Logs' },
      { icon: Icon.mobile,    label: 'Multi-account' },
      { icon: Icon.analytics, label: 'Reports' },
      { icon: Icon.premium,   label: 'Multi-tenant' },
    ],
    visual: { title: 'whatsapp-crm · inbox', footer: ['WhatsApp Business API', 'Multi-tenant ready'] },
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
  const hasVisual = !!project.visual
  return (
    <motion.div
      className="proj-card"
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, ease: EASE, delay: i * 0.08 }}
    >
      {hasVisual && (
        <div className="proj-visual" aria-hidden>
          <div className="proj-visual-glow" />
          <div className="proj-visual-header">
            <div className="proj-visual-dot" style={{ background: '#FF5F57' }} />
            <div className="proj-visual-dot" style={{ background: '#FEBC2E' }} />
            <div className="proj-visual-dot" style={{ background: '#28C840' }} />
            <span className="proj-visual-title">{project.visual.title}</span>
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
            {project.visual.footer.map((line) => (
              <span key={line}><b style={{ color: 'var(--orange)' }}>✓</b> {line}</span>
            ))}
          </div>
        </div>
      )}

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
    </motion.div>
  )
}

export function OurProjects() {
  const listRef = useRef(null)
  const trackRef = useRef(null)
  const scrollTarget = useRef(0)
  const [thumb, setThumb] = useState({ left: 0, width: 33 })

  function updateThumb(el) {
    const { scrollLeft, scrollWidth, clientWidth } = el
    const max = scrollWidth - clientWidth
    const progress = max > 0 ? scrollLeft / max : 0
    const widthPct = (clientWidth / scrollWidth) * 100
    setThumb({ left: progress * (100 - widthPct), width: widthPct })
  }

  useEffect(() => {
    const el = listRef.current
    if (!el) return
    updateThumb(el)

    let target = 0
    let current = 0
    let rafId = null

    function lerp(a, b, t) { return a + (b - a) * t }

    function tick() {
      current = lerp(current, target, 0.1)
      el.scrollLeft = current
      updateThumb(el)
      if (Math.abs(target - current) > 0.5) {
        rafId = requestAnimationFrame(tick)
      } else {
        el.scrollLeft = target
        updateThumb(el)
        rafId = null
      }
    }

    function onWheel(e) {
      e.preventDefault()
      const max = el.scrollWidth - el.clientWidth
      target = Math.max(0, Math.min(max, target + (e.deltaY || e.deltaX)))
      scrollTarget.current = target
      if (!rafId) rafId = requestAnimationFrame(tick)
    }

    target = el.scrollLeft
    current = el.scrollLeft
    scrollTarget.current = target

    el.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      el.removeEventListener('wheel', onWheel)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [])

  function smoothScrollTo(pos) {
    const list = listRef.current
    if (!list) return
    const max = list.scrollWidth - list.clientWidth
    scrollTarget.current = Math.max(0, Math.min(max, pos))
    list.scrollTo({ left: scrollTarget.current, behavior: 'smooth' })
  }

  function onThumbMouseDown(e) {
    e.preventDefault()
    const list = listRef.current
    const track = trackRef.current
    if (!list || !track) return

    const startX = e.clientX
    const startScrollLeft = list.scrollLeft

    function onMouseMove(e) {
      const deltaX = e.clientX - startX
      const trackW = track.clientWidth
      const thumbW = (list.clientWidth / list.scrollWidth) * trackW
      const maxScroll = list.scrollWidth - list.clientWidth
      smoothScrollTo(startScrollLeft + (deltaX / (trackW - thumbW)) * maxScroll)
    }

    function onMouseUp() {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }

  function onTrackClick(e) {
    if (e.target !== trackRef.current) return
    const list = listRef.current
    const track = trackRef.current
    const rect = track.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const trackW = rect.width
    const thumbW = (list.clientWidth / list.scrollWidth) * trackW
    const maxScroll = list.scrollWidth - list.clientWidth
    smoothScrollTo(((clickX - thumbW / 2) / (trackW - thumbW)) * maxScroll)
  }

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

        <div
          className="proj-list"
          ref={listRef}
          onScroll={(e) => updateThumb(e.currentTarget)}
        >
          {projects.map((p, i) => <ProjectCard key={p.id} project={p} i={i} />)}
        </div>

        <div className="proj-scroll-track" ref={trackRef} onClick={onTrackClick}>
          <div
            className="proj-scroll-thumb"
            style={{ left: `${thumb.left}%`, width: `${thumb.width}%` }}
            onMouseDown={onThumbMouseDown}
          />
        </div>
      </div>
    </section>
  )
}

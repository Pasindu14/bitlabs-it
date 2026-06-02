import { Fragment } from 'react'

const items = ['Mobile Apps', 'Web Platforms', 'AI Solutions', 'UI / UX Design', 'Custom Software', 'API Integration', 'Cloud', 'Automation']

function Group() {
  return (
    <div className="marquee-item">
      {items.map((t, i) => (
        <Fragment key={i}>
          <span className={i % 2 ? 'ghost' : ''}>{t}</span>
          <span className="dot" />
        </Fragment>
      ))}
    </div>
  )
}

export function Marquee() {
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track" data-marquee="">
        <Group /><Group /><Group />
      </div>
    </div>
  )
}

'use client'
import { useRef } from 'react'
import dynamic from 'next/dynamic'
import { Reveal } from './Reveal'

// A quiet dotted globe beside the heading — client-only, lazy.
const GlobeScene = dynamic(() => import('./hero3d/globe/GlobeScene'), { ssr: false })

const items = [
  { quote: 'Came back a second time because the first project was that good. Consistent quality, great communication every step of the way.', name: 'anthonybbaer', initials: 'AB' },
  { quote: 'High-value project handled with complete professionalism. Delivered exactly to spec and went the extra mile without being asked.', name: 'juliantrading', initials: 'JT', bg: 'dark' },
  { quote: 'Impressive output for a complex build. The work was clean, well-structured, and finished ahead of time. Left a tip because it deserved one.', name: 'leonsceco', initials: 'LS', bg: 'orange' },
  { quote: 'Solid execution on a detailed brief. The app worked first try, no revisions needed. Rare to find that level of precision.', name: 'o3books', initials: 'OB', bg: 'dark' },
  { quote: 'Dependable, talented, and fast. Came back multiple times and the standard never dropped once.', name: 'typeseo', initials: 'TS' },
  { quote: 'Trusted this developer with a substantial budget and it paid off completely. Exceptional value and craftsmanship.', name: 'john3m', initials: 'JM', bg: 'orange' },
]

export function Testimonials() {
  const globe = useRef(null)
  return (
    <section className="section-pad" id="testimonials" style={{ background: 'var(--bg-2)' }}>
      <div className="wrap">
        <div className="services-head">
          <div>
            <Reveal><span className="eyebrow">Social proof</span></Reveal>
            <Reveal delay={0.05}>
              <h2 className="h2" style={{ marginTop: 22, maxWidth: '15ch' }}>
                Teams that build <span style={{ color: 'var(--orange)', fontStyle: 'italic' }}>with us, stay with us.</span>
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.1}>
            <div className="t-globe" ref={globe}>
              <GlobeScene boxRef={globe} />
              <span className="t-globe-cap"><i /> Sri Lanka &amp; beyond</span>
            </div>
          </Reveal>
        </div>
        <div className="t-grid">
          {items.map((t, i) => (
            <Reveal key={i} delay={(i % 3) * 0.07}>
              <div className={'tcard' + (t.bg ? ` tcard--${t.bg}` : '')}>
                <div className="quote-mark">&ldquo;</div>
                <p>{t.quote}</p>
                <div className="who">
                  <span className="avatar">{t.initials}</span>
                  <span className="name">{t.name}</span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

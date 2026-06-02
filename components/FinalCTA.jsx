'use client'
import { Reveal } from './Reveal'
import { Magnetic } from './Magnetic'
import { ArrowR } from './ArrowR'

export function FinalCTA() {
  return (
    <section className="final" id="contact">
      <div className="wrap final-inner">
        <div className="glow-c" />
        <Reveal>
          <span className="eyebrow center" style={{ color: 'var(--orange)' }}>Let&#39;s talk</span>
        </Reveal>
        <h2 style={{ marginTop: 26 }}>
          <Reveal y={40}>Let&#39;s build</Reveal>
          <Reveal y={40} delay={0.08}><span className="accent">together.</span></Reveal>
        </h2>
        <Reveal delay={0.15}>
          <p className="lead">
            Tell us what you&#39;re trying to build. We&#39;ll help you scope it, design it and ship it — on time.
          </p>
        </Reveal>
        <div className="final-cta">
          <Magnetic>
            <a className="btn btn-primary" href="#contact">Start a Project <ArrowR /></a>
          </Magnetic>
          <Magnetic strength={0.25}>
            <a className="btn btn-on-dark-ghost" href="#contact">Book a Call</a>
          </Magnetic>
        </div>
      </div>
    </section>
  )
}

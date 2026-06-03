'use client'
import { Reveal } from './Reveal'

const items = [
  { quote: 'Bitlabs took our messy internal process and turned it into software our whole team actually enjoys using. Genuinely the most reliable dev partner we\'ve worked with.', name: 'Nimal Perera', initials: 'NP', bg: 'dark' },
  { quote: 'Shipped our app ahead of schedule and the quality was outstanding. Clean code, clear communication.', name: 'Sarah Chen', initials: 'SC' },
  { quote: 'The AI integration they built saves us hours every day. Smart team, no over-engineering.', name: 'Ravi Kumar', initials: 'RK', bg: 'orange' },
  { quote: 'Beautiful UI and rock-solid performance. They cared about the details we didn\'t even think of.', name: 'Amaya Silva', initials: 'AS' },
  { quote: 'They understood exactly what we needed and delivered without back-and-forth. Refreshingly straightforward.', name: 'Dinesh Jayawardena', initials: 'DJ', bg: 'dark' },
  { quote: 'Our mobile app went from concept to App Store in 10 weeks. Fast, responsive and professional throughout.', name: 'Priya Ratnayake', initials: 'PR' },
  { quote: 'Best decision we made was outsourcing our platform to Bitlabs. It scales beautifully and the code is clean.', name: 'Marcus Webb', initials: 'MW', bg: 'orange' },
  { quote: 'They built something we didn\'t think was possible in our budget. Would recommend without hesitation.', name: 'Kasun Fernando', initials: 'KF' },
  { quote: 'The attention to UX detail set them apart from every other agency we\'ve used. Users absolutely love it.', name: 'Tharushi Wickramasinghe', initials: 'TW', bg: 'dark' },
  { quote: 'Pasi and the team delivered exactly what we envisioned — on time, on budget, and with zero drama. Exceptional work.', name: 'Pete Fry', initials: 'PF', bg: 'orange' },
  { quote: 'Came back a second time because the first project was that good. Consistent quality, great communication every step of the way.', name: 'anthonybbaer', initials: 'AB' },
  { quote: 'High-value project handled with complete professionalism. Delivered exactly to spec and went the extra mile without being asked.', name: 'juliantrading', initials: 'JT', bg: 'dark' },
]

export function Testimonials() {
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

import { ArrowR } from './ArrowR'

const steps = [
  { n: '01', title: 'Discover', desc: 'We start by understanding your goals, users and constraints — mapping the problem before writing a line of code.', meta: ['Workshops', 'Scoping', 'Strategy'] },
  { n: '02', title: 'Design', desc: 'Wireframes become polished, validated interfaces. We prototype fast and refine with your feedback at every step.', meta: ['UX flows', 'Prototyping', 'Design system'] },
  { n: '03', title: 'Build', desc: 'Clean, tested, production-grade code shipped in tight iterations — so you see real progress every single sprint.', meta: ['Agile sprints', 'QA', 'Reviews'] },
  { n: '04', title: 'Deploy', desc: 'We launch, monitor and optimise — then stay on as your long-term partner for support, updates and scaling.', meta: ['CI/CD', 'Monitoring', 'Support'] },
]

export function HowWeWork() {
  return (
    <section className="how" id="process" data-how="">
      <div className="how-pin" data-how-pin="">
        <div className="wrap how-head">
          <div>
            <span className="eyebrow">How we work</span>
            <h2 className="h2" style={{ marginTop: 20, maxWidth: '16ch' }}>
              A clear path from idea to launch.
            </h2>
          </div>
          <div className="how-progress"><span data-how-bar="" /></div>
        </div>
        <div className="wrap" style={{ overflow: 'visible' }}>
          <div className="how-track" data-how-track="">
            {steps.map((s) => (
              <div className="step" key={s.n}>
                <div className="step-idx"><em>{s.n.slice(0, 1)}</em>{s.n.slice(1)}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
                <div className="step-meta">
                  {s.meta.map((m) => <span className="tag" key={m}>{m}</span>)}
                </div>
              </div>
            ))}
            <div
              className="step"
              style={{
                background: 'linear-gradient(150deg,#FF4D00,#FF7A3D)',
                border: 'none',
                color: '#fff',
                justifyContent: 'center',
              }}
            >
              <h3 style={{ color: '#fff', fontSize: 34 }}>Ready to start?</h3>
              <p style={{ color: 'rgba(255,255,255,0.85)' }}>
                Let&#39;s turn your idea into a product people love to use.
              </p>
              <a
                className="btn"
                href="#contact"
                style={{ background: '#0A0A0A', color: '#fff', marginTop: 26, alignSelf: 'flex-start' }}
              >
                Start a Project <ArrowR />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

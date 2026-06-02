/* global React, Motion */
const { motion: M2 } = window.Motion;

/* ---------------- Service icons ---------------- */
const Icon = {
  mobile: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="2" width="12" height="20" rx="3"/><path d="M11 18h2"/></svg>
  ),
  web: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="15" rx="2"/><path d="M2 9h20M6 22h12"/></svg>
  ),
  ai: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="7" width="14" height="12" rx="3"/><path d="M12 7V3M9 3h6M9 13h.01M15 13h.01M2 11v3M22 11v3"/></svg>
  ),
  custom: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m8 7-5 5 5 5M16 7l5 5-5 5"/></svg>
  ),
  uiux: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="13" cy="11" r="8"/><path d="m9 7-4 4 4 4M3 21l3-3"/></svg>
  ),
  api: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="18" cy="18" r="3"/><circle cx="18" cy="6" r="3"/><path d="M6 9v6a3 3 0 0 0 3 3h6"/></svg>
  ),
};

function ServiceCard({ data, i }) {
  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  return (
    <M2.div
      className="card"
      data-depth={(i % 3) - 1}
      onMouseMove={onMove}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, ease: window.EASE, delay: (i % 3) * 0.09 }}
    >
      <div className="card-num">{String(i + 1).padStart(2, "0")}</div>
      <div className="card-icon">{Icon[data.icon]}</div>
      <h3>{data.title}</h3>
      <p>{data.desc}</p>
      <div className="card-tags">
        {data.tags.map((t) => <span className="tag" key={t}>{t}</span>)}
      </div>
    </M2.div>
  );
}

function Services() {
  const data = [
    { icon: "mobile", title: "Mobile App Development", desc: "Fast, native-feeling Android apps built for reliability and a polished user experience your customers will love.", tags: ["Android", "Kotlin", "Cross-platform"] },
    { icon: "web", title: "Web Application Development", desc: "Scalable, secure web platforms and dashboards — engineered for performance and built to grow with your business.", tags: ["React", "Node", "Cloud"] },
    { icon: "ai", title: "AI Solutions & Integration", desc: "Put intelligence to work: chat assistants, automation and predictive features integrated into your existing products.", tags: ["LLMs", "Automation", "RAG"] },
    { icon: "custom", title: "Custom Software Solutions", desc: "Bespoke systems tailored to how your team actually works — replacing spreadsheets and manual processes with one tool.", tags: ["ERP", "Internal tools", "Workflow"] },
    { icon: "uiux", title: "UI / UX Design", desc: "Research-led interfaces that are intuitive, accessible and beautiful — turning complex flows into effortless journeys.", tags: ["Product", "Design systems", "Prototyping"] },
    { icon: "api", title: "API & System Integration", desc: "Connect your tools and data. We integrate payments, CRMs and third-party services into seamless, reliable pipelines.", tags: ["REST", "Webhooks", "Payments"] },
  ];
  return (
    <section className="section-pad" id="services">
      <div className="wrap">
        <div className="services-head">
          <div>
            <window.Reveal><span className="eyebrow">What we do</span></window.Reveal>
            <window.Reveal delay={0.06}>
              <h2 className="h2" style={{ marginTop: 22, maxWidth: "13ch" }}>
                Services engineered <span style={{ color: "var(--orange)", fontStyle: "italic" }}>around outcomes.</span>
              </h2>
            </window.Reveal>
          </div>
          <window.Reveal delay={0.12}>
            <p className="lead" style={{ maxWidth: "30ch" }}>
              One studio, full-stack capability — from first sketch to deployed, maintained product.
            </p>
          </window.Reveal>
        </div>
        <div className="cards-grid">
          {data.map((d, i) => <ServiceCard data={d} i={i} key={i} />)}
        </div>
      </div>
    </section>
  );
}

/* ---------------- How we work (GSAP-pinned horizontal) ---------------- */
function HowWeWork() {
  const steps = [
    { n: "01", title: "Discover", desc: "We start by understanding your goals, users and constraints — mapping the problem before writing a line of code.", meta: ["Workshops", "Scoping", "Strategy"] },
    { n: "02", title: "Design", desc: "Wireframes become polished, validated interfaces. We prototype fast and refine with your feedback at every step.", meta: ["UX flows", "Prototyping", "Design system"] },
    { n: "03", title: "Build", desc: "Clean, tested, production-grade code shipped in tight iterations — so you see real progress every single sprint.", meta: ["Agile sprints", "QA", "Reviews"] },
    { n: "04", title: "Deploy", desc: "We launch, monitor and optimise — then stay on as your long-term partner for support, updates and scaling.", meta: ["CI/CD", "Monitoring", "Support"] },
  ];
  return (
    <section className="how" id="process" data-how>
      <div className="how-pin" data-how-pin>
        <div className="wrap how-head">
          <div>
            <span className="eyebrow">How we work</span>
            <h2 className="h2" style={{ marginTop: 20, maxWidth: "16ch" }}>A clear path from idea to launch.</h2>
          </div>
          <div className="how-progress"><span data-how-bar></span></div>
        </div>
        <div className="wrap" style={{ overflow: "visible" }}>
          <div className="how-track" data-how-track>
            {steps.map((s) => (
              <div className="step" key={s.n}>
                <div className="step-idx"><em>{s.n.slice(0,1)}</em>{s.n.slice(1)}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
                <div className="step-meta">
                  {s.meta.map((m) => <span className="tag" key={m}>{m}</span>)}
                </div>
              </div>
            ))}
            <div className="step" style={{ background: "linear-gradient(150deg,#FF4D00,#FF7A3D)", border: "none", color: "#fff", justifyContent: "center" }}>
              <h3 style={{ color: "#fff", fontSize: 34 }}>Ready to start?</h3>
              <p style={{ color: "rgba(255,255,255,0.85)" }}>Let's turn your idea into a product people love to use.</p>
              <a className="btn" href="#contact" style={{ background: "#0A0A0A", color: "#fff", marginTop: 26, alignSelf: "flex-start" }}>Start a Project <window.ArrowR /></a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { Services, HowWeWork });

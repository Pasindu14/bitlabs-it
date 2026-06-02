/* global React, Motion */
const { motion: M3 } = window.Motion;

/* ---------------- Why Bitlabs ---------------- */
function WhyBitlabs() {
  const values = [
    { n: "01", title: "Clean, maintainable code", desc: "Well-architected and documented — easy to extend, audit and hand over. No black boxes, ever." },
    { n: "02", title: "Performance-optimized", desc: "Built for speed: fast load times, smooth interactions and efficient systems that scale under load." },
    { n: "03", title: "On-time delivery", desc: "Transparent timelines and steady sprint cadence. We ship when we say we will." },
    { n: "04", title: "Ongoing support", desc: "We don't disappear at launch — count on us for maintenance, improvements and long-term partnership." },
  ];
  return (
    <section className="section-pad" id="why">
      <div className="wrap why-grid">
        <div>
          <window.Reveal><span className="eyebrow">Why Bitlabs</span></window.Reveal>
          <window.Reveal delay={0.05}>
            <h2 className="h2" style={{ marginTop: 22, marginBottom: 18 }}>
              Built right, <span style={{ color: "var(--orange)", fontStyle: "italic" }}>built to last.</span>
            </h2>
          </window.Reveal>
          <div className="value-list">
            {values.map((v, i) => (
              <window.Reveal key={v.n} delay={i * 0.06} y={18}>
                <div className="value">
                  <div className="value-num">{v.n}</div>
                  <div>
                    <h3>{v.title}</h3>
                    <p>{v.desc}</p>
                  </div>
                </div>
              </window.Reveal>
            ))}
          </div>
        </div>

        <window.Reveal delay={0.1}>
          <M3.div className="why-visual" whileHover={{ y: -6 }} transition={{ type: "spring", stiffness: 200, damping: 20 }}>
            <div className="glow"></div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, position: "relative", zIndex: 2 }}>
              <div className="code-row"><b>›</b> npm run build</div>
              <div className="code-row" style={{ color: "var(--on-dark-40)" }}>compiling production bundle…</div>
              <div className="code-row"><b>✓</b> built in 1.42s · 0 errors</div>
              <div className="code-row"><b>✓</b> lighthouse · 100 / 100</div>
            </div>
            <div>
              <div className="why-stat-big">100<span style={{ color: "var(--orange)" }}>%</span></div>
              <p style={{ color: "var(--on-dark-60)", marginTop: 10, fontSize: 16, position: "relative", zIndex: 2 }}>
                Of projects shipped with performance budgets met and a clean handover.
              </p>
            </div>
          </M3.div>
        </window.Reveal>
      </div>
    </section>
  );
}

/* ---------------- Testimonials ---------------- */
function Testimonials() {
  const items = [
    { feature: true, quote: "Bitlabs took our messy internal process and turned it into software our whole team actually enjoys using. Genuinely the most reliable dev partner we've worked with.", name: "Nimal Perera", role: "Operations Director, Logistics" , initials: "NP" },
    { quote: "Shipped our app ahead of schedule and the quality was outstanding. Clean code, clear communication.", name: "Sarah Chen", role: "Founder, Retail Startup", initials: "SC" },
    { quote: "The AI integration they built saves us hours every day. Smart team, no over-engineering.", name: "Ravi Kumar", role: "CTO, Fintech", initials: "RK" },
    { quote: "Beautiful UI and rock-solid performance. They cared about the details we didn't even think of.", name: "Amaya Silva", role: "Product Lead", initials: "AS" },
  ];
  return (
    <section className="section-pad" id="testimonials" style={{ background: "var(--bg-2)" }}>
      <div className="wrap">
        <div className="services-head">
          <div>
            <window.Reveal><span className="eyebrow">Social proof</span></window.Reveal>
            <window.Reveal delay={0.05}>
              <h2 className="h2" style={{ marginTop: 22, maxWidth: "15ch" }}>
                Teams that build <span style={{ color: "var(--orange)", fontStyle: "italic" }}>with us, stay with us.</span>
              </h2>
            </window.Reveal>
          </div>
        </div>
        <div className="t-grid">
          {items.map((t, i) => (
            <window.Reveal key={i} delay={(i % 3) * 0.08} className={t.feature ? "feature-wrap" : ""}>
              <div className={"tcard" + (t.feature ? " feature" : "")}>
                <div className="quote-mark">“</div>
                <p>{t.quote}</p>
                <div className="who">
                  <span className="avatar">{t.initials}</span>
                  <span>
                    <span className="name" style={{ display: "block" }}>{t.name}</span>
                    <span className="role">{t.role}</span>
                  </span>
                </div>
              </div>
            </window.Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Final CTA ---------------- */
function FinalCTA() {
  return (
    <section className="final" id="contact">
      <div className="wrap final-inner">
        <div className="glow-c"></div>
        <window.Reveal>
          <span className="eyebrow center" style={{ color: "var(--orange)" }}>Let's talk</span>
        </window.Reveal>
        <h2 style={{ marginTop: 26 }}>
          <window.Reveal y={40}>Let's build</window.Reveal>
          <window.Reveal y={40} delay={0.08}><span className="accent">together.</span></window.Reveal>
        </h2>
        <window.Reveal delay={0.15}>
          <p className="lead">
            Tell us what you're trying to build. We'll help you scope it, design it and ship it — on time.
          </p>
        </window.Reveal>
        <div className="final-cta">
          <window.Magnetic><a className="btn btn-primary" href="#contact">Start a Project <window.ArrowR /></a></window.Magnetic>
          <window.Magnetic strength={0.25}><a className="btn btn-on-dark-ghost" href="#contact">Book a Call</a></window.Magnetic>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Footer ---------------- */
function Footer() {
  return (
    <footer className="footer" id="footer-contact">
      <div className="wrap">
        <div className="footer-top">
          <div className="footer-brand">
            <a className="brand" href="#top" style={{ color: "var(--on-dark)" }}>
              <span className="brand-mark"><span></span></span> <span className="brand-word">Bit<b>labs</b></span>
            </a>
            <p>Crafting innovative software solutions for businesses in Sri Lanka and beyond.</p>
            <div style={{ display: "flex", gap: 10, marginTop: 22, flexWrap: "wrap" }}>
              <a className="contact-pill" href="https://wa.me/94000000000">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.5 15.2L2 22l4.9-1.3A10 10 0 1 0 12 2zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-2.9.8.8-2.8-.2-.3A8 8 0 1 1 12 20zm4.4-5.6c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.5.1l-.7.9c-.1.2-.3.2-.5.1a6.5 6.5 0 0 1-3.2-2.8c-.1-.2 0-.4.1-.5l.4-.5.2-.4v-.4l-.8-1.8c-.2-.5-.4-.4-.5-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2c0 1.3.9 2.5 1.1 2.7 0 .2 1.8 2.8 4.4 3.9 1.6.7 2.2.7 3 .6.5 0 1.4-.6 1.6-1.1.2-.6.2-1 .1-1.1l-.3-.2z"/></svg>
                WhatsApp
              </a>
              <a className="contact-pill" href="mailto:hello@bitlabs.lk">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>
                hello@bitlabs.lk
              </a>
            </div>
          </div>
          <div>
            <h4>Services</h4>
            <div className="footer-links">
              <a href="#services">Mobile Apps</a>
              <a href="#services">Web Platforms</a>
              <a href="#services">AI Solutions</a>
              <a href="#services">Custom Software</a>
              <a href="#services">UI / UX Design</a>
            </div>
          </div>
          <div>
            <h4>Company</h4>
            <div className="footer-links">
              <a href="#why">Why Bitlabs</a>
              <a href="#process">Process</a>
              <a href="#testimonials">Work</a>
              <a href="#contact">Contact</a>
            </div>
          </div>
          <div>
            <h4>Studio</h4>
            <div className="footer-links">
              <a href="#" style={{ pointerEvents: "none" }}>Kalutara South,<br/>Sri Lanka</a>
              <a href="mailto:hello@bitlabs.lk">hello@bitlabs.lk</a>
              <a href="https://wa.me/94000000000">WhatsApp chat</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Bitlabs. All rights reserved.</span>
          <span>Designed &amp; built in Sri Lanka 🇱🇰</span>
        </div>
      </div>
    </footer>
  );
}

Object.assign(window, { WhyBitlabs, Testimonials, FinalCTA, Footer });

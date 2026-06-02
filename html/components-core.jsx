/* global React, Motion */
const { motion, useScroll, useSpring, useTransform, useMotionValue, useInView, animate } = window.Motion;
const { useRef, useEffect, useState } = React;

/* ---------------- Magnetic button ---------------- */
function Magnetic({ children, strength = 0.35, className = "", ...rest }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 });
  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const reset = () => { x.set(0); y.set(0); };
  return (
    <motion.span
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={reset}
      style={{ x: sx, y: sy, display: "inline-flex" }}
      whileTap={{ scale: 0.95 }}
      className={className}
      {...rest}
    >
      {children}
    </motion.span>
  );
}

const ArrowR = ({ s = 18 }) => (
  <svg className="arrow" width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
);

/* ---------------- Scroll progress bar ---------------- */
function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 28, mass: 0.3 });
  return <motion.div className="scroll-progress" style={{ scaleX }} />;
}

/* ---------------- Nav ---------------- */
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  const links = [["Services", "#services"], ["Process", "#process"], ["Why Bitlabs", "#why"], ["Work", "#testimonials"]];
  return (
    <motion.nav
      className={"nav" + (scrolled ? " scrolled" : "")}
      initial={{ y: -90 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
    >
      <div className="wrap nav-inner">
        <a className="brand" href="#top">
          <span className="brand-mark"><span></span></span>
          <span className="brand-word">Bit<b>labs</b></span>
        </a>
        <div className="nav-links">
          {links.map(([t, h]) => <a key={t} href={h}>{t}</a>)}
        </div>
        <div className="nav-cta">
          <Magnetic>
            <a className="btn btn-primary btn-sm" href="#contact">Get in Touch <ArrowR s={16} /></a>
          </Magnetic>
          <button className="nav-burger" aria-label="Menu">
            <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6"><path d="M3 7h18M3 12h18M3 17h18"/></svg>
          </button>
        </div>
      </div>
    </motion.nav>
  );
}

/* ---------------- Hero ---------------- */
const EASE = [0.22, 1, 0.36, 1];

function WordReveal({ text, className = "", delay = 0 }) {
  const words = text.split(" ");
  return (
    <span className={className}>
      {words.map((w, i) => (
        <span className="word-line" key={i}>
          <motion.span
            className="word"
            initial={{ y: "110%" }}
            animate={{ y: "0%" }}
            transition={{ duration: 1.0, ease: EASE, delay: delay + i * 0.075 }}
            dangerouslySetInnerHTML={{ __html: w + (i < words.length - 1 ? "&nbsp;" : "") }}
          />
        </span>
      ))}
    </span>
  );
}

function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y1 = useTransform(scrollYProgress, [0, 1], [0, 160]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const orbitY = useTransform(scrollYProgress, [0, 1], [0, 220]);

  return (
    <header className="hero" id="top" ref={ref}>
      <div className="hero-bg">
        <motion.div className="blob b1" style={{ y: y1 }} animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div className="blob b2" style={{ y: y2 }} animate={{ scale: [1, 1.12, 1] }} transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }} />
        <div className="grid-lines"></div>
      </div>

      <motion.div className="hero-orbit" style={{ y: orbitY }}>
        <motion.div className="orbit-ring" animate={{ rotate: 360 }} transition={{ duration: 22, repeat: Infinity, ease: "linear" }}>
          <span className="orbit-dot"></span>
        </motion.div>
        <motion.div className="orbit-ring r2" animate={{ rotate: -360 }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }}>
          <span className="orbit-dot" style={{ background: "#111" }}></span>
        </motion.div>
        <div className="orbit-core">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
        </div>
      </motion.div>

      <motion.div className="wrap hero-inner" style={{ opacity: fade }}>
        <motion.span className="eyebrow" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.8 }}>
          Software Studio · Sri Lanka
        </motion.span>

        <h1 className="display">
          <WordReveal text="We design and" delay={0.35} />
          <WordReveal text="build software" delay={0.5} />
          <span className="word-line">
            <motion.span className="word" initial={{ y: "110%" }} animate={{ y: "0%" }} transition={{ duration: 1, ease: EASE, delay: 0.66 }}>
              that <span className="accent">drives growth.</span>
            </motion.span>
          </span>
        </h1>

        <div className="hero-sub">
          <motion.p className="lead" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, duration: 0.9, ease: EASE }}>
            Bitlabs crafts custom digital products — from mobile and web apps to
            AI-driven systems — engineered for efficiency, performance and scale.
          </motion.p>
          <motion.div className="hero-cta" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.05, duration: 0.9, ease: EASE }}>
            <Magnetic><a className="btn btn-primary" href="#contact">Start a Project <ArrowR /></a></Magnetic>
            <Magnetic strength={0.25}><a className="btn btn-ghost" href="#services">Explore Services</a></Magnetic>
          </motion.div>
        </div>
      </motion.div>
    </header>
  );
}

/* ---------------- Marquee ---------------- */
function Marquee() {
  const items = ["Mobile Apps", "Web Platforms", "AI Solutions", "UI / UX Design", "Custom Software", "API Integration", "Cloud", "Automation"];
  const Group = () => (
    <div className="marquee-item">
      {items.map((t, i) => (
        <React.Fragment key={i}>
          <span className={i % 2 ? "ghost" : ""}>{t}</span>
          <span className="dot"></span>
        </React.Fragment>
      ))}
    </div>
  );
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track" data-marquee>
        <Group /><Group /><Group />
      </div>
    </div>
  );
}

/* ---------------- Trust / Stat counters ---------------- */
function Counter({ to, suffix = "", duration = 2 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, {
      duration, ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setVal(v),
    });
    return () => controls.stop();
  }, [inView, to]);
  return <span ref={ref} data-counter={to} data-suffix={suffix}>{Math.round(val)}<span className="suffix">{suffix}</span></span>;
}

function Trust() {
  const stats = [
    { to: 80, suffix: "+", label: "Projects delivered across web, mobile & AI" },
    { to: 45, suffix: "+", label: "Businesses served in Sri Lanka & beyond" },
    { to: 7, suffix: "", label: "Years building production software" },
    { to: 99, suffix: "%", label: "On-time delivery & client retention" },
  ];
  return (
    <section className="trust section-pad" id="trust">
      <div className="wrap">
        <Reveal><span className="eyebrow">Trusted partner</span></Reveal>
        <Reveal delay={0.05}>
          <h2 className="h2" style={{ marginTop: 22, maxWidth: "16ch" }}>
            Trusted by businesses in Sri Lanka and beyond.
          </h2>
        </Reveal>
        <div className="stats-grid">
          {stats.map((s, i) => (
            <Reveal key={i} delay={0.1 + i * 0.08}>
              <div className="stat">
                <div className="num"><Counter to={s.to} suffix={s.suffix} /></div>
                <div className="label">{s.label}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Reveal wrapper (whileInView) ---------------- */
function Reveal({ children, delay = 0, y = 26, className = "" }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.85, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

Object.assign(window, { Magnetic, ArrowR, ScrollProgress, Nav, Hero, Marquee, Trust, Reveal, Counter, EASE });

/* -----------------------------------------------------------------------
   ScrollCurveArrow — fixed right-side hand-drawn looping path that draws
   itself from top to bottom as the user scrolls the full page.
   Path lives in a 60×500 viewBox; the loop is a bezier circle centred
   around y≈255, radius≈25, so the path crosses itself cleanly there.
   ----------------------------------------------------------------------- */
function ScrollCurveArrow() {
  const { scrollYProgress } = useScroll();
  const rawPL  = useSpring(scrollYProgress, { stiffness: 80, damping: 22, mass: 0.5 });
  const headOp = useTransform(rawPL, [0.88, 1], [0, 1]);

  /* path:
     (30,5) → S-curve right → (30,175) [loop entry top]
     → clockwise circle loop (r≈25, centre 30,255)
     → (30,280) [loop exit bottom]
     → straight to (30,492) [arrowhead]           */
  const d = [
    "M 30 5",
    "C 52 55, 52 115, 30 160",        /* sweep right then back */
    "C 8 198, 10 218, 30 230",        /* sweep left then to loop entry */
    "C 44 230, 55 241, 55 255",       /* loop Q1: top → right */
    "C 55 269, 44 280, 30 280",       /* loop Q2: right → bottom */
    "C 16 280, 5 269, 5 255",         /* loop Q3: bottom → left */
    "C 5 241, 16 230, 30 230",        /* loop Q4: left → top (crossing) */
    "C 30 222, 30 330, 30 492",       /* exit loop downward */
  ].join(" ");

  return (
    <motion.div
      className="scroll-curve-arrow"
      aria-hidden="true"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.2, duration: 0.8 }}
    >
      <svg viewBox="0 0 60 500" fill="none" xmlns="http://www.w3.org/2000/svg" overflow="visible">
        <defs>
          <filter id="sc-glow" x="-60%" y="-10%" width="220%" height="120%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Faint full-path guide (always visible) */}
        <path
          d={d}
          stroke="var(--ink-06)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Orange drawn path */}
        <motion.path
          d={d}
          stroke="var(--orange)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#sc-glow)"
          style={{ pathLength: rawPL, opacity: 0.9 }}
        />

        {/* Arrowhead — two barb lines pointing down */}
        <motion.g style={{ opacity: headOp }}>
          <line x1="20" y1="478" x2="30" y2="494" stroke="var(--orange)" strokeWidth="2.5" strokeLinecap="round" filter="url(#sc-glow)" />
          <line x1="40" y1="478" x2="30" y2="494" stroke="var(--orange)" strokeWidth="2.5" strokeLinecap="round" filter="url(#sc-glow)" />
        </motion.g>
      </svg>
    </motion.div>
  );
}

Object.assign(window, { ScrollCurveArrow });



/* global React, ReactDOM, gsap, ScrollTrigger, Lenis */
const { Nav, Hero, Marquee, Trust, Services, HowWeWork, WhyBitlabs, Testimonials, FinalCTA, Footer, ScrollProgress, ScrollCurveArrow } = window;

const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function App() {
  return (
    <React.Fragment>
      <ScrollProgress />
      <ScrollCurveArrow />
      <Nav />
      <main>
        <Hero />
        <Marquee />
        <Trust />
        <Services />
        <HowWeWork />
        <WhyBitlabs />
        <Testimonials />
        <FinalCTA />
      </main>
      <Footer />
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);

/* ============================================================
   Smooth scroll + GSAP scroll effects — init after mount
   ============================================================ */
function initMotion() {
  gsap.registerPlugin(ScrollTrigger);

  let lenis;
  if (!prefersReduced) {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true, wheelMultiplier: 1 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    document.documentElement.classList.add("lenis");
  }

  /* anchor links -> smooth scroll via lenis */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id.length < 2) return;
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(el, { offset: -70, duration: 1.2 });
      else el.scrollIntoView();
    });
  });

  if (prefersReduced) return;

  /* ---- Infinite marquee ---- */
  const track = document.querySelector("[data-marquee]");
  if (track) {
    const groupWidth = track.scrollWidth / 3;
    gsap.to(track, {
      x: -groupWidth,
      duration: 22,
      ease: "none",
      repeat: -1,
      modifiers: { x: gsap.utils.unitize((x) => parseFloat(x) % groupWidth) },
    });
  }

  /* ---- Card parallax depth ---- */
  gsap.utils.toArray(".card[data-depth]").forEach((card) => {
    const depth = parseFloat(card.dataset.depth) || 0;
    if (!depth) return;
    gsap.fromTo(card, { y: depth * 26 }, {
      y: depth * -26,
      ease: "none",
      scrollTrigger: { trigger: card.closest(".cards-grid"), start: "top bottom", end: "bottom top", scrub: 1 },
    });
  });

  /* ---- How we work: pin + horizontal scroll ---- */
  const how = document.querySelector("[data-how]");
  const htrack = document.querySelector("[data-how-track]");
  const hbar = document.querySelector("[data-how-bar]");
  if (how && htrack) {
    const getScroll = () => htrack.scrollWidth - htrack.parentElement.offsetWidth + 40;
    const st = gsap.to(htrack, {
      x: () => -getScroll(),
      ease: "none",
      scrollTrigger: {
        trigger: how,
        start: "top top",
        end: () => "+=" + (getScroll() + window.innerHeight * 0.4),
        pin: ".how-pin",
        scrub: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => { if (hbar) hbar.style.width = (self.progress * 100).toFixed(1) + "%"; },
      },
    });
  }

  ScrollTrigger.refresh();
  /* refresh once fonts settle to fix pin measurements */
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => ScrollTrigger.refresh());
  }
  window.addEventListener("load", () => ScrollTrigger.refresh());
}

/* give React a tick to paint, then init scroll machinery */
requestAnimationFrame(() => requestAnimationFrame(initMotion));

/* ------------------------------------------------------------
   Failsafe: if requestAnimationFrame is throttled at load
   (e.g. the page is rendered in a backgrounded tab/pane),
   framer-motion's frame loop pauses and entrance animations
   never advance — which would leave content stuck at opacity:0.
   Detect that and force any still-hidden elements visible so
   the page is never blank. Harmless in the normal case: by the
   time it fires, foreground animations have already finished.
------------------------------------------------------------ */
(function revealFailsafe() {
  let rafFired = false;
  requestAnimationFrame(() => { rafFired = true; });
  setTimeout(() => {
    if (rafFired) return; // rAF healthy — animations are running normally
    document.querySelectorAll('[style*="opacity"], [style*="transform"]').forEach((el) => {
      el.style.opacity = "";
      el.style.transform = "";
    });
    // Reveal scroll-driven SVG paths (pathLength stuck at 0 when rAF throttled)
    document.querySelectorAll('.scroll-curve-arrow path, .scroll-curve-arrow line').forEach((el) => {
      el.style.strokeDashoffset = "0";
      el.style.strokeDasharray = "";
      el.style.opacity = "0.9";
    });
    document.querySelectorAll("[data-counter]").forEach((el) => {
      el.innerHTML = el.getAttribute("data-counter") + '<span class="suffix">' + (el.getAttribute("data-suffix") || "") + "</span>";
    });
    document.documentElement.classList.add("anim-skipped");
  }, 1500);
})();

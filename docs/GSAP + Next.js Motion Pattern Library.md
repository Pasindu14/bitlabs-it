# GSAP + Next.js Motion Pattern Library

Use this catalog to select, specify and implement animation features consistently. Each pattern includes its purpose, construction, responsive behavior, reduced-motion behavior and common failure modes.

---

## Pattern 01 — Hero Entrance Timeline

**Purpose**

Introduce the brand hierarchy and establish the page's motion language.

**Suitable for**

- Agency websites
- Portfolios
- Product launches
- Editorial landing pages
- Brand campaigns

**Typical sequence**

1. Background or hero media becomes visible.
2. Eyebrow text enters.
3. Heading lines reveal.
4. Supporting copy enters.
5. Primary actions become available.
6. Decorative media settles.
7. Scroll indicator appears last.

**Recommended timing**

| Element | Timing |
| --- | --- |
| Background reveal | 0.00–0.60 s |
| Heading reveal | 0.12–0.82 s |
| Supporting copy | 0.42–0.92 s |
| Actions | 0.58–1.02 s |
| Decorative elements | 0.28–1.10 s |

**Implementation model**

```ts
const timeline = gsap.timeline({
  defaults: {
    ease: "power3.out",
  },
});

timeline
  .fromTo(
    "[data-hero-media]",
    { scale: 1.08, autoAlpha: 0 },
    { scale: 1, autoAlpha: 1, duration: 0.9 },
  )
  .fromTo(
    "[data-hero-line]",
    { yPercent: 110 },
    {
      yPercent: 0,
      duration: 0.72,
      stagger: 0.075,
    },
    0.12,
  )
  .fromTo(
    "[data-hero-copy]",
    { y: 16, autoAlpha: 0 },
    {
      y: 0,
      autoAlpha: 1,
      duration: 0.48,
    },
    0.42,
  )
  .fromTo(
    "[data-hero-action]",
    { y: 12, autoAlpha: 0 },
    {
      y: 0,
      autoAlpha: 1,
      duration: 0.4,
      stagger: 0.06,
    },
    0.56,
  );
```

**Mobile behavior**

- Reduce movement distance.
- Avoid delayed access to important buttons.
- Remove secondary decorative animation.
- Avoid large scale transformations on tall media.

**Reduced motion**

Reveal the complete hero immediately or use a brief opacity transition.

**Avoid**

- Five-second introductions.
- Mandatory logo sequences.
- Preventing scrolling.
- Animating all heading characters independently.
- Hiding the primary action until the timeline completes.

---

## Pattern 02 — Masked Text Reveal

**Purpose**

Create editorial hierarchy without relying on generic opacity transitions.

**Structure**

```html
<div class="line-mask">
  <span data-line>Motion with purpose.</span>
</div>
```

```css
.line-mask {
  overflow: hidden;
}
```

**Motion**

```ts
gsap.fromTo(
  "[data-line]",
  {
    yPercent: 110,
    rotate: 1.5,
  },
  {
    yPercent: 0,
    rotate: 0,
    duration: 0.7,
    ease: "power3.out",
    stagger: 0.08,
  },
);
```

**SplitText version**

Use SplitText when lines must be calculated from responsive text wrapping. SplitText supports lines, words, characters, masking and responsive re-splitting.

**Rules**

- Animate short headings.
- Preserve line readability.
- Keep total reveal under approximately one second for normal sections.
- Recalculate after font loading and width changes.
- Revert generated wrappers during cleanup.

**Reduced motion**

Remove the translation and render the complete heading.

**Avoid**

- Splitting paragraphs into characters.
- Excessive rotation.
- Revealing words so slowly that users must wait to read.

---

## Pattern 03 — Masked Image Reveal

**Purpose**

Introduce media with more visual direction than a simple fade.

**Recommended layering**

```text
Figure
├── Mask container
│   └── Oversized image
└── Optional caption
```

**Motion**

```ts
const timeline = gsap.timeline({
  scrollTrigger: {
    trigger: root.current,
    start: "top 80%",
    once: true,
  },
});

timeline
  .fromTo(
    "[data-image-mask]",
    { clipPath: "inset(0 0 100% 0)" },
    {
      clipPath: "inset(0 0 0% 0)",
      duration: 0.85,
      ease: "power3.inOut",
    },
  )
  .fromTo(
    "[data-image]",
    { scale: 1.12 },
    {
      scale: 1,
      duration: 1.05,
      ease: "power3.out",
    },
    0,
  );
```

**Variations**

- Vertical curtain
- Horizontal wipe
- Rounded rectangle expansion
- Two-panel opening
- SVG-shaped reveal
- Diagonal clip
- Full-screen expansion

**Mobile behavior**

Use simpler clipping and less scale.

**Reduced motion**

Show the image directly or apply a brief crossfade.

**Performance warning**

Large animated clipping regions may be expensive. Test real mobile devices.

---

## Pattern 04 — Image-Within-Frame Parallax

**Purpose**

Create depth while keeping the page's layout stable.

**Structure**

```css
.parallax-frame {
  position: relative;
  overflow: hidden;
}

.parallax-frame img {
  height: 120%;
  width: 100%;
  object-fit: cover;
}
```

**Implementation**

```ts
useGSAP(
  () => {
    gsap.fromTo(
      "[data-parallax-image]",
      { yPercent: -8 },
      {
        yPercent: 8,
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      },
    );
  },
  { scope: root },
);
```

**Rules**

- Keep displacement subtle.
- Ensure the image is oversized enough to prevent empty edges.
- Use `ease: "none"` for direct scrub mapping.
- Use only on selected images.
- Avoid parallax on text that must remain easy to read.

**Mobile behavior**

Use a smaller range or static media.

**Reduced motion**

Set `yPercent: 0`.

**Avoid**

- Moving every image.
- Combining large parallax with strong scale and rotation.
- Making foreground text difficult to track.

---

## Pattern 05 — Multi-Layer Depth Parallax

**Purpose**

Create spatial depth using layers that move at different rates.

**Example layers**

- Background gradient
- Distant decorative shape
- Main image
- Foreground object
- Typography

**Data-based setup**

```html
<div data-depth="0.15"></div>
<div data-depth="0.35"></div>
<div data-depth="0.65"></div>
```

```ts
const layers = gsap.utils.toArray<HTMLElement>("[data-depth]");

layers.forEach((layer) => {
  const depth = Number(layer.dataset.depth ?? 0);

  gsap.to(layer, {
    yPercent: depth * -20,
    ease: "none",
    scrollTrigger: {
      trigger: root.current,
      start: "top bottom",
      end: "bottom top",
      scrub: true,
    },
  });
});
```

**Rules**

- Use a consistent depth model.
- Keep text near the stable plane.
- Avoid large differences that separate the composition.
- Do not add pointer parallax on touch devices.

**Reduced motion**

Flatten all layers into their intended static composition.

---

## Pattern 06 — Pinned Scrollytelling

**Purpose**

Keep one visual stage in position while the associated story progresses.

**Suitable for**

- Product features
- Timelines
- Processes
- Case studies
- Data explanations
- Before-and-after stories

**Structure**

```text
Story section
├── Sticky/pinned visual stage
└── Narrative steps
    ├── Step 1
    ├── Step 2
    ├── Step 3
    └── Step 4
```

**Implementation concept**

```ts
const steps = gsap.utils.toArray<HTMLElement>("[data-step]");

const timeline = gsap.timeline({
  scrollTrigger: {
    trigger: root.current,
    start: "top top",
    end: () => `+=${steps.length * window.innerHeight * 0.75}`,
    scrub: 0.5,
    pin: "[data-stage]",
    invalidateOnRefresh: true,
  },
});

steps.forEach((step, index) => {
  timeline.to(
    `[data-visual="${index}"]`,
    {
      autoAlpha: 1,
      scale: 1,
      duration: 1,
    },
    index,
  );

  if (index > 0) {
    timeline.to(
      `[data-visual="${index - 1}"]`,
      {
        autoAlpha: 0,
        scale: 0.96,
        duration: 1,
      },
      index,
    );
  }
});
```

**Rules**

- Each scroll segment must communicate meaningful information.
- Show progress or chapter state.
- Keep pin duration proportional to content.
- Ensure users can exit naturally.
- Avoid placing focused controls inside changing layers.
- Create triggers in page order.

**Mobile behavior**

Convert to:

- Sticky media with normal text flow.
- Swipeable cards.
- Vertical chapters.
- Static step-by-step sections.

**Reduced motion**

Show all steps as a normal document sequence.

**Avoid**

- Pinning an almost-empty section for several viewport heights.
- Hiding the narrative until scroll reaches exact points.
- Overlapping invisible layers that remain focusable.

---

## Pattern 07 — Horizontal Gallery

**Purpose**

Present a visual collection with controlled cinematic progression.

**Implementation**

```ts
const track = root.current?.querySelector<HTMLElement>(
  "[data-horizontal-track]",
);

if (!track) return;

const getDistance = () =>
  Math.max(0, track.scrollWidth - window.innerWidth);

gsap.to(track, {
  x: () => -getDistance(),
  ease: "none",
  scrollTrigger: {
    trigger: root.current,
    start: "top top",
    end: () => `+=${getDistance()}`,
    scrub: true,
    pin: true,
    invalidateOnRefresh: true,
  },
});
```

**Required features**

- Progress indicator
- Obvious final item
- Natural exit
- Correct resize calculations
- Adequate keyboard order
- Mobile alternative

**Mobile behavior**

Prefer native horizontal overflow with scroll snapping:

```css
.gallery {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 84%;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
}

.gallery > * {
  scroll-snap-align: start;
}
```

**Reduced motion**

Use a normal grid or native horizontal list.

**Avoid**

- Horizontal body text.
- Entire websites that require sideways exploration.
- Hidden scroll direction.
- Very long pinned tracks.

---

## Pattern 08 — Scroll-Scrubbed Product Sequence

**Purpose**

Connect scroll progress to a product transformation or explanatory sequence.

**Suitable media**

- Canvas frame sequences
- SVG components
- DOM product layers
- Three.js models
- Video with carefully controlled seeking

**Frame-sequence architecture**

```ts
type FrameSequence = {
  frames: HTMLImageElement[];
  frame: number;
};

const sequence: FrameSequence = {
  frames,
  frame: 0,
};

gsap.to(sequence, {
  frame: frames.length - 1,
  snap: "frame",
  ease: "none",
  scrollTrigger: {
    trigger: root.current,
    start: "top top",
    end: "+=300%",
    scrub: true,
    pin: true,
  },
  onUpdate: renderFrame,
});
```

**Loading strategy**

1. Load the poster frame.
2. Load the first interaction range.
3. Begin interaction when enough frames are ready.
4. Continue loading remaining frames.
5. Avoid downloading excessively large frames on mobile.
6. Use AVIF or WebP when supported by the pipeline.
7. Cap canvas resolution.

**Mobile behavior**

Use fewer frames, shorter pinning or a static product gallery.

**Reduced motion**

Show representative key frames as static sections.

**Avoid**

- Loading hundreds of full-resolution images before showing the page.
- Tying essential information only to fleeting frames.
- Rendering at unrestricted device pixel ratios.

---

## Pattern 09 — Scroll-Based Reading Highlight

**Purpose**

Guide reading without moving the text itself.

**Effect**

Words or lines transition from muted to active color as the reader progresses.

**Implementation**

```ts
const words = gsap.utils.toArray<HTMLElement>("[data-word]");

gsap.fromTo(
  words,
  {
    color: "var(--text-muted)",
  },
  {
    color: "var(--text-primary)",
    stagger: 0.1,
    ease: "none",
    scrollTrigger: {
      trigger: root.current,
      start: "top 75%",
      end: "bottom 40%",
      scrub: true,
    },
  },
);
```

**Rules**

- Maintain sufficient contrast in both states.
- Do not make unread text nearly invisible.
- Use for short statements rather than long articles.
- Keep semantic text intact.

**Reduced motion**

Use the final readable color for all text.

---

## Pattern 10 — Flip Filterable Grid

**Purpose**

Animate cards naturally when filtering, sorting or changing layout.

**Workflow**

1. Record current state.
2. Change the DOM or CSS layout.
3. Animate from the previous state.
4. Handle entering and leaving items.

Flip performs the position and size calculations needed for major DOM-layout changes.

**Implementation**

```ts
function applyFilter(category: string): void {
  const cards = gsap.utils.toArray<HTMLElement>("[data-card]");
  const state = Flip.getState(cards);

  cards.forEach((card) => {
    const matches =
      category === "all" ||
      card.dataset.category === category;

    card.hidden = !matches;
  });

  Flip.from(state, {
    duration: 0.55,
    ease: "power2.inOut",
    absolute: true,
    stagger: 0.025,
    onEnter: (elements) =>
      gsap.fromTo(
        elements,
        { autoAlpha: 0, scale: 0.96 },
        { autoAlpha: 1, scale: 1 },
      ),
    onLeave: (elements) =>
      gsap.to(elements, {
        autoAlpha: 0,
        scale: 0.96,
      }),
  });
}
```

**Rules**

- Preserve logical keyboard order.
- Announce filtering results when appropriate.
- Keep controls usable during animation.
- Handle rapid filter changes.
- Avoid very long stagger values.

**Reduced motion**

Change the layout immediately or use a brief crossfade.

---

## Pattern 11 — Card-to-Detail Shared Element

**Purpose**

Preserve continuity when a project or product opens.

**Preferred methods**

1. Native View Transition API when suitable and stable.
2. GSAP Flip for same-document state changes.
3. Custom transition overlay for complex route transitions.
4. Immediate navigation fallback.

**Visual sequence**

1. Selected card is identified.
2. Non-selected content recedes subtly.
3. Image expands toward destination geometry.
4. Border radius reduces.
5. Destination content appears.
6. Focus moves to the destination heading.

**Rules**

- Keep transition duration moderate.
- Use the same image asset where possible.
- Do not delay navigation for decorative secondary effects.
- Handle direct destination URLs without requiring origin state.
- Handle browser back navigation.
- Disable geometry movement under reduced motion.

**Next.js warning**

Next.js-specific View Transition integration was still experimental as of July 14, 2026, so production use must be based on current official documentation rather than assumed stability.

---

## Pattern 12 — Route Transition Overlay

**Purpose**

Provide branded continuity when shared-element geometry is unavailable.

**Suitable transition**

- Short mask
- Curtain
- Color panel
- Brand shape
- Typography wipe

**Transition states**

```text
Idle
→ Covering current page
→ Navigation starts
→ Destination renders
→ Overlay reveals destination
→ Idle
```

**Rules**

- Never intercept modified or external links.
- Use a state lock to prevent overlapping transitions.
- Provide a timeout or failure fallback.
- Keep the overlay pointer-safe.
- Clear fixed styles after completion.
- Avoid replaying large intros on every route.
- Restore focus after navigation.

**Reduced motion**

Navigate immediately or apply a 100–150 ms opacity transition.

**Avoid**

- Delaying every navigation for more than roughly half a second.
- Full-screen loaders for already-prefetched pages.
- Covering the new page while data has already loaded.

---

## Pattern 13 — Velocity-Responsive Marquee

**Purpose**

Make an editorial marquee respond to user scroll direction and speed.

**Behavior**

- Default slow movement.
- Accelerate briefly during fast scrolling.
- Reverse according to direction when appropriate.
- Return smoothly to base speed.

**Implementation concept**

```ts
const loop = createHorizontalLoop(items, {
  repeat: -1,
  speed: 0.45,
});

let velocityTween: gsap.core.Tween | null = null;

ScrollTrigger.create({
  trigger: root.current,
  start: "top bottom",
  end: "bottom top",
  onUpdate: (self) => {
    const velocity = self.getVelocity();
    const targetScale = gsap.utils.clamp(
      -3,
      3,
      velocity / 800,
    );

    velocityTween?.kill();

    loop.timeScale(targetScale || 0.45);

    velocityTween = gsap.to(loop, {
      timeScale: targetScale < 0 ? -0.45 : 0.45,
      duration: 0.6,
      ease: "power2.out",
    });
  },
});
```

**Rules**

- Use seamless duplicated content.
- Mark decorative duplicates appropriately.
- Pause offscreen.
- Avoid rapid oscillation.
- Do not use continuous moving text beside long reading content.

**Reduced motion**

Display a static row.

---

## Pattern 14 — Navigation Hide/Reveal

**Purpose**

Increase available space while keeping navigation easy to recover.

**Behavior**

- Hide after meaningful downward scrolling.
- Reveal immediately when direction changes upward.
- Always reveal near the top.
- Keep keyboard focus behavior stable.

**Implementation**

```ts
let lastScroll = window.scrollY;

const trigger = ScrollTrigger.create({
  start: 0,
  end: "max",
  onUpdate: () => {
    const current = window.scrollY;
    const delta = current - lastScroll;

    if (current < 40) {
      gsap.to(header, { yPercent: 0, duration: 0.25 });
    } else if (delta > 8) {
      gsap.to(header, { yPercent: -100, duration: 0.25 });
    } else if (delta < -8) {
      gsap.to(header, { yPercent: 0, duration: 0.25 });
    }

    lastScroll = current;
  },
});
```

**Rules**

- Use a movement threshold.
- Do not hide while a menu is open.
- Do not hide while keyboard focus is inside the header.
- Avoid constantly toggling from tiny trackpad movements.

**Reduced motion**

Show or hide immediately without sliding.

---

## Pattern 15 — Magnetic Button

**Purpose**

Add responsive physical character to an important desktop action.

**Conditions**

Enable only when:

- `pointer: fine`
- Hover is supported.
- Reduced motion is not requested.
- The button remains easy to target.

**Implementation**

```ts
function handlePointerMove(
  event: React.PointerEvent<HTMLButtonElement>,
): void {
  const button = event.currentTarget;
  const rect = button.getBoundingClientRect();

  const x = event.clientX - (rect.left + rect.width / 2);
  const y = event.clientY - (rect.top + rect.height / 2);

  gsap.to(button, {
    x: x * 0.16,
    y: y * 0.16,
    duration: 0.28,
    ease: "power2.out",
    overwrite: "auto",
  });
}

function handlePointerLeave(
  event: React.PointerEvent<HTMLButtonElement>,
): void {
  gsap.to(event.currentTarget, {
    x: 0,
    y: 0,
    duration: 0.5,
    ease: "elastic.out(1, 0.45)",
    overwrite: "auto",
  });
}
```

**Rules**

- Keep displacement small.
- Move inner decoration more than the hit target where possible.
- Preserve focus styles.
- Do not enable on touch.
- Do not apply to every link.

**Reduced motion**

Normal stationary button.

---

## Pattern 16 — Contextual Cursor

**Purpose**

Communicate actions such as View, Drag, Play or Open.

**Structure**

```text
Native pointer
├── Decorative cursor follower
└── Context label
```

**Rules**

- Do not remove native pointer precision.
- Use `pointer-events: none`.
- Update through transform.
- Use `quickTo()` or setters for high-frequency movement.
- Disable on coarse pointers.
- Disable in reduced-motion mode.
- Hide when the pointer leaves the window.
- Never make cursor text the only instruction.

**Avoid**

- Large delayed followers.
- Cursor trails over form fields.
- Replacing text selection behavior.
- Making controls harder to locate.

---

## Pattern 17 — Draggable Gallery

**Purpose**

Create direct, physical exploration of visual content.

Draggable supports mouse and touch dragging, bounds and optional inertia-driven movement.

**Implementation**

```ts
const [instance] = Draggable.create(track, {
  type: "x",
  bounds: viewport,
  inertia: true,
  edgeResistance: 0.85,
  dragResistance: 0.08,
  cursor: "grab",
  activeCursor: "grabbing",
  onDrag: updateProgress,
  onThrowUpdate: updateProgress,
});

return () => {
  instance.kill();
};
```

**Required alternatives**

- Previous button
- Next button
- Keyboard navigation
- Visible progress
- Native overflow fallback

**Rules**

- Distinguish horizontal intent from vertical page scrolling.
- Use sensible drag thresholds.
- Do not disable page scrolling unnecessarily.
- Keep item labels accessible.
- Snap only when it improves control.

**Reduced motion**

Disable inertia or use buttons/native overflow.

---

## Pattern 18 — SVG Draw and Path Motion

**Purpose**

Animate brand graphics, diagrams, annotations and guided object movement.

MotionPath can animate elements along SVG paths or coordinate arrays and can align and rotate objects to the path.

**Draw sequence**

```ts
gsap.fromTo(
  "[data-draw-path]",
  {
    drawSVG: "0%",
  },
  {
    drawSVG: "100%",
    duration: 1.2,
    ease: "power2.inOut",
    stagger: 0.08,
  },
);
```

**Path movement**

```ts
gsap.to("[data-path-object]", {
  motionPath: {
    path: "#motion-path",
    align: "#motion-path",
    alignOrigin: [0.5, 0.5],
    autoRotate: true,
  },
  duration: 2,
  ease: "power1.inOut",
});
```

**Rules**

- Optimize SVG markup.
- Use descriptive labels when the SVG communicates information.
- Avoid excessive simultaneous path animation.
- Test responsive SVG scaling.
- Preserve static final artwork under reduced motion.

---

## Pattern 19 — SVG Morphing

**Purpose**

Create meaningful transitions between related icons, states or brand shapes.

**Suitable examples**

- Menu icon to close icon
- Seed to flower
- Drop to wave
- Product icon transformations
- Logo assembly

**Implementation**

```ts
gsap.to("#source-shape", {
  morphSVG: "#target-shape",
  duration: 0.7,
  ease: "power2.inOut",
});
```

**Rules**

- Morph between conceptually related forms.
- Keep the result recognizable.
- Use morphing as state feedback, not random decoration.
- Test visual artifacts at multiple sizes.
- Ensure controls have accessible labels independent of the icon.

**Reduced motion**

Switch shapes immediately or crossfade.

---

## Pattern 20 — Ambient Background Motion

**Purpose**

Give minimal layouts a subtle sense of life.

**Suitable effects**

- Slow gradient drift
- Gentle shape movement
- Slow 3D rotation
- Grain movement
- Small illustration loops
- Low-amplitude floating objects

**Rules**

- Use low contrast and low amplitude.
- Keep loops long.
- Pause when offscreen.
- Pause when the document is hidden.
- Avoid motion directly behind paragraphs.
- Avoid multiple independent loop frequencies.

**Reduced motion**

Stop at a carefully composed static frame.

---

## Pattern 21 — Three.js Product Viewer

**Purpose**

Allow users to explore a product spatially.

**Architecture**

```text
Server-rendered section
├── Semantic heading and description
├── Product options and controls
├── Poster image fallback
└── Dynamically imported client-only 3D canvas
```

**Requirements**

- Dynamically import the scene.
- Provide loading and failure states.
- Keep product information in HTML.
- Cap pixel ratio.
- Compress models and textures.
- Pause rendering when offscreen.
- Use demand-based rendering when the scene is static.
- Provide keyboard-accessible controls.
- Provide static media for reduced motion or unsupported devices.

**Avoid**

- Placing navigation inside the canvas.
- Rendering large scenes before the hero's core content.
- Keeping continuous rendering active with no visual changes.
- Using uncompressed models.
- Making product details available only through rotation.

---

## Pattern 22 — Branded Loading Experience

**Purpose**

Communicate real loading progress without unnecessarily blocking users.

**Use only when**

- A required scene or asset prevents meaningful interaction.
- Progress can be estimated.
- A skeleton or progressive reveal is insufficient.

**Rules**

- Show actual progress where possible.
- Reveal usable content as soon as it is ready.
- Do not replay the full loader on normal route changes.
- Provide a failure or retry state.
- Avoid indefinite loops.
- Avoid loader-first architecture for ordinary content pages.

WCAG guidance recognizes loading animation as potentially essential when interaction genuinely cannot begin and no progress feedback would make the experience appear frozen.

**Reduced motion**

Use a static progress indicator.

---

## Pattern 23 — Interactive Rive or Vector State Machine

**Purpose**

Provide stateful illustration feedback without orchestrating every vector path in React.

**Suitable uses**

- Interactive mascots
- Onboarding
- Form feedback
- Product demonstrations
- Empty states
- Gamified controls

**Rules**

- Connect states to meaningful application events.
- Keep a static fallback.
- Avoid running hidden animations.
- Avoid using decorative vector interactions as essential instructions.
- Respect reduced motion.
- Expose state changes through normal text or ARIA when needed.

---

## Pattern 24 — Responsive Section Reveal System

**Purpose**

Provide a consistent baseline entrance pattern across ordinary sections.

**Default behavior**

- Trigger once.
- Animate by 16–32 pixels.
- Use opacity and transform.
- Complete in approximately 400–650 ms.
- Stagger only closely related items.
- Avoid applying the same sequence to every element.

**Reusable API**

```tsx
<SectionReveal
  selector="[data-reveal]"
  start="top 82%"
  distance={24}
  stagger={0.06}
  once
>
  {children}
</SectionReveal>
```

**Agent rule**

This is a foundation pattern, not a signature effect. Use it quietly.

---

## Pattern Selection Matrix

| Requirement | Preferred solution |
| --- | --- |
| Simple hover | CSS transition |
| Button or toggle state | CSS or short GSAP tween |
| Multi-element entrance | GSAP timeline |
| Basic scroll progress | CSS Scroll-driven Animation |
| Pinned scroll story | ScrollTrigger |
| Layout reordering | Flip |
| Card-to-detail continuity | Flip or View Transition |
| Complex route transition | GSAP transition shell |
| Responsive text reveal | SplitText |
| Scroll velocity response | ScrollTrigger or Observer |
| Pointer and touch gesture | Observer |
| Direct dragging | Draggable |
| Momentum | Inertia |
| SVG line drawing | DrawSVG |
| SVG transformation | MorphSVG |
| Object following path | MotionPath |
| Smooth native-based scroll | ScrollSmoother |
| Stateful vector illustration | Rive |
| Predetermined vector playback | Lottie |
| 3D and shaders | Three.js / WebGL / WebGPU |
| Product frame sequence | Canvas plus ScrollTrigger |

---

## Motion Specification Template

Use this template before implementing any major pattern.

- **Pattern name:**
- **Section:**
- **Purpose:**
- **User trigger:**
- **Initial state:**
- **Final state:**
- **Duration:**
- **Easing:**
- **Stagger:**
- **Scroll relationship:**
- **Interruption behavior:**
- **Desktop behavior:**
- **Tablet behavior:**
- **Mobile behavior:**
- **Reduced-motion behavior:**
- **Keyboard behavior:**
- **Loading dependency:**
- **Performance risk:**
- **Fallback:**
- **Cleanup method:**
- **Acceptance criteria:**

---

## Quality Checklist

**Visual**

- Motion direction supports layout.
- Timing is consistent.
- Easing matches the interaction.
- Stagger does not delay reading.
- Effects do not compete.
- There is a clear signature moment.

**Functional**

- Links remain clickable.
- Buttons remain focusable.
- Browser back and forward work.
- Anchors work.
- Deep links work.
- Rapid clicks do not break transitions.
- Navigation cannot remain covered by an overlay.

**Responsive**

- Mobile has intentional animation choices.
- Touch gestures do not block normal scroll.
- Orientation changes are handled.
- Pinned sections do not overflow.
- Typography re-splitting is correct.

**Accessibility**

- Reduced motion is complete.
- Keyboard order is logical.
- Focus remains visible.
- Moving content can be stopped where necessary.
- Canvas content has an HTML alternative.
- Dragging has controls.
- Contrast remains sufficient during animation.

**Performance**

- No unnecessary page-wide Client Component.
- Heavy assets are dynamically loaded.
- Offscreen loops stop.
- Layout shifts are avoided.
- Scroll calculations are controlled.
- Repeated navigation does not increase trigger count.
- Large effects are tested on real mobile hardware.

**Cleanup**

- Timelines revert.
- ScrollTriggers are removed.
- Observers are killed.
- Draggable instances are killed.
- Event listeners are removed.
- Animation frames are cancelled.
- Three.js resources are disposed.
- Fixed overlays return to their initial state.

---

## Final Pattern-Library Rule

A project should generally contain:

- A small functional motion system.
- A consistent section-reveal language.
- One or two storytelling patterns.
- One navigational-continuity pattern.
- One distinctive signature pattern.
- Complete mobile and reduced-motion alternatives.

Do not implement the entire catalog in one website. Select the smallest combination capable of producing a coherent and memorable experience.

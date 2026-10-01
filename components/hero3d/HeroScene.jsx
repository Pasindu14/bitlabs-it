'use client'
// Live, procedural Three.js hero: a minka at dusk, built in code (see ./minka.js).
// Scroll → dusk deepens + camera dollies. Pointer → parallax + a gust through the petals.
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { buildMinka } from './minka'
import { createSky, createMountains, createGround, createSakura, createPetals, createBlossomAssets } from './world'
import { applyRevealTo, disposeTree, clamp, lerp, smoothstep } from './utils'

const easeInOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2)

function detectQuality() {
  const coarse = window.matchMedia('(pointer: coarse)').matches
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const cores = navigator.hardwareConcurrency || 4
  const mem = navigator.deviceMemory || 8
  const low = (coarse && (cores <= 6 || window.innerWidth < 760)) || mem <= 2
  return { low, reduced }
}

function init(host, hero, compose = 'right') {
  const { low, reduced } = detectQuality()

  // The canvas is created here (not in JSX) so a StrictMode remount gets a fresh GL context.
  const canvas = document.createElement('canvas')
  canvas.className = 'hero-canvas'
  canvas.setAttribute('aria-hidden', 'true')
  host.appendChild(canvas)

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !low,
    powerPreference: 'high-performance',
  })
  const maxAniso = Math.min(4, renderer.capabilities.getMaxAnisotropy())
  let pixelRatioCap = low ? 1 : 1.5 // full Retina blows the frame budget
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, pixelRatioCap))
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.05
  renderer.shadowMap.enabled = !low

  const scene = new THREE.Scene()
  const sky = createSky()
  scene.add(sky.mesh)
  scene.fog = new THREE.Fog(sky.fogColor(0), 34, 175)

  // Image-based light from the sky itself — gives tiles & lacquer something to reflect.
  {
    const pm = new THREE.PMREMGenerator(renderer)
    const envScene = new THREE.Scene()
    const envSky = createSky()
    envSky.set(0.15, 0.16, 0)
    envScene.add(envSky.mesh)
    const rt = pm.fromScene(envScene, 0, 1, 1000)
    scene.environment = rt.texture
    scene.environmentIntensity = 0.55
    disposeTree(envScene)
    pm.dispose()
  }

  // ── Lights: one sun (the only shadow caster), a soft sky fill, and the glowing lanterns
  const sun = new THREE.DirectionalLight(0xff9b5a, 3.4)
  sun.castShadow = !low
  sun.shadow.mapSize.set(2048, 2048)
  Object.assign(sun.shadow.camera, { left: -17, right: 17, top: 15, bottom: -15, near: 1, far: 150 })
  sun.shadow.bias = -0.0005
  sun.shadow.normalBias = 0.05
  sun.shadow.radius = 3
  sun.target.position.set(0, 1, 3)
  scene.add(sun, sun.target)
  const hemi = new THREE.HemisphereLight(0x8a86d8, 0x3b2a33, 0.9)
  scene.add(hemi)
  const fill = new THREE.DirectionalLight(0x93a4ea, 0.85)
  fill.position.set(-12, 7, 22)
  scene.add(fill)

  // ── The world ───────────────────────────────────────────────────────────
  const minka = buildMinka({ maxAniso })
  if (low) {
    // fewer dynamic lights on weak GPUs
    minka.lights.slice(-2).forEach(({ light }) => (light.visible = false))
  }
  const ground = createGround(maxAniso)
  const mountains = createMountains()
  const { barkMat, blossomGeo, blossomMat } = createBlossomAssets(maxAniso)
  const trees = new THREE.Group()
  const treeCount = low ? 50 : 72
  ;[
    [101, 8.4, -0.6, 1.45, 0.4],
    [202, -19, -16, 1.8, -0.2],
    [303, 14, 5, 1.0, 0.9],
  ].forEach(([seed, x, z, s, ry]) => {
    const t = createSakura(seed, barkMat, blossomMat, blossomGeo, treeCount)
    t.position.set(x, 0, z)
    t.scale.setScalar(s)
    t.rotation.y = ry
    trees.add(t)
  })
  const petals = createPetals(low ? 60 : 150)

  const world = new THREE.Group()
  world.add(ground.group, minka.group, trees)
  scene.add(world, mountains.group, petals.mesh)

  // Hologram "survey" intro
  const shared = { uReveal: { value: -1 }, uSurveyX: { value: 100 } }
  applyRevealTo(world, shared)
  const holo = new THREE.Mesh(
    new THREE.PlaneGeometry(60, 40),
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      fog: false,
      uniforms: { uOpacity: { value: 0 } },
      vertexShader: `varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position,1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
      fragmentShader: `
        varying vec3 vW; uniform float uOpacity;
        void main(){
          vec2 g = abs(fract(vW.xz * 0.5) - 0.5);
          float line = 1.0 - smoothstep(0.0, 0.035, min(g.x, g.y));
          float fade = smoothstep(20.0, 3.0, length(vW.xz - vec2(0.0, 2.0)));
          gl_FragColor = vec4(vec3(1.0, 0.38, 0.08), (line * 0.85 + 0.07) * fade * uOpacity);
        }`,
    })
  )
  holo.rotation.x = -Math.PI / 2
  holo.position.set(0, -1, 2)
  holo.renderOrder = 5
  scene.add(holo)

  // ── Camera & responsive composition ─────────────────────────────────────
  const camera = new THREE.PerspectiveCamera(30, 1, 0.5, 700)
  const target = new THREE.Vector3(0, 2.7, 0.5)
  const view = { dist: 24, portrait: false }

  function layout() {
    const w = Math.max(1, hero.clientWidth)
    const h = Math.max(1, hero.clientHeight)
    renderer.setSize(w, h, false)
    view.portrait = w < 820
    camera.fov = view.portrait ? 40 : 30
    camera.aspect = w / h
    const span = view.portrait ? 11.5 : 12.5 // world width we want to fit
    const frac = view.portrait ? 1.05 : compose === 'center' ? 0.66 : 0.6 // share of the viewport width it should occupy
    view.dist = clamp(span / (frac * 2 * Math.tan((camera.fov * Math.PI) / 360) * camera.aspect), 16, 80)
    // Push the house to the right (text lives on the left) or down (text lives on top).
    // 'right': house sits right of the copy. 'center': house sits behind a centred/wide layout.
    const centered = compose === 'center'
    const sx = view.portrait || centered ? 0 : 0.17
    const sy = view.portrait ? 0.2 : centered ? 0.1 : 0.09
    camera.setViewOffset(w, h, -w * sx, -h * sy, w, h)
    camera.updateProjectionMatrix()
  }
  layout()

  // ── Input ───────────────────────────────────────────────────────────────
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 }
  let gust = 0
  let lastPX = null
  const onMove = (e) => {
    const r = hero.getBoundingClientRect()
    pointer.tx = clamp(((e.clientX - r.left) / r.width) * 2 - 1, -1, 1)
    pointer.ty = clamp(((e.clientY - r.top) / r.height) * 2 - 1, -1, 1)
    if (lastPX != null) gust = clamp(gust + (e.clientX - lastPX) * 0.012, -2.5, 2.5)
    lastPX = e.clientX
  }
  window.addEventListener('pointermove', onMove, { passive: true })

  // ── Frame ───────────────────────────────────────────────────────────────
  let t = 0
  let scrollP = 0
  let scrollTarget = 0
  let raf = 0
  let running = false
  let last = 0
  let slowFrames = 0
  let sampled = 0
  let introDone = false
  const introStart = reduced ? -10 : 0

  function updateScrollTarget() {
    const r = hero.getBoundingClientRect()
    scrollTarget = clamp(-r.top / Math.max(1, r.height * 0.9))
  }

  function step(dt, final = false) {
    t += dt
    updateScrollTarget()
    scrollP = final ? scrollTarget : lerp(scrollP, scrollTarget, 1 - Math.exp(-dt * 5))
    pointer.x = lerp(pointer.x, pointer.tx, 1 - Math.exp(-dt * 3))
    pointer.y = lerp(pointer.y, pointer.ty, 1 - Math.exp(-dt * 3))

    // Intro: scan plane rises building the house, then a survey band sweeps across.
    const it = t - introStart
    if (!introDone) {
      const b = clamp((it - 0.55) / 3.4)
      shared.uReveal.value = lerp(-0.4, 9.5, easeInOut(b))
      holo.position.y = shared.uReveal.value
      holo.material.uniforms.uOpacity.value = smoothstep(0, 0.1, b) * (1 - smoothstep(0.88, 1, b))
      const s = clamp((it - 3.3) / 2.1)
      shared.uSurveyX.value = s > 0 && s < 1 ? lerp(-7, 7, easeInOut(s)) : 100
      if (b >= 1 && it > 5.5) {
        introDone = true
        shared.uReveal.value = 100
        shared.uSurveyX.value = 100
        holo.visible = false
      }
    }

    // Dusk deepens as the hero scrolls away.
    const dusk = smoothstep(0.0, 0.95, scrollP)
    const elev = lerp(0.17, 0.05, dusk)
    sky.set(dusk, elev, t)
    mountains.set(dusk)
    scene.fog.color.copy(sky.fogColor(dusk))
    const sd = sky.uniforms.uSunDir.value
    sun.position.copy(sd).multiplyScalar(80).add(sun.target.position)
    sun.intensity = lerp(3.4, 1.4, dusk)
    sun.color.setHex(0xff9b5a).lerp(new THREE.Color(0xff5a2a), dusk)
    hemi.intensity = lerp(0.9, 0.5, dusk)
    fill.intensity = lerp(0.85, 0.45, dusk)
    renderer.toneMappingExposure = lerp(1.05, 1.15, dusk)
    scene.environmentIntensity = lerp(0.55, 0.3, dusk)

    // Wind: gentle ambient + pointer gusts.
    gust *= Math.exp(-dt * 1.3)
    const wind = Math.sin(t * 0.35) * 0.35 + 0.3 + gust
    petals.state.wind = wind
    minka.update(t, wind * 0.6, 1 + dusk * 0.7)
    if (!reduced) petals.update(t, dt)
    trees.children.forEach((tr, i) => {
      tr.rotation.z = Math.sin(t * 0.5 + i * 2) * 0.006 * (1 + Math.abs(wind))
    })

    // Camera: slow dolly-in + orbit with scroll, parallax with the pointer.
    const d = view.dist * (1 - 0.2 * scrollP)
    const az = 0.3 + 0.1 * scrollP + pointer.x * 0.07
    const ty = target.y + 0.9 * scrollP
    camera.position.set(
      target.x + Math.sin(az) * d,
      ty + d * (0.062 + 0.02 * scrollP) - pointer.y * 0.5,
      target.z + Math.cos(az) * d
    )
    camera.lookAt(target.x, ty, target.z)
    renderer.render(scene, camera)
  }

  function frame(now) {
    if (!running) return
    raf = requestAnimationFrame(frame)
    const dt = Math.min(0.05, (now - last) / 1000)
    last = now
    step(dt)

    // Adaptive quality: if the first seconds after the intro run slow, step down once.
    if (introDone && sampled < 120) {
      sampled++
      if (dt > 0.032) slowFrames++
      if (sampled === 120 && slowFrames > 50 && pixelRatioCap > 1) {
        pixelRatioCap = 1
        renderer.setPixelRatio(1)
        layout()
        sun.castShadow = false
      }
    }
  }
  const start = () => {
    if (running || reduced) return
    running = true
    last = performance.now()
    raf = requestAnimationFrame(frame)
  }
  const stop = () => {
    running = false
    cancelAnimationFrame(raf)
  }

  // Pause when off-screen or the tab is hidden (battery, heat).
  let inView = true
  const io = new IntersectionObserver(
    ([entry]) => {
      inView = entry.isIntersecting
      inView && !document.hidden ? start() : stop()
    },
    { threshold: 0 }
  )
  io.observe(hero)
  const onVis = () => (document.hidden || !inView ? stop() : start())
  document.addEventListener('visibilitychange', onVis)

  const ro = new ResizeObserver(() => {
    layout()
    if (reduced || !running) step(0, true)
  })
  ro.observe(hero)

  if (reduced) {
    // Static frame: fully built, no motion.
    introDone = true
    shared.uReveal.value = 100
    shared.uSurveyX.value = 100
    holo.visible = false
    petals.update(0, 0.5)
    step(0, true)
  } else {
    start()
  }
  requestAnimationFrame(() => canvas.classList.add('ready'))

  return () => {
    stop()
    io.disconnect()
    ro.disconnect()
    document.removeEventListener('visibilitychange', onVis)
    window.removeEventListener('pointermove', onMove)
    disposeTree(scene)
    scene.environment?.dispose()
    renderer.dispose()
    renderer.forceContextLoss()
    canvas.remove()
  }
}

export default function HeroScene({ heroRef, compose = 'right' }) {
  const hostRef = useRef(null)

  useEffect(() => {
    const host = hostRef.current
    const hero = heroRef.current
    if (!host || !hero) return
    let dispose = () => {}
    try {
      dispose = init(host, hero, compose)
    } catch (err) {
      // No WebGL (or it failed) — the CSS dusk gradient behind stays as the hero.
      console.warn('[hero3d] WebGL scene unavailable:', err)
    }
    return () => dispose()
  }, [heroRef, compose])

  return <div className="hero-scene" ref={hostRef} aria-hidden="true" />
}

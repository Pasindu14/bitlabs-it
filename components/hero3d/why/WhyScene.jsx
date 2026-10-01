'use client'
// "Why Bitlabs" — a chrome gimbal (nested gyroscope rings) around a glowing core.
// Deliberately a different visual language from the cube scenes: smooth, machined, reflective.
//   ring 1  clean code        thin precise chrome ring, bolts at the quadrants
//   ring 2  performance       heavy ring with orange speed-streak arcs, spins up
//   ring 3  on-time delivery  clock ring: ticks + a sweeping hand
//   ring 4  ongoing support   satellites orbiting the core
// The ring for the active value lights up; the others dim down.
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { clamp, lerp, disposeTree } from '../utils'
import { glowTexture } from '../textures'

function buildEnv(renderer) {
  // a tiny studio: dark room + a few HDR softboxes, baked once into a PMREM for reflections
  const env = new THREE.Scene()
  const room = new THREE.Mesh(
    new THREE.SphereGeometry(30, 24, 16),
    new THREE.MeshBasicMaterial({ color: 0x0a0a0e, side: THREE.BackSide })
  )
  env.add(room)
  const box = (w, h, color, k, pos) => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(k), side: THREE.DoubleSide, toneMapped: false })
    )
    m.position.set(...pos)
    m.lookAt(0, 0, 0)
    env.add(m)
  }
  box(14, 9, 0xffffff, 7, [-14, 12, 10])
  box(5, 16, 0xff6a2a, 6, [16, 2, 6])
  box(18, 2.4, 0xcfd8ff, 4, [0, -12, 8])
  box(10, 10, 0x6a7cff, 2.2, [0, 6, -18])
  box(3, 12, 0xffffff, 5, [10, 8, 14])
  const pm = new THREE.PMREMGenerator(renderer)
  const rt = pm.fromScene(env, 0.02)
  pm.dispose()
  disposeTree(env)
  return rt.texture
}

function init(host, card, activeRef) {
  const coarse = window.matchMedia('(pointer: coarse)').matches
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const canvas = document.createElement('canvas')
  canvas.className = 'why-canvas'
  canvas.setAttribute('aria-hidden', 'true')
  host.appendChild(canvas)

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 2))
  renderer.setClearColor(0x000000, 0)
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.05

  const scene = new THREE.Scene()
  scene.environment = buildEnv(renderer)
  scene.environmentIntensity = 1
  const camera = new THREE.PerspectiveCamera(32, 1, 0.5, 100)

  // ── Materials ───────────────────────────────────────────────────────────
  const chrome = () => new THREE.MeshStandardMaterial({ color: 0xe9e9f0, metalness: 1, roughness: 0.16 })
  const dark = () => new THREE.MeshStandardMaterial({ color: 0x34343e, metalness: 0.95, roughness: 0.3 })
  const glow = () => new THREE.MeshStandardMaterial({ color: 0x1a0800, emissive: 0xff4d00, emissiveIntensity: 1.2, roughness: 0.4 })

  const rig = new THREE.Group()
  scene.add(rig)

  // ── Core ────────────────────────────────────────────────────────────────
  const coreMat = new THREE.MeshStandardMaterial({ color: 0x220a00, emissive: 0xff5a14, emissiveIntensity: 2.4, roughness: 0.35 })
  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.46, 4), coreMat)
  rig.add(core)
  const halo = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: glowTexture(), color: 0xff4d00, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.9 })
  )
  halo.scale.setScalar(3.4)
  rig.add(halo)
  const coreLight = new THREE.PointLight(0xff6a2a, 40, 9, 2)
  rig.add(coreLight)

  // ── Rings (nested gimbal: each lives inside the previous one) ───────────
  const rings = [] // { group, mats: [{m, base, hot, emBase, emHot}], speed, axis }
  const mk = (parent, axis, speed) => {
    const group = new THREE.Group()
    parent.add(group)
    const r = { group, mats: [], speed, axis, act: 0, spinBoost: 1 }
    rings.push(r)
    return r
  }
  const reg = (r, m, base, hot, emBase, emHot) => {
    r.mats.push({ m, base: new THREE.Color(base), hot: new THREE.Color(hot), emBase, emHot })
    return m
  }
  const add = (r, geo, mat) => {
    const mesh = new THREE.Mesh(geo, mat)
    r.group.add(mesh)
    return mesh
  }

  // 1 · clean code — thin, perfect, with four bolts
  const r1 = mk(rig, 'x', 0.11)
  const m1 = reg(r1, chrome(), 0xcfcfd8, 0xffffff, 0, 0.35)
  m1.emissive = new THREE.Color(0xff4d00)
  add(r1, new THREE.TorusGeometry(2.6, 0.05, 28, 200), m1)
  for (let i = 0; i < 4; i++) {
    const bolt = add(r1, new THREE.SphereGeometry(0.12, 24, 16), reg(r1, dark(), 0x2b2b33, 0x6a6a78, 0, 0))
    const a = (i / 4) * Math.PI * 2
    bolt.position.set(Math.cos(a) * 2.6, Math.sin(a) * 2.6, 0)
  }

  // 2 · performance — heavy ring with glowing speed arcs
  const r2 = mk(r1.group, 'y', 0.34)
  r2.group.rotation.x = 0.5
  const m2 = reg(r2, dark(), 0x30303a, 0x55555f, 0, 0)
  add(r2, new THREE.TorusGeometry(2.15, 0.1, 24, 160), m2)
  for (let i = 0; i < 6; i++) {
    const arc = add(r2, new THREE.TorusGeometry(2.15, 0.125, 14, 26, 0.34), reg(r2, glow(), 0x1a0800, 0x2a0e00, 0.5, 2.6))
    arc.rotation.z = (i / 6) * Math.PI * 2
  }

  // 3 · on-time delivery — a clock ring
  const r3 = mk(r2.group, 'z', 0.2)
  r3.group.rotation.y = 0.7
  const m3 = reg(r3, chrome(), 0xb9b9c4, 0xffffff, 0, 0.3)
  m3.emissive = new THREE.Color(0xff4d00)
  add(r3, new THREE.TorusGeometry(1.7, 0.035, 24, 160), m3)
  const tickGeo = new THREE.BoxGeometry(0.022, 0.13, 0.05)
  const tickMajor = new THREE.BoxGeometry(0.04, 0.22, 0.07)
  const tickMat = reg(r3, chrome(), 0x9a9aa6, 0xffffff, 0, 0.2)
  tickMat.emissive = new THREE.Color(0xff4d00)
  for (let i = 0; i < 60; i++) {
    const t = new THREE.Mesh(i % 5 === 0 ? tickMajor : tickGeo, tickMat)
    const a = (i / 60) * Math.PI * 2
    const rad = i % 5 === 0 ? 1.56 : 1.58
    t.position.set(Math.sin(a) * rad, Math.cos(a) * rad, 0)
    t.rotation.z = -a
    r3.group.add(t)
  }
  const hand = new THREE.Group()
  const handBar = new THREE.Mesh(new THREE.BoxGeometry(0.035, 1.5, 0.04), reg(r3, glow(), 0x1a0800, 0x2a0e00, 0.7, 2.6))
  handBar.position.y = 0.75
  const hub = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 12), reg(r3, glow(), 0x1a0800, 0x2a0e00, 0.9, 2.6))
  hand.add(handBar, hub)
  r3.group.add(hand)

  // 4 · ongoing support — satellites in orbit
  const r4 = mk(r3.group, 'y', 0.3)
  r4.group.rotation.x = -0.6
  const orbitMat = reg(r4, new THREE.MeshStandardMaterial({ color: 0x40200f, metalness: 0.6, roughness: 0.5 }), 0x40200f, 0xff7a3d, 0.2, 1.2)
  orbitMat.emissive = new THREE.Color(0xff4d00)
  add(r4, new THREE.TorusGeometry(1.2, 0.012, 10, 140), orbitMat)
  const sats = []
  for (let i = 0; i < 3; i++) {
    const s = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 20, 14),
      reg(r4, new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xff5a14, emissiveIntensity: 0.9, metalness: 0.3, roughness: 0.25 }), 0xdddddd, 0xffffff, 0.9, 3)
    )
    r4.group.add(s)
    sats.push({ mesh: s, phase: (i / 3) * Math.PI * 2 })
  }

  // ── Layout ──────────────────────────────────────────────────────────────
  const view = { dist: 15 }
  function layout() {
    const w = Math.max(1, card.clientWidth)
    const h = Math.max(1, card.clientHeight)
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    const need = 5.9 / (0.62 * 2 * Math.tan((camera.fov * Math.PI) / 360) * Math.min(1, camera.aspect))
    view.dist = clamp(need, 9, 40)
    camera.updateProjectionMatrix()
  }
  layout()

  const ptr = { x: 0, y: 0, tx: 0, ty: 0 }
  const onMove = (e) => {
    const r = card.getBoundingClientRect()
    ptr.tx = clamp(((e.clientX - r.left) / r.width) * 2 - 1, -1.2, 1.2)
    ptr.ty = clamp(((e.clientY - r.top) / r.height) * 2 - 1, -1.2, 1.2)
  }
  window.addEventListener('pointermove', onMove, { passive: true })

  // ── Frame ───────────────────────────────────────────────────────────────
  let t = 0
  let raf = 0
  let running = false
  let last = 0
  const angle = rings.map(() => 0)
  let handAngle = 0
  let satAngle = 0
  const tmp = new THREE.Color()

  function step(dt) {
    t += reduced ? 0 : dt
    const active = activeRef.current ?? 0
    ptr.x = lerp(ptr.x, ptr.tx, 1 - Math.exp(-dt * 3))
    ptr.y = lerp(ptr.y, ptr.ty, 1 - Math.exp(-dt * 3))

    rings.forEach((r, i) => {
      r.act = lerp(r.act, i === active ? 1 : 0, 1 - Math.exp(-dt * 4))
      // each ring has its own "active" behaviour
      const boost = i === 0 ? 1 - r.act * 0.75 : i === 1 ? 1 + r.act * 3.2 : i === 2 ? 1 + r.act * 0.8 : 1 + r.act * 0.8
      if (!reduced) angle[i] += dt * r.speed * boost
      r.group.rotation[r.axis] = angle[i] + (r.axis === 'x' ? 0.3 : 0)
      r.mats.forEach(({ m, base, hot, emBase, emHot }) => {
        tmp.copy(base).lerp(hot, r.act)
        m.color.copy(tmp)
        if (m.emissiveIntensity !== undefined) m.emissiveIntensity = lerp(emBase, emHot, r.act)
      })
    })
    handAngle += reduced ? 0 : dt * (0.9 + rings[2].act * 4.2)
    hand.rotation.z = -handAngle
    satAngle += reduced ? 0 : dt * (0.8 + rings[3].act * 2.4)
    sats.forEach((s) => {
      const a = satAngle + s.phase
      s.mesh.position.set(Math.cos(a) * 1.2, Math.sin(a) * 1.2, 0)
    })

    // core breathes; glow follows activity
    const breathe = 1 + Math.sin(t * 2.2) * 0.06
    core.scale.setScalar(breathe)
    halo.scale.setScalar(3.2 + Math.sin(t * 1.6) * 0.15)
    coreLight.intensity = 34 + Math.sin(t * 2.2) * 6

    rig.rotation.y = ptr.x * 0.4 + Math.sin(t * 0.25) * 0.1
    rig.rotation.x = ptr.y * 0.3 - 0.1
    camera.position.set(0, 0, view.dist)
    camera.lookAt(0, 0, 0)
    renderer.render(scene, camera)
  }

  function frame(now) {
    if (!running) return
    raf = requestAnimationFrame(frame)
    const dt = Math.min(0.05, (now - last) / 1000)
    last = now
    step(dt)
  }
  const start = () => {
    if (running) return
    running = true
    last = performance.now()
    raf = requestAnimationFrame(frame)
  }
  const stop = () => {
    running = false
    cancelAnimationFrame(raf)
  }
  let inView = false
  const io = new IntersectionObserver(
    ([e]) => {
      inView = e.isIntersecting
      inView && !document.hidden ? start() : stop()
    },
    { threshold: 0 }
  )
  io.observe(card)
  const onVis = () => (document.hidden || !inView ? stop() : start())
  document.addEventListener('visibilitychange', onVis)
  const ro = new ResizeObserver(() => {
    layout()
    if (!running) step(0)
  })
  ro.observe(card)
  step(0)
  requestAnimationFrame(() => canvas.classList.add('ready'))

  return () => {
    stop()
    io.disconnect()
    ro.disconnect()
    document.removeEventListener('visibilitychange', onVis)
    window.removeEventListener('pointermove', onMove)
    scene.environment?.dispose()
    disposeTree(scene)
    renderer.dispose()
    renderer.forceContextLoss()
    canvas.remove()
  }
}

export default function WhyScene({ cardRef, activeRef }) {
  const hostRef = useRef(null)
  useEffect(() => {
    const host = hostRef.current
    const card = cardRef.current
    if (!host || !card) return
    let dispose = () => {}
    try {
      dispose = init(host, card, activeRef)
    } catch (err) {
      console.warn('[why] WebGL scene unavailable:', err)
    }
    return () => dispose()
  }, [cardRef, activeRef])
  return <div className="why-scene" ref={hostRef} aria-hidden="true" />
}

'use client'
// "Product Lab" stage: one floating screen slab that flips between the products. Each product
// gets a UI board painted from its own modules, and the modules float in front of the screen as
// 3D chips that scatter and re-form on every switch.
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { boardTexture, chipTexture } from './boards'
import { clamp, lerp, rng, disposeTree } from '../utils'
import { glowTexture } from '../textures'

const SW = 5.5
const SH = 3.6
const CHIP_POS = [
  [-3.55, 1.15, 0.9],
  [-3.85, 0.15, 1.5],
  [-3.4, -0.9, 0.8],
  [3.6, 1.25, 1.25],
  [3.9, 0.2, 0.7],
  [3.5, -0.95, 1.55],
  [-1.5, -2.35, 1.1],
  [1.6, 2.3, 1.0],
]
const easeIO = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2)
const easeOutBack = (x) => {
  const c1 = 1.4
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2)
}

function buildEnv(renderer) {
  const env = new THREE.Scene()
  env.add(new THREE.Mesh(new THREE.SphereGeometry(30, 24, 16), new THREE.MeshBasicMaterial({ color: 0x08080b, side: THREE.BackSide })))
  const box = (w, h, color, k, pos) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(k), side: THREE.DoubleSide, toneMapped: false }))
    m.position.set(...pos)
    m.lookAt(0, 0, 0)
    env.add(m)
  }
  box(14, 8, 0xffffff, 5, [-12, 12, 10])
  box(4, 14, 0xff6a2a, 5, [14, 2, 6])
  box(16, 2, 0xcfd8ff, 3, [0, -11, 8])
  const pm = new THREE.PMREMGenerator(renderer)
  const rt = pm.fromScene(env, 0.02)
  pm.dispose()
  disposeTree(env)
  return rt.texture
}

function init(host, box, projects, activeRef) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const coarse = window.matchMedia('(pointer: coarse)').matches
  const canvas = document.createElement('canvas')
  canvas.className = 'hero-canvas'
  canvas.setAttribute('aria-hidden', 'true')
  host.appendChild(canvas)

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 2))
  renderer.setClearColor(0x000000, 0)
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.05
  const maxAniso = Math.min(8, renderer.capabilities.getMaxAnisotropy())

  const scene = new THREE.Scene()
  scene.environment = buildEnv(renderer)
  scene.environmentIntensity = 0.9
  const camera = new THREE.PerspectiveCamera(30, 1, 0.5, 100)
  scene.add(new THREE.AmbientLight(0xffffff, 0.25))
  const rimL = new THREE.DirectionalLight(0xff5a1a, 1.2)
  rimL.position.set(6, 3, -4)
  scene.add(rimL)

  const rig = new THREE.Group()
  scene.add(rig)

  // glow behind the slab
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), color: 0xff4d00, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.28 }))
  glow.scale.set(11, 8, 1)
  glow.position.z = -0.8
  rig.add(glow)

  // slab: dark metal bezel + glowing edge + the screen
  const slab = new THREE.Group()
  rig.add(slab)
  const bezelGeo = new THREE.BoxGeometry(SW, SH, 0.2)
  slab.add(new THREE.Mesh(bezelGeo, new THREE.MeshStandardMaterial({ color: 0x15151a, metalness: 0.9, roughness: 0.32 })))
  slab.add(new THREE.LineSegments(new THREE.EdgesGeometry(bezelGeo), new THREE.LineBasicMaterial({ color: 0xff5a1a, transparent: true, opacity: 0.7, toneMapped: false })))
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(SW - 0.26, (SW - 0.26) / 1.6),
    new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false })
  )
  screen.position.z = 0.102
  slab.add(screen)

  // chips + connectors
  const chips = CHIP_POS.map(() => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1.55, 0.435), new THREE.MeshBasicMaterial({ transparent: true, toneMapped: false, depthWrite: false, opacity: 1 }))
    m.visible = false
    rig.add(m)
    return m
  })
  const links = new THREE.LineSegments(
    new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(new Float32Array(CHIP_POS.length * 6), 3)),
    new THREE.LineBasicMaterial({ color: 0xff5a1a, transparent: true, opacity: 0.28, toneMapped: false })
  )
  links.frustumCulled = false
  rig.add(links)

  // slow orbit rings + dust
  const ringPts = (r) => {
    const a = []
    for (let i = 0; i <= 128; i++) a.push(Math.cos((i / 128) * 6.2832) * r, Math.sin((i / 128) * 6.2832) * r, 0)
    return new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(new Float32Array(a), 3))
  }
  const rings = [4.7, 5.5].map((r, i) => {
    const l = new THREE.Line(ringPts(r), new THREE.LineBasicMaterial({ color: 0xff5a1a, transparent: true, opacity: 0.16 - i * 0.05, toneMapped: false }))
    l.rotation.x = 1.15 + i * 0.25
    l.rotation.y = i * 0.6
    l.position.z = -0.4
    rig.add(l)
    return l
  })
  const R = rng(5)
  const DN = 90
  const dust = new THREE.Points(
    new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(Float32Array.from({ length: DN * 3 }, (_, i) => (i % 3 === 0 ? (R() - 0.5) * 13 : i % 3 === 1 ? (R() - 0.5) * 8 : -2 + R() * 4)), 3)),
    new THREE.PointsMaterial({ map: glowTexture(), color: 0xff7a3d, size: 0.14, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })
  )
  rig.add(dust)

  // ── textures (lazy + cached) ────────────────────────────────────────────
  const boards = new Map()
  const chipTex = new Map()
  const boardOf = (i) => {
    if (!boards.has(i)) boards.set(i, boardTexture(projects[i], i, maxAniso))
    return boards.get(i)
  }
  const chipOf = (i, k) => {
    const key = `${i}:${k}`
    if (!chipTex.has(key)) chipTex.set(key, chipTexture(projects[i].modules[k], maxAniso))
    return chipTex.get(key)
  }
  function show(i) {
    screen.material.map = boardOf(i)
    screen.material.needsUpdate = true
    chips.forEach((c, k) => {
      const has = !!projects[i].modules[k]
      c.visible = has
      if (has) {
        c.material.map = chipOf(i, k)
        c.material.needsUpdate = true
      }
    })
  }

  // ── layout ──────────────────────────────────────────────────────────────
  const view = { dist: 12 }
  function layout() {
    const w = Math.max(1, box.clientWidth)
    const h = Math.max(1, box.clientHeight)
    renderer.setSize(w, h, false)
    const portrait = w / h < 1
    camera.fov = portrait ? 38 : 30
    camera.aspect = w / h
    const th = Math.tan((camera.fov * Math.PI) / 360)
    const dw = 9.5 / (2 * th * camera.aspect * 0.98)
    const dh = 5.4 / (2 * th * 0.92)
    view.dist = clamp(Math.max(dw, dh), 9, 40)
    camera.updateProjectionMatrix()
  }
  layout()

  const ptr = { x: 0, y: 0, tx: 0, ty: 0 }
  const onMove = (e) => {
    const r = box.getBoundingClientRect()
    // only tilt while the pointer is over (or near) the stage; ease back to flat otherwise
    const inside = e.clientX > r.left - 40 && e.clientX < r.right + 40 && e.clientY > r.top - 40 && e.clientY < r.bottom + 40
    ptr.tx = inside ? clamp(((e.clientX - r.left) / r.width) * 2 - 1, -1, 1) : 0
    ptr.ty = inside ? clamp(((e.clientY - r.top) / r.height) * 2 - 1, -1, 1) : 0
  }
  window.addEventListener('pointermove', onMove, { passive: true })

  // ── loop ────────────────────────────────────────────────────────────────
  let t = 0
  let shown = -1
  let tr = null // { p: 0..1, to }
  let raf = 0
  let running = false
  let last = 0
  const lp = links.geometry.attributes.position.array
  const tmp = new THREE.Vector3()

  function step(dt) {
    t += reduced ? 0 : dt
    const want = activeRef.current ?? 0
    if (shown === -1) {
      show(want)
      shown = want
      tr = { p: 0.5, to: want, swapped: true, intro: true } // chips grow in on first view
    } else if (!tr && want !== shown) {
      tr = { p: 0, to: want, swapped: false }
    }

    let slabY = 0
    let chipS = 1
    let chipStagger = false
    if (tr) {
      tr.p += reduced ? 2 : dt / 1.15
      const p = clamp(tr.p)
      if (!tr.swapped && p >= 0.5) {
        show(tr.to)
        shown = tr.to
        tr.swapped = true
      }
      if (p < 0.5) {
        slabY = -(Math.PI / 2) * easeIO(p / 0.5)
        chipS = 1 - easeIO(clamp(p / 0.35))
      } else {
        slabY = (Math.PI / 2) * (1 - easeIO((p - 0.5) / 0.5))
        chipStagger = true
      }
      if (tr.p >= 1) tr = null
    }

    ptr.x = lerp(ptr.x, ptr.tx, 1 - Math.exp(-dt * 3))
    ptr.y = lerp(ptr.y, ptr.ty, 1 - Math.exp(-dt * 3))
    rig.rotation.y = ptr.x * 0.3 + Math.sin(t * 0.4) * 0.05
    rig.rotation.x = -ptr.y * 0.16
    slab.rotation.y = slabY
    glow.material.opacity = 0.2 + 0.1 * Math.cos(Math.abs(slabY) * 2)

    const pCur = tr ? clamp(tr.p) : 1
    chips.forEach((c, k) => {
      if (!c.visible) return
      let s = chipS
      if (chipStagger) s = easeOutBack(clamp((pCur - 0.5) * 2 - k * 0.07))
      else if (!tr) s = 1
      s = Math.max(0.0001, s)
      const [x, y, z] = CHIP_POS[k]
      const bob = Math.sin(t * 0.9 + k * 1.3) * 0.09
      c.position.set(x, y + bob, z)
      c.scale.setScalar(s)
      c.rotation.z = Math.sin(t * 0.5 + k) * 0.015
      // connector from the chip toward the slab edge
      const ex = clamp(x, -SW / 2 + 0.2, SW / 2 - 0.2)
      const ey = clamp(y, -SH / 2 + 0.2, SH / 2 - 0.2)
      tmp.set(x * 0.82, y + bob, z - 0.05)
      lp[k * 6] = tmp.x
      lp[k * 6 + 1] = tmp.y
      lp[k * 6 + 2] = tmp.z
      lp[k * 6 + 3] = ex
      lp[k * 6 + 4] = ey
      lp[k * 6 + 5] = 0.1
      if (s < 0.05) lp.fill(0, k * 6, k * 6 + 6)
    })
    for (let k = projects[shown >= 0 ? shown : 0].modules.length; k < CHIP_POS.length; k++) lp.fill(0, k * 6, k * 6 + 6)
    links.geometry.attributes.position.needsUpdate = true
    rings.forEach((r, i) => (r.rotation.z = t * (0.05 + i * 0.03)))
    dust.rotation.y = t * 0.02

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
    { rootMargin: '10% 0px 10% 0px' }
  )
  io.observe(box)
  const onVis = () => (document.hidden || !inView ? stop() : start())
  document.addEventListener('visibilitychange', onVis)
  const ro = new ResizeObserver(() => {
    layout()
    if (!running) step(0)
  })
  ro.observe(box)
  step(0)
  requestAnimationFrame(() => canvas.classList.add('ready'))

  return () => {
    stop()
    io.disconnect()
    ro.disconnect()
    document.removeEventListener('visibilitychange', onVis)
    window.removeEventListener('pointermove', onMove)
    boards.forEach((tx) => tx.dispose())
    chipTex.forEach((tx) => tx.dispose())
    scene.environment?.dispose()
    disposeTree(scene)
    renderer.dispose()
    renderer.forceContextLoss()
    canvas.remove()
  }
}

export default function ProjectsStage({ boxRef, projects, activeRef }) {
  const hostRef = useRef(null)
  useEffect(() => {
    const host = hostRef.current
    const box = boxRef.current
    if (!host || !box) return
    let dispose = () => {}
    try {
      dispose = init(host, box, projects, activeRef)
    } catch (err) {
      console.warn('[projects] WebGL stage unavailable:', err)
    }
    return () => dispose()
  }, [boxRef, projects, activeRef])
  return <div className="proj-scene" ref={hostRef} aria-hidden="true" />
}

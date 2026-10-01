'use client'
// "Bit by Bit" — one InstancedMesh of glowing cubes that swarm, assemble into what Bitlabs
// builds (logo → mobile app → sales dashboard → org chart → WhatsApp chat), scatter away
// from the pointer and snap back. CPU-driven, one draw call: light enough for budget phones.
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { buildScenes, GRID } from './scenes'
import { clamp, lerp, smoothstep, rng, disposeTree } from '../utils'

const PITCH = 0.125 // world units per pixel
const HOLD = 4.8 // seconds each scene stays assembled
const DUR = 1.5 // seconds a cube takes to travel
const easeIO = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2)

function quality() {
  const coarse = window.matchMedia('(pointer: coarse)').matches
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const cores = navigator.hardwareConcurrency || 4
  const mem = navigator.deviceMemory || 8
  const low = (coarse && (cores <= 6 || window.innerWidth < 760)) || mem <= 2
  return { low, reduced }
}

function init(host, hero, { onScene, control }) {
  const { low, reduced } = quality()
  const canvas = document.createElement('canvas')
  canvas.className = 'hero-canvas'
  canvas.setAttribute('aria-hidden', 'true')
  host.appendChild(canvas)

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !low, alpha: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, low ? 1 : 1.5))
  renderer.setClearColor(0x000000, 0)
  renderer.toneMapping = THREE.NoToneMapping

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(30, 1, 0.5, 200)

  // ── Scenes → per-cube targets ───────────────────────────────────────────
  const scenes = buildScenes()
  const N = low ? 2200 : 3600
  const { W, H } = GRID
  const R = rng(2024)
  const lin = new THREE.Color()
  const toLin = (r, g, b) => lin.setRGB(r / 255, g / 255, b / 255, THREE.SRGBColorSpace)

  const tgtPos = []
  const tgtCol = []
  const tgtScale = []
  scenes.forEach((sc, k) => {
    const pos = new Float32Array(N * 3)
    const col = new Float32Array(N * 3)
    const scl = new Float32Array(N)
    const pts = sc.points.slice()
    for (let i = pts.length - 1; i > 0; i--) {
      const j = (R() * (i + 1)) | 0
      ;[pts[i], pts[j]] = [pts[j], pts[i]]
    }
    for (let i = 0; i < N; i++) {
      const p = pts[i]
      if (p) {
        pos[i * 3] = (p.px - W / 2 + 0.5) * PITCH
        pos[i * 3 + 1] = -(p.py - H / 2 + 0.5) * PITCH
        pos[i * 3 + 2] = (R() - 0.5) * 0.05
        toLin(p.r, p.g, p.b)
        col[i * 3] = lin.r
        col[i * 3 + 1] = lin.g
        col[i * 3 + 2] = lin.b
        scl[i] = 0.86
      } else {
        // spare cubes become drifting dust around the picture
        pos[i * 3] = (R() - 0.5) * 26
        pos[i * 3 + 1] = (R() - 0.5) * 15
        pos[i * 3 + 2] = -7 + R() * 10
        const l = 0.04 + R() * 0.16
        col[i * 3] = l * 1.0
        col[i * 3 + 1] = l * (R() > 0.85 ? 0.8 : 0.28)
        col[i * 3 + 2] = l * (R() > 0.85 ? 0.7 : 0.06)
        scl[i] = 0.22 + R() * 0.3
      }
    }
    tgtPos[k] = pos
    tgtCol[k] = col
    tgtScale[k] = scl
  })

  // ── Instanced cubes ─────────────────────────────────────────────────────
  const mat = new THREE.MeshStandardMaterial({ roughness: 0.38, metalness: 0.12 })
  // Self-glow in the cube's own colour (emissive doesn't follow instance colour by default).
  mat.onBeforeCompile = (sh) => {
    sh.fragmentShader = sh.fragmentShader.replace(
      '#include <emissivemap_fragment>',
      '#include <emissivemap_fragment>\n totalEmissiveRadiance = diffuseColor.rgb * 0.62;'
    )
  }
  const mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), mat, N)
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
  mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(N * 3), 3)
  mesh.instanceColor.setUsage(THREE.DynamicDrawUsage)
  mesh.frustumCulled = false
  scene.add(mesh)

  scene.add(new THREE.AmbientLight(0xffffff, 0.55))
  const key = new THREE.DirectionalLight(0xfff0e6, 1.6)
  key.position.set(-4, 6, 9)
  scene.add(key)
  const ptrLight = new THREE.PointLight(0xff7a3d, 26, 8, 2)
  ptrLight.position.set(0, 0, 3)
  scene.add(ptrLight)

  // ── Per-cube state ──────────────────────────────────────────────────────
  const cur = new Float32Array(N * 3)
  const from = new Float32Array(N * 3)
  const to = new Float32Array(N * 3)
  const arc = new Float32Array(N * 3)
  const spin = new Float32Array(N * 3)
  const delay = new Float32Array(N)
  const colCur = new Float32Array(N * 3)
  const colFrom = new Float32Array(N * 3)
  const colTo = new Float32Array(N * 3)
  const sCur = new Float32Array(N)
  const sFrom = new Float32Array(N)
  const sTo = new Float32Array(N)
  const off = new Float32Array(N * 3)
  const vel = new Float32Array(N * 3)
  const phase = new Float32Array(N)
  for (let i = 0; i < N; i++) {
    // start as a loose swarm on a big shell
    const a = R() * Math.PI * 2
    const b = Math.acos(2 * R() - 1)
    const r = 10 + R() * 12
    cur[i * 3] = Math.sin(b) * Math.cos(a) * r
    cur[i * 3 + 1] = Math.cos(b) * r * 0.6
    cur[i * 3 + 2] = Math.sin(b) * Math.sin(a) * r - 4
    colCur[i * 3] = 0.05
    colCur[i * 3 + 1] = 0.01
    colCur[i * 3 + 2] = 0
    sCur[i] = 0.3
    phase[i] = R() * 6.28
  }

  let sceneIdx = -1
  let t0 = 0
  let busyUntil = 0
  let nextAt = 0
  let t = 0

  function goTo(k) {
    const n = (k + scenes.length) % scenes.length
    sceneIdx = n
    t0 = t
    const P = tgtPos[n]
    let maxDelay = 0
    for (let i = 0; i < N * 3; i++) {
      from[i] = cur[i]
      to[i] = P[i]
      colFrom[i] = colCur[i]
      colTo[i] = tgtCol[n][i]
    }
    for (let i = 0; i < N; i++) {
      sFrom[i] = sCur[i]
      sTo[i] = tgtScale[n][i]
      // a wave sweeps left → right across the destination
      delay[i] = clamp((P[i * 3] + 8) / 16) * 0.55 + R() * 0.3
      maxDelay = Math.max(maxDelay, delay[i])
      const m = 1.2 + R() * 2.4
      arc[i * 3] = (R() - 0.5) * m
      arc[i * 3 + 1] = (R() - 0.5) * m
      arc[i * 3 + 2] = (R() - 0.2) * m * 1.5
      spin[i * 3] = (R() - 0.5) * 9
      spin[i * 3 + 1] = (R() - 0.5) * 9
      spin[i * 3 + 2] = (R() - 0.5) * 9
    }
    busyUntil = t + maxDelay + DUR
    nextAt = busyUntil + HOLD
    onScene?.(n, scenes[n])
  }
  if (control) control.current = { goTo: (k) => goTo(k), count: scenes.length }

  // ── Layout ──────────────────────────────────────────────────────────────
  const view = { dist: 28, portrait: false }
  function layout() {
    const w = Math.max(1, hero.clientWidth)
    const h = Math.max(1, hero.clientHeight)
    renderer.setSize(w, h, false)
    view.portrait = w < 820
    camera.fov = view.portrait ? 40 : 30
    camera.aspect = w / h
    const span = GRID.W * PITCH + 1.2
    const frac = view.portrait ? 0.96 : 0.5
    view.dist = clamp(span / (frac * 2 * Math.tan((camera.fov * Math.PI) / 360) * camera.aspect), 14, 70)
    const sx = view.portrait ? 0 : 0.24
    const sy = view.portrait ? 0.2 : -0.05
    camera.setViewOffset(w, h, -w * sx, -h * sy, w, h)
    camera.updateProjectionMatrix()
  }
  layout()

  // ── Pointer ─────────────────────────────────────────────────────────────
  const ptr = { x: 0, y: 0, nx: 0, ny: 0, active: false, wx: 99, wy: 99 }
  const ray = new THREE.Raycaster()
  const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)
  const hit = new THREE.Vector3()
  const onMove = (e) => {
    const r = hero.getBoundingClientRect()
    const inside = e.clientY >= r.top && e.clientY <= r.bottom
    ptr.active = inside
    ptr.nx = clamp(((e.clientX - r.left) / r.width) * 2 - 1, -1, 1)
    ptr.ny = clamp(((e.clientY - r.top) / r.height) * 2 - 1, -1, 1)
  }
  const onLeave = () => (ptr.active = false)
  window.addEventListener('pointermove', onMove, { passive: true })
  document.addEventListener('pointerleave', onLeave)

  // ── Frame ───────────────────────────────────────────────────────────────
  const arr = mesh.instanceMatrix.array
  const carr = mesh.instanceColor.array
  let scrollP = 0
  let scrollT = 0
  let raf = 0
  let running = false
  let last = 0
  goTo(0)

  function step(dt, final = false) {
    t += dt
    const rect = hero.getBoundingClientRect()
    scrollT = clamp(-rect.top / Math.max(1, rect.height * 0.9))
    scrollP = final ? scrollT : lerp(scrollP, scrollT, 1 - Math.exp(-dt * 5))
    ptr.x = lerp(ptr.x, ptr.nx, 1 - Math.exp(-dt * 3))
    ptr.y = lerp(ptr.y, ptr.ny, 1 - Math.exp(-dt * 3))

    // auto-advance
    if (!reduced && t > nextAt) goTo(sceneIdx + 1)

    // camera: gentle parallax + scroll dolly
    const d = view.dist * (1 - 0.1 * scrollP)
    camera.position.set(ptr.x * 1.1, -ptr.y * 0.7, d)
    camera.lookAt(0, 0, 0)
    camera.updateMatrixWorld()

    // pointer → world on z = 0
    let wx = 99
    let wy = 99
    if (ptr.active) {
      ray.setFromCamera(new THREE.Vector2(ptr.nx, -ptr.ny), camera)
      if (ray.ray.intersectPlane(plane, hit)) {
        wx = hit.x
        wy = hit.y
      }
    }
    ptrLight.position.set(wx === 99 ? 0 : wx, wy === 99 ? 0 : wy, 2.2)
    ptrLight.intensity = lerp(ptrLight.intensity, wx === 99 ? 0 : 26, 1 - Math.exp(-dt * 8))

    const sweepX = ((t * 3.2) % 34) - 17
    const spring = Math.min(dt, 0.04)
    const explode = smoothstep(0.05, 0.9, scrollP)
    const RAD = 1.7
    const pi = Math.PI
    let i3 = 0
    for (let i = 0; i < N; i++, i3 += 3) {
      // ── travel
      const u = clamp((t - t0 - delay[i]) / DUR)
      let px
      let py
      let pz
      let rx = 0
      let ry = 0
      let rz = 0
      let col0
      let col1
      let col2
      let s
      if (u >= 1) {
        px = to[i3]
        py = to[i3 + 1]
        pz = to[i3 + 2]
        col0 = colTo[i3]
        col1 = colTo[i3 + 1]
        col2 = colTo[i3 + 2]
        s = sTo[i]
      } else {
        const e = easeIO(u)
        const a = Math.sin(pi * u)
        px = from[i3] + (to[i3] - from[i3]) * e + arc[i3] * a
        py = from[i3 + 1] + (to[i3 + 1] - from[i3 + 1]) * e + arc[i3 + 1] * a
        pz = from[i3 + 2] + (to[i3 + 2] - from[i3 + 2]) * e + arc[i3 + 2] * a
        const k = (1 - e) * a
        rx = spin[i3] * (1 - e)
        ry = spin[i3 + 1] * (1 - e)
        rz = spin[i3 + 2] * (1 - e) + k
        col0 = lerp(colFrom[i3], colTo[i3], e)
        col1 = lerp(colFrom[i3 + 1], colTo[i3 + 1], e)
        col2 = lerp(colFrom[i3 + 2], colTo[i3 + 2], e)
        s = lerp(sFrom[i], sTo[i], e)
      }
      cur[i3] = px
      cur[i3 + 1] = py
      cur[i3 + 2] = pz
      colCur[i3] = col0
      colCur[i3 + 1] = col1
      colCur[i3 + 2] = col2
      sCur[i] = s

      // ── idle life: dust drifts, shapes shimmer
      const dust = s < 0.55
      const ph = phase[i]
      if (dust) {
        px += Math.sin(t * 0.25 + ph) * 0.35
        py += Math.cos(t * 0.21 + ph * 1.3) * 0.3
        pz += Math.sin(t * 0.17 + ph * 2) * 0.4
      } else {
        pz += Math.sin(t * 1.4 + ph) * 0.025
      }

      // ── pointer scatter (spring back)
      const o = i3
      if (wx !== 99) {
        const dx = px + off[o] - wx
        const dy = py + off[o + 1] - wy
        const dd = dx * dx + dy * dy
        if (dd < RAD * RAD) {
          const dl = Math.sqrt(dd) + 0.0001
          const f = (1 - dl / RAD) * (1 - dl / RAD) * 70
          vel[o] += (dx / dl) * f * spring
          vel[o + 1] += (dy / dl) * f * spring
          vel[o + 2] += f * spring * (0.4 + (ph % 1))
        }
      }
      vel[o] += (-off[o] * 16 - vel[o] * 4.2) * spring
      vel[o + 1] += (-off[o + 1] * 16 - vel[o + 1] * 4.2) * spring
      vel[o + 2] += (-off[o + 2] * 16 - vel[o + 2] * 4.2) * spring
      off[o] += vel[o] * spring
      off[o + 1] += vel[o + 1] * spring
      off[o + 2] += vel[o + 2] * spring
      px += off[o]
      py += off[o + 1]
      pz += off[o + 2]

      // ── scroll: bits fly apart as the hero leaves
      if (explode > 0) {
        const l = Math.hypot(px, py) + 0.001
        px += (px / l) * explode * 7 + Math.sin(ph) * explode * 2
        py += (py / l) * explode * 5 + Math.cos(ph) * explode * 2
        pz += explode * (3 + (ph % 2) * 3)
      }

      // ── write matrix (Euler XYZ rotation × uniform scale + translation)
      const size = PITCH * s * (1 - explode * 0.5)
      const m = i * 16
      if (rx === 0 && ry === 0 && rz === 0) {
        arr[m] = size
        arr[m + 1] = 0
        arr[m + 2] = 0
        arr[m + 4] = 0
        arr[m + 5] = size
        arr[m + 6] = 0
        arr[m + 8] = 0
        arr[m + 9] = 0
        arr[m + 10] = size
      } else {
        const a = Math.cos(rx)
        const b = Math.sin(rx)
        const c = Math.cos(ry)
        const dd = Math.sin(ry)
        const e = Math.cos(rz)
        const f = Math.sin(rz)
        const ae = a * e
        const af = a * f
        const be = b * e
        const bf = b * f
        arr[m] = c * e * size
        arr[m + 1] = (af + be * dd) * size
        arr[m + 2] = (bf - ae * dd) * size
        arr[m + 4] = -c * f * size
        arr[m + 5] = (ae - bf * dd) * size
        arr[m + 6] = (be + af * dd) * size
        arr[m + 8] = dd * size
        arr[m + 9] = -b * c * size
        arr[m + 10] = a * c * size
      }
      arr[m + 3] = 0
      arr[m + 7] = 0
      arr[m + 11] = 0
      arr[m + 12] = px
      arr[m + 13] = py
      arr[m + 14] = pz
      arr[m + 15] = 1

      // colour: a bright scan sweeps across assembled shapes
      const boost = dust ? 1 : 1 + 0.9 * Math.max(0, 1 - Math.abs(px - sweepX) / 1.4)
      carr[i3] = col0 * boost
      carr[i3 + 1] = col1 * boost
      carr[i3 + 2] = col2 * boost
    }
    mesh.instanceMatrix.needsUpdate = true
    mesh.instanceColor.needsUpdate = true
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
    if (running || reduced) return
    running = true
    last = performance.now()
    raf = requestAnimationFrame(frame)
  }
  const stop = () => {
    running = false
    cancelAnimationFrame(raf)
  }
  let inView = true
  const io = new IntersectionObserver(
    ([e]) => {
      inView = e.isIntersecting
      inView && !document.hidden ? start() : stop()
    },
    { threshold: 0 }
  )
  io.observe(hero)
  const onVis = () => (document.hidden || !inView ? stop() : start())
  document.addEventListener('visibilitychange', onVis)
  const ro = new ResizeObserver(() => {
    layout()
    if (!running) step(0, true)
  })
  ro.observe(hero)

  if (reduced) {
    t = 99
    goTo(0)
    t += DUR + 2
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
    document.removeEventListener('pointerleave', onLeave)
    window.removeEventListener('pointermove', onMove)
    disposeTree(scene)
    renderer.dispose()
    renderer.forceContextLoss()
    canvas.remove()
    if (control) control.current = null
  }
}

export default function BitsScene({ heroRef, onScene, control }) {
  const hostRef = useRef(null)
  const cb = useRef(onScene)
  cb.current = onScene

  useEffect(() => {
    const host = hostRef.current
    const hero = heroRef.current
    if (!host || !hero) return
    let dispose = () => {}
    try {
      dispose = init(host, hero, { onScene: (i, s) => cb.current?.(i, s), control })
    } catch (err) {
      console.warn('[bits] WebGL scene unavailable:', err)
    }
    return () => dispose()
  }, [heroRef, control])

  return <div className="hero-scene" ref={hostRef} aria-hidden="true" />
}

'use client'
// The "proof" stage: one InstancedMesh of cubes whose formation is a pure function of the
// scroll position (state.s ∈ [0,4]): skyline → network → growth rings → gauge.
// Scrubbing back and forth is always consistent because nothing is stored between frames.
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { STATS, pack } from './formations'
import { clamp, lerp, smoothstep, rng, disposeTree } from '../utils'

const BASE = 0.34 // cube edge for scale = 1
const reveal = (o, g) => smoothstep(0, 1, clamp((g - o * 0.9) / 0.1))

function quality() {
  const coarse = window.matchMedia('(pointer: coarse)').matches
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const cores = navigator.hardwareConcurrency || 4
  const mem = navigator.deviceMemory || 8
  return { low: (coarse && (cores <= 6 || window.innerWidth < 760)) || mem <= 2, reduced }
}

function init(host, stage, root, state) {
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

  // ── Formations ──────────────────────────────────────────────────────────
  const raw = STATS.map((s) => s.build())
  const N = Math.max(...raw.map((r) => r.length)) + (low ? 160 : 380)
  const F = raw.map((slots, k) => pack(slots, N, 300 + k))

  const mat = new THREE.MeshStandardMaterial({ roughness: 0.4, metalness: 0.12 })
  mat.onBeforeCompile = (sh) => {
    sh.fragmentShader = sh.fragmentShader.replace(
      '#include <emissivemap_fragment>',
      '#include <emissivemap_fragment>\n totalEmissiveRadiance = diffuseColor.rgb * 0.6;'
    )
  }
  const mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), mat, N)
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
  mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(N * 3), 3)
  mesh.instanceColor.setUsage(THREE.DynamicDrawUsage)
  mesh.frustumCulled = false
  scene.add(mesh)

  scene.add(new THREE.AmbientLight(0xffffff, 0.6))
  const key = new THREE.DirectionalLight(0xfff0e6, 1.7)
  key.position.set(-5, 8, 9)
  scene.add(key)
  const rim = new THREE.DirectionalLight(0xff7a3d, 0.9)
  rim.position.set(6, -2, -6)
  scene.add(rim)
  const ptrLight = new THREE.PointLight(0xff7a3d, 0, 9, 2)
  scene.add(ptrLight)

  // per-cube constants
  const R = rng(77)
  const dly = new Float32Array(N)
  const arc = new Float32Array(N * 3)
  const off = new Float32Array(N * 3)
  const vel = new Float32Array(N * 3)
  const phase = new Float32Array(N)
  for (let i = 0; i < N; i++) {
    dly[i] = R()
    arc[i * 3] = (R() - 0.5) * 3
    arc[i * 3 + 1] = (R() - 0.5) * 3
    arc[i * 3 + 2] = (R() - 0.2) * 4
    phase[i] = R() * 6.28
  }

  // evaluate one slot of one formation → out [x,y,z,scale,r,g,b]
  const out = new Float32Array(7)
  const A = new Float32Array(7)
  function evalSlot(f, i, t, g, o) {
    const i3 = i * 3
    const kind = f.kind[i]
    let x = f.pos[i3]
    let y = f.pos[i3 + 1]
    let z = f.pos[i3 + 2]
    const cr = f.col[i3]
    const cg = f.col[i3 + 1]
    const cb = f.col[i3 + 2]
    if (kind === 1) {
      const ph = phase[i]
      o[0] = x + Math.sin(t * 0.25 + ph) * 0.35
      o[1] = y + Math.cos(t * 0.21 + ph * 1.3) * 0.3
      o[2] = z + Math.sin(t * 0.17 + ph * 2) * 0.4
      o[3] = f.scl[i]
      o[4] = cr
      o[5] = cg
      o[6] = cb
      return
    }
    const r = kind === 2 ? 1 : reveal(f.ord[i], g)
    let ax = f.anc[i3]
    const ay = f.anc[i3 + 1]
    let az = f.anc[i3 + 2]
    const w = f.omg[i]
    if (w !== 0) {
      const c = Math.cos(w * t)
      const s = Math.sin(w * t)
      const nx = x * c + z * s
      z = -x * s + z * c
      x = nx
      const nax = ax * c + az * s
      az = -ax * s + az * c
      ax = nax
    }
    o[0] = lerp(ax, x, r)
    o[1] = lerp(ay, y, r)
    o[2] = lerp(az, z, r)
    o[3] = kind === 2 ? f.scl[i] * 0.9 : lerp(0.3, f.scl[i], r)
    const dim = kind === 2 ? 1 : 0.14 + 0.86 * r
    o[4] = cr * dim
    o[5] = cg * dim
    o[6] = cb * dim
  }

  // ── Layout ──────────────────────────────────────────────────────────────
  const view = { dist: 28 }
  function layout() {
    const w = Math.max(1, stage.clientWidth)
    const h = Math.max(1, stage.clientHeight)
    renderer.setSize(w, h, false)
    const portrait = w < 820
    camera.fov = portrait ? 40 : 30
    camera.aspect = w / h
    const span = portrait ? 11.5 : 12
    const frac = portrait ? 0.98 : 0.6
    view.dist = clamp(span / (frac * 2 * Math.tan((camera.fov * Math.PI) / 360) * camera.aspect), 14, 80)
    const sx = portrait ? 0 : -0.22 // formations live on the right, copy on the left
    const sy = portrait ? 0.22 : 0
    camera.setViewOffset(w, h, w * sx, -h * sy, w, h)
    camera.updateProjectionMatrix()
  }
  layout()

  // ── Pointer ─────────────────────────────────────────────────────────────
  const ptr = { nx: 0, ny: 0, x: 0, y: 0, active: false }
  const ray = new THREE.Raycaster()
  const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)
  const hit = new THREE.Vector3()
  const inv = new THREE.Matrix4()
  const onMove = (e) => {
    const r = stage.getBoundingClientRect()
    ptr.active = e.clientY >= r.top && e.clientY <= r.bottom
    ptr.nx = clamp(((e.clientX - r.left) / r.width) * 2 - 1, -1, 1)
    ptr.ny = clamp(((e.clientY - r.top) / r.height) * 2 - 1, -1, 1)
  }
  const onLeave = () => (ptr.active = false)
  window.addEventListener('pointermove', onMove, { passive: true })
  document.addEventListener('pointerleave', onLeave)

  // ── Frame ───────────────────────────────────────────────────────────────
  const arr = mesh.instanceMatrix.array
  const carr = mesh.instanceColor.array
  let t = 0
  let rotY = 0
  let raf = 0
  let running = false
  let last = 0
  const pi = Math.PI

  function step(dt) {
    t += reduced ? 0 : dt
    const s = clamp(state.s, 0, 4)
    const idx = Math.min(3, Math.floor(s))
    const tt = s - idx
    const gA = smoothstep(0, 0.55, tt)
    const m = idx < 3 ? smoothstep(0.72, 1, tt) : 0
    const fa = F[idx]
    const fb = F[Math.min(3, idx + 1)]
    const sa = STATS[idx]
    const sb = STATS[Math.min(3, idx + 1)]

    ptr.x = lerp(ptr.x, ptr.nx, 1 - Math.exp(-dt * 3))
    ptr.y = lerp(ptr.y, ptr.ny, 1 - Math.exp(-dt * 3))
    camera.position.set(ptr.x * 1.0, -ptr.y * 0.6, view.dist)
    camera.lookAt(0, 0, 0)
    camera.updateMatrixWorld()

    // formation-level motion
    const spin = lerp(sa.spin, sb.spin, m)
    rotY += reduced ? 0 : dt * spin
    // formations that must face the camera (rings, gauge) ease the accumulated spin back to 0
    mesh.rotation.y = rotY * lerp(sa.keepSpin, sb.keepSpin, m) + ptr.x * 0.12
    mesh.rotation.x = lerp(sa.tilt, sb.tilt, m) - ptr.y * 0.05
    mesh.position.y = lerp(idx === 0 ? -0.85 : 0, idx + 1 === 0 ? -0.85 : 0, m)
    mesh.updateMatrixWorld()

    // pointer → local space of the mesh
    let lx = 99
    let ly = 99
    let lz = 99
    if (ptr.active) {
      ray.setFromCamera(new THREE.Vector2(ptr.nx, -ptr.ny), camera)
      if (ray.ray.intersectPlane(plane, hit)) {
        ptrLight.position.set(hit.x, hit.y, 2.4)
        inv.copy(mesh.matrixWorld).invert()
        hit.applyMatrix4(inv)
        lx = hit.x
        ly = hit.y
        lz = hit.z
      }
    }
    ptrLight.intensity = lerp(ptrLight.intensity, lx === 99 ? 0 : 24, 1 - Math.exp(-dt * 8))

    const spring = Math.min(dt, 0.04)
    const RAD = 1.5
    for (let i = 0; i < N; i++) {
      evalSlot(fa, i, t, gA, out)
      let x = out[0]
      let y = out[1]
      let z = out[2]
      let sc = out[3]
      let cr = out[4]
      let cg = out[5]
      let cb = out[6]
      if (m > 0) {
        evalSlot(fb, i, t, 0, A)
        const mi = smoothstep(0, 1, clamp((m - dly[i] * 0.45) / 0.55))
        const bump = Math.sin(pi * mi)
        const i3 = i * 3
        x = lerp(x, A[0], mi) + arc[i3] * bump
        y = lerp(y, A[1], mi) + arc[i3 + 1] * bump
        z = lerp(z, A[2], mi) + arc[i3 + 2] * bump
        sc = lerp(sc, A[3], mi)
        cr = lerp(cr, A[4], mi)
        cg = lerp(cg, A[5], mi)
        cb = lerp(cb, A[6], mi)
      }

      // pointer scatter with spring return
      const o = i * 3
      if (lx !== 99) {
        const dx = x + off[o] - lx
        const dy = y + off[o + 1] - ly
        const dz = z + off[o + 2] - lz
        const d2 = dx * dx + dy * dy + dz * dz
        if (d2 < RAD * RAD) {
          const dl = Math.sqrt(d2) + 0.0001
          const f = (1 - dl / RAD) * (1 - dl / RAD) * 60
          vel[o] += (dx / dl) * f * spring
          vel[o + 1] += (dy / dl) * f * spring
          vel[o + 2] += (dz / dl) * f * spring
        }
      }
      vel[o] += (-off[o] * 15 - vel[o] * 4.2) * spring
      vel[o + 1] += (-off[o + 1] * 15 - vel[o + 1] * 4.2) * spring
      vel[o + 2] += (-off[o + 2] * 15 - vel[o + 2] * 4.2) * spring
      off[o] += vel[o] * spring
      off[o + 1] += vel[o + 1] * spring
      off[o + 2] += vel[o + 2] * spring

      const size = BASE * sc
      const q = i * 16
      arr[q] = size
      arr[q + 1] = 0
      arr[q + 2] = 0
      arr[q + 3] = 0
      arr[q + 4] = 0
      arr[q + 5] = size
      arr[q + 6] = 0
      arr[q + 7] = 0
      arr[q + 8] = 0
      arr[q + 9] = 0
      arr[q + 10] = size
      arr[q + 11] = 0
      arr[q + 12] = x + off[o]
      arr[q + 13] = y + off[o + 1]
      arr[q + 14] = z + off[o + 2]
      arr[q + 15] = 1
      carr[o] = cr
      carr[o + 1] = cg
      carr[o + 2] = cb
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
  io.observe(root)
  const onVis = () => (document.hidden || !inView ? stop() : start())
  document.addEventListener('visibilitychange', onVis)
  const ro = new ResizeObserver(() => {
    layout()
    if (!running) step(0)
  })
  ro.observe(stage)
  step(0)
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
  }
}

export default function ProofScene({ stageRef, rootRef, state }) {
  const hostRef = useRef(null)
  useEffect(() => {
    const host = hostRef.current
    const stage = stageRef.current
    const root = rootRef.current
    if (!host || !stage || !root) return
    let dispose = () => {}
    try {
      dispose = init(host, stage, root, state)
    } catch (err) {
      console.warn('[proof] WebGL scene unavailable:', err)
    }
    return () => dispose()
  }, [stageRef, rootRef, state])
  return <div className="hero-scene" ref={hostRef} aria-hidden="true" />
}

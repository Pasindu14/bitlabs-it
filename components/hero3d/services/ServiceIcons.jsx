'use client'
// Six live 3D voxel icons — one per service card — rendered by ONE canvas laid over the
// cards grid with an orthographic camera in CSS pixels, so each icon sits exactly on its
// card's icon slot (and follows the card when it moves, parallaxes or lifts on hover).
//   • assembles from scattered cubes when its card scrolls into view
//   • tilts toward the pointer, sways gently at rest
//   • on hover (or tap) bursts apart, spins and snaps back together
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { ICONS, GRID, DEPTH, PALETTE } from './icons'
import { clamp, lerp, rng, disposeTree } from '../utils'

const CELL = 7.4 // px per voxel
const easeOut = (x) => 1 - Math.pow(1 - x, 3)

function init(host, grid) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const coarse = window.matchMedia('(pointer: coarse)').matches
  const canvas = document.createElement('canvas')
  canvas.className = 'svc-canvas'
  canvas.setAttribute('aria-hidden', 'true')
  host.appendChild(canvas)

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 2))
  renderer.setClearColor(0x000000, 0)
  renderer.toneMapping = THREE.NoToneMapping
  const scene = new THREE.Scene()
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -2000, 2000)

  // ── Build every icon's cubes ────────────────────────────────────────────
  const R = rng(5)
  const lin = new THREE.Color()
  const cubes = []
  ICONS.forEach((make, icon) => {
    const g = make()
    const maxD = Math.max(...Object.values(DEPTH))
    for (let y = 0; y < GRID; y++) {
      for (let x = 0; x < GRID; x++) {
        const ch = g[y][x]
        if (ch === '.') continue
        const d = DEPTH[ch]
        lin.set(PALETTE[ch])
        for (let l = 0; l < d; l++) {
          cubes.push({
            icon,
            x: (x - (GRID - 1) / 2) * CELL,
            y: -(y - (GRID - 1) / 2) * CELL,
            z: (l - (maxD - 1) / 2) * CELL,
            r: lin.r,
            g: lin.g,
            b: lin.b,
          })
        }
      }
    }
  })
  const N = cubes.length
  const base = new Float32Array(N * 3)
  const scat = new Float32Array(N * 3)
  const col = new Float32Array(N * 3)
  const ico = new Uint8Array(N)
  const dly = new Float32Array(N)
  const off = new Float32Array(N * 3)
  const vel = new Float32Array(N * 3)
  cubes.forEach((c, i) => {
    base.set([c.x, c.y, c.z], i * 3)
    col.set([c.r, c.g, c.b], i * 3)
    ico[i] = c.icon
    // scatter on a shell around the slot
    const a = R() * Math.PI * 2
    const b = Math.acos(2 * R() - 1)
    const rad = 90 + R() * 140
    scat.set([Math.sin(b) * Math.cos(a) * rad, Math.cos(b) * rad, Math.sin(b) * Math.sin(a) * rad], i * 3)
    dly[i] = R() * 0.55 + (c.y / (GRID * CELL) + 0.5) * 0.25 // builds bottom → top
  })

  const mat = new THREE.MeshStandardMaterial({ roughness: 0.46, metalness: 0.08 })
  mat.onBeforeCompile = (sh) => {
    sh.fragmentShader = sh.fragmentShader.replace(
      '#include <emissivemap_fragment>',
      '#include <emissivemap_fragment>\n totalEmissiveRadiance = diffuseColor.rgb * 0.28;'
    )
  }
  const mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), mat, N)
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
  mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(N * 3), 3)
  mesh.instanceColor.setUsage(THREE.DynamicDrawUsage)
  mesh.frustumCulled = false
  scene.add(mesh)
  scene.add(new THREE.AmbientLight(0xffffff, 0.85))
  const key = new THREE.DirectionalLight(0xfff2e8, 2.4)
  key.position.set(-0.6, 1, 1.4)
  scene.add(key)
  const fill = new THREE.DirectionalLight(0xffb27a, 0.7)
  fill.position.set(1, -0.4, 0.8)
  scene.add(fill)

  // ── Per-icon state ──────────────────────────────────────────────────────
  const cards = Array.from(grid.querySelectorAll('.card'))
  const slots = cards.map((c) => c.querySelector('.card-icon'))
  const count = Math.min(cards.length, ICONS.length)
  const st = Array.from({ length: count }, (_, i) => ({
    t0: -1, // time the card became visible
    hover: 0,
    hoverGoal: 0,
    spin: 0,
    spinGoal: 0,
    phase: i * 1.7,
  }))

  const burst = (i) => {
    const s = st[i]
    if (!s || s.t0 < 0) return
    s.spinGoal += Math.PI * 2
    for (let k = 0; k < N; k++) {
      if (ico[k] !== i) continue
      const k3 = k * 3
      const dx = base[k3]
      const dy = base[k3 + 1]
      const dz = base[k3 + 2] + (R() - 0.5) * CELL
      const l = Math.hypot(dx, dy, dz) + 0.001
      const f = 220 + R() * 320
      vel[k3] += (dx / l) * f
      vel[k3 + 1] += (dy / l) * f
      vel[k3 + 2] += (dz / l) * f + 120
    }
  }
  const cleanups = []
  cards.slice(0, count).forEach((card, i) => {
    const enter = () => {
      st[i].hoverGoal = 1
      burst(i)
    }
    const leave = () => (st[i].hoverGoal = 0)
    card.addEventListener('pointerenter', enter)
    card.addEventListener('pointerleave', leave)
    cleanups.push(() => {
      card.removeEventListener('pointerenter', enter)
      card.removeEventListener('pointerleave', leave)
    })
  })

  // reveal when each card scrolls into view
  let t = 0
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (!e.isIntersecting) return
        const i = cards.indexOf(e.target)
        if (i >= 0 && i < count && st[i].t0 < 0) st[i].t0 = t + (i % 3) * 0.12
      }),
    { threshold: 0.3 }
  )
  cards.slice(0, count).forEach((c) => io.observe(c))
  if (reduced) st.forEach((s) => (s.t0 = -100))

  // ── Layout ──────────────────────────────────────────────────────────────
  const size = { w: 1, h: 1 }
  function layout() {
    size.w = Math.max(1, host.clientWidth)
    size.h = Math.max(1, host.clientHeight)
    renderer.setSize(size.w, size.h, false)
    camera.left = -size.w / 2
    camera.right = size.w / 2
    camera.top = size.h / 2
    camera.bottom = -size.h / 2
    camera.updateProjectionMatrix()
  }
  layout()

  const ptr = { x: -9999, y: -9999 }
  const onMove = (e) => {
    ptr.x = e.clientX
    ptr.y = e.clientY
  }
  window.addEventListener('pointermove', onMove, { passive: true })

  // ── Frame ───────────────────────────────────────────────────────────────
  const arr = mesh.instanceMatrix.array
  const carr = mesh.instanceColor.array
  let raf = 0
  let running = false
  let last = 0
  const pose = Array.from({ length: count }, () => ({ cx: 0, cy: 0, m: new Float32Array(9), vis: false }))

  function step(dt) {
    t += reduced ? 0 : dt
    const hr = host.getBoundingClientRect()
    const spring = Math.min(dt, 0.04)

    for (let i = 0; i < count; i++) {
      const s = st[i]
      const slot = slots[i]
      const p = pose[i]
      if (!slot) {
        p.vis = false
        continue
      }
      const r = slot.getBoundingClientRect()
      p.cx = r.left + r.width / 2 - hr.left - size.w / 2
      p.cy = size.h / 2 - (r.top + r.height / 2 - hr.top)
      s.hover = lerp(s.hover, s.hoverGoal, 1 - Math.exp(-dt * 8))
      s.spin = lerp(s.spin, s.spinGoal, 1 - Math.exp(-dt * 3.2))
      const dx = clamp((ptr.x - (r.left + r.width / 2)) / 420, -1, 1)
      const dy = clamp((ptr.y - (r.top + r.height / 2)) / 420, -1, 1)
      const ry = Math.sin(t * 0.7 + s.phase) * 0.32 + dx * 0.55 + s.spin
      const rx = -0.12 + Math.cos(t * 0.55 + s.phase) * 0.07 + dy * 0.4
      const cy = Math.cos(ry)
      const sy = Math.sin(ry)
      const cx = Math.cos(rx)
      const sx = Math.sin(rx)
      const m = p.m
      m[0] = cy
      m[1] = sx * sy
      m[2] = -cx * sy
      m[3] = 0
      m[4] = cx
      m[5] = sx
      m[6] = sy
      m[7] = -sx * cy
      m[8] = cx * cy
      p.vis = s.t0 !== -1 // hidden until its card has scrolled into view
    }

    for (let k = 0; k < N; k++) {
      const i = ico[k]
      const k3 = k * 3
      const q = k * 16
      const s = st[i]
      const p = pose[i]
      if (!s || !p || !p.vis || (s.t0 >= 0 && t < s.t0)) {
        arr[q] = arr[q + 5] = arr[q + 10] = 0
        arr[q + 15] = 1
        continue
      }
      const e = reduced ? 1 : easeOut(clamp((t - s.t0 - dly[k]) / 1.15))
      if (e <= 0) {
        arr[q] = arr[q + 5] = arr[q + 10] = 0
        arr[q + 15] = 1
        continue
      }
      // spring-back for the hover burst
      vel[k3] += (-off[k3] * 15 - vel[k3] * 4.4) * spring
      vel[k3 + 1] += (-off[k3 + 1] * 15 - vel[k3 + 1] * 4.4) * spring
      vel[k3 + 2] += (-off[k3 + 2] * 15 - vel[k3 + 2] * 4.4) * spring
      off[k3] += vel[k3] * spring
      off[k3 + 1] += vel[k3 + 1] * spring
      off[k3 + 2] += vel[k3 + 2] * spring

      const lx = lerp(scat[k3], base[k3], e) + off[k3]
      const ly = lerp(scat[k3 + 1], base[k3 + 1], e) + off[k3 + 1]
      const lz = lerp(scat[k3 + 2], base[k3 + 2], e) + off[k3 + 2]
      const m = p.m
      const px = m[0] * lx + m[3] * ly + m[6] * lz
      const py = m[1] * lx + m[4] * ly + m[7] * lz
      const pz = m[2] * lx + m[5] * ly + m[8] * lz
      const sc = CELL * 0.92 * e * (1 + s.hover * 0.04)

      arr[q] = m[0] * sc
      arr[q + 1] = m[1] * sc
      arr[q + 2] = m[2] * sc
      arr[q + 3] = 0
      arr[q + 4] = m[3] * sc
      arr[q + 5] = m[4] * sc
      arr[q + 6] = m[5] * sc
      arr[q + 7] = 0
      arr[q + 8] = m[6] * sc
      arr[q + 9] = m[7] * sc
      arr[q + 10] = m[8] * sc
      arr[q + 11] = 0
      arr[q + 12] = p.cx + px
      arr[q + 13] = p.cy + py
      arr[q + 14] = pz
      arr[q + 15] = 1

      // diagonal shine sweeping across the icon + a hover glow
      const scan = ((t * 70 + i * 55) % 300) - 100
      const boost = 1 + 0.55 * Math.max(0, 1 - Math.abs(base[k3] - base[k3 + 1] - scan + 40) / 18) + s.hover * 0.22
      carr[k3] = col[k3] * boost
      carr[k3 + 1] = col[k3 + 1] * boost
      carr[k3 + 2] = col[k3 + 2] * boost
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
  const vio = new IntersectionObserver(
    ([e]) => {
      inView = e.isIntersecting
      inView && !document.hidden ? start() : stop()
    },
    { rootMargin: '10% 0px 10% 0px' }
  )
  vio.observe(grid)
  const onVis = () => (document.hidden || !inView ? stop() : start())
  document.addEventListener('visibilitychange', onVis)
  const ro = new ResizeObserver(() => {
    layout()
    if (!running) step(0)
  })
  ro.observe(host)

  grid.classList.add('has-3d')
  step(0)

  return () => {
    stop()
    io.disconnect()
    vio.disconnect()
    ro.disconnect()
    cleanups.forEach((f) => f())
    document.removeEventListener('visibilitychange', onVis)
    window.removeEventListener('pointermove', onMove)
    grid.classList.remove('has-3d')
    disposeTree(scene)
    renderer.dispose()
    renderer.forceContextLoss()
    canvas.remove()
  }
}

export default function ServiceIcons({ gridRef }) {
  const hostRef = useRef(null)
  useEffect(() => {
    const host = hostRef.current
    const grid = gridRef.current
    if (!host || !grid) return
    let dispose = () => {}
    try {
      dispose = init(host, grid)
    } catch (err) {
      console.warn('[services] WebGL icons unavailable:', err)
    }
    return () => dispose()
  }, [gridRef])
  return <div className="svc-host" ref={hostRef} aria-hidden="true" />
}

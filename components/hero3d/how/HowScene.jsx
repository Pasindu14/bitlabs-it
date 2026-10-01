'use client'
// "How we work" — an isometric dusk-black scene: four plots on a wet reflective floor,
// joined by glowing orange arcs. As you scroll the camera travels plot to plot and each
// one comes alive:
//   01 Discover  an empty plot: scanner sweep, radar pulses, idea-cubes hanging in the air
//   02 Design    the building drawn as an orange blueprint, floor by floor, with dimensions
//   03 Build     solid cubes dropping into place along hairlines, scaffold rising
//   04 Deploy    the finished tower, windows lighting up, a launch beam from the roof
// Everything is procedural; scroll position fully determines the state (scrub both ways).
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { Reflector } from 'three/examples/jsm/objects/Reflector.js'
import { VOXELS, TIERS, CELL, LAYERS } from './mass'
import { PLOTS, timeline, ss } from './timeline'
import { clamp, lerp, rng, disposeTree } from '../utils'
import { glowTexture } from '../textures'

const SLAB = 7.6
const ORANGE = new THREE.Color('#ff4d00')
const NEON = new THREE.Color('#ff5a1a').multiplyScalar(1.5)
const BG = 0x070605
const easeOut = (x) => 1 - Math.pow(1 - clamp(x), 3)

function roundedRect(half, r, y, seg = 8) {
  const pts = []
  const c = half - r
  const corners = [
    [c, c, 0],
    [-c, c, Math.PI / 2],
    [-c, -c, Math.PI],
    [c, -c, Math.PI * 1.5],
  ]
  corners.forEach(([cx, cz, a0]) => {
    for (let i = 0; i <= seg; i++) {
      const a = a0 + (i / seg) * (Math.PI / 2)
      pts.push(new THREE.Vector3(cx + Math.cos(a) * r, y, cz + Math.sin(a) * r))
    }
  })
  return new THREE.CatmullRomCurve3(pts, true, 'catmullrom', 0.05)
}

function lineGeo(arr) {
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(arr), 3))
  return g
}

const wx = (v) => (v.x + 0.5) * CELL
const wy = (v) => 0.55 + (v.y + 0.5) * CELL
const wz = (v) => (v.z + 0.5) * CELL

function init(host, stage, root, state, labelEls) {
  const coarse = window.matchMedia('(pointer: coarse)').matches
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const cores = navigator.hardwareConcurrency || 4
  const mem = navigator.deviceMemory || 8
  const low = (coarse && (cores <= 6 || window.innerWidth < 760)) || mem <= 2

  const canvas = document.createElement('canvas')
  canvas.className = 'hero-canvas'
  canvas.setAttribute('aria-hidden', 'true')
  host.appendChild(canvas)

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !low, powerPreference: 'high-performance' })
  const dpr = Math.min(window.devicePixelRatio || 1, low ? 1 : 1.5)
  renderer.setPixelRatio(dpr)
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.12
  renderer.setClearColor(BG, 1)

  const scene = new THREE.Scene()
  scene.background = new THREE.Color(BG)
  scene.fog = new THREE.FogExp2(BG, 0.0105)
  const camera = new THREE.PerspectiveCamera(28, 1, 0.5, 400)

  scene.add(new THREE.AmbientLight(0xffe2cc, 0.55))
  const key = new THREE.DirectionalLight(0xffd6b8, 1.7)
  key.position.set(-12, 20, 14)
  scene.add(key)
  const rim = new THREE.DirectionalLight(0xff4d00, 1.1)
  rim.position.set(16, 7, -14)
  scene.add(rim)

  // ── Materials ───────────────────────────────────────────────────────────
  const slabMat = new THREE.MeshStandardMaterial({ color: 0x1a1411, metalness: 0.6, roughness: 0.4 })
  const insetMat = new THREE.MeshStandardMaterial({ color: 0x0b0908, metalness: 0.5, roughness: 0.55 })
  const cubeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7, metalness: 0.04 })
  const ideaMat = new THREE.MeshStandardMaterial({ color: 0xf0e2cc, emissive: 0xff4d00, emissiveIntensity: 0.28, roughness: 0.6 })
  const neon = new THREE.MeshBasicMaterial({ color: NEON, toneMapped: false })
  const haloMat = new THREE.MeshBasicMaterial({ color: ORANGE, transparent: true, opacity: 0.13, blending: THREE.AdditiveBlending, depthWrite: false })
  const lineMat = (o) => new THREE.LineBasicMaterial({ color: ORANGE.clone().multiplyScalar(1.5), transparent: true, opacity: o, toneMapped: false })
  const glowTex = glowTexture()
  const glowSprite = (s, o = 1) => {
    const sp = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: glowTex, color: NEON, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: o, toneMapped: false })
    )
    sp.scale.setScalar(s)
    return sp
  }

  // ── Floor: mirror + dark veil + faint grid ──────────────────────────────
  let reflector = null
  if (!low) {
    reflector = new Reflector(new THREE.PlaneGeometry(420, 420), {
      color: 0x6a6a6a,
      textureWidth: Math.floor(window.innerWidth * dpr * 0.5),
      textureHeight: Math.floor(window.innerHeight * dpr * 0.5),
      clipBias: 0.003,
    })
    reflector.rotation.x = -Math.PI / 2
    scene.add(reflector)
  }
  const veil = new THREE.Mesh(
    new THREE.PlaneGeometry(420, 420),
    new THREE.MeshBasicMaterial({ color: 0x050403, transparent: true, opacity: low ? 1 : 0.74, depthWrite: false })
  )
  veil.rotation.x = -Math.PI / 2
  veil.position.y = 0.004
  scene.add(veil)
  const grid = new THREE.GridHelper(200, 100, 0x4a2412, 0x2a150b)
  grid.position.y = 0.01
  grid.material.transparent = true
  grid.material.opacity = 0.45
  scene.add(grid)

  // ── Plots ───────────────────────────────────────────────────────────────
  const plots = PLOTS.map(([px, pz], i) => {
    const g = new THREE.Group()
    g.position.set(px, 0, pz)
    const slab = new THREE.Mesh(new THREE.BoxGeometry(SLAB, 0.5, SLAB), slabMat)
    slab.position.y = 0.25
    const inset = new THREE.Mesh(new THREE.BoxGeometry(SLAB - 0.5, 0.06, SLAB - 0.5), insetMat)
    inset.position.y = 0.53
    g.add(slab, inset)
    const curve = roundedRect(SLAB / 2 - 0.1, 0.55, 0.57)
    g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 160, 0.05, 6, true), neon))
    g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 160, 0.2, 6, true), haloMat))
    const light = new THREE.PointLight(0xff6a2a, 0, 16, 2)
    light.position.set(0, 4.5, 0)
    g.add(light)
    scene.add(g)
    return { g, light, i }
  })

  // 01 · Discover ──────────────────────────────────────────────────────────
  const discover = (() => {
    const P = plots[0].g
    const R = rng(11)
    const grid = []
    for (let k = -5; k <= 5; k++) {
      const v = k * CELL
      grid.push(-3.5, 0.6, v, 3.5, 0.6, v, v, 0.6, -3.5, v, 0.6, 3.5)
    }
    P.add(new THREE.LineSegments(lineGeo(grid), lineMat(0.16)))
    const br = []
    ;[[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([sx, sz]) => {
      const x = sx * 2.3
      const z = sz * 2.3
      br.push(x, 0.62, z, x - sx * 0.8, 0.62, z, x, 0.62, z, x, 0.62, z - sz * 0.8)
    })
    P.add(new THREE.LineSegments(lineGeo(br), lineMat(0.95)))

    const N = 28
    const ideas = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), ideaMat, N)
    const data = Array.from({ length: N }, () => {
      const a = R() * Math.PI * 2
      const r = Math.sqrt(R()) * 2.7
      return { x: Math.cos(a) * r, z: Math.sin(a) * r, y: 1.7 + R() * 3.8, s: 0.16 + R() * 0.2, ph: R() * 6.28, d: R() }
    })
    P.add(ideas)
    const hair = new THREE.LineSegments(lineGeo(new Float32Array(N * 6)), lineMat(0.3))
    P.add(hair)
    const m = new THREE.Matrix4()
    const q = new THREE.Quaternion()
    const e = new THREE.Euler()

    const scanTex = (() => {
      const c = document.createElement('canvas')
      c.width = 8
      c.height = 128
      const x = c.getContext('2d')
      const gr = x.createLinearGradient(0, 0, 0, 128)
      gr.addColorStop(0, 'rgba(255,77,0,0)')
      gr.addColorStop(0.85, 'rgba(255,100,30,0.55)')
      gr.addColorStop(1, 'rgba(255,170,90,1)')
      x.fillStyle = gr
      x.fillRect(0, 0, 8, 128)
      return new THREE.CanvasTexture(c)
    })()
    const scan = new THREE.Mesh(
      new THREE.PlaneGeometry(SLAB - 1.4, 4.4),
      new THREE.MeshBasicMaterial({ map: scanTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false })
    )
    scan.rotation.y = Math.PI / 2
    scan.position.y = 0.6 + 2.2
    P.add(scan)
    const rings = [0, 1, 2].map(() => {
      const r = new THREE.Mesh(
        new THREE.RingGeometry(0.97, 1, 72),
        new THREE.MeshBasicMaterial({ color: NEON, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false })
      )
      r.rotation.x = -Math.PI / 2
      r.position.y = 0.62
      P.add(r)
      return r
    })

    return (t, g0) => {
      const g = 0.4 + 0.6 * g0
      const hp = hair.geometry.attributes.position.array
      data.forEach((d, i) => {
        const v = ss(0, 1, clamp(g * 1.5 - d.d * 0.5))
        const y = d.y + Math.sin(t * 0.8 + d.ph) * 0.16
        e.set(t * 0.3 + d.ph, t * 0.4 + d.ph, 0)
        q.setFromEuler(e)
        m.compose(new THREE.Vector3(d.x, y, d.z), q, new THREE.Vector3(d.s * v, d.s * v, d.s * v))
        ideas.setMatrixAt(i, m)
        hp[i * 6] = d.x
        hp[i * 6 + 1] = y - d.s * v * 0.5
        hp[i * 6 + 2] = d.z
        hp[i * 6 + 3] = d.x
        hp[i * 6 + 4] = v > 0.01 ? 0.6 : y
        hp[i * 6 + 5] = d.z
      })
      ideas.instanceMatrix.needsUpdate = true
      hair.geometry.attributes.position.needsUpdate = true
      scan.position.x = Math.sin(t * 0.9) * 3.1
      scan.material.opacity = 0.35 + 0.5 * g
      rings.forEach((r, i) => {
        const ph = (t * 0.32 + i / 3) % 1
        r.scale.setScalar(0.4 + ph * 3.7)
        r.material.opacity = (1 - ph) * 0.55 * g
      })
    }
  })()

  // 02 · Design (blueprint) ────────────────────────────────────────────────
  const design = (() => {
    const P = plots[1].g
    const lm = lineMat(0.95)
    const ghost = new THREE.MeshBasicMaterial({ color: ORANGE, transparent: true, opacity: 0.06, blending: THREE.AdditiveBlending, depthWrite: false })
    const boxes = []
    TIERS.forEach((t) => {
      for (let y = t.y[0]; y < t.y[1]; y++) {
        const w = (t.x[1] - t.x[0]) * CELL
        const d = (t.z[1] - t.z[0]) * CELL
        const geo = new THREE.BoxGeometry(w, CELL, d)
        const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo), lm)
        const fill = new THREE.Mesh(geo, ghost)
        const cx = ((t.x[0] + t.x[1]) / 2) * CELL
        const cz = ((t.z[0] + t.z[1]) / 2) * CELL
        const grp = new THREE.Group()
        grp.add(edges, fill)
        grp.position.set(cx, 0.55 + y * CELL + CELL / 2, cz)
        P.add(grp)
        boxes.push({ grp, y, base: 0.55 + y * CELL })
      }
    })
    // dimension lines
    const H = LAYERS * CELL
    const dim = []
    const x0 = -2.1
    const x1 = 2.1
    const zf = 2.55
    dim.push(x0, 0.6, zf, x1, 0.6, zf, x0, 0.5, zf, x0, 0.8, zf, x1, 0.5, zf, x1, 0.8, zf)
    dim.push(2.75, 0.6, 2.1, 2.75, 0.6 + H, 2.1, 2.65, 0.6, 2.1, 2.85, 0.6, 2.1, 2.65, 0.6 + H, 2.1, 2.85, 0.6 + H, 2.1)
    dim.push(-2.1, 0.6, -2.6, 2.1, 0.6, -2.6)
    const dimLines = new THREE.LineSegments(lineGeo(dim), lineMat(0.8))
    P.add(dimLines)
    // compass ring with ticks
    const comp = new THREE.Group()
    const ringPts = []
    for (let i = 0; i <= 96; i++) {
      const a = (i / 96) * Math.PI * 2
      ringPts.push(Math.cos(a) * 3.35, 0.6, Math.sin(a) * 3.35)
    }
    const ringGeo = lineGeo(ringPts)
    comp.add(new THREE.Line(ringGeo, lineMat(0.35)))
    const ticks = []
    for (let i = 0; i < 48; i++) {
      const a = (i / 48) * Math.PI * 2
      const r0 = 3.35
      const r1 = i % 6 === 0 ? 3.7 : 3.5
      ticks.push(Math.cos(a) * r0, 0.6, Math.sin(a) * r0, Math.cos(a) * r1, 0.6, Math.sin(a) * r1)
    }
    comp.add(new THREE.LineSegments(lineGeo(ticks), lineMat(0.5)))
    P.add(comp)

    return (t, g) => {
      boxes.forEach((b) => {
        const v = ss(0, 1, clamp(g * (LAYERS + 1.4) - b.y))
        b.grp.scale.y = Math.max(0.001, v)
        b.grp.position.y = b.base + (CELL * Math.max(0.001, v)) / 2
        b.grp.visible = v > 0.002
      })
      dimLines.material.opacity = 0.8 * ss(0.3, 0.9, g)
      comp.rotation.y = t * 0.12
      comp.children.forEach((c) => (c.material.opacity = 0.2 + 0.4 * g))
    }
  })()

  // 03 · Build (cubes drop in) ─────────────────────────────────────────────
  const build = (() => {
    const P = plots[2].g
    const vox = VOXELS.filter((v) => !v.hole)
    const M = vox.length
    const inst = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), cubeMat, M)
    inst.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(M * 3), 3)
    P.add(inst)
    const hair = new THREE.LineSegments(lineGeo(new Float32Array(M * 6)), lineMat(0.35))
    P.add(hair)
    const R = rng(77)
    const info = vox.map((v) => ({ x: wx(v), y: wy(v), z: wz(v), yy: v.y + (v.r - 0.5) * 0.9, r: v.r }))
    const tint = new THREE.Color()
    const m = new THREE.Matrix4()
    const sc = new THREE.Vector3()
    const pos = new THREE.Vector3()
    const idQ = new THREE.Quaternion()

    // cubes waiting overhead
    const K = 22
    const wait = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), ideaMat, K)
    const wd = Array.from({ length: K }, () => ({ x: (R() - 0.5) * 6, z: (R() - 0.5) * 6, y: 8 + R() * 3.5, s: 0.16 + R() * 0.2, ph: R() * 6.28 }))
    P.add(wait)
    const wHair = new THREE.LineSegments(lineGeo(new Float32Array(K * 6)), lineMat(0.25))
    P.add(wHair)

    // scaffold: corner posts + a ring per finished floor
    const scaffoldMax = (LAYERS + 2) * 8 + 8
    const scaffold = new THREE.LineSegments(lineGeo(new Float32Array(scaffoldMax * 6)), lineMat(0.7))
    scaffold.frustumCulled = false
    P.add(scaffold)

    return (t, g, near = 1) => {
      const L = g * (LAYERS + 1.2)
      const hp = hair.geometry.attributes.position.array
      const ca = inst.instanceColor.array
      for (let i = 0; i < M; i++) {
        const b = info[i]
        const f = clamp((L - (b.yy - 2.6)) / 2.6)
        const e = easeOut(f)
        const s = f <= 0 ? 0 : CELL * 0.94 * Math.min(1, f * 3)
        pos.set(b.x, b.y + (1 - e) * 6.5, b.z)
        sc.set(s, s, s)
        m.compose(pos, idQ, sc)
        inst.setMatrixAt(i, m)
        // freshly dropped cubes glow orange, then settle to cream
        const hot = Math.pow(1 - f, 1.4)
        tint.setRGB(0.78 + b.r * 0.14, 0.7 + b.r * 0.1, 0.58 + b.r * 0.08)
        tint.lerp(NEON, hot * 0.55)
        ca[i * 3] = tint.r
        ca[i * 3 + 1] = tint.g
        ca[i * 3 + 2] = tint.b
        const falling = f > 0 && f < 1
        hp[i * 6] = b.x
        hp[i * 6 + 1] = pos.y + s * 0.5
        hp[i * 6 + 2] = b.z
        hp[i * 6 + 3] = b.x
        hp[i * 6 + 4] = falling ? pos.y + 10 : pos.y + s * 0.5
        hp[i * 6 + 5] = b.z
      }
      inst.instanceMatrix.needsUpdate = true
      inst.instanceColor.needsUpdate = true
      hair.geometry.attributes.position.needsUpdate = true

      const wp = wHair.geometry.attributes.position.array
      const leave = (1 - ss(0.55, 1, g)) * ss(0.25, 0.75, near)
      wd.forEach((d, i) => {
        const y = d.y + Math.sin(t * 0.7 + d.ph) * 0.18
        const s = d.s * leave
        sc.set(s, s, s)
        pos.set(d.x, y, d.z)
        m.compose(pos, idQ, sc)
        wait.setMatrixAt(i, m)
        wp[i * 6] = d.x
        wp[i * 6 + 1] = y
        wp[i * 6 + 2] = d.z
        wp[i * 6 + 3] = d.x
        wp[i * 6 + 4] = y + 6 * leave
        wp[i * 6 + 5] = d.z
      })
      wait.instanceMatrix.needsUpdate = true
      wHair.geometry.attributes.position.needsUpdate = true

      // scaffold
      const sp = scaffold.geometry.attributes.position.array
      let n = 0
      const floors = Math.floor(L)
      const half = 2.55
      const top = 0.6 + clamp(L, 0, LAYERS) * CELL
      ;[[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([sx, sz]) => {
        sp.set([sx * half, 0.6, sz * half, sx * half, top + 0.4, sz * half], n * 6)
        n++
      })
      for (let j = 1; j <= Math.min(floors, LAYERS) && n + 4 <= scaffoldMax; j += 2) {
        const y = 0.6 + j * CELL
        const c = [[-1, -1], [1, -1], [1, 1], [-1, 1]]
        for (let k = 0; k < 4; k++) {
          const a = c[k]
          const b = c[(k + 1) % 4]
          sp.set([a[0] * half, y, a[1] * half, b[0] * half, y, b[1] * half], n * 6)
          n++
        }
      }
      scaffold.geometry.setDrawRange(0, n * 2)
      scaffold.geometry.attributes.position.needsUpdate = true
      scaffold.material.opacity = 0.7 * (1 - ss(0.92, 1, g) * 0.7)
    }
  })()

  // 04 · Deploy (finished, lit, launch beam) ───────────────────────────────
  const deploy = (() => {
    const P = plots[3].g
    const R = rng(404)
    const M = VOXELS.length
    const inst = new THREE.InstancedMesh(new THREE.BoxGeometry(CELL * 0.96, CELL * 0.96, CELL * 0.96), cubeMat, M)
    inst.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(M * 3), 3)
    const m = new THREE.Matrix4()
    const c = new THREE.Color()
    VOXELS.forEach((v, i) => {
      m.makeTranslation(wx(v), wy(v), wz(v))
      inst.setMatrixAt(i, m)
      c.setRGB(0.5 + v.r * 0.1, 0.46 + v.r * 0.08, 0.4 + v.r * 0.06)
      inst.setColorAt(i, c)
    })
    P.add(inst)

    // windows on exposed faces
    const wins = []
    VOXELS.forEach((v) => {
      ;[['px', 1, 0, Math.PI / 2], ['nx', -1, 0, -Math.PI / 2], ['pz', 0, 1, 0], ['nz', 0, -1, Math.PI]].forEach(([k, dx, dz, ry]) => {
        if (v.sides[k] && R() < 0.62) wins.push({ x: wx(v) + dx * (CELL / 2 + 0.004), y: wy(v), z: wz(v) + dz * (CELL / 2 + 0.004), ry, h: (v.y + 0.5) / LAYERS, n: R() })
      })
    })
    const winMat = new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false, side: THREE.DoubleSide })
    const win = new THREE.InstancedMesh(new THREE.PlaneGeometry(CELL * 0.62, CELL * 0.58), winMat, wins.length)
    win.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(wins.length * 3), 3)
    const q = new THREE.Quaternion()
    const e = new THREE.Euler()
    wins.forEach((w, i) => {
      e.set(0, w.ry, 0)
      q.setFromEuler(e)
      m.compose(new THREE.Vector3(w.x, w.y, w.z), q, new THREE.Vector3(1, 1, 1))
      win.setMatrixAt(i, m)
    })
    P.add(win)

    // rooftop mast + beam + sparks
    const roofY = 0.55 + LAYERS * CELL
    const roofX = CELL * 0.5 // centre of the top tier
    const roofZ = CELL * 0.5
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.07, 1.6, 8), neon)
    mast.position.set(roofX, roofY + 0.8, roofZ)
    P.add(mast)
    const beamMat = new THREE.MeshBasicMaterial({ color: NEON, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false })
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.34, 22, 20, 1, true), beamMat)
    beam.position.set(roofX, roofY + 11.4, roofZ)
    P.add(beam)
    const beacon = glowSprite(2.2, 0)
    beacon.position.set(roofX, roofY + 1.7, roofZ)
    P.add(beacon)
    const sparkN = 80
    const sparks = new THREE.Points(
      new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(new Float32Array(sparkN * 3), 3)),
      new THREE.PointsMaterial({ map: glowTex, color: NEON, size: 0.34, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true, toneMapped: false })
    )
    sparks.frustumCulled = false
    const sd = Array.from({ length: sparkN }, () => ({ a: R() * 6.28, r: R() * 0.5, v: 1.2 + R() * 2.4, o: R() * 10 }))
    P.add(sparks)
    // launch rings along the beam + a big pulse across the slab
    const launchRings = [0, 1, 2, 3].map(() => {
      const r = new THREE.Mesh(
        new THREE.RingGeometry(0.94, 1, 56),
        new THREE.MeshBasicMaterial({ color: NEON, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false })
      )
      r.rotation.x = -Math.PI / 2
      P.add(r)
      return r
    })

    return (t, g) => {
      // windows light up floor by floor
      const ca = win.instanceColor.array
      wins.forEach((w, i) => {
        const on = ss(0, 0.12, g * 1.15 - w.h * 0.95 + (w.n - 0.5) * 0.12)
        const flick = 0.82 + Math.sin(t * (1.3 + w.n * 2) + w.n * 20) * 0.1
        const k = (0.04 + on * (0.8 + w.n * 1.1)) * (on > 0.5 ? flick : 1)
        ca[i * 3] = 1.0 * k * 1.7
        ca[i * 3 + 1] = (0.38 + w.n * 0.18) * k * 1.7
        ca[i * 3 + 2] = 0.05 * k * 1.7
      })
      win.instanceColor.needsUpdate = true

      const launch = ss(0.55, 1, g)
      beamMat.opacity = (0.16 + Math.sin(t * 3) * 0.04) * launch
      beacon.material.opacity = (0.8 + Math.sin(t * 4) * 0.2) * launch
      mast.visible = g > 0.1
      const sp = sparks.geometry.attributes.position.array
      sd.forEach((s, i) => {
        const h = ((t * s.v + s.o) % 14) + 0.5
        sp[i * 3] = roofX + Math.cos(s.a + t * 0.6) * (0.1 + s.r * (1 + h * 0.05))
        sp[i * 3 + 1] = roofY + 1.6 + h
        sp[i * 3 + 2] = roofZ + Math.sin(s.a + t * 0.6) * (0.1 + s.r * (1 + h * 0.05))
      })
      sparks.geometry.attributes.position.needsUpdate = true
      sparks.material.opacity = 0.9 * launch
      launchRings.forEach((r, i) => {
        const ph = (t * 0.3 + i / 4) % 1
        if (i < 2) {
          // slab pulses
          r.position.set(0, 0.62, 0)
          r.rotation.x = -Math.PI / 2
          r.scale.setScalar(1 + ph * 6)
          r.material.opacity = (1 - ph) * 0.45 * launch
        } else {
          // rings climbing the beam
          r.position.set(roofX, roofY + 1.8 + ph * 12, roofZ)
          r.scale.setScalar(0.35 + ph * 0.8)
          r.material.opacity = (1 - ph) * 0.6 * launch
        }
      })
    }
  })()
  const updaters = [discover, design, build, deploy]

  // ── One continuous line: runs across every plot's floor and arcs between them ──
  // A single centripetal Catmull-Rom spline through well-spaced waypoints (no loops, no kinks),
  // drawn progressively with the scroll like a pen that never lifts.
  const LANE_Z = 2.95 // along the front edge of each slab, in front of the building
  const LY = 0.62
  const pts = []
  const mark = { mid: [], in: [] }
  pts.push(new THREE.Vector3(PLOTS[0][0] - SLAB / 2 - 3.4, LY, PLOTS[0][1] + LANE_Z))
  PLOTS.forEach(([px, pz], k) => {
    pts.push(new THREE.Vector3(px - 3.45, LY, pz + LANE_Z))
    mark.in[k] = pts.length - 1
    pts.push(new THREE.Vector3(px, LY, pz + LANE_Z))
    mark.mid[k] = pts.length - 1
    const out = new THREE.Vector3(px + 3.45, LY, pz + LANE_Z)
    pts.push(out)
    if (k < PLOTS.length - 1) {
      const nIn = new THREE.Vector3(PLOTS[k + 1][0] - 3.45, LY, PLOTS[k + 1][1] + LANE_Z)
      const dz = nIn.z - out.z
      pts.push(out.clone().add(new THREE.Vector3(1.7, 1.0, dz * 0.12))) // lift-off
      pts.push(out.clone().add(nIn).multiplyScalar(0.5).setY(4.5)) // apex
      pts.push(nIn.clone().add(new THREE.Vector3(-1.7, 1.0, -dz * 0.12))) // approach
    }
  })
  pts.push(pts[pts.length - 1].clone().add(new THREE.Vector3(2.4, 0, 0)))
  const path = new THREE.CatmullRomCurve3(pts, false, 'centripetal')
  const LDIV = 4000
  const lens = path.getLengths(LDIV)
  const totalLen = lens[LDIV]
  // control-point index → arc-length fraction
  const uOf = (i) => lens[Math.round((i / (pts.length - 1)) * LDIV)] / totalLen
  const TUB = 1100
  const lineCore = new THREE.TubeGeometry(path, TUB, 0.055, 8, false)
  const lineHalo = new THREE.TubeGeometry(path, TUB, 0.22, 8, false)
  scene.add(new THREE.Mesh(lineCore, neon), new THREE.Mesh(lineHalo, haloMat))
  const lineHead = glowSprite(1.7, 0)
  const linePulses = [0, 1, 2].map(() => glowSprite(0.95, 0))
  scene.add(lineHead, ...linePulses)
  // scroll position → how far the pen has travelled (piecewise linear, so scroll speed = pen speed)
  const stops = [[0, 0]]
  PLOTS.forEach((_, k) => {
    if (k > 0) stops.push([k - 0.05, uOf(mark.in[k])])
    stops.push([k + 0.45, uOf(mark.mid[k])])
  })
  stops.push([4, 1])
  const headAt = (sv) => {
    for (let i = 1; i < stops.length; i++) {
      if (sv <= stops[i][0]) {
        const [s0, u0] = stops[i - 1]
        const [s1, u1] = stops[i]
        return lerp(u0, u1, (sv - s0) / (s1 - s0))
      }
    }
    return 1
  }

  // ── Atmosphere: drifting sparks ─────────────────────────────────────────
  const AN = low ? 90 : 220
  const R2 = rng(9)
  const ad = Array.from({ length: AN }, () => ({ x: (R2() - 0.5) * 60, y: R2() * 11, z: (R2() - 0.5) * 30, v: 0.1 + R2() * 0.35, ph: R2() * 6.28 }))
  const atmos = new THREE.Points(
    new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(new Float32Array(AN * 3), 3)),
    new THREE.PointsMaterial({ map: glowTex, color: NEON, size: 0.2, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })
  )
  atmos.frustumCulled = false
  scene.add(atmos)

  // ── Layout / camera ─────────────────────────────────────────────────────
  const view = { w: 1, h: 1, portrait: false, focus: 24, over: 70 }
  function layout() {
    view.w = Math.max(1, stage.clientWidth)
    view.h = Math.max(1, stage.clientHeight)
    renderer.setSize(view.w, view.h, false)
    view.portrait = view.w < 820
    camera.fov = view.portrait ? 38 : 28
    camera.aspect = view.w / view.h
    const th = Math.tan((camera.fov * Math.PI) / 360)
    // desktop: fit the plot's height; portrait: fit its width
    view.focus = clamp(view.portrait ? 12.5 / (0.86 * 2 * th * camera.aspect) : 11 / (0.68 * 2 * th), 18, 70)
    view.over = clamp(40 / (2 * th * camera.aspect * 0.95), 40, 160)
    if (reflector) {
      const rt = reflector.getRenderTarget()
      rt.setSize(Math.floor(view.w * dpr * 0.5), Math.floor(view.h * dpr * 0.5))
    }
  }
  layout()

  const ptr = { x: 0, y: 0, tx: 0, ty: 0 }
  const onMove = (e) => {
    const r = stage.getBoundingClientRect()
    ptr.tx = clamp(((e.clientX - r.left) / r.width) * 2 - 1, -1, 1)
    ptr.ty = clamp(((e.clientY - r.top) / r.height) * 2 - 1, -1, 1)
  }
  window.addEventListener('pointermove', onMove, { passive: true })

  // ── Frame ───────────────────────────────────────────────────────────────
  let t = 0
  let raf = 0
  let running = false
  let last = 0
  const dirV = new THREE.Vector3(0.52, 0.5, 0.69).normalize()
  const tgt = new THREE.Vector3()
  const ovT = new THREE.Vector3(0, 1.4, 0)
  const proj = new THREE.Vector3()
  const lightBase = [26, 26, 30, 46]

  function step(dt) {
    t += reduced ? 0 : dt
    const tl = timeline(state.s)
    ptr.x = lerp(ptr.x, ptr.tx, 1 - Math.exp(-dt * 3))
    ptr.y = lerp(ptr.y, ptr.ty, 1 - Math.exp(-dt * 3))

    // camera
    const k = Math.min(2, Math.floor(tl.f))
    const fr = tl.f >= 3 ? 1 : tl.f - k
    const kk = tl.f >= 3 ? 2 : k
    const px = lerp(PLOTS[kk][0], PLOTS[kk + 1][0], fr)
    const pz = lerp(PLOTS[kk][1], PLOTS[kk + 1][1], fr)
    tgt.set(px, 3.1, pz).lerp(ovT, tl.ov)
    const dist = lerp(view.focus, view.over, tl.ov)
    const az = ptr.x * 0.12
    const d = dirV.clone()
    d.applyAxisAngle(new THREE.Vector3(0, 1, 0), az)
    d.y += ptr.y * -0.05
    camera.position.copy(tgt).addScaledVector(d, dist)
    camera.lookAt(tgt)
    const sx = view.portrait ? 0 : lerp(0.17, 0.09, tl.ov)
    const sy = view.portrait ? lerp(-0.03, 0, tl.ov) : 0
    camera.setViewOffset(view.w, view.h, -view.w * sx, -view.h * sy, view.w, view.h)
    camera.updateProjectionMatrix()
    camera.updateMatrixWorld()

    // plots
    updaters.forEach((u, i) => {
      const a = clamp(1 - Math.abs(tl.f - i), 0, 1)
      u(t, tl.g[i], a)
      plots[i].light.intensity = lightBase[i] * (0.15 + 0.85 * tl.g[i]) * (0.6 + 0.4 * Math.max(a, tl.ov))
    })

    // the line
    const u = clamp(headAt(tl.s), 0, 1)
    const n = Math.floor(u * TUB) * 8 * 6
    lineCore.setDrawRange(0, n)
    lineHalo.setDrawRange(0, n)
    const drawing = u > 0.0005 && u < 0.9995
    lineHead.material.opacity = drawing ? 1 : 0
    if (u > 0.0005) lineHead.position.copy(path.getPointAt(Math.min(u, 0.9999)))
    linePulses.forEach((p, j) => {
      if (u > 0.04) {
        const k = (t * 0.1 + j / linePulses.length) % 1
        p.position.copy(path.getPointAt(Math.min(k * u, 0.9999)))
        p.material.opacity = Math.sin(k * Math.PI) * 0.9
      } else p.material.opacity = 0
    })

    // atmosphere
    const ap = atmos.geometry.attributes.position.array
    ad.forEach((s, i) => {
      const y = (s.y + t * s.v) % 11
      ap[i * 3] = s.x + Math.sin(t * 0.3 + s.ph) * 0.6
      ap[i * 3 + 1] = y
      ap[i * 3 + 2] = s.z
    })
    atmos.geometry.attributes.position.needsUpdate = true

    // DOM labels hover above each plot
    labelEls.forEach((el, i) => {
      if (!el) return
      proj.set(PLOTS[i][0], 8.2, PLOTS[i][1]).project(camera)
      const x = (proj.x * 0.5 + 0.5) * view.w
      const y = (-proj.y * 0.5 + 0.5) * view.h
      const a = clamp(1 - Math.abs(tl.f - i) * 0.9, 0.0, 1)
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -100%)`
      el.style.opacity = proj.z < 1 ? String(Math.max(a, tl.ov * 0.9).toFixed(2)) : '0'
    })

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
    window.removeEventListener('pointermove', onMove)
    reflector?.dispose?.()
    disposeTree(scene)
    renderer.dispose()
    renderer.forceContextLoss()
    canvas.remove()
  }
}

export default function HowScene({ stageRef, rootRef, state, labelRefs }) {
  const hostRef = useRef(null)
  useEffect(() => {
    const host = hostRef.current
    const stage = stageRef.current
    const root = rootRef.current
    if (!host || !stage || !root) return
    let dispose = () => {}
    try {
      dispose = init(host, stage, root, state, labelRefs.current)
    } catch (err) {
      console.warn('[how] WebGL scene unavailable:', err)
    }
    return () => dispose()
  }, [stageRef, rootRef, state, labelRefs])
  return <div className="hero-scene" ref={hostRef} aria-hidden="true" />
}

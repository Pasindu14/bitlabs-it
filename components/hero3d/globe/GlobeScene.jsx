'use client'
// A calm dotted globe for the testimonials header: a sphere of fine dots, a pulsing node on
// Sri Lanka and a few thin arcs reaching out. It only sways gently and tilts a touch toward
// the pointer — deliberately quiet. (Dots are a lat/long lattice, not a geographic map; the
// other nodes are illustrative.)
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { clamp, lerp, disposeTree } from '../utils'

const R = 1
const SL = { lat: 6.93, lon: 79.85 } // Colombo
const OTHERS = [
  { lat: 51.5, lon: -0.12 },
  { lat: 25.2, lon: 55.3 },
  { lat: 1.35, lon: 103.8 },
  { lat: -33.9, lon: 151.2 },
  { lat: 40.7, lon: -74.0 },
  { lat: 19.07, lon: 72.87 },
]

const rad = (d) => (d * Math.PI) / 180
function ll(lat, lon, r = R) {
  const la = rad(lat)
  const lo = rad(lon)
  return new THREE.Vector3(Math.cos(la) * Math.sin(lo) * r, Math.sin(la) * r, Math.cos(la) * Math.cos(lo) * r)
}

function init(host, box) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const coarse = window.matchMedia('(pointer: coarse)').matches
  const canvas = document.createElement('canvas')
  canvas.className = 'globe-canvas'
  canvas.setAttribute('aria-hidden', 'true')
  host.appendChild(canvas)

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 2))
  renderer.setClearColor(0x000000, 0)
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50)
  camera.position.set(0, 0, 5.2)

  const tilt = new THREE.Group() // fixed viewing angle + pointer tilt
  const globe = new THREE.Group() // sways around Y
  tilt.add(globe)
  scene.add(tilt)

  // hides everything behind the sphere (depth only)
  const occluder = new THREE.Mesh(new THREE.SphereGeometry(R * 0.992, 48, 32), new THREE.MeshBasicMaterial({ colorWrite: false }))
  globe.add(occluder)

  // ── dots: Fibonacci lattice ─────────────────────────────────────────────
  const N = coarse ? 1100 : 2200
  const pos = new Float32Array(N * 3)
  const size = new Float32Array(N)
  const node = new Float32Array(N)
  const gold = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < N; i++) {
    const y = 1 - (i / (N - 1)) * 2
    const r = Math.sqrt(1 - y * y)
    const a = i * gold
    pos.set([Math.cos(a) * r * R, y * R, Math.sin(a) * r * R], i * 3)
    size[i] = 1
  }
  const nodes = [SL, ...OTHERS]
  const extra = new Float32Array(nodes.length * 3)
  const extraSize = new Float32Array(nodes.length)
  const extraNode = new Float32Array(nodes.length)
  nodes.forEach((n, i) => {
    extra.set(ll(n.lat, n.lon, R * 1.004).toArray(), i * 3)
    extraSize[i] = i === 0 ? 3.4 : 2.2
    extraNode[i] = 1
  })
  const geo = new THREE.BufferGeometry()
  const all = new Float32Array((N + nodes.length) * 3)
  all.set(pos, 0)
  all.set(extra, N * 3)
  const sizes = new Float32Array(N + nodes.length)
  sizes.set(size, 0)
  sizes.set(extraSize, N)
  const flags = new Float32Array(N + nodes.length)
  flags.set(node, 0)
  flags.set(extraNode, N)
  geo.setAttribute('position', new THREE.BufferAttribute(all, 3))
  geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
  geo.setAttribute('aNode', new THREE.BufferAttribute(flags, 1))
  const dots = new THREE.Points(
    geo,
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: { uPx: { value: 1 }, uInk: { value: new THREE.Color('#1b1b1f') }, uOrange: { value: new THREE.Color('#ff4d00') } },
      vertexShader: `
        attribute float aSize; attribute float aNode;
        uniform float uPx; varying float vNode; varying float vFacing;
        void main(){
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          vec3 n = normalize(mat3(modelMatrix) * position);
          vFacing = n.z; vNode = aNode;
          gl_PointSize = aSize * uPx * (4.6 / -mv.z) * (1.0 + aNode * 0.9);
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: `
        uniform vec3 uInk; uniform vec3 uOrange; varying float vNode; varying float vFacing;
        void main(){
          vec2 c = gl_PointCoord - 0.5; float d = length(c);
          float a = smoothstep(0.5, 0.28, d);
          float face = smoothstep(-0.05, 0.9, vFacing);
          vec3 col = mix(uInk, uOrange, vNode);
          float alpha = a * mix(0.16, 0.78, face);
          alpha = mix(alpha, a, vNode);
          gl_FragColor = vec4(col, alpha);
        }`,
    })
  )
  dots.renderOrder = 2
  globe.add(dots)

  // ── arcs from Colombo ───────────────────────────────────────────────────
  const a0 = ll(SL.lat, SL.lon)
  const arcMat = new THREE.MeshBasicMaterial({ color: 0xff4d00, transparent: true, opacity: 0.55, depthWrite: false })
  const arcCurves = OTHERS.map((o) => {
    const a1 = ll(o.lat, o.lon)
    const pts = []
    const ang = a0.angleTo(a1)
    for (let i = 0; i <= 48; i++) {
      const t = i / 48
      const p = a0.clone().lerp(a1, t).normalize().multiplyScalar(R * (1.004 + Math.sin(Math.PI * t) * (0.1 + ang * 0.1)))
      pts.push(p)
    }
    const curve = new THREE.CatmullRomCurve3(pts)
    const m = new THREE.Mesh(new THREE.TubeGeometry(curve, 64, 0.0042, 5, false), arcMat)
    m.renderOrder = 3
    globe.add(m)
    return curve.getPoints(200) // dense samples for the slow travellers
  })
  // slow travellers along the arcs
  const trav = new THREE.Points(
    new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(new Float32Array(OTHERS.length * 3), 3)),
    new THREE.PointsMaterial({ color: 0xff4d00, size: 0.045, sizeAttenuation: true, transparent: true, opacity: 0.9, depthWrite: false })
  )
  trav.frustumCulled = false
  trav.renderOrder = 4
  globe.add(trav)

  // pulsing ring on Colombo
  const ringMat = new THREE.MeshBasicMaterial({ color: 0xff4d00, transparent: true, opacity: 0.6, side: THREE.DoubleSide, depthWrite: false })
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.97, 1, 48), ringMat)
  ring.position.copy(a0.clone().multiplyScalar(1.006))
  ring.lookAt(a0.clone().multiplyScalar(2))
  ring.renderOrder = 3
  globe.add(ring)

  // faint rim so the sphere reads against the page
  const rim = new THREE.Mesh(
    new THREE.RingGeometry(1.002, 1.008, 96),
    new THREE.MeshBasicMaterial({ color: 0x1b1b1f, transparent: true, opacity: 0.1, side: THREE.DoubleSide, depthWrite: false })
  )
  scene.add(rim)

  // ── layout ──────────────────────────────────────────────────────────────
  function layout() {
    const w = Math.max(1, box.clientWidth)
    const h = Math.max(1, box.clientHeight)
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    dots.material.uniforms.uPx.value = (h * renderer.getPixelRatio()) / 190
  }
  layout()

  const ptr = { x: 0, y: 0, tx: 0, ty: 0 }
  const onMove = (e) => {
    const r = box.getBoundingClientRect()
    ptr.tx = clamp(((e.clientX - r.left) / r.width) * 2 - 1, -1.4, 1.4)
    ptr.ty = clamp(((e.clientY - r.top) / r.height) * 2 - 1, -1.4, 1.4)
  }
  window.addEventListener('pointermove', onMove, { passive: true })

  // ── loop ────────────────────────────────────────────────────────────────
  let t = 0
  let raf = 0
  let running = false
  let last = 0
  const lat0 = rad(SL.lat)
  const lon0 = rad(SL.lon)

  function step(dt) {
    t += reduced ? 0 : dt
    ptr.x = lerp(ptr.x, ptr.tx, 1 - Math.exp(-dt * 2.5))
    ptr.y = lerp(ptr.y, ptr.ty, 1 - Math.exp(-dt * 2.5))
    globe.rotation.y = -lon0 + Math.sin(t * 0.16) * 0.55 + ptr.x * 0.25
    tilt.rotation.x = lat0 * 0.6 + 0.22 + ptr.y * 0.12
    // Colombo ping
    const ph = (t * 0.35) % 1
    ring.scale.setScalar(0.02 + ph * 0.09)
    ringMat.opacity = (1 - ph) * 0.6
    // travellers
    const tp = trav.geometry.attributes.position.array
    arcCurves.forEach((samples, i) => {
      const u = (t * 0.08 + i * 0.17) % 1
      const p = samples[Math.min(samples.length - 1, Math.floor(u * (samples.length - 1)))]
      tp[i * 3] = p.x
      tp[i * 3 + 1] = p.y
      tp[i * 3 + 2] = p.z
    })
    trav.geometry.attributes.position.needsUpdate = true
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
    disposeTree(scene)
    renderer.dispose()
    renderer.forceContextLoss()
    canvas.remove()
  }
}

export default function GlobeScene({ boxRef }) {
  const hostRef = useRef(null)
  useEffect(() => {
    const host = hostRef.current
    const box = boxRef.current
    if (!host || !box) return
    let dispose = () => {}
    try {
      dispose = init(host, box)
    } catch (err) {
      console.warn('[globe] WebGL scene unavailable:', err)
    }
    return () => dispose()
  }, [boxRef])
  return <div className="globe-host" ref={hostRef} aria-hidden="true" />
}

// Four 3-D cube formations for the "proof" stage — one per stat.
// Every formation is a list of cube *slots*; a slot has a reveal order `o` (0..1) so the
// formation visibly tallies up as its counter climbs, and a collapsed anchor it grows from.
import * as THREE from 'three'
import { rng } from '../utils'

const tmp = new THREE.Color()
const lin = (hex) => {
  tmp.set(hex)
  return [tmp.r, tmp.g, tmp.b]
}
const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]

const C = {
  deep: lin('#7a1d00'),
  orange: lin('#ff4d00'),
  hot: lin('#ff8a45'),
  cream: lin('#fff0e4'),
  white: lin('#f4f3ef'),
  grey: lin('#6b6b78'),
}

// ── A · 80 projects: a skyline that grows tower by tower ───────────────────
function skyline() {
  const R = rng(11)
  const towers = []
  for (let gx = 0; gx < 10; gx++) {
    for (let gz = 0; gz < 8; gz++) {
      const x = (gx - 4.5) * 0.98
      const z = (gz - 3.5) * 0.98
      const d = Math.hypot(x / 4.5, z / 3.5)
      const h = Math.max(1, Math.min(9, Math.round(1 + (1 - d * 0.78) * 6.4 * (0.55 + R() * 0.9))))
      towers.push({ x, z, h, d: d + R() * 0.22 })
    }
  }
  towers.sort((a, b) => a.d - b.d) // the city grows outward from its centre
  const slots = []
  const size = 0.62
  towers.forEach((t, i) => {
    const o = i / (towers.length - 1)
    for (let k = 0; k < t.h; k++) {
      const f = t.h === 1 ? 1 : k / (t.h - 1)
      const top = k === t.h - 1
      slots.push({
        p: [t.x, -2.1 + k * (size + 0.04) + size / 2, t.z],
        o,
        col: top ? (t.h > 5 ? C.cream : C.hot) : mix(C.deep, C.orange, Math.min(1, f * 1.15)),
        s: 1,
        anchor: [t.x, -2.1 + size / 2, t.z],
      })
    }
  })
  return slots
}

// ── B · 45 businesses: a constellation joined by strings of bits ────────────
function network() {
  const R = rng(45)
  const pts = []
  const n = 45
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2
    const r = Math.sqrt(1 - y * y)
    const a = i * 2.399963
    const rad = 3.3 * (0.88 + R() * 0.24)
    pts.push(new THREE.Vector3(Math.cos(a) * r * rad, y * rad * 0.82, Math.sin(a) * r * rad))
  }
  // random-ish reveal order so the network lights up all over
  const order = [...pts.keys()].sort(() => R() - 0.5)
  const rank = new Array(n)
  order.forEach((idx, k) => (rank[idx] = k / (n - 1)))
  const slots = []
  const centre = [0, 0, 0]
  pts.forEach((p, i) => {
    slots.push({ p: [p.x, p.y, p.z], o: rank[i], col: i % 5 === 0 ? C.cream : C.white, s: 1.05, anchor: centre })
  })
  const seen = new Set()
  pts.forEach((p, i) => {
    const nearest = pts
      .map((q, j) => [j, p.distanceTo(q)])
      .filter(([j]) => j !== i)
      .sort((a, b) => a[1] - b[1])
      .slice(0, 2)
    nearest.forEach(([j, d]) => {
      const key = i < j ? `${i}-${j}` : `${j}-${i}`
      if (seen.has(key)) return
      seen.add(key)
      const q = pts[j]
      const steps = Math.max(2, Math.floor(d / 0.36))
      const o = Math.max(rank[i], rank[j]) * 0.96 + 0.02
      for (let k = 1; k < steps; k++) {
        const t = k / steps
        slots.push({
          p: [lerp(p.x, q.x, t), lerp(p.y, q.y, t), lerp(p.z, q.z, t)],
          o,
          col: mix(C.deep, C.orange, 0.45 + 0.55 * Math.sin(Math.PI * t)),
          s: 0.5,
          anchor: centre,
        })
      }
    })
  })
  return slots
}
const lerp = (a, b, t) => a + (b - a) * t

// ── C · 7 years: growth rings, one per year, counter-rotating ──────────────
function rings() {
  const slots = []
  for (let y = 0; y < 7; y++) {
    const r = 0.95 + y * 0.62
    const count = Math.round((Math.PI * 2 * r) / 0.46)
    const dir = y % 2 ? -1 : 1
    const omega = dir * (0.34 - y * 0.032)
    for (let k = 0; k < count; k++) {
      const a = (k / count) * Math.PI * 2
      const hot = k % Math.max(6, Math.round(count / 3)) === 0
      slots.push({
        p: [Math.cos(a) * r, Math.sin(y * 1.7 + k * 0.4) * 0.08 - 0.15 + y * 0.04, Math.sin(a) * r],
        o: y / 6,
        col: hot ? C.cream : mix(C.deep, C.orange, 0.35 + (y / 6) * 0.65),
        s: 0.84,
        anchor: [0, 0, 0],
        omega,
      })
    }
  }
  return slots
}

// ── D · 99%: a gauge that fills, with one segment left empty ───────────────
function gauge() {
  const slots = []
  const seg = 100
  for (let k = 0; k < seg; k++) {
    const a = Math.PI / 2 - (k / seg) * Math.PI * 2 // clockwise from 12 o'clock
    const lit = k < 99
    const f = k / 98
    for (const [r, s] of [[3.55, 0.92], [4.0, 0.68]]) {
      slots.push({
        p: [Math.cos(a) * r, Math.sin(a) * r, 0],
        o: lit ? f : 1,
        col: lit ? (k > 94 ? C.cream : mix(C.deep, C.orange, 0.25 + f * 0.75)) : C.grey,
        s,
        fixed: !lit,
        anchor: [Math.cos(a) * r, Math.sin(a) * r, 0],
      })
    }
  }
  // inner track
  for (let k = 0; k < 50; k++) {
    const a = (k / 50) * Math.PI * 2
    slots.push({
      p: [Math.cos(a) * 2.7, Math.sin(a) * 2.7, 0],
      o: k / 49,
      col: mix(C.deep, C.hot, k / 49),
      s: 0.32,
      anchor: [Math.cos(a) * 2.7, Math.sin(a) * 2.7, 0],
    })
  }
  return slots
}

export const STATS = [
  { to: 80, suffix: '+', label: 'Projects delivered across web, mobile & AI', note: 'Every tower is a product we shipped.', spin: 0.12, keepSpin: 1, tilt: 0.5, build: skyline },
  { to: 45, suffix: '+', label: 'Businesses served in Sri Lanka & beyond', note: 'Each node is a business. Each line, a working relationship.', spin: 0.16, keepSpin: 1, tilt: 0.12, build: network },
  { to: 7, suffix: '', label: 'Years building production software', note: 'One ring for every year in production.', spin: 0, keepSpin: 0, tilt: 1.02, build: rings },
  { to: 99, suffix: '%', label: 'On-time delivery & client retention', note: 'We ship when we say we will — and clients stay.', spin: 0, keepSpin: 0, tilt: 0.0, build: gauge },
]

/** Pack a formation into typed arrays of length N (spare cubes become dust). */
export function pack(slots, N, seed) {
  const R = rng(seed)
  const pos = new Float32Array(N * 3)
  const anc = new Float32Array(N * 3)
  const col = new Float32Array(N * 3)
  const ord = new Float32Array(N)
  const scl = new Float32Array(N)
  const omg = new Float32Array(N)
  const kind = new Uint8Array(N) // 0 = slot, 1 = dust, 2 = fixed (always shown, e.g. gauge gap)
  for (let i = 0; i < N; i++) {
    const s = slots[i]
    if (s) {
      pos.set(s.p, i * 3)
      anc.set(s.anchor, i * 3)
      col.set(s.col, i * 3)
      ord[i] = s.o
      scl[i] = s.s
      omg[i] = s.omega || 0
      kind[i] = s.fixed ? 2 : 0
    } else {
      pos[i * 3] = (R() - 0.5) * 22
      pos[i * 3 + 1] = (R() - 0.5) * 13
      pos[i * 3 + 2] = -9 + R() * 9
      anc.set([pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]], i * 3)
      const l = 0.05 + R() * 0.2
      col[i * 3] = l
      col[i * 3 + 1] = l * (R() > 0.85 ? 0.75 : 0.28)
      col[i * 3 + 2] = l * (R() > 0.85 ? 0.7 : 0.05)
      scl[i] = 0.14 + R() * 0.2
      kind[i] = 1
    }
  }
  return { pos, anc, col, ord, scl, omg, kind, count: Math.min(slots.length, N) }
}

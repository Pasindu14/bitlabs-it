// UI boards drawn on <canvas> for the 3D slab — one per project, composed from that project's
// real module names. They are illustrative "skeleton" screens (no invented metrics).
import * as THREE from 'three'
import { rng } from '../utils'

export const BW = 1024
export const BH = 640

const ORANGE = '#ff4d00'
const ORANGE_L = '#ff9a5c'
const INK = '#0d0d11'
const PANEL = '#17171d'
const LINE = '#2a2a33'
const MUTE = '#8b8b96'
const WHITE = '#f4f3ef'
const FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif'
const MONO = 'ui-monospace, "SF Mono", Menlo, Consolas, monospace'

function rr(g, x, y, w, h, r, fill, stroke) {
  g.beginPath()
  g.roundRect(x, y, w, h, r)
  if (fill) {
    g.fillStyle = fill
    g.fill()
  }
  if (stroke) {
    g.strokeStyle = stroke
    g.lineWidth = 2
    g.stroke()
  }
}
function txt(g, s, x, y, size, color, weight = 500, font = FONT, align = 'left') {
  g.font = `${weight} ${size}px ${font}`
  g.fillStyle = color
  g.textAlign = align
  g.textBaseline = 'middle'
  g.fillText(s, x, y)
}
function bar(g, x, y, w, h, color = LINE) {
  rr(g, x, y, w, h, h / 2, color)
}

function chrome(g, p) {
  const bg = g.createLinearGradient(0, 0, 0, BH)
  bg.addColorStop(0, '#121217')
  bg.addColorStop(1, '#0a0a0d')
  g.fillStyle = bg
  g.fillRect(0, 0, BW, BH)
  // title bar
  g.fillStyle = '#0e0e12'
  g.fillRect(0, 0, BW, 58)
  g.fillStyle = LINE
  g.fillRect(0, 58, BW, 2)
  ;['#ff5f57', '#febc2e', '#28c840'].forEach((c, i) => {
    g.beginPath()
    g.arc(32 + i * 26, 29, 7, 0, Math.PI * 2)
    g.fillStyle = c
    g.fill()
  })
  txt(g, p.visual?.title || p.name, 130, 30, 20, MUTE, 500, MONO)
  // footer highlights
  g.fillStyle = '#0e0e12'
  g.fillRect(0, BH - 54, BW, 54)
  g.fillStyle = LINE
  g.fillRect(0, BH - 56, BW, 2)
  ;(p.visual?.footer || []).forEach((f, i) => {
    txt(g, '✓', 36 + i * 360, BH - 27, 20, ORANGE, 700)
    txt(g, f, 64 + i * 360, BH - 27, 18, MUTE, 500)
  })
}

// ── Dashboards (HRIS / SFA / LMS / ERP) ────────────────────────────────────
function dashboard(g, p, seed) {
  const R = rng(seed)
  // sidebar
  g.fillStyle = '#0f0f14'
  g.fillRect(0, 60, 230, BH - 116)
  g.fillStyle = LINE
  g.fillRect(230, 60, 2, BH - 116)
  txt(g, p.name, 26, 96, 20, WHITE, 700)
  p.modules.slice(0, 8).forEach((m, i) => {
    const y = 138 + i * 48
    if (i === 0) rr(g, 14, y - 18, 202, 38, 10, 'rgba(255,77,0,0.16)')
    rr(g, 26, y - 7, 14, 14, 4, i === 0 ? ORANGE : '#3a3a44')
    txt(g, m, 52, y, 17, i === 0 ? WHITE : MUTE, i === 0 ? 600 : 500)
  })
  // stat cards
  const x0 = 262
  ;[0, 1, 2].forEach((i) => {
    const x = x0 + i * 250
    rr(g, x, 82, 232, 108, 16, PANEL, LINE)
    bar(g, x + 20, 106, 80, 10, '#34343e')
    bar(g, x + 20, 138, 60 + R() * 90, 22, i === 0 ? ORANGE : '#e8e8ee')
    bar(g, x + 20, 172, 120, 8, '#2a2a33')
  })
  // chart card
  rr(g, x0, 210, 470, 290, 16, PANEL, LINE)
  bar(g, x0 + 22, 238, 130, 12, '#3a3a44')
  const n = 12
  const hi = Math.floor(R() * n)
  for (let i = 0; i < n; i++) {
    const h = 40 + R() * 160
    rr(g, x0 + 28 + i * 36, 470 - h, 22, h, 6, i === hi ? ORANGE : '#34343e')
  }
  // table card
  rr(g, x0 + 490, 210, 242, 290, 16, PANEL, LINE)
  bar(g, x0 + 512, 238, 90, 12, '#3a3a44')
  for (let i = 0; i < 5; i++) {
    const y = 278 + i * 42
    g.beginPath()
    g.arc(x0 + 524, y, 12, 0, Math.PI * 2)
    g.fillStyle = i === 1 ? ORANGE_L : '#34343e'
    g.fill()
    bar(g, x0 + 548, y - 8, 100 + R() * 40, 9, '#e2e2e8')
    bar(g, x0 + 548, y + 8, 60 + R() * 40, 7, '#2e2e37')
  }
}

// ── Mobile app (Flutter) ───────────────────────────────────────────────────
function mobile(g, p, seed) {
  const R = rng(seed)
  // phone
  const px = 90
  const py = 82
  rr(g, px, py, 250, BH - 82 - 76, 34, '#0b0b0e', '#3a3a44')
  rr(g, px + 8, py + 8, 234, BH - 82 - 76 - 16, 28, '#111116')
  rr(g, px + 90, py + 14, 70, 10, 5, '#000')
  txt(g, 'Round 3 · Tap in order', px + 125, py + 54, 15, MUTE, 500, FONT, 'center')
  const c = 4
  const cs = 48
  const gx = px + 125 - (c * cs + (c - 1) * 8) / 2
  const order = Array.from({ length: c * c }, (_, i) => i + 1).sort(() => R() - 0.5)
  order.forEach((num, i) => {
    const x = gx + (i % c) * (cs + 8)
    const y = py + 84 + Math.floor(i / c) * (cs + 8)
    const next = num === 5
    rr(g, x, y, cs, cs, 10, next ? ORANGE : '#1e1e26', next ? null : LINE)
    txt(g, String(num), x + cs / 2, y + cs / 2 + 1, 20, next ? '#fff' : '#d8d8e0', 700, FONT, 'center')
  })
  bar(g, px + 40, py + 330, 170, 10, '#2a2a33')
  bar(g, px + 40, py + 330, 112, 10, ORANGE)
  // modules as feature cards
  p.modules.slice(0, 8).forEach((m, i) => {
    const col = i % 2
    const row = Math.floor(i / 2)
    const x = 400 + col * 290
    const y = 90 + row * 100
    rr(g, x, y, 270, 84, 16, PANEL, LINE)
    rr(g, x + 18, y + 22, 40, 40, 12, i % 3 === 0 ? 'rgba(255,77,0,0.2)' : '#23232b')
    rr(g, x + 28, y + 32, 20, 20, 6, i % 3 === 0 ? ORANGE : '#6a6a76')
    txt(g, m, x + 74, y + 34, 18, WHITE, 600)
    bar(g, x + 74, y + 56, 100 + R() * 60, 8, '#2e2e37')
  })
}

// ── Chat (WhatsApp CRM) ────────────────────────────────────────────────────
function chat(g, p, seed) {
  const R = rng(seed)
  g.fillStyle = '#0f0f14'
  g.fillRect(0, 60, 290, BH - 116)
  g.fillStyle = LINE
  g.fillRect(290, 60, 2, BH - 116)
  txt(g, 'Inbox', 24, 94, 22, WHITE, 700)
  for (let i = 0; i < 7; i++) {
    const y = 134 + i * 62
    if (i === 1) rr(g, 10, y - 24, 270, 54, 12, 'rgba(255,77,0,0.14)')
    g.beginPath()
    g.arc(44, y, 18, 0, Math.PI * 2)
    g.fillStyle = i === 1 ? ORANGE : '#34343e'
    g.fill()
    bar(g, 74, y - 12, 100 + R() * 70, 10, '#e2e2e8')
    bar(g, 74, y + 8, 120 + R() * 60, 8, '#2e2e37')
  }
  // thread
  rr(g, 320, 78, 684, 60, 14, PANEL)
  g.beginPath()
  g.arc(356, 108, 18, 0, Math.PI * 2)
  g.fillStyle = ORANGE
  g.fill()
  bar(g, 386, 98, 130, 11, '#e2e2e8')
  bar(g, 386, 118, 80, 8, '#34343e')
  const bubbles = [
    [false, 300, 2],
    [true, 340, 2],
    [false, 240, 1],
    [true, 380, 3],
    [false, 280, 2],
  ]
  let y = 158
  bubbles.forEach(([me, w, lines]) => {
    const h = 22 + lines * 22
    const x = me ? 1004 - 24 - w : 340
    rr(g, x, y, w, h, 16, me ? ORANGE : '#1f1f27')
    for (let l = 0; l < lines; l++) bar(g, x + 18, y + 18 + l * 20, w - 36 - (l === lines - 1 ? 60 : 0), 9, me ? 'rgba(255,255,255,0.85)' : '#8b8b96')
    y += h + 14
  })
  rr(g, 320, BH - 118, 684, 46, 23, PANEL, LINE)
  txt(g, 'Type a message', 348, BH - 95, 17, MUTE, 500)
  g.beginPath()
  g.arc(970, BH - 95, 15, 0, Math.PI * 2)
  g.fillStyle = ORANGE
  g.fill()
}

// ── Code editor (VS Code extension) ────────────────────────────────────────
function editor(g, p, seed) {
  const R = rng(seed)
  g.fillStyle = '#0f0f14'
  g.fillRect(0, 60, 60, BH - 116)
  for (let i = 0; i < 5; i++) rr(g, 18, 90 + i * 54, 24, 24, 6, i === 3 ? ORANGE : '#34343e')
  // explorer
  g.fillStyle = '#101015'
  g.fillRect(60, 60, 220, BH - 116)
  p.modules.slice(0, 7).forEach((m, i) => {
    txt(g, m, 80, 96 + i * 38, 16, i === 1 ? WHITE : MUTE, 500, MONO)
    if (i === 1) rr(g, 66, 80 + 38, 4, 4, 2, ORANGE)
  })
  // code
  const cols = [ORANGE, '#7aa2ff', '#7be0a0', '#e8e8ee', MUTE]
  for (let l = 0; l < 14; l++) {
    const y = 102 + l * 30
    txt(g, String(l + 1), 330, y, 14, '#4a4a55', 500, MONO, 'right')
    let x = 360 + (l % 4 === 2 || l % 4 === 3 ? 36 : 0)
    const segs = 2 + Math.floor(R() * 3)
    for (let s = 0; s < segs; s++) {
      const w = 40 + R() * 120
      bar(g, x, y - 5, w, 10, cols[Math.floor(R() * cols.length)])
      x += w + 12
    }
  }
  // status bar
  g.fillStyle = ORANGE
  g.fillRect(0, BH - 84, BW, 28)
  txt(g, '⎇ main', 24, BH - 70, 15, '#fff', 600, MONO)
  rr(g, 780, 82, 210, 120, 14, PANEL, LINE)
  bar(g, 800, 106, 80, 10, '#3a3a44')
  for (let i = 0; i < 4; i++) bar(g, 800, 134 + i * 16, 70 + R() * 90, 8, i === 1 ? ORANGE : '#34343e')
}

// ── Diagram generator (AI Diagramify) ──────────────────────────────────────
function diagram(g, p) {
  const nodes = [
    [512, 120, 'Prompt'],
    [300, 250, 'Parse'],
    [724, 250, 'Generate'],
    [180, 390, 'Entities'],
    [420, 390, 'Relations'],
    [624, 390, 'Layout'],
    [844, 390, 'Render'],
  ]
  const edges = [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6]]
  g.strokeStyle = '#3a3a44'
  g.lineWidth = 3
  edges.forEach(([a, b]) => {
    g.beginPath()
    g.moveTo(nodes[a][0], nodes[a][1] + 24)
    g.bezierCurveTo(nodes[a][0], nodes[a][1] + 70, nodes[b][0], nodes[b][1] - 70, nodes[b][0], nodes[b][1] - 24)
    g.stroke()
  })
  nodes.forEach(([x, y, label], i) => {
    rr(g, x - 70, y - 24, 140, 48, 14, i === 0 ? ORANGE : PANEL, i === 0 ? null : LINE)
    txt(g, label, x, y + 1, 18, i === 0 ? '#fff' : WHITE, 600, FONT, 'center')
  })
  rr(g, 120, 478, 784, 52, 26, PANEL, LINE)
  txt(g, 'Describe your system in plain English…', 152, 504, 18, MUTE, 500)
  g.beginPath()
  g.arc(870, 504, 18, 0, Math.PI * 2)
  g.fillStyle = ORANGE
  g.fill()
}

// ── Concentration grid ─────────────────────────────────────────────────────
function grid(g, p, seed) {
  const R = rng(seed)
  const c = 5
  const cs = 78
  const gx = 90
  const gy = 98
  const order = Array.from({ length: c * c }, (_, i) => i + 1).sort(() => R() - 0.5)
  order.forEach((n, i) => {
    const x = gx + (i % c) * (cs + 8)
    const y = gy + Math.floor(i / c) * (cs + 8)
    const next = n === 8
    const done = n < 8
    rr(g, x, y, cs, cs, 14, next ? ORANGE : done ? 'rgba(255,77,0,0.18)' : '#1c1c24', next ? null : LINE)
    txt(g, String(n), x + cs / 2, y + cs / 2 + 1, 26, next ? '#fff' : done ? ORANGE_L : '#d8d8e0', 700, FONT, 'center')
  })
  // leaderboard + modules
  rr(g, 560, 98, 400, 330, 18, PANEL, LINE)
  txt(g, p.modules[4] || 'Leaderboards', 584, 130, 19, WHITE, 700)
  for (let i = 0; i < 5; i++) {
    const y = 172 + i * 50
    g.beginPath()
    g.arc(600, y, 15, 0, Math.PI * 2)
    g.fillStyle = i === 0 ? ORANGE : '#34343e'
    g.fill()
    bar(g, 630, y - 6, 220 - i * 26, 12, i === 0 ? ORANGE_L : '#3a3a44')
  }
  p.modules.slice(0, 4).forEach((m, i) => {
    rr(g, 560 + (i % 2) * 204, 446 + Math.floor(i / 2) * 50, 196, 42, 12, '#1c1c24', LINE)
    txt(g, m, 560 + (i % 2) * 204 + 98, 446 + Math.floor(i / 2) * 50 + 21, 15, MUTE, 600, FONT, 'center')
  })
}

const DRAW = { dashboard, mobile, chat, editor, diagram, grid }

export function boardTexture(project, index, aniso = 8) {
  const c = document.createElement('canvas')
  c.width = BW
  c.height = BH
  const g = c.getContext('2d')
  chrome(g, project)
  ;(DRAW[project.kind] || dashboard)(g, project, 100 + index * 17)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = aniso
  return t
}

/** A floating module chip: icon square + label. */
export function chipTexture(label, aniso = 8) {
  const c = document.createElement('canvas')
  c.width = 512
  c.height = 144
  const g = c.getContext('2d')
  rr(g, 6, 6, 500, 132, 66, 'rgba(14,14,18,0.94)', 'rgba(255,77,0,0.55)')
  rr(g, 30, 36, 72, 72, 20, 'rgba(255,77,0,0.18)')
  rr(g, 52, 58, 28, 28, 8, ORANGE)
  g.font = `600 40px ${FONT}`
  g.fillStyle = WHITE
  g.textAlign = 'left'
  g.textBaseline = 'middle'
  let s = label
  while (g.measureText(s).width > 340 && s.length > 4) s = s.slice(0, -2)
  g.fillText(s === label ? s : s + '…', 124, 74)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = aniso
  return t
}

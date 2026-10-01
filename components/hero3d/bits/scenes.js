// "Bit by Bit" scene definitions. Each scene is drawn as pixel-art on a tiny offscreen canvas;
// every lit pixel later becomes one glowing cube. Colours come straight from what is drawn.

export const GRID = { W: 112, H: 70 }

const ORANGE = '#ff4d00'
const ORANGE_L = '#ff9a5c'
const WHITE = '#f4f3ef'
const GREY = '#6c6c78'
const GREY_D = '#3e3e48'

function rr(g, x, y, w, h, r, fill) {
  g.beginPath()
  g.roundRect(x, y, w, h, r)
  if (fill) {
    g.fillStyle = fill
    g.fill()
  }
}
// outlined rounded rect (hollow inside)
function ring(g, x, y, w, h, r, t, color) {
  rr(g, x, y, w, h, r, color)
  g.save()
  g.globalCompositeOperation = 'destination-out'
  rr(g, x + t, y + t, w - t * 2, h - t * 2, Math.max(0, r - t), '#000')
  g.restore()
}
function disc(g, x, y, r, fill) {
  g.beginPath()
  g.arc(x, y, r, 0, Math.PI * 2)
  g.fillStyle = fill
  g.fill()
}
function line(g, x1, y1, x2, y2, w, color) {
  g.strokeStyle = color
  g.lineWidth = w
  g.lineCap = 'butt'
  g.beginPath()
  g.moveTo(x1, y1)
  g.lineTo(x2, y2)
  g.stroke()
}

const SCENES = [
  {
    key: 'logo',
    title: 'Bitlabs',
    sub: 'Software studio · Sri Lanka',
    draw(g) {
      rr(g, 38, 6, 36, 36, 10, ORANGE)
      rr(g, 50, 18, 12, 12, 3.5, WHITE)
      g.fillStyle = WHITE
      g.font = '500 25px Arial, Helvetica, sans-serif'
      g.textAlign = 'right'
      g.textBaseline = 'alphabetic'
      g.fillText('Bit', 55, 64)
      g.fillStyle = ORANGE
      g.font = '700 25px Arial, Helvetica, sans-serif'
      g.textAlign = 'left'
      g.fillText('labs', 55, 64)
    },
  },
  {
    key: 'app',
    title: 'Mobile apps',
    sub: 'Flutter · iOS & Android',
    draw(g) {
      ring(g, 38, 2, 36, 66, 8, 2, ORANGE)
      rr(g, 49, 4.5, 14, 2.4, 1, ORANGE)
      rr(g, 42, 11, 28, 6, 1.5, WHITE)
      rr(g, 42, 19, 16, 2, 1, GREY)
      ;[26, 37, 48].forEach((y, i) => {
        rr(g, 42, y, 28, 9, 2.5, GREY_D)
        disc(g, 47, y + 4.5, 2.6, i === 0 ? ORANGE : ORANGE_L)
        rr(g, 52, y + 2.4, 14, 1.6, 0.8, WHITE)
        rr(g, 52, y + 5.2, 9, 1.4, 0.7, GREY)
      })
      ;[46, 52, 58, 64].forEach((x, i) => disc(g, x, 62.5, 1.3, i === 0 ? WHITE : GREY))
      // floating widgets either side
      ring(g, 6, 18, 26, 18, 4, 1.4, ORANGE_L)
      ;[10, 15, 20, 25].forEach((x, i) => rr(g, x, 32 - [6, 10, 5, 8][i], 3, [6, 10, 5, 8][i], 0.8, i === 1 ? WHITE : ORANGE))
      ring(g, 80, 38, 26, 14, 7, 1.4, ORANGE_L)
      disc(g, 98, 45, 4, ORANGE)
      rr(g, 85, 44, 7, 2, 1, WHITE)
    },
  },
  {
    key: 'dash',
    title: 'Sales dashboards',
    sub: 'SFA · field sales automation',
    draw(g) {
      ring(g, 3, 5, 106, 60, 5, 2, ORANGE)
      line(g, 5, 13.5, 107, 13.5, 1, GREY)
      ;[9, 14, 19].forEach((x, i) => disc(g, x, 9.3, 1.4, [ORANGE, ORANGE_L, GREY][i]))
      // sidebar
      ;[18, 24, 30, 36, 42].forEach((y, i) => rr(g, 7, y, 14, 3, 1.2, i === 0 ? ORANGE : GREY_D))
      line(g, 24.5, 15, 24.5, 63, 1, GREY_D)
      // KPI cards
      ;[27, 56, 85].forEach((x, i) => {
        ring(g, x, 17, 25, 15, 3, 1, GREY)
        rr(g, x + 3, 21, 10, 3, 1.2, WHITE)
        rr(g, x + 3, 26.5, [14, 17, 11][i], 3, 1.2, ORANGE)
      })
      // bars
      ;[7, 11, 8, 14, 10, 17, 13, 19, 15].forEach((h, i) => rr(g, 28 + i * 5, 60 - h, 3.4, h, 0.8, i === 7 ? WHITE : ORANGE))
      line(g, 27, 60.5, 74, 60.5, 1, GREY)
      // line chart
      const pts = [[78, 55], [85, 49], [91, 52], [98, 42], [105, 38]]
      g.strokeStyle = ORANGE_L
      g.lineWidth = 1.8
      g.beginPath()
      pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)))
      g.stroke()
      pts.forEach(([x, y]) => disc(g, x, y, 1.7, WHITE))
      line(g, 77, 60.5, 107, 60.5, 1, GREY)
    },
  },
  {
    key: 'org',
    title: 'HR platforms',
    sub: 'HRIS · people & org charts',
    draw(g) {
      const node = (cx, y, w, h, fill, av) => {
        rr(g, cx - w / 2, y, w, h, 3, fill)
        disc(g, cx - w / 2 + 4.6, y + h / 2, 2.3, av)
        rr(g, cx - w / 2 + 8.6, y + h / 2 - 1.5, w - 12, 1.6, 0.8, WHITE)
        rr(g, cx - w / 2 + 8.6, y + h / 2 + 1.1, (w - 12) * 0.6, 1.2, 0.6, GREY)
      }
      const root = 56
      const mids = [22, 56, 90]
      const leaves = [10, 34, 46, 66, 80, 102]
      const leafParent = [0, 0, 1, 1, 2, 2]
      // connectors first
      line(g, root, 15, root, 19, 1.2, GREY)
      line(g, mids[0], 19, mids[2], 19, 1.2, GREY)
      mids.forEach((x) => line(g, x, 19, x, 24, 1.2, GREY))
      mids.forEach((x, i) => {
        const cs = leaves.filter((_, j) => leafParent[j] === i)
        line(g, x, 34, x, 39, 1.2, GREY)
        line(g, cs[0], 39, cs[cs.length - 1], 39, 1.2, GREY)
        cs.forEach((c) => line(g, c, 39, c, 44, 1.2, GREY))
      })
      node(root, 5, 26, 10.5, ORANGE, WHITE)
      mids.forEach((x) => node(x, 24, 24, 10, GREY_D, ORANGE))
      leaves.forEach((x) => node(x, 44, 20, 9, GREY_D, ORANGE_L))
      ;[10, 34, 66, 102].forEach((x) => rr(g, x - 6, 59, 12, 2.2, 1, GREY_D))
      rr(g, 50, 59, 12, 2.2, 1, ORANGE)
    },
  },
  {
    key: 'chat',
    title: 'WhatsApp SaaS',
    sub: 'Conversational business tools',
    draw(g) {
      ring(g, 30, 2, 52, 66, 7, 2, ORANGE)
      disc(g, 38, 11.5, 4, ORANGE)
      rr(g, 45, 8.5, 18, 2.4, 1, WHITE)
      rr(g, 45, 12.5, 11, 1.6, 0.8, GREY)
      line(g, 32, 18.5, 80, 18.5, 1, GREY_D)
      const bubble = (x, y, w, h, fill, l1, l2) => {
        rr(g, x, y, w, h, 3.5, fill)
        rr(g, x + 3, y + 2.6, l1, 1.7, 0.85, WHITE)
        if (l2) rr(g, x + 3, y + 5.6, l2, 1.5, 0.75, fill === ORANGE ? '#ffd1b8' : GREY)
      }
      bubble(34, 23, 30, 10, GREY_D, 20, 12)
      bubble(48, 36, 30, 10, ORANGE, 22, 14)
      bubble(34, 49, 22, 8, GREY_D, 14, 0)
      ;[38, 43, 48].forEach((x) => disc(g, x, 62.2, 1.4, GREY))
      // chat icon + notification badge outside the window
      disc(g, 15, 34, 11, ORANGE)
      g.beginPath()
      g.moveTo(8, 41)
      g.lineTo(4.5, 49)
      g.lineTo(13, 44)
      g.closePath()
      g.fillStyle = ORANGE
      g.fill()
      ring(g, 10, 29, 10, 10, 5, 2, WHITE)
      disc(g, 98, 20, 7, ORANGE)
      g.fillStyle = WHITE
      g.font = '700 10px Arial, sans-serif'
      g.textAlign = 'center'
      g.textBaseline = 'middle'
      g.fillText('3', 98, 20.8)
      ;[0, 1].forEach((i) => line(g, 88 + i * 3, 48, 90 + i * 3, 51, 1.6, ORANGE_L))
      line(g, 90, 51, 96, 44, 1.6, ORANGE_L)
      line(g, 93, 51, 99, 44, 1.6, ORANGE_L)
    },
  },
]

/** Rasterise every scene → [{ key, title, sub, points: [{ px, py, r, g, b }] }] */
export function buildScenes() {
  const { W, H } = GRID
  const cv = document.createElement('canvas')
  cv.width = W
  cv.height = H
  const g = cv.getContext('2d', { willReadFrequently: true })
  return SCENES.map((s) => {
    g.clearRect(0, 0, W, H)
    s.draw(g)
    const data = g.getImageData(0, 0, W, H).data
    const points = []
    for (let py = 0; py < H; py++) {
      for (let px = 0; px < W; px++) {
        const i = (py * W + px) * 4
        if (data[i + 3] > 150) points.push({ px, py, r: data[i], g: data[i + 1], b: data[i + 2] })
      }
    }
    return { key: s.key, title: s.title, sub: s.sub, points }
  })
}

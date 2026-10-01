// Voxel icons for the six services. Drawn on a 12×12 grid with a few tiny helpers.
// Characters: O orange · L light orange · P peach · D ink · W cream · '.' empty
// Each character also has an extrusion depth, so screens sit recessed inside their bezels.

export const GRID = 12
export const DEPTH = { O: 2, L: 2, P: 1, D: 3, W: 2 }
export const PALETTE = { O: '#ff4d00', L: '#ff9a5c', P: '#ffd2b8', D: '#1d1d24', W: '#fff4ec' }

const blank = () => Array.from({ length: GRID }, () => Array(GRID).fill('.'))
const put = (g, x, y, c) => {
  if (x >= 0 && y >= 0 && x < GRID && y < GRID) g[y][x] = c
}
const rect = (g, x, y, w, h, c) => {
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) put(g, x + i, y + j, c)
}
const line = (g, x0, y0, x1, y1, c) => {
  const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0))
  for (let i = 0; i <= n; i++) {
    const t = n === 0 ? 0 : i / n
    put(g, Math.round(x0 + (x1 - x0) * t), Math.round(y0 + (y1 - y0) * t), c)
  }
}

const mobile = () => {
  const g = blank()
  rect(g, 3, 0, 6, 12, 'D')
  rect(g, 4, 1, 4, 10, 'P')
  rect(g, 4, 1, 4, 2, 'O')
  rect(g, 4, 4, 3, 1, 'L')
  rect(g, 4, 6, 4, 1, 'L')
  rect(g, 4, 8, 2, 1, 'L')
  rect(g, 5, 10, 2, 1, 'O')
  return g
}

const web = () => {
  const g = blank()
  rect(g, 0, 1, 12, 10, 'D')
  rect(g, 1, 4, 10, 6, 'P')
  put(g, 1, 2, 'O')
  put(g, 3, 2, 'L')
  put(g, 5, 2, 'P')
  rect(g, 2, 5, 3, 3, 'O')
  rect(g, 6, 5, 4, 1, 'L')
  rect(g, 6, 7, 3, 1, 'L')
  rect(g, 2, 9, 8, 1, 'L')
  return g
}

const ai = () => {
  const g = blank()
  rect(g, 5, 0, 2, 1, 'O')
  rect(g, 5, 1, 2, 1, 'D')
  rect(g, 2, 2, 8, 6, 'D')
  rect(g, 3, 3, 6, 4, 'P')
  rect(g, 0, 4, 2, 2, 'O')
  rect(g, 10, 4, 2, 2, 'O')
  put(g, 4, 4, 'O')
  put(g, 7, 4, 'O')
  rect(g, 4, 6, 4, 1, 'D')
  rect(g, 5, 8, 2, 1, 'L')
  rect(g, 2, 9, 8, 3, 'D')
  rect(g, 3, 10, 6, 1, 'L')
  return g
}

const custom = () => {
  const g = blank()
  ;[[4, 2], [3, 3], [2, 4], [1, 5], [2, 6], [3, 7], [4, 8]].forEach(([x, y]) => {
    put(g, x, y + 1, 'O')
    put(g, 11 - x, y + 1, 'O')
  })
  line(g, 7, 1, 4, 11, 'D')
  line(g, 8, 1, 5, 11, 'L')
  return g
}

const uiux = () => {
  const g = blank()
  ;[[0, 0], [1, 0], [0, 1], [11, 11], [10, 11], [11, 10]].forEach(([x, y]) => put(g, x, y, 'D'))
  line(g, 2, 9, 8, 3, 'O')
  line(g, 3, 9, 9, 3, 'O')
  line(g, 2, 10, 2, 10, 'D')
  put(g, 1, 10, 'D')
  put(g, 2, 9, 'D')
  put(g, 3, 10, 'D')
  rect(g, 9, 2, 2, 2, 'L')
  put(g, 10, 1, 'P')
  put(g, 8, 1, 'D')
  put(g, 11, 4, 'D')
  put(g, 1, 3, 'L')
  put(g, 6, 9, 'L')
  return g
}

const api = () => {
  const g = blank()
  line(g, 3, 2, 8, 2, 'L')
  line(g, 2, 3, 5, 8, 'L')
  line(g, 9, 3, 6, 8, 'L')
  rect(g, 0, 0, 3, 3, 'O')
  rect(g, 9, 0, 3, 3, 'O')
  rect(g, 4, 8, 4, 4, 'D')
  rect(g, 5, 9, 2, 2, 'O')
  put(g, 1, 1, 'W')
  put(g, 10, 1, 'W')
  return g
}

export const ICONS = [mobile, web, ai, custom, uiux, api]

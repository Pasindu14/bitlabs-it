// Procedural material textures, all drawn on <canvas> so the scene ships zero image assets.
import * as THREE from 'three'
import { rng } from './utils'

function canvas(w, h) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return [c, c.getContext('2d')]
}

function finish(c, { srgb = true, repeat, aniso = 4 } = {}) {
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace
  t.anisotropy = aniso
  if (repeat) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    t.repeat.set(repeat[0], repeat[1])
  }
  return t
}

function speckle(g, w, h, n, r, colors, alpha = 0.5, size = 2) {
  for (let i = 0; i < n; i++) {
    g.globalAlpha = alpha * r()
    g.fillStyle = colors[(r() * colors.length) | 0]
    g.fillRect(r() * w, r() * h, 1 + r() * size, 1 + r() * size)
  }
  g.globalAlpha = 1
}

/** Wood grain running along X. Returns { map, bump }. */
export function woodTextures(base, dark, light, seed = 3, repeat = [1, 1]) {
  const r = rng(seed)
  const [c, g] = canvas(512, 256)
  g.fillStyle = base
  g.fillRect(0, 0, 512, 256)
  for (let i = 0; i < 90; i++) {
    const y = r() * 256
    g.globalAlpha = 0.1 + r() * 0.3
    g.strokeStyle = r() > 0.4 ? dark : light
    g.lineWidth = 0.6 + r() * 2.2
    g.beginPath()
    g.moveTo(0, y)
    for (let x = 0; x <= 512; x += 64) g.lineTo(x, y + Math.sin(x * 0.02 + i) * 3 * r())
    g.stroke()
  }
  g.globalAlpha = 1
  const [b, bg] = canvas(512, 256)
  bg.drawImage(c, 0, 0)
  bg.globalCompositeOperation = 'saturation'
  bg.fillStyle = '#808080'
  bg.fillRect(0, 0, 512, 256)
  return { map: finish(c, { repeat }), bump: finish(b, { srgb: false, repeat }) }
}

/** Shou-sugi-ban: charred vertical boards with alligator cracks. */
export function yakisugiTextures(repeat = [2, 1]) {
  const r = rng(11)
  const [c, g] = canvas(512, 512)
  g.fillStyle = '#17120f'
  g.fillRect(0, 0, 512, 512)
  const boards = 8
  for (let i = 0; i < boards; i++) {
    const x = (i * 512) / boards
    g.fillStyle = `rgba(${40 + r() * 20},${28 + r() * 12},${20 + r() * 8},0.55)`
    g.fillRect(x, 0, 512 / boards, 512)
    g.fillStyle = '#050403'
    g.fillRect(x - 1.5, 0, 3, 512)
    // alligatoring cracks
    g.strokeStyle = 'rgba(0,0,0,0.85)'
    g.lineWidth = 1.2
    for (let k = 0; k < 70; k++) {
      const cx = x + 4 + r() * (512 / boards - 8)
      const cy = r() * 512
      g.beginPath()
      g.moveTo(cx, cy)
      g.lineTo(cx + (r() - 0.5) * 6, cy + 6 + r() * 14)
      g.stroke()
    }
    // dull grey char sheen
    speckle(g, 512, 512, 140, r, ['#4a423c', '#2a231f'], 0.5, 3)
  }
  const [b, bg] = canvas(512, 512)
  bg.fillStyle = '#777'
  bg.fillRect(0, 0, 512, 512)
  bg.drawImage(c, 0, 0)
  bg.globalCompositeOperation = 'saturation'
  bg.fillStyle = '#808080'
  bg.fillRect(0, 0, 512, 512)
  return { map: finish(c, { repeat }), bump: finish(b, { srgb: false, repeat }) }
}

export function plasterTextures(repeat = [2, 2]) {
  const r = rng(5)
  const [c, g] = canvas(256, 256)
  g.fillStyle = '#d6cdbb'
  g.fillRect(0, 0, 256, 256)
  speckle(g, 256, 256, 2400, r, ['#b9ae99', '#efe7d6', '#a89c86'], 0.45, 3)
  const [b, bg] = canvas(256, 256)
  bg.drawImage(c, 0, 0)
  bg.globalCompositeOperation = 'saturation'
  bg.fillStyle = '#808080'
  bg.fillRect(0, 0, 256, 256)
  return { map: finish(c, { repeat }), bump: finish(b, { srgb: false, repeat }) }
}

export function graniteTextures(repeat = [2, 1]) {
  const r = rng(9)
  const [c, g] = canvas(256, 256)
  g.fillStyle = '#7d7a78'
  g.fillRect(0, 0, 256, 256)
  speckle(g, 256, 256, 3200, r, ['#4a4846', '#b4b0ac', '#5d5a58', '#d0ccc6'], 0.7, 2.4)
  const [b, bg] = canvas(256, 256)
  bg.drawImage(c, 0, 0)
  bg.globalCompositeOperation = 'saturation'
  bg.fillStyle = '#808080'
  bg.fillRect(0, 0, 256, 256)
  return { map: finish(c, { repeat }), bump: finish(b, { srgb: false, repeat }) }
}

/** Raked karesansui gravel. Lines run along X so they sweep toward the camera when rotated. */
export function gravelTextures(repeat = [8, 8]) {
  const r = rng(21)
  const [c, g] = canvas(512, 512)
  g.fillStyle = '#9b958a'
  g.fillRect(0, 0, 512, 512)
  speckle(g, 512, 512, 7000, r, ['#6e695f', '#c9c3b6', '#857f74'], 0.8, 2.2)
  for (let y = 0; y < 512; y += 16) {
    g.fillStyle = 'rgba(40,36,30,0.34)'
    g.fillRect(0, y, 512, 3)
    g.fillStyle = 'rgba(235,228,214,0.28)'
    g.fillRect(0, y + 4, 512, 2)
  }
  const [b, bg] = canvas(512, 512)
  bg.fillStyle = '#808080'
  bg.fillRect(0, 0, 512, 512)
  for (let y = 0; y < 512; y += 16) {
    bg.fillStyle = '#303030'
    bg.fillRect(0, y, 512, 4)
    bg.fillStyle = '#d8d8d8'
    bg.fillRect(0, y + 6, 512, 3)
  }
  speckle(bg, 512, 512, 4000, r, ['#ffffff', '#222222'], 0.5, 2)
  return { map: finish(c, { repeat }), bump: finish(b, { srgb: false, repeat }) }
}

export function mossTextures(repeat = [3, 3]) {
  const r = rng(33)
  const [c, g] = canvas(256, 256)
  g.fillStyle = '#3f5a24'
  g.fillRect(0, 0, 256, 256)
  speckle(g, 256, 256, 3500, r, ['#27401a', '#6f8f3a', '#4d6c2b', '#8aa84c'], 0.85, 3)
  return { map: finish(c, { repeat }) }
}

/** Shoji paper: warm translucent sheet with a thin kumiko lattice. */
export function shojiTexture(cols = 3, rows = 6) {
  const [c, g] = canvas(256, 512)
  const grad = g.createLinearGradient(0, 0, 0, 512)
  grad.addColorStop(0, '#ffd9a0')
  grad.addColorStop(1, '#ffb866')
  g.fillStyle = grad
  g.fillRect(0, 0, 256, 512)
  g.fillStyle = '#6b4020'
  const t = 5
  for (let i = 0; i <= cols; i++) g.fillRect((i * (256 - t)) / cols, 0, t, 512)
  for (let j = 0; j <= rows; j++) g.fillRect(0, (j * (512 - t)) / rows, 256, t)
  return finish(c)
}

/** Bamboo blind (sudare): vertical splits, a bright strip showing underneath. */
export function sudareTexture() {
  const r = rng(77)
  const [c, g] = canvas(256, 256)
  g.fillStyle = '#9a8a4c'
  g.fillRect(0, 0, 256, 256)
  for (let x = 0; x < 256; x += 5) {
    g.fillStyle = r() > 0.5 ? '#b5a461' : '#7c6f3a'
    g.fillRect(x, 0, 3, 256)
  }
  g.fillStyle = '#3a301a'
  for (const y of [32, 128, 224]) g.fillRect(0, y, 256, 4) // binding cords
  return finish(c)
}

/** Indigo noren curtain. `kind`: 'mark' draws the Bitlabs logo, otherwise stacked letters. */
export function norenTexture(kind, letters = '') {
  const r = rng(kind === 'mark' ? 4 : letters.charCodeAt(0))
  const [c, g] = canvas(256, 512)
  g.fillStyle = '#1c2a5e'
  g.fillRect(0, 0, 256, 512)
  // weave
  for (let i = 0; i < 700; i++) {
    g.globalAlpha = 0.18 * r()
    g.fillStyle = r() > 0.5 ? '#3a4d92' : '#0f1a40'
    g.fillRect(r() * 256, r() * 512, 1 + r() * 24, 1)
  }
  g.globalAlpha = 1
  // hem + top sleeve
  g.fillStyle = '#e9e2cf'
  g.fillRect(0, 486, 256, 6)
  g.fillStyle = 'rgba(0,0,0,0.25)'
  g.fillRect(0, 0, 256, 14)

  if (kind === 'mark') {
    const s = 124
    const x = 128 - s / 2
    const y = 150
    g.fillStyle = '#ff4d00'
    g.beginPath()
    g.roundRect(x, y, s, s, 30)
    g.fill()
    g.fillStyle = '#fff'
    g.beginPath()
    g.roundRect(128 - 22, y + s / 2 - 22, 44, 44, 11)
    g.fill()
    g.fillStyle = '#e9e2cf'
    g.font = '300 34px "Jost", sans-serif'
    g.textAlign = 'center'
    g.fillText('BITLABS', 128, 360)
  } else {
    g.fillStyle = '#e9e2cf'
    g.font = '300 92px "Jost", sans-serif'
    g.textAlign = 'center'
    const step = 108
    ;[...letters].forEach((ch, i) => g.fillText(ch, 128, 140 + i * step))
  }
  return finish(c)
}

/** Paper lantern ribs, banded vertically. */
export function lanternTexture() {
  const [c, g] = canvas(64, 256)
  const grad = g.createLinearGradient(0, 0, 0, 256)
  grad.addColorStop(0, '#ff9c4a')
  grad.addColorStop(0.5, '#ffb866')
  grad.addColorStop(1, '#ff8a3a')
  g.fillStyle = grad
  g.fillRect(0, 0, 64, 256)
  g.fillStyle = 'rgba(80,20,0,0.55)'
  for (let y = 4; y < 256; y += 18) g.fillRect(0, y, 64, 2)
  return finish(c)
}

/** Dark-slate kawara sheen used on the roof tiles. */
export function kawaraTextures() {
  const r = rng(41)
  const [c, g] = canvas(128, 128)
  g.fillStyle = '#c8c8cc'
  g.fillRect(0, 0, 128, 128)
  for (let i = 0; i < 40; i++) {
    g.globalAlpha = 0.18 * r()
    g.fillStyle = r() > 0.5 ? '#ffffff' : '#555'
    g.fillRect(0, r() * 128, 128, 1 + r() * 2)
  }
  g.globalAlpha = 1
  speckle(g, 128, 128, 900, r, ['#888', '#ddd'], 0.5, 1.6)
  return { map: finish(c), bump: finish(c, { srgb: false }) }
}

/** Soft glow sprite texture (sun halo etc.). */
export function glowTexture() {
  const [c, g] = canvas(128, 128)
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64)
  grad.addColorStop(0, 'rgba(255,255,255,1)')
  grad.addColorStop(0.25, 'rgba(255,255,255,0.45)')
  grad.addColorStop(1, 'rgba(255,255,255,0)')
  g.fillStyle = grad
  g.fillRect(0, 0, 128, 128)
  return finish(c)
}

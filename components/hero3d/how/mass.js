// The building every plot shares: a stepped tower with a side wing, as voxels.
// Only surface voxels are kept (the inside is hollow), and each knows which sides are exposed.
import { rng } from '../utils'

export const CELL = 0.7
export const LAYERS = 9

// x/z/y ranges are [from, to) in cells, centred on the plot
export const TIERS = [
  { x: [-3, 3], z: [-3, 3], y: [0, 4] },
  { x: [-2, 2], z: [-2, 2], y: [4, 7] },
  { x: [-1, 2], z: [-1, 2], y: [7, 9] },
  { x: [-5, -3], z: [-2, 2], y: [0, 3] }, // wing
]

const key = (x, y, z) => `${x},${y},${z}`

function build() {
  const R = rng(321)
  const occ = new Set()
  TIERS.forEach((t) => {
    for (let x = t.x[0]; x < t.x[1]; x++)
      for (let y = t.y[0]; y < t.y[1]; y++) for (let z = t.z[0]; z < t.z[1]; z++) occ.add(key(x, y, z))
  })
  const out = []
  occ.forEach((k) => {
    const [x, y, z] = k.split(',').map(Number)
    const sides = {
      px: !occ.has(key(x + 1, y, z)),
      nx: !occ.has(key(x - 1, y, z)),
      pz: !occ.has(key(x, y, z + 1)),
      nz: !occ.has(key(x, y, z - 1)),
      top: !occ.has(key(x, y + 1, z)),
    }
    const surface = sides.px || sides.nx || sides.pz || sides.nz || sides.top || !occ.has(key(x, y - 1, z))
    if (!surface) return
    const side = sides.px || sides.nx || sides.pz || sides.nz
    out.push({
      x,
      y,
      z,
      sides,
      // openings that give the "under construction" lattice its see-through look
      hole: side && !sides.top && y >= 1 && R() < 0.17,
      r: R(),
    })
  })
  out.sort((a, b) => a.y - b.y || a.r - b.r)
  return out
}

export const VOXELS = build()

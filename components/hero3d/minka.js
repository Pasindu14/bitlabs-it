// buildMinka — a Japanese machiya/minka assembled piece by piece, the way a carpenter would:
// plinth → sill (dodai) → posts & infill bay by bay → noren → engawa → roof (hundreds of
// instanced kawara tiles) → rafters, lanterns, rain chain. No models, no image assets.
import * as THREE from 'three'
import { box } from './utils'
import * as T from './textures'

// ── Dimensions (metres) ─────────────────────────────────────────────────────
const BAY = 1.5
const HALF_W = 4.5 // 6 bays
const FRONT_Z = 2.2
const BACK_Z = -2.2
const SILL_Y = 0.5
const HEAD_Y = 3.3
const TOP_Y = 3.5
const ALPHA = Math.PI / 6 // 30° roof pitch
const TAN = Math.tan(ALPHA)
const EAVE_H = 3.7 // horizontal distance ridge → eave tip
const EAVE_Y = 3.45
const RIDGE_Y = EAVE_Y + EAVE_H * TAN
const SLOPE_L = EAVE_H / Math.cos(ALPHA)
const ROOF_HW = 5.4
const TILE_PITCH = 0.3
const ROW_PITCH = 0.33

function makeMaterials() {
  const wood = T.woodTextures('#4a3426', '#22150d', '#7c5a3d', 3, [3, 1])
  const hinoki = T.woodTextures('#c79a68', '#8a5f35', '#e6c293', 6, [4, 1])
  const char = T.yakisugiTextures([2, 1])
  const plaster = T.plasterTextures([3, 2])
  const granite = T.graniteTextures([2, 1])
  const kawara = T.kawaraTextures()

  const std = (o) => new THREE.MeshStandardMaterial(o)
  return {
    wood: std({ map: wood.map, bumpMap: wood.bump, bumpScale: 1.5, roughness: 0.78 }),
    hinoki: std({ map: hinoki.map, bumpMap: hinoki.bump, bumpScale: 1.2, roughness: 0.7 }),
    char: std({ map: char.map, bumpMap: char.bump, bumpScale: 2.2, roughness: 0.92 }),
    plaster: std({ map: plaster.map, bumpMap: plaster.bump, bumpScale: 1.0, roughness: 0.95, side: THREE.DoubleSide }),
    granite: std({ map: granite.map, bumpMap: granite.bump, bumpScale: 1.5, roughness: 0.85 }),
    // `color` multiplies per-instance colour, so tiles keep a subtle tone variation.
    tile: std({ color: 0xffffff, map: kawara.map, bumpMap: kawara.bump, bumpScale: 0.6, roughness: 0.36, metalness: 0.18, side: THREE.DoubleSide }),
    tileDark: std({ color: 0x2c2f36, roughness: 0.45, metalness: 0.2 }),
    paper: std({ color: 0xffd9a0, emissive: 0xff9a40, emissiveIntensity: 1.15, roughness: 0.9 }),
    shoji: std({ map: T.shojiTexture(4, 6), emissive: 0xffa050, emissiveMap: T.shojiTexture(4, 6), emissiveIntensity: 1.1, roughness: 0.9 }),
    lantern: std({ map: T.lanternTexture(), emissive: 0xff8a3a, emissiveMap: T.lanternTexture(), emissiveIntensity: 1.5, roughness: 0.8 }),
    stoneLit: std({ color: 0xffe0b0, emissive: 0xff9a45, emissiveIntensity: 1.6, roughness: 0.9 }),
    sudare: std({ map: T.sudareTexture(), roughness: 0.9 }),
    copper: std({ color: 0xb96b3d, roughness: 0.38, metalness: 0.85 }),
    water: std({ color: 0x0f1b2b, roughness: 0.06, metalness: 0.3 }),
  }
}

export function buildMinka({ maxAniso = 4 } = {}) {
  const group = new THREE.Group()
  group.name = 'minka'
  const M = makeMaterials()
  const lights = [] // { light, base, flicker }
  const swayers = [] // fn(t, wind)

  const add = (o) => (group.add(o), o)

  // ── 1. Base: plinth, sill, hidden shadow block ───────────────────────────
  add(box(9.4, 0.4, 4.8, M.granite, 0, 0.2, 0))
  // the walls themselves: plaster block that also casts the big roof-time shadow
  const body = add(box(HALF_W * 2, TOP_Y - SILL_Y, FRONT_Z - BACK_Z, M.plaster, 0, (TOP_Y + SILL_Y) / 2, 0))
  body.material = M.plaster
  add(box(HALF_W * 2 + 0.3, 0.16, 0.22, M.wood, 0, SILL_Y + 0.08, FRONT_Z + 0.1)) // dodai sill (front)
  add(box(HALF_W * 2 + 0.3, 0.2, 0.22, M.wood, 0, HEAD_Y + 0.1, FRONT_Z + 0.1)) // kamoi head beam

  // posts (hashira)
  for (let i = 0; i <= 6; i++) {
    add(box(0.17, HEAD_Y - SILL_Y, 0.17, M.wood, -HALF_W + i * BAY, (HEAD_Y + SILL_Y) / 2, FRONT_Z + 0.06))
  }

  // ── 2. Front wall, bay by bay ───────────────────────────────────────────
  // bays 1–2: shoji behind glass, koshi lattice above
  for (const cx of [-3.75, -2.25]) {
    const p = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 2.05), M.shoji)
    p.position.set(cx, 1.65, FRONT_Z + 0.04)
    group.add(p)
    add(box(1.34, 0.08, 0.08, M.wood, cx, 2.72, FRONT_Z + 0.06))
    add(box(1.34, 0.08, 0.08, M.wood, cx, 0.64, FRONT_Z + 0.06))
    add(box(0.05, 2.05, 0.07, M.wood, cx, 1.65, FRONT_Z + 0.06))
  }
  const koshiBack = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 0.52), M.paper)
  koshiBack.position.set(-3.0, 3.0, FRONT_Z + 0.04)
  group.add(koshiBack)
  const koshi = new THREE.InstancedMesh(new THREE.BoxGeometry(0.028, 0.54, 0.05), M.wood, 42)
  const mtx = new THREE.Matrix4()
  for (let i = 0; i < 42; i++) {
    mtx.makeTranslation(-4.45 + i * 0.0715, 3.0, FRONT_Z + 0.08)
    koshi.setMatrixAt(i, mtx)
  }
  koshi.castShadow = true
  group.add(koshi)

  // bay 3: plaster wall with the round window (marumado)
  const plasterFill = box(BAY - 0.14, HEAD_Y - SILL_Y, 0.12, M.plaster, -0.75, (HEAD_Y + SILL_Y) / 2, FRONT_Z + 0.02)
  group.add(plasterFill)
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.47, 0.05, 10, 48), M.wood)
  ring.position.set(-0.75, 2.0, FRONT_Z + 0.1)
  ring.castShadow = true
  group.add(ring)
  const disc = new THREE.Mesh(new THREE.CircleGeometry(0.45, 40), M.paper)
  disc.position.set(-0.75, 2.0, FRONT_Z + 0.09)
  group.add(disc)
  add(box(0.9, 0.025, 0.03, M.wood, -0.75, 2.0, FRONT_Z + 0.11))
  add(box(0.025, 0.9, 0.03, M.wood, -0.75, 2.0, FRONT_Z + 0.11))

  // bay 4: entrance — lattice sliding doors, warm light behind
  const doorGlow = new THREE.Mesh(new THREE.PlaneGeometry(1.34, 1.95), M.paper)
  doorGlow.position.set(0.75, 2.22, FRONT_Z + 0.05)
  group.add(doorGlow)
  const bars = new THREE.InstancedMesh(new THREE.BoxGeometry(0.03, 1.95, 0.05), M.wood, 18)
  for (let i = 0; i < 18; i++) {
    mtx.makeTranslation(0.09 + i * 0.0755, 2.22, FRONT_Z + 0.1)
    bars.setMatrixAt(i, mtx)
  }
  bars.castShadow = true
  group.add(bars)
  add(box(1.4, 0.72, 0.08, M.wood, 0.75, 0.88, FRONT_Z + 0.1))
  add(box(1.44, 0.1, 0.09, M.wood, 0.75, 3.22, FRONT_Z + 0.1))
  add(box(1.44, 0.09, 0.09, M.wood, 0.75, 1.27, FRONT_Z + 0.1))
  add(box(0.06, 2.75, 0.1, M.wood, 0.75, 1.9, FRONT_Z + 0.1))
  const doorLight = new THREE.PointLight(0xffa24d, 14, 11, 2)
  doorLight.position.set(0.75, 1.9, FRONT_Z + 1.4)
  group.add(doorLight)
  lights.push({ light: doorLight, base: 14, flicker: 0.05 })

  // bays 5–6: yakisugi with a lit window and a half-rolled bamboo blind
  add(box(3.0 - 0.14, HEAD_Y - SILL_Y, 0.12, M.char, 3.0, (HEAD_Y + SILL_Y) / 2, FRONT_Z + 0.03))
  const winGlow = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.0), M.paper)
  winGlow.position.set(3.0, 1.95, FRONT_Z + 0.1)
  group.add(winGlow)
  for (const [w, h, x, y] of [
    [1.26, 0.08, 3.0, 2.49],
    [1.26, 0.08, 3.0, 1.41],
    [0.08, 1.16, 2.41, 1.95],
    [0.08, 1.16, 3.59, 1.95],
  ]) add(box(w, h, 0.09, M.wood, x, y, FRONT_Z + 0.12))
  const blind = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.68), M.sudare)
  blind.position.set(3.0, 2.16, FRONT_Z + 0.16)
  blind.castShadow = true
  group.add(blind)
  const roll = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.14, 8), M.wood)
  roll.rotation.z = Math.PI / 2
  roll.position.set(3.0, 2.5, FRONT_Z + 0.17)
  group.add(roll)
  const winLight = new THREE.PointLight(0xffa04a, 9, 8, 2)
  winLight.position.set(3.0, 1.9, FRONT_Z + 1.2)
  group.add(winLight)
  lights.push({ light: winLight, base: 9, flicker: 0.04 })

  // ── 3. Noren: three cloth panels with the Bitlabs mark ──────────────────
  const norenSpecs = [
    { x: 0.27, tex: T.norenTexture('letters', 'BIT'), phase: 0 },
    { x: 0.75, tex: T.norenTexture('mark'), phase: 1.7 },
    { x: 1.23, tex: T.norenTexture('letters', 'LABS'), phase: 3.1 },
  ]
  const norens = norenSpecs.map((s) => {
    const geo = new THREE.PlaneGeometry(0.44, 1.15, 5, 9)
    geo.translate(0, -0.575, 0)
    const mesh = new THREE.Mesh(
      geo,
      new THREE.MeshStandardMaterial({ map: s.tex, roughness: 0.95, side: THREE.DoubleSide })
    )
    mesh.position.set(s.x, 2.86, FRONT_Z + 0.34)
    mesh.castShadow = true
    mesh.userData.base = geo.attributes.position.array.slice()
    mesh.userData.phase = s.phase
    group.add(mesh)
    return mesh
  })
  const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.6, 8), M.wood)
  rod.rotation.z = Math.PI / 2
  rod.position.set(0.75, 2.88, FRONT_Z + 0.34)
  group.add(rod)
  swayers.push((t, wind) => {
    for (const m of norens) {
      const pos = m.geometry.attributes.position
      const base = m.userData.base
      for (let i = 0; i < pos.count; i++) {
        const x = base[i * 3]
        const y = base[i * 3 + 1]
        const k = Math.min(1, -y / 1.15)
        const s = k * k
        pos.setZ(
          i,
          Math.sin(t * 1.5 + x * 5 + k * 3.2 + m.userData.phase) * 0.04 * s +
            (0.07 + wind * 0.2) * s * (0.6 + 0.4 * Math.sin(t * 0.9 + m.userData.phase))
        )
        pos.setX(i, x + Math.sin(t * 1.1 + k * 2 + m.userData.phase) * 0.012 * s)
      }
      pos.needsUpdate = true
      m.geometry.computeVertexNormals()
    }
  })

  // ── 4. Engawa veranda, supports and entry stones ────────────────────────
  add(box(9.3, 0.1, 1.25, M.hinoki, 0, 0.45, FRONT_Z + 0.62))
  for (let i = 0; i <= 6; i++) {
    const s = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.16, 0.4, 10), M.granite)
    s.position.set(-HALF_W + i * BAY, 0.2, FRONT_Z + 0.95)
    s.castShadow = s.receiveShadow = true
    group.add(s)
  }
  add(box(1.9, 0.28, 1.0, M.granite, 0.75, 0.14, 4.0))
  add(box(1.2, 0.14, 0.7, M.granite, 0.75, 0.07, 4.85))

  // ── 5. Roof ─────────────────────────────────────────────────────────────
  const roofRoot = new THREE.Group()
  roofRoot.position.set(0, RIDGE_Y, 0)
  group.add(roofRoot)

  const hiraGeo = (() => {
    const R = 0.5
    const a = Math.asin((TILE_PITCH * 0.98) / 2 / R)
    const g = new THREE.CylinderGeometry(R, R, 0.4, 8, 1, true, -a, a * 2)
    g.rotateX(Math.PI / 2)
    g.translate(0, R, 0)
    return g
  })()
  const maruGeo = (() => {
    const g = new THREE.CylinderGeometry(0.06, 0.078, 0.4, 10, 1, true, Math.PI / 2, Math.PI)
    g.rotateX(Math.PI / 2)
    return g
  })()
  const discGeo = (() => {
    const g = new THREE.CylinderGeometry(0.08, 0.08, 0.035, 14)
    g.rotateX(Math.PI / 2)
    return g
  })()
  const rafterGeo = new THREE.BoxGeometry(0.1, 0.13, 2.4)

  const rows = Math.ceil((SLOPE_L - 0.1) / ROW_PITCH)
  const cols = Math.round((ROOF_HW * 2) / TILE_PITCH)
  const tileColor = new THREE.Color()
  const q = new THREE.Quaternion()
  const e = new THREE.Euler()
  const v = new THREE.Vector3()
  const sc = new THREE.Vector3(1, 1, 1)
  let seed = 7
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)

  const hira = new THREE.InstancedMesh(hiraGeo, M.tile, rows * cols * 2)
  const maru = new THREE.InstancedMesh(maruGeo, M.tile, rows * (cols + 1) * 2)
  const discs = new THREE.InstancedMesh(discGeo, M.tileDark, (cols + 1) * 2)
  const rafters = new THREE.InstancedMesh(rafterGeo, M.wood, 32 * 2)
  let hi = 0
  let mi = 0
  let di = 0
  let ri = 0
  const slopeRoots = []

  for (const side of [1, -1]) {
    const outer = new THREE.Group()
    outer.rotation.y = side > 0 ? 0 : Math.PI
    const slope = new THREE.Group()
    slope.rotation.x = ALPHA
    outer.add(slope)
    roofRoot.add(outer)
    outer.updateMatrixWorld(true)
    slopeRoots.push(slope)

    // Sheathing, eave fascia, soffit, barge boards
    slope.add(box(ROOF_HW * 2, 0.2, SLOPE_L, M.wood, 0, -0.1, SLOPE_L / 2))
    slope.add(box(ROOF_HW * 2 + 0.1, 0.3, 0.1, M.wood, 0, -0.14, SLOPE_L + 0.03))
    slope.add(box(ROOF_HW * 2, 0.03, 2.4, M.wood, 0, -0.22, SLOPE_L - 1.2))
    for (const bx of [-ROOF_HW, ROOF_HW]) slope.add(box(0.14, 0.36, SLOPE_L + 0.06, M.wood, bx, -0.12, SLOPE_L / 2))

    const slopeM = new THREE.Matrix4()
    const slopeMatrix = () => {
      slope.updateWorldMatrix(true, false)
      // matrix of `slope` relative to the house group (inverse of group's world is identity here)
      return slopeM.copy(roofRoot.matrix).multiply(outer.matrix).multiply(slope.matrix)
    }
    roofRoot.updateMatrix()
    outer.updateMatrix()
    slope.updateMatrix()
    const S = slopeMatrix().clone()
    const local = new THREE.Matrix4()

    for (let j = 0; j < rows; j++) {
      const z = 0.2 + j * ROW_PITCH
      for (let k = 0; k < cols; k++) {
        const x = -ROOF_HW + TILE_PITCH * (k + 0.5)
        e.set(-0.1 + (rand() - 0.5) * 0.03, 0, 0)
        q.setFromEuler(e)
        v.set(x, 0.01 + (rand() - 0.5) * 0.004, z + (rand() - 0.5) * 0.015)
        local.compose(v, q, sc)
        hira.setMatrixAt(hi, local.premultiply(S).clone())
        const l = 0.2 + rand() * 0.07
        hira.setColorAt(hi, tileColor.setHSL(0.62, 0.08 + rand() * 0.06, l))
        hi++
      }
      for (let k = 0; k <= cols; k++) {
        const x = -ROOF_HW + TILE_PITCH * k
        e.set(-0.1, 0, 0)
        q.setFromEuler(e)
        v.set(x, 0.045, z + 0.005)
        local.compose(v, q, sc)
        maru.setMatrixAt(mi, local.premultiply(S).clone())
        const l = 0.15 + rand() * 0.06
        maru.setColorAt(mi, tileColor.setHSL(0.6, 0.07, l))
        mi++
      }
    }
    // eave-end discs (gawara) on every cover tile
    for (let k = 0; k <= cols; k++) {
      v.set(-ROOF_HW + TILE_PITCH * k, 0.06, SLOPE_L + 0.2)
      q.identity()
      local.compose(v, q, sc)
      discs.setMatrixAt(di++, local.premultiply(S).clone())
    }
    // exposed rafters under the deep eave
    for (let k = 0; k < 32; k++) {
      v.set(-ROOF_HW + 0.3 + k * 0.335, -0.3, SLOPE_L - 1.1)
      q.identity()
      local.compose(v, q, sc)
      rafters.setMatrixAt(ri++, local.premultiply(S).clone())
    }
  }
  hira.count = hi
  maru.count = mi
  discs.count = di
  rafters.count = ri
  for (const m of [hira, maru, discs, rafters]) {
    m.castShadow = true
    m.receiveShadow = true
    m.instanceMatrix.needsUpdate = true
    if (m.instanceColor) m.instanceColor.needsUpdate = true
    group.add(m)
  }

  // Ridge caps (two stacked rows) and onigawara end ornaments
  const ridgeLow = new THREE.InstancedMesh(
    (() => {
      const g = new THREE.CylinderGeometry(0.3, 0.3, 0.44, 10, 1, true, 0, Math.PI)
      g.rotateZ(Math.PI / 2)
      return g
    })(),
    M.tile,
    26
  )
  const ridgeTop = new THREE.InstancedMesh(
    (() => {
      const g = new THREE.CylinderGeometry(0.19, 0.19, 0.44, 10, 1, true, 0, Math.PI)
      g.rotateZ(Math.PI / 2)
      return g
    })(),
    M.tile,
    26
  )
  for (let i = 0; i < 26; i++) {
    const x = -5.2 + i * 0.416
    mtx.makeTranslation(x, RIDGE_Y + 0.02, 0)
    ridgeLow.setMatrixAt(i, mtx)
    ridgeLow.setColorAt(i, tileColor.setHSL(0.6, 0.06, 0.2 + rand() * 0.05))
    mtx.makeTranslation(x + 0.03, RIDGE_Y + 0.2, 0)
    ridgeTop.setMatrixAt(i, mtx)
    ridgeTop.setColorAt(i, tileColor.setHSL(0.6, 0.06, 0.17 + rand() * 0.05))
  }
  for (const m of [ridgeLow, ridgeTop]) {
    m.castShadow = true
    group.add(m)
  }
  for (const sx of [-1, 1]) {
    const on = new THREE.Group()
    on.position.set(sx * 5.3, RIDGE_Y + 0.22, 0)
    on.add(box(0.5, 0.5, 0.56, M.tileDark, 0, 0.12, 0))
    const fin = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.78, 6), M.tileDark)
    fin.position.set(sx * 0.02, 0.7, 0)
    fin.rotation.z = -sx * 0.28
    fin.castShadow = true
    on.add(fin)
    const orb = new THREE.Mesh(new THREE.SphereGeometry(0.065, 12, 10), M.copper)
    orb.position.set(sx * 0.0, 0.19, 0.29)
    on.add(orb)
    group.add(on)
  }

  // Gable end walls (plaster with a timber frame)
  for (const sx of [-1, 1]) {
    const under = (z) => RIDGE_Y - 0.2 - Math.abs(z) * TAN
    const shape = new THREE.Shape()
    shape.moveTo(-2.2, TOP_Y)
    shape.lineTo(2.2, TOP_Y)
    shape.lineTo(2.2, under(2.2))
    shape.lineTo(0, under(0))
    shape.lineTo(-2.2, under(-2.2))
    shape.closePath()
    const g = new THREE.Mesh(new THREE.ShapeGeometry(shape), M.plaster)
    g.rotation.y = sx * (Math.PI / 2)
    g.position.x = sx * (HALF_W + 0.02)
    g.receiveShadow = true
    group.add(g)
    add(box(0.12, 0.14, 4.5, M.wood, sx * (HALF_W + 0.07), TOP_Y + 0.07, 0))
    add(box(0.12, under(0) - TOP_Y, 0.12, M.wood, sx * (HALF_W + 0.07), (under(0) + TOP_Y) / 2, 0))
  }

  // ── 6. Lanterns, rain chain, stone basin, stone lantern ─────────────────
  const lanternGeo = new THREE.LatheGeometry(
    [[0.001, -0.23], [0.09, -0.21], [0.15, -0.11], [0.17, 0], [0.15, 0.11], [0.09, 0.21], [0.001, 0.23]].map(
      ([r, y]) => new THREE.Vector2(r, y)
    ),
    18
  )
  const lanternGroups = []
  for (const x of [-0.45, 1.95]) {
    const l = new THREE.Group()
    l.position.set(x, 2.85, FRONT_Z + 1.15)
    const body = new THREE.Mesh(lanternGeo, M.lantern)
    l.add(body)
    for (const dy of [0.25, -0.25]) {
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.045, 12), M.tileDark)
      cap.position.y = dy
      l.add(cap)
    }
    const string = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.55, 4), M.tileDark)
    string.position.y = 0.52
    l.add(string)
    const pl = new THREE.PointLight(0xff8a3a, 7, 7, 2)
    l.add(pl)
    lights.push({ light: pl, base: 7, flicker: 0.12 })
    group.add(l)
    lanternGroups.push(l)
  }
  swayers.push((t, wind) => {
    lanternGroups.forEach((l, i) => {
      l.rotation.z = Math.sin(t * 1.1 + i * 2) * 0.05 + wind * 0.08
      l.rotation.x = Math.cos(t * 0.8 + i) * 0.03
    })
  })

  // rain chain (kusari-doi) hanging into a stone basin
  const chain = new THREE.Group()
  chain.position.set(5.05, 3.4, FRONT_Z + 1.4)
  const linkGeo = new THREE.TorusGeometry(0.055, 0.013, 6, 12)
  for (let i = 0; i < 12; i++) {
    const l = new THREE.Mesh(linkGeo, M.copper)
    l.position.y = -0.1 - i * 0.235
    l.rotation.y = (i % 2) * (Math.PI / 2)
    l.scale.y = 1.7
    l.castShadow = true
    chain.add(l)
  }
  const cupGeo = new THREE.CylinderGeometry(0.1, 0.06, 0.11, 10, 1, true)
  for (let i = 0; i < 4; i++) {
    const c = new THREE.Mesh(cupGeo, M.copper)
    c.material.side = THREE.DoubleSide
    c.position.y = -0.55 - i * 0.7
    chain.add(c)
  }
  group.add(chain)
  swayers.push((t, wind) => {
    chain.rotation.z = Math.sin(t * 1.3) * 0.015 + wind * 0.05
  })
  const basin = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.36, 0.46, 18), M.granite)
  basin.position.set(5.05, 0.23, FRONT_Z + 1.4)
  basin.castShadow = basin.receiveShadow = true
  group.add(basin)
  const water = new THREE.Mesh(new THREE.CircleGeometry(0.34, 24), M.water)
  water.rotation.x = -Math.PI / 2
  water.position.set(5.05, 0.462, FRONT_Z + 1.4)
  group.add(water)

  // stone lantern (ishidoro)
  const ishi = new THREE.Group()
  ishi.position.set(-6.3, 0, 4.6)
  const part = (geo, mat, y) => {
    const m = new THREE.Mesh(geo, mat)
    m.position.y = y
    m.castShadow = m.receiveShadow = true
    ishi.add(m)
    return m
  }
  part(new THREE.BoxGeometry(0.9, 0.14, 0.9), M.granite, 0.07)
  part(new THREE.CylinderGeometry(0.13, 0.16, 0.85, 8), M.granite, 0.56)
  part(new THREE.CylinderGeometry(0.32, 0.26, 0.12, 8), M.granite, 1.04)
  part(new THREE.BoxGeometry(0.42, 0.06, 0.42), M.granite, 1.13)
  part(new THREE.BoxGeometry(0.26, 0.36, 0.26), M.stoneLit, 1.34)
  for (const [px, pz] of [[0.17, 0.17], [-0.17, 0.17], [0.17, -0.17], [-0.17, -0.17]]) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.38, 0.05), M.granite)
    post.position.set(px, 1.34, pz)
    post.castShadow = true
    ishi.add(post)
  }
  part(new THREE.BoxGeometry(0.46, 0.06, 0.46), M.granite, 1.55)
  const roofIshi = part(new THREE.ConeGeometry(0.58, 0.34, 4), M.granite, 1.75)
  roofIshi.rotation.y = Math.PI / 4
  part(new THREE.SphereGeometry(0.07, 10, 8), M.granite, 1.98)
  const ishiLight = new THREE.PointLight(0xffa050, 6, 6, 2)
  ishiLight.position.y = 1.4
  ishi.add(ishiLight)
  lights.push({ light: ishiLight, base: 6, flicker: 0.1 })
  group.add(ishi)

  // Make every texture crisp at grazing angles
  group.traverse((o) => {
    if (!o.material) return
    ;(Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => {
      for (const k of ['map', 'bumpMap', 'emissiveMap']) if (m[k]) m[k].anisotropy = maxAniso
    })
  })

  return {
    group,
    lights,
    update(t, wind = 0, glow = 1) {
      swayers.forEach((fn) => fn(t, wind))
      lights.forEach((l, i) => {
        const f = 1 + Math.sin(t * (7 + i * 1.3) + i * 3) * l.flicker * 0.6 + Math.sin(t * 17 + i) * l.flicker * 0.4
        l.light.intensity = l.base * f * glow
      })
      M.lantern.emissiveIntensity = 1.5 * glow
      M.shoji.emissiveIntensity = 1.1 * glow
      M.paper.emissiveIntensity = 1.15 * glow
      M.stoneLit.emissiveIntensity = 1.6 * glow
    },
  }
}

export const HOUSE = { HALF_W, FRONT_Z, RIDGE_Y, EAVE_Y }

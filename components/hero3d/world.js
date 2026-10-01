// The world around the house: dusk sky shader, mountains, ground + raked gravel, procedural
// sakura trees and drifting petals.
import * as THREE from 'three'
import { rng, lerp } from './utils'
import * as T from './textures'

// ── Sky ─────────────────────────────────────────────────────────────────────
const SKY_FRAG = /* glsl */ `
  uniform vec3 uTop; uniform vec3 uMid; uniform vec3 uHor;
  uniform vec3 uSunDir; uniform vec3 uSunCol;
  uniform float uDusk; uniform float uTime;
  varying vec3 vDir;

  float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
  float noise(vec2 p){
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1,0)), f.x), mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), f.x), f.y);
  }
  float fbm(vec2 p){ float a = 0.5, s = 0.0; for (int i = 0; i < 4; i++){ s += a * noise(p); p *= 2.03; a *= 0.5; } return s; }

  void main(){
    vec3 d = normalize(vDir);
    float h = d.y;
    vec3 col = mix(uHor, uMid, smoothstep(-0.02, 0.22, h));
    col = mix(col, uTop, smoothstep(0.18, 0.75, h));
    col = mix(uHor * 0.55, col, smoothstep(-0.25, 0.0, h)); // below horizon

    float sd = max(dot(d, normalize(uSunDir)), 0.0);
    float az = max(dot(normalize(vec3(d.x, 0.0, d.z)), normalize(vec3(uSunDir.x, 0.0, uSunDir.z))), 0.0);
    col += uSunCol * (pow(sd, 5.0) * 0.32 + pow(sd, 48.0) * 0.7);
    col += uSunCol * 0.5 * exp(-abs(h) * 7.0) * pow(az, 3.0);
    col += uSunCol * smoothstep(0.99935, 0.99975, sd) * 3.2;

    // thin sunset cloud streaks, lit from below by the sun
    vec2 cuv = d.xz / (h + 0.22) * vec2(0.7, 1.7) + vec2(uTime * 0.004, 0.0);
    float cl = fbm(cuv * 1.6);
    float cloud = smoothstep(0.52, 0.86, cl) * smoothstep(0.025, 0.2, h) * (1.0 - smoothstep(0.35, 0.65, h));
    vec3 cloudCol = mix(uMid * 0.8, uSunCol * 1.15, pow(az, 2.0) * (1.0 - uDusk * 0.5));
    col = mix(col, cloudCol, cloud * 0.55);

    // stars fade in as the dusk deepens
    float st = step(0.9982, hash(floor(d.xz / (h + 1.2) * 260.0))) * smoothstep(0.12, 0.5, h);
    col += vec3(0.9, 0.95, 1.0) * st * uDusk * (0.55 + 0.45 * sin(uTime * 2.0 + h * 90.0));

    gl_FragColor = vec4(col, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`

const STATES = {
  golden: { top: 0x2d2d6b, mid: 0x9a4e7c, hor: 0xff7a35, sun: 0xff8f45, fog: 0xd9744a },
  twilight: { top: 0x0a0b22, mid: 0x2b2152, hor: 0x8a3340, sun: 0xff6a30, fog: 0x3a2548 },
}

export function createSky() {
  const uniforms = {
    uTop: { value: new THREE.Color(STATES.golden.top) },
    uMid: { value: new THREE.Color(STATES.golden.mid) },
    uHor: { value: new THREE.Color(STATES.golden.hor) },
    uSunCol: { value: new THREE.Color(STATES.golden.sun) },
    uSunDir: { value: new THREE.Vector3(-0.28, 0.16, -1).normalize() },
    uDusk: { value: 0 },
    uTime: { value: 0 },
  }
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(420, 32, 20),
    new THREE.ShaderMaterial({
      uniforms,
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
      vertexShader: `varying vec3 vDir; void main(){ vDir = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: SKY_FRAG,
    })
  )
  mesh.frustumCulled = false
  mesh.renderOrder = -10
  const c = new THREE.Color()
  return {
    mesh,
    uniforms,
    set(dusk, elev, t) {
      const a = STATES.golden
      const b = STATES.twilight
      uniforms.uTop.value.set(a.top).lerp(c.set(b.top), dusk)
      uniforms.uMid.value.set(a.mid).lerp(c.set(b.mid), dusk)
      uniforms.uHor.value.set(a.hor).lerp(c.set(b.hor), dusk)
      uniforms.uSunCol.value.set(a.sun).lerp(c.set(b.sun), dusk)
      uniforms.uSunDir.value.set(-0.28, elev, -1).normalize()
      uniforms.uDusk.value = dusk
      uniforms.uTime.value = t
    },
    fogColor(dusk) {
      return new THREE.Color(STATES.golden.fog).lerp(c.set(STATES.twilight.fog), dusk)
    },
  }
}

// ── Mountains ───────────────────────────────────────────────────────────────
export function createMountains() {
  const group = new THREE.Group()
  const layers = [
    { z: -150, base: 6, amp: 26, color: 0x7a5f86, seed: 1.3, sx: 0.035 },
    { z: -105, base: 3, amp: 20, color: 0x56456f, seed: 4.1, sx: 0.05 },
    { z: -68, base: 1, amp: 14, color: 0x352c52, seed: 7.7, sx: 0.07 },
  ]
  const mats = []
  layers.forEach((l) => {
    const s = new THREE.Shape()
    s.moveTo(-200, -12)
    for (let x = -200; x <= 200; x += 3) {
      const n =
        0.5 * Math.sin(x * l.sx + l.seed) +
        0.3 * Math.sin(x * l.sx * 2.7 + l.seed * 2) +
        0.2 * Math.sin(x * l.sx * 6.1 + l.seed * 3)
      s.lineTo(x, l.base + l.amp * (0.55 + 0.45 * n) * (0.4 + 0.6 * Math.abs(Math.sin(x * 0.011 + l.seed))))
    }
    s.lineTo(200, -12)
    const mat = new THREE.MeshBasicMaterial({ color: l.color, fog: true })
    mat.userData.base = new THREE.Color(l.color)
    mats.push(mat)
    const m = new THREE.Mesh(new THREE.ShapeGeometry(s), mat)
    m.position.z = l.z
    group.add(m)
  })
  const dark = new THREE.Color(0x0c0b1c)
  return {
    group,
    set(dusk) {
      mats.forEach((m) => m.color.copy(m.userData.base).lerp(dark, dusk * 0.55))
    },
  }
}

// ── Ground, gravel, stepping stones, moss ───────────────────────────────────
export function createGround(maxAniso = 4) {
  const group = new THREE.Group()
  const moss = T.mossTextures([40, 40])
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(260, 260),
    new THREE.MeshStandardMaterial({ map: moss.map, color: 0x6b7a55, roughness: 1 })
  )
  ground.rotation.x = -Math.PI / 2
  ground.receiveShadow = true
  group.add(ground)

  const gr = T.gravelTextures([14, 5])
  gr.map.anisotropy = gr.bump.anisotropy = maxAniso
  const gravel = new THREE.Mesh(
    new THREE.PlaneGeometry(28, 10),
    new THREE.MeshStandardMaterial({ map: gr.map, bumpMap: gr.bump, bumpScale: 2.2, roughness: 0.95 })
  )
  gravel.rotation.x = -Math.PI / 2
  gravel.position.set(0, 0.012, 9.6)
  gravel.receiveShadow = true
  group.add(gravel)

  const granite = T.graniteTextures([1, 1])
  const stoneMat = new THREE.MeshStandardMaterial({ map: granite.map, bumpMap: granite.bump, bumpScale: 1.2, roughness: 0.85 })
  const stoneGeo = new THREE.CylinderGeometry(0.5, 0.56, 0.16, 9)
  const r = rng(12)
  ;[
    [0.9, 5.7], [0.45, 7.0], [1.2, 8.3], [0.7, 9.7], [1.3, 11.2], [0.9, 12.7],
  ].forEach(([x, z]) => {
    const s = new THREE.Mesh(stoneGeo, stoneMat)
    s.position.set(x, 0.07, z)
    s.scale.set(1 + r() * 0.4, 1, 0.85 + r() * 0.4)
    s.rotation.y = r() * 3
    s.castShadow = s.receiveShadow = true
    group.add(s)
  })

  const mossMat = new THREE.MeshStandardMaterial({ map: moss.map, color: 0x88a45a, roughness: 1 })
  const mossGeo = new THREE.IcosahedronGeometry(1, 2)
  const patches = [
    [-5.1, 3.1, 1.1], [5.9, 4.4, 0.9], [-6.4, 5.4, 0.8], [6.6, 2.3, 1.2], [-2.8, 3.8, 0.55],
    [3.6, 4.1, 0.5], [-9.5, 2.2, 1.5], [9.5, 3.5, 1.3], [-4.2, -3.0, 1.2], [4.8, -3.2, 1.0],
  ]
  patches.forEach(([x, z, s]) => {
    const m = new THREE.Mesh(mossGeo, mossMat)
    m.scale.set(s, s * 0.16, s * 0.9)
    m.position.set(x, 0.015, z)
    m.receiveShadow = true
    group.add(m)
  })
  return { group }
}

// ── Sakura ──────────────────────────────────────────────────────────────────
function taperedTube(curve, r0, r1, seg, mat) {
  const radial = 7
  const geo = new THREE.TubeGeometry(curve, seg, 1, radial, false)
  const pos = geo.attributes.position
  const c = new THREE.Vector3()
  const v = new THREE.Vector3()
  for (let i = 0; i <= seg; i++) {
    curve.getPointAt(i / seg, c)
    const rad = lerp(r0, r1, i / seg)
    for (let j = 0; j <= radial; j++) {
      const idx = i * (radial + 1) + j
      v.fromBufferAttribute(pos, idx).sub(c).multiplyScalar(rad).add(c)
      pos.setXYZ(idx, v.x, v.y, v.z)
    }
  }
  geo.computeVertexNormals()
  const m = new THREE.Mesh(geo, mat)
  m.castShadow = m.receiveShadow = true
  return m
}

export function createSakura(seed, barkMat, blossomMat, blossomGeo, count = 70) {
  const r = rng(seed)
  const g = new THREE.Group()
  const lean = (r() - 0.5) * 0.8
  const trunk = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(lean * 0.3, 1.2, 0.1),
    new THREE.Vector3(-lean * 0.4, 2.3, -0.1),
    new THREE.Vector3(lean * 0.6, 3.3, 0.1),
    new THREE.Vector3(lean, 4.1, 0),
  ])
  g.add(taperedTube(trunk, 0.3, 0.1, 22, barkMat))

  const anchors = [trunk.getPoint(1)]
  const branches = 7
  for (let i = 0; i < branches; i++) {
    const start = trunk.getPoint(0.42 + (0.56 * i) / branches)
    const ang = i * 2.4 + r() * 0.8
    const len = 1.5 + r() * 1.3
    const dir = new THREE.Vector3(Math.cos(ang), 0.45 + r() * 0.45, Math.sin(ang))
    const p1 = start.clone().addScaledVector(dir, len * 0.4).add(new THREE.Vector3(0, -0.15, 0))
    const p2 = start.clone().addScaledVector(dir, len * 0.75).add(new THREE.Vector3(0, 0.2, 0))
    const p3 = start.clone().addScaledVector(dir, len).add(new THREE.Vector3(0, 0.55, 0))
    const bc = new THREE.CatmullRomCurve3([start, p1, p2, p3])
    g.add(taperedTube(bc, 0.1, 0.025, 10, barkMat))
    anchors.push(p2, p3)
  }

  const blossoms = new THREE.InstancedMesh(blossomGeo, blossomMat, count)
  const m = new THREE.Matrix4()
  const q = new THREE.Quaternion()
  const e = new THREE.Euler()
  const col = new THREE.Color()
  for (let i = 0; i < count; i++) {
    const a = anchors[(r() * anchors.length) | 0]
    const s = 0.55 + r() * 0.75
    const p = new THREE.Vector3(a.x + (r() - 0.5) * 2.0, a.y + (r() - 0.35) * 1.3, a.z + (r() - 0.5) * 2.0)
    e.set(r() * 3, r() * 3, r() * 3)
    q.setFromEuler(e)
    m.compose(p, q, new THREE.Vector3(s, s * 0.82, s))
    blossoms.setMatrixAt(i, m)
    blossoms.setColorAt(i, col.setHSL(0.96 + (r() - 0.5) * 0.03, 0.6 + r() * 0.3, 0.8 + r() * 0.1))
  }
  blossoms.castShadow = true
  blossoms.receiveShadow = true
  g.add(blossoms)
  return g
}

// ── Petals ──────────────────────────────────────────────────────────────────
export function createPetals(count) {
  const geo = new THREE.CircleGeometry(0.5, 5)
  geo.scale(0.11, 0.07, 1)
  const mat = new THREE.MeshStandardMaterial({
    color: 0xffc9d8,
    emissive: 0x7a2a45,
    emissiveIntensity: 0.55,
    roughness: 0.9,
    side: THREE.DoubleSide,
  })
  const mesh = new THREE.InstancedMesh(geo, mat, count)
  const r = rng(99)
  const data = Array.from({ length: count }, () => ({
    x: (r() - 0.5) * 34,
    y: r() * 10,
    z: -8 + r() * 22,
    v: 0.22 + r() * 0.35,
    ph: r() * 6.28,
    sp: 0.6 + r() * 1.6,
    rx: r() * 6,
    ry: r() * 6,
    rz: r() * 6,
    sx: (r() - 0.5) * 2,
  }))
  const d = new THREE.Object3D()
  mesh.frustumCulled = false
  const state = { wind: 0, windZ: 0 }
  return {
    mesh,
    state,
    update(t, dt) {
      for (let i = 0; i < count; i++) {
        const p = data[i]
        p.y -= p.v * dt
        p.x += (Math.sin(t * p.sp + p.ph) * 0.35 + 0.28 + state.wind * (0.8 + p.sx * 0.3)) * dt
        p.z += (Math.cos(t * p.sp * 0.8 + p.ph) * 0.18 + state.windZ) * dt
        p.rx += dt * p.sp * 0.9
        p.ry += dt * p.sp * 0.6
        p.rz += dt * 0.4
        if (p.y < 0.02) {
          p.y = 9 + r() * 2
          p.x = (r() - 0.5) * 34
          p.z = -8 + r() * 22
        }
        if (p.x > 18) p.x = -18
        d.position.set(p.x, p.y, p.z)
        d.rotation.set(p.rx, p.ry, p.rz)
        d.updateMatrix()
        mesh.setMatrixAt(i, d.matrix)
      }
      mesh.instanceMatrix.needsUpdate = true
    },
  }
}

export function createBlossomAssets(maxAniso = 4) {
  const bark = T.woodTextures('#3a2a22', '#1c120d', '#5a4034', 12, [1, 3])
  bark.map.anisotropy = maxAniso
  const barkMat = new THREE.MeshStandardMaterial({ map: bark.map, bumpMap: bark.bump, bumpScale: 2, roughness: 1 })
  // lumpy cloud-like blossom puff
  const geo = new THREE.IcosahedronGeometry(1, 3)
  const p = geo.attributes.position
  const r = rng(5)
  const v = new THREE.Vector3()
  const cache = new Map()
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i)
    const key = `${v.x.toFixed(3)},${v.y.toFixed(3)},${v.z.toFixed(3)}`
    if (!cache.has(key)) cache.set(key, 0.82 + r() * 0.34)
    v.multiplyScalar(cache.get(key))
    p.setXYZ(i, v.x, v.y, v.z)
  }
  geo.computeVertexNormals()
  const mat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0x5a1c36,
    emissiveIntensity: 0.4,
    roughness: 0.95,
  })
  return { barkMat, blossomGeo: geo, blossomMat: mat }
}


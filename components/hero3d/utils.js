// Small helpers shared by the hero scene modules.
import * as THREE from 'three'

export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
export const lerp = (a, b, t) => a + (b - a) * t
export const smoothstep = (a, b, v) => {
  const t = clamp((v - a) / (b - a))
  return t * t * (3 - 2 * t)
}

// Deterministic PRNG so the scene looks identical on every load.
export function rng(seed = 1) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * The "survey" intro. Every lit material is patched so that:
 *  - geometry above `uReveal` (world Y) is discarded, with a glowing hologram
 *    band right under the rising plane;
 *  - a vertical scan band (`uSurveyX`) sweeps across the finished house.
 * Uniforms are shared, so one object drives the whole scene.
 */
export function patchReveal(material, shared) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uReveal = shared.uReveal
    shader.uniforms.uSurveyX = shared.uSurveyX

    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vRevealPos;')
      .replace(
        '#include <project_vertex>',
        `#include <project_vertex>
        vec4 revealP = vec4(transformed, 1.0);
        #ifdef USE_INSTANCING
          revealP = instanceMatrix * revealP;
        #endif
        vRevealPos = (modelMatrix * revealP).xyz;`
      )

    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        '#include <common>\nvarying vec3 vRevealPos;\nuniform float uReveal;\nuniform float uSurveyX;'
      )
      .replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
        float dReveal = uReveal - vRevealPos.y;
        if (dReveal < 0.0) discard;
        float rBand = smoothstep(0.55, 0.0, dReveal) * step(uReveal, 40.0);
        float rStripe = 0.55 + 0.45 * step(0.5, fract(vRevealPos.y * 7.0));
        totalEmissiveRadiance += vec3(1.0, 0.36, 0.06) * rBand * rStripe * 2.4;
        float sBand = smoothstep(0.7, 0.0, abs(vRevealPos.x - uSurveyX)) * step(abs(uSurveyX), 40.0);
        totalEmissiveRadiance += vec3(1.0, 0.42, 0.1) * sBand * 0.55;`
      )
  }
  material.customProgramCacheKey = () => 'reveal'
  material.needsUpdate = true
  return material
}

// Same discard for the shadow pass, so the unbuilt house doesn't cast a shadow during the intro.
function makeRevealDepth(shared) {
  const m = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking })
  m.onBeforeCompile = (shader) => {
    shader.uniforms.uReveal = shared.uReveal
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vRevealPos;')
      .replace(
        '#include <project_vertex>',
        `#include <project_vertex>
        vec4 revealP = vec4(transformed, 1.0);
        #ifdef USE_INSTANCING
          revealP = instanceMatrix * revealP;
        #endif
        vRevealPos = (modelMatrix * revealP).xyz;`
      )
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vRevealPos;\nuniform float uReveal;')
      .replace('void main() {', 'void main() {\n  if (uReveal < vRevealPos.y) discard;')
  }
  m.customProgramCacheKey = () => 'revealDepth'
  return m
}

export function applyRevealTo(root, shared) {
  const seen = new Set()
  const depth = makeRevealDepth(shared)
  root.traverse((o) => {
    if (o.isMesh && o.castShadow) o.customDepthMaterial = depth
    if (!o.material) return
    const mats = Array.isArray(o.material) ? o.material : [o.material]
    mats.forEach((m) => {
      if (seen.has(m) || !m.isMeshStandardMaterial) return
      seen.add(m)
      patchReveal(m, shared)
    })
  })
}

export function disposeTree(root) {
  const mats = new Set()
  root.traverse((o) => {
    if (o.geometry) o.geometry.dispose()
    if (o.customDepthMaterial) mats.add(o.customDepthMaterial)
    if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => mats.add(m))
  })
  mats.forEach((m) => {
    for (const k in m) if (m[k] && m[k].isTexture) m[k].dispose()
    m.dispose()
  })
}

export function box(w, h, d, mat, x = 0, y = 0, z = 0, { cast = true, receive = true } = {}) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat)
  m.position.set(x, y, z)
  m.castShadow = cast
  m.receiveShadow = receive
  return m
}

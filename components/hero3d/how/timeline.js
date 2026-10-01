// Shared scroll → scene timeline for "How we work". s ∈ [0, 4].
//   plot k builds during  [k-0.1, k+0.45]
//   arc  k→k+1 draws during [k+0.4, k+0.9]; the camera travels during [k+0.45, k+1]
//   s ∈ [3.45, 4] the camera pulls back to the overview and the CTA appears
export const PLOTS = [
  [-13, 3],
  [-4.5, -3],
  [4.5, 3],
  [13, -3],
]

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
export const ss = (a, b, v) => {
  const t = clamp((v - a) / (b - a))
  return t * t * (3 - 2 * t)
}

export function timeline(sRaw) {
  const s = clamp(sRaw, 0, 4)
  const g = [0, 1, 2, 3].map((k) => ss(k === 0 ? 0 : k - 0.1, k + 0.45, s))
  const q = [0, 1, 2].map((k) => ss(k + 0.4, k + 0.9, s))
  let f = 3
  if (s < 3) {
    const k = Math.floor(s)
    f = k + ss(k + 0.45, k + 1, s)
  }
  const ov = ss(3.45, 4, s)
  return { s, g, q, f, ov, idx: Math.min(3, Math.round(f)), cta: ov > 0.55 }
}

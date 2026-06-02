'use client'
import { useEffect } from 'react'
import { useTweaks, TweaksPanel, TweakSection, TweakRadio, TweakColor } from './TweaksPanel'

const ACCENTS = {
  '#FF4D00': ['#FF4D00', '#E64500', '#FF7A3D', 255, 77, 0],
  '#2A6FDB': ['#2A6FDB', '#1E57C4', '#5C8FE8', 42, 111, 219],
  '#0D9B6E': ['#0D9B6E', '#0A7A57', '#3AB88A', 13, 155, 110],
  '#7B3FE4': ['#7B3FE4', '#6128C9', '#A070EF', 123, 63, 228],
}

const PERSONALITY = {
  Editorial: { dw: 200, dt: '-0.045em', sw: 400, cs: 500 },
  Studio:    { dw: 300, dt: '-0.035em', sw: 400, cs: 500 },
  Bold:      { dw: 500, dt: '-0.018em', sw: 500, cs: 600 },
}

const SURFACES = {
  Warm:  { bg: '#FAFAF8', bg2: '#F3F2ED', ink: '17,17,17',    dark: '#0A0A0A', dark2: '#121212', onDark: '244,243,239' },
  Crisp: { bg: '#FFFFFF',  bg2: '#F5F5F5', ink: '13,13,13',    dark: '#0A0A0A', dark2: '#0F0F0F', onDark: '244,243,239' },
  Dark:  { bg: '#0D0D0D',  bg2: '#141414', ink: '237,235,230', dark: '#1C1C1C', dark2: '#222222', onDark: '244,243,239' },
}

function applyTweaks(t) {
  const root = document.documentElement
  const set = (k, v) => root.style.setProperty(k, v)

  const ac = ACCENTS[t.accent] || ACCENTS['#FF4D00']
  set('--orange',      ac[0])
  set('--orange-600',  ac[1])
  set('--orange-300',  ac[2])
  set('--shadow-glow', `0 24px 60px -22px rgba(${ac[3]},${ac[4]},${ac[5]},0.55)`)

  const sf = SURFACES[t.surface] || SURFACES.Warm
  set('--bg',        sf.bg)
  set('--bg-2',      sf.bg2)
  set('--ink',       `rgb(${sf.ink})`)
  set('--ink-60',    `rgba(${sf.ink},0.6)`)
  set('--ink-40',    `rgba(${sf.ink},0.4)`)
  set('--ink-12',    `rgba(${sf.ink},0.12)`)
  set('--ink-06',    `rgba(${sf.ink},0.06)`)
  set('--dark',      sf.dark)
  set('--dark-2',    sf.dark2)
  set('--on-dark',   `rgb(${sf.onDark})`)
  set('--on-dark-60',`rgba(${sf.onDark},0.6)`)
  set('--on-dark-40',`rgba(${sf.onDark},0.4)`)
  set('--on-dark-12',`rgba(${sf.onDark},0.12)`)

  const p = PERSONALITY[t.personality] || PERSONALITY.Studio
  let ss = document.getElementById('tweak-personality')
  if (!ss) {
    ss = document.createElement('style')
    ss.id = 'tweak-personality'
    document.head.appendChild(ss)
  }
  ss.textContent = `
    .display { font-weight: ${p.dw} !important; letter-spacing: ${p.dt} !important; }
    .h2      { font-weight: ${p.dw} !important; }
    h1,h2,h3 { font-weight: ${p.dw} !important; }
    .value h3, .card h3, .step h3, .who .name, .btn { font-weight: ${p.cs} !important; }
    .lead     { font-weight: ${p.sw} !important; }
    .eyebrow  { letter-spacing: ${t.personality === 'Bold' ? '0.18em' : '0.32em'} !important; }
    ${t.personality === 'Editorial' ? `
      body { letter-spacing: 0.01em; }
      .section-pad { padding-block: clamp(100px, 15vw, 200px) !important; }
    ` : ''}
    ${t.personality === 'Bold' ? `
      .section-pad { padding-block: clamp(64px, 9vw, 120px) !important; }
      .card { border-radius: 14px !important; }
    ` : ''}
  `
}

const TWEAK_DEFAULTS = {
  personality: 'Studio',
  accent: '#FF4D00',
  surface: 'Warm',
}

export function TweaksApp() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS)

  useEffect(() => {
    applyTweaks(t)
  }, [t.personality, t.accent, t.surface])

  return (
    <TweaksPanel title="Bitlabs Tweaks">
      <TweakSection label="Personality" />
      <TweakRadio
        label="Feel"
        value={t.personality}
        options={['Editorial', 'Studio', 'Bold']}
        onChange={(v) => setTweak('personality', v)}
      />

      <TweakSection label="Accent" />
      <TweakColor
        label="Brand color"
        value={t.accent}
        options={['#FF4D00', '#2A6FDB', '#0D9B6E', '#7B3FE4']}
        onChange={(v) => setTweak('accent', v)}
      />

      <TweakSection label="Surface" />
      <TweakRadio
        label="Theme"
        value={t.surface}
        options={['Warm', 'Crisp', 'Dark']}
        onChange={(v) => setTweak('surface', v)}
      />
    </TweaksPanel>
  )
}

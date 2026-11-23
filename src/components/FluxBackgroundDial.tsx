import { useEffect } from 'react'
import { DialRoot, useDialKit } from 'dialkit'
import 'dialkit/styles.css'
import {
  defaultFluxBackgroundSettings as defaults,
  setFluxBackgroundSettings,
} from '../lib/flux-background-settings'

export default function FluxBackgroundDial() {
  const params = useDialKit('Flux capacitor', {
    light: {
      brightness: [defaults.brightness, 0.2, 3],
      bloom: [defaults.bloom, 0, 3],
      warmth: [defaults.warmth, 0, 1],
    },
    motion: {
      speed: [defaults.speed, 0, 3],
      paused: defaults.paused,
    },
    patina: {
      grain: [defaults.grain, 0, 3],
      scanlines: [defaults.scanlines, 0, 3],
    },
    shape: {
      spread: [defaults.spread, 0.4, 1.6],
      offsetX: [defaults.offsetX, -0.3, 0.3],
      offsetY: [defaults.offsetY, -0.25, 0.25],
    },
  })

  const { brightness, bloom, warmth } = params.light
  const { speed, paused } = params.motion
  const { grain, scanlines } = params.patina
  const { spread, offsetX, offsetY } = params.shape

  useEffect(() => {
    setFluxBackgroundSettings({
      brightness,
      bloom,
      warmth,
      speed,
      paused,
      grain,
      scanlines,
      spread,
      offsetX,
      offsetY,
    })
  }, [
    brightness,
    bloom,
    warmth,
    speed,
    paused,
    grain,
    scanlines,
    spread,
    offsetX,
    offsetY,
  ])

  return <DialRoot position="bottom-right" />
}

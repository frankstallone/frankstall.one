export type FluxBackgroundSettings = {
  brightness: number
  bloom: number
  warmth: number
  speed: number
  grain: number
  scanlines: number
  spread: number
  offsetX: number
  offsetY: number
  paused: boolean
}

export const defaultFluxBackgroundSettings: Readonly<FluxBackgroundSettings> =
  Object.freeze({
    brightness: 1.33,
    bloom: 0.89,
    warmth: 1,
    speed: 2.26,
    grain: 1.89,
    scanlines: 1.04,
    spread: 1,
    offsetX: 0,
    offsetY: 0,
    paused: false,
  })

const ranges = {
  brightness: [0.2, 3],
  bloom: [0, 3],
  warmth: [0, 1],
  speed: [0, 3],
  grain: [0, 3],
  scanlines: [0, 3],
  spread: [0.4, 1.6],
  offsetX: [-0.3, 0.3],
  offsetY: [-0.25, 0.25],
} satisfies Record<
  Exclude<keyof FluxBackgroundSettings, 'paused'>,
  [number, number]
>

let settings = defaultFluxBackgroundSettings
const listeners = new Set<
  (settings: Readonly<FluxBackgroundSettings>) => void
>()

export function getFluxBackgroundSettings(): Readonly<FluxBackgroundSettings> {
  return settings
}

export function setFluxBackgroundSettings(
  patch: Partial<FluxBackgroundSettings>,
): void {
  const next = { ...settings }
  for (const key of Object.keys(ranges) as (keyof typeof ranges)[]) {
    const value = patch[key]
    if (typeof value === 'number' && Number.isFinite(value)) {
      const [min, max] = ranges[key]
      next[key] = Math.min(max, Math.max(min, value))
    }
  }
  if (typeof patch.paused === 'boolean') next.paused = patch.paused
  if (
    (Object.keys(next) as (keyof FluxBackgroundSettings)[]).every(
      (key) => next[key] === settings[key],
    )
  )
    return
  settings = Object.freeze(next)
  for (const listener of listeners) listener(settings)
}

export function subscribeFluxBackgroundSettings(
  listener: (settings: Readonly<FluxBackgroundSettings>) => void,
): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

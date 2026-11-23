import { afterEach, describe, expect, it, vi } from 'vitest'
import { mountFluxBackground } from './flux-background'
import {
  defaultFluxBackgroundSettings,
  getFluxBackgroundSettings,
  setFluxBackgroundSettings,
  subscribeFluxBackgroundSettings,
} from './flux-background-settings'

function setup(reducedMotion = false) {
  const context = {
    createProgram: vi.fn(() => ({})),
    createBuffer: vi.fn(() => ({})),
    createShader: vi.fn(() => ({})),
    getShaderParameter: vi.fn(() => true),
    getProgramParameter: vi.fn(() => true),
    getAttribLocation: vi.fn(() => 0),
    getUniformLocation: vi.fn((_program: unknown, name: string) => name),
    shaderSource: vi.fn(),
    compileShader: vi.fn(),
    attachShader: vi.fn(),
    linkProgram: vi.fn(),
    deleteShader: vi.fn(),
    deleteBuffer: vi.fn(),
    deleteProgram: vi.fn(),
    useProgram: vi.fn(),
    bindBuffer: vi.fn(),
    bufferData: vi.fn(),
    enableVertexAttribArray: vi.fn(),
    vertexAttribPointer: vi.fn(),
    viewport: vi.fn(),
    uniform2f: vi.fn(),
    uniform1f: vi.fn(),
    drawArrays: vi.fn(),
  }
  const motion = new EventTarget() as EventTarget & { matches: boolean }
  motion.matches = reducedMotion
  vi.stubGlobal('matchMedia', () => motion)
  vi.stubGlobal(
    'requestAnimationFrame',
    vi.fn(() => 7),
  )
  vi.stubGlobal('cancelAnimationFrame', vi.fn())
  const canvas = document.createElement('canvas')
  vi.spyOn(canvas, 'getContext').mockImplementation(
    (() => context) as unknown as HTMLCanvasElement['getContext'],
  )
  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({
    width: 4000,
    height: 2000,
  } as DOMRect)
  return { canvas, context, motion }
}

afterEach(() => {
  setFluxBackgroundSettings(defaultFluxBackgroundSettings)
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('flux background lifecycle', () => {
  it('updates uniforms while paused and unsubscribes on disposal', () => {
    const { canvas, context } = setup()
    const dispose = mountFluxBackground(canvas)
    setFluxBackgroundSettings({
      paused: true,
      brightness: 2,
      bloom: 0.4,
      warmth: 0,
      spread: 1.5,
      offsetY: 0.2,
    })
    expect(requestAnimationFrame).toHaveBeenCalledOnce()
    expect(context.drawArrays).toHaveBeenCalledTimes(2)
    expect(context.uniform1f).toHaveBeenCalledWith('u_brightness', 2)
    expect(context.uniform1f).toHaveBeenCalledWith('u_bloom', 0.4)
    expect(context.uniform1f).toHaveBeenCalledWith('u_warmth', 0)
    expect(context.uniform1f).toHaveBeenCalledWith('u_spread', 1.5)
    expect(context.uniform1f).toHaveBeenCalledWith('u_offsetY', 0.2)
    dispose()
    setFluxBackgroundSettings({ brightness: 1 })
    expect(context.drawArrays).toHaveBeenCalledTimes(2)
  })

  it('redraws reduced-motion controls without starting animation', () => {
    const { canvas, context } = setup(true)
    const dispose = mountFluxBackground(canvas)
    setFluxBackgroundSettings({ grain: 0, scanlines: 2 })
    expect(context.drawArrays).toHaveBeenCalledTimes(2)
    expect(context.uniform1f).toHaveBeenCalledWith('u_grain', 0)
    expect(context.uniform1f).toHaveBeenCalledWith('u_scanlines', 2)
    expect(requestAnimationFrame).not.toHaveBeenCalled()
    dispose()
  })

  it('preserves elapsed phase across speed changes and stops at zero speed', () => {
    setFluxBackgroundSettings({ speed: 1 })
    const { canvas, context } = setup()
    let tick: FrameRequestCallback = () => {}
    vi.stubGlobal(
      'requestAnimationFrame',
      vi.fn((callback: FrameRequestCallback) => {
        tick = callback
        return 7
      }),
    )
    const dispose = mountFluxBackground(canvas)
    tick(100)
    tick(200)
    expect(context.uniform1f).toHaveBeenLastCalledWith('u_offsetY', 0)
    const phases = () =>
      context.uniform1f.mock.calls
        .filter(([name]) => name === 'u_time')
        .map(([, value]) => value)
    expect(phases().at(-1)).toBeCloseTo(0.1)
    setFluxBackgroundSettings({ speed: 2 })
    expect(phases().at(-1)).toBeCloseTo(0.1)
    tick(300)
    tick(400)
    expect(phases().at(-1)).toBeCloseTo(0.3)
    const scheduled = vi.mocked(requestAnimationFrame).mock.calls.length
    setFluxBackgroundSettings({ speed: 0 })
    expect(requestAnimationFrame).toHaveBeenCalledTimes(scheduled)
    expect(cancelAnimationFrame).toHaveBeenCalledWith(7)
    dispose()
  })

  it('clamps settings and only notifies subscribers for a changed snapshot', () => {
    const changed = vi.fn()
    const unsubscribe = subscribeFluxBackgroundSettings(changed)
    const original = getFluxBackgroundSettings()
    setFluxBackgroundSettings({ brightness: original.brightness })
    expect(getFluxBackgroundSettings()).toBe(original)
    expect(changed).not.toHaveBeenCalled()
    setFluxBackgroundSettings({
      brightness: 12,
      offsetX: -1,
      grain: Number.NaN,
    })
    expect(getFluxBackgroundSettings()).toMatchObject({
      brightness: 3,
      offsetX: -0.3,
      grain: original.grain,
    })
    expect(changed).toHaveBeenCalledOnce()
    unsubscribe()
  })

  it('keeps the CSS fallback when WebGL cannot initialize', () => {
    const canvas = document.createElement('canvas')
    vi.spyOn(canvas, 'getContext').mockReturnValue(null)
    const dispose = mountFluxBackground(canvas)
    expect(canvas.dataset.ready).toBeUndefined()
    expect(dispose).not.toThrow()
  })

  it('draws a static reduced-motion frame within its pixel budget and releases resources', () => {
    const { canvas, context } = setup(true)
    const dispose = mountFluxBackground(canvas)
    expect(context.drawArrays).toHaveBeenCalledOnce()
    expect(canvas.dataset.ready).toBe('true')
    expect(canvas.width * canvas.height).toBeLessThan(1_502_000)
    expect(requestAnimationFrame).not.toHaveBeenCalled()
    dispose()
    expect(context.deleteProgram).toHaveBeenCalledOnce()
    expect(context.deleteBuffer).toHaveBeenCalledOnce()
    expect(canvas.dataset.ready).toBeUndefined()
  })

  it('stops scheduling offscreen and hidden work, then resumes when visible', () => {
    let onIntersection: IntersectionObserverCallback = () => {}
    const disconnect = vi.fn()
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(callback: IntersectionObserverCallback) {
          onIntersection = callback
        }
        observe() {}
        disconnect = disconnect
      },
    )
    const { canvas, context } = setup()
    const hidden = vi.spyOn(document, 'hidden', 'get').mockReturnValue(false)
    const dispose = mountFluxBackground(canvas)
    const intersect = (isIntersecting: boolean) =>
      onIntersection(
        [{ isIntersecting } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      )
    intersect(false)
    expect(context.drawArrays).toHaveBeenCalledOnce()
    expect(requestAnimationFrame).toHaveBeenCalledOnce()
    intersect(true)
    expect(requestAnimationFrame).toHaveBeenCalledTimes(2)
    hidden.mockReturnValue(true)
    document.dispatchEvent(new Event('visibilitychange'))
    expect(requestAnimationFrame).toHaveBeenCalledTimes(2)
    hidden.mockReturnValue(false)
    document.dispatchEvent(new Event('visibilitychange'))
    expect(requestAnimationFrame).toHaveBeenCalledTimes(3)
    dispose()
    expect(disconnect).toHaveBeenCalledOnce()
  })

  it('pauses for reduced motion changes and restores resources after context loss', () => {
    const { canvas, context, motion } = setup()
    const dispose = mountFluxBackground(canvas)
    expect(requestAnimationFrame).toHaveBeenCalledOnce()
    motion.matches = true
    motion.dispatchEvent(new Event('change'))
    expect(cancelAnimationFrame).toHaveBeenCalledWith(7)
    expect(requestAnimationFrame).toHaveBeenCalledOnce()
    const loss = new Event('webglcontextlost', { cancelable: true })
    canvas.dispatchEvent(loss)
    expect(loss.defaultPrevented).toBe(true)
    expect(canvas.dataset.ready).toBeUndefined()
    canvas.dispatchEvent(new Event('webglcontextrestored'))
    expect(context.createProgram).toHaveBeenCalledTimes(2)
    expect(canvas.dataset.ready).toBe('true')
    dispose()
    canvas.dispatchEvent(new Event('webglcontextrestored'))
    expect(context.createProgram).toHaveBeenCalledTimes(2)
  })
})

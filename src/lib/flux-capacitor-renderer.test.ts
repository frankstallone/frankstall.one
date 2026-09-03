import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  createFluxRenderer,
  type FluxRenderer,
} from './flux-capacitor-renderer'

const gpu = vi.hoisted(() => ({
  frame: vi.fn(() => ({ done: Promise.resolve() })),
  frameLoop: vi.fn(() => ({ stop: vi.fn() })),
  dispose: vi.fn(),
}))

vi.mock('../shaders/flux-mesh.wgsl', () => ({ default: '' }))
vi.mock('../shaders/flux-shadow.wgsl', () => ({ default: '' }))
vi.mock('../shaders/flux-bloom.wgsl', () => ({ default: '' }))
vi.mock('../shaders/flux-present.wgsl', () => ({ default: '' }))
vi.mock('vgpu', () => ({
  init: async () => ({
    onError: () => vi.fn(),
    gpu: { lost: new Promise(() => {}) },
    settled: () => Promise.resolve(),
    dispose: gpu.dispose,
  }),
  surface: () => ({ size: [300, 200], dispose: vi.fn() }),
  target: () => ({}),
  geometry: () => ({}),
  sampler: () => ({}),
  effect: () => ({ compile: () => Promise.resolve() }),
  frame: gpu.frame,
  frameLoop: gpu.frameLoop,
}))

describe('flux capacitor animation lifecycle', () => {
  let renderer: FluxRenderer
  let motion: MediaQueryList
  let intersect: (visible: boolean) => void

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    vi.stubGlobal('navigator', { gpu: {} })
    motion = Object.assign(new EventTarget(), {
      matches: false,
    }) as MediaQueryList
    vi.spyOn(window, 'matchMedia').mockReturnValue(motion)
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible')
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(callback: IntersectionObserverCallback) {
          intersect = (visible) =>
            callback(
              [{ isIntersecting: visible } as IntersectionObserverEntry],
              this as unknown as IntersectionObserver,
            )
        }
        observe() {}
        disconnect() {}
      },
    )
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe() {}
        disconnect() {}
      },
    )
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            binary: 'flux-capacitor.bin',
            vertexByteOffset: 0,
            vertexByteLength: 0,
            indexByteOffset: 0,
            indexCount: 0,
            draws: [],
            camera: {
              position: [5, -12, 4],
              target: [0, 0, 0],
              up: [0, 0, 1],
              orthoScale: 6,
              aspect: 1.5,
            },
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          arrayBuffer: async () => new ArrayBuffer(0),
        }),
    )
  })

  afterEach(() => {
    renderer?.dispose()
    vi.useRealTimers()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('runs the idle chase, pauses offscreen or hidden, and resumes when visible', async () => {
    renderer = createFluxRenderer({ canvas: document.createElement('canvas') })
    await renderer.ready
    expect(gpu.frameLoop).toHaveBeenCalledOnce()
    const firstLoop = gpu.frameLoop.mock.results[0].value
    intersect(false)
    expect(firstLoop.stop).toHaveBeenCalledOnce()
    intersect(true)
    expect(gpu.frameLoop).toHaveBeenCalledTimes(2)

    const secondLoop = gpu.frameLoop.mock.results[1].value
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden')
    document.dispatchEvent(new Event('visibilitychange'))
    expect(secondLoop.stop).toHaveBeenCalledOnce()
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible')
    document.dispatchEvent(new Event('visibilitychange'))
    expect(gpu.frameLoop).toHaveBeenCalledTimes(3)
    renderer.dispose()
    expect(gpu.frameLoop.mock.results[2].value.stop).toHaveBeenCalledOnce()
    expect(gpu.dispose).toHaveBeenCalledOnce()
  })

  it('keeps reduced motion still with brief charge feedback and resumes after preference changes', async () => {
    Object.defineProperty(motion, 'matches', { value: true })
    renderer = createFluxRenderer({ canvas: document.createElement('canvas') })
    await renderer.ready
    expect(gpu.frameLoop).not.toHaveBeenCalled()
    gpu.frame.mockClear()
    renderer.pulse()
    expect(gpu.frame).toHaveBeenCalledOnce()
    vi.advanceTimersByTime(180)
    expect(gpu.frame).toHaveBeenCalledTimes(2)
    expect(gpu.frameLoop).not.toHaveBeenCalled()

    motion.dispatchEvent(Object.assign(new Event('change'), { matches: false }))
    expect(gpu.frameLoop).toHaveBeenCalledOnce()
    motion.dispatchEvent(Object.assign(new Event('change'), { matches: true }))
    expect(gpu.frameLoop.mock.results[0].value.stop).toHaveBeenCalledOnce()
    renderer.dispose()
    motion.dispatchEvent(Object.assign(new Event('change'), { matches: false }))
    expect(gpu.frameLoop).toHaveBeenCalledOnce()
  })
})

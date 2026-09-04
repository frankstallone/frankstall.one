import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  createFluxRenderer,
  type FluxRenderer,
} from './flux-capacitor-renderer'

const gpu = vi.hoisted(() => ({
  pass: vi.fn(),
  frame: vi.fn(),
  frameLoop: vi.fn(() => ({ stop: vi.fn() })),
  dispose: vi.fn(),
  surfaces: [] as {
    size: readonly number[]
    resize: ReturnType<typeof vi.fn>
    dispose: ReturnType<typeof vi.fn>
  }[],
  flareSet: vi.fn(),
}))

vi.mock('../shaders/flux-mesh.wgsl', () => ({ default: '' }))
vi.mock('../shaders/flux-shadow.wgsl', () => ({ default: '' }))
vi.mock('../shaders/flux-bloom.wgsl', () => ({ default: '' }))
vi.mock('../shaders/flux-present.wgsl', () => ({ default: '' }))
vi.mock('../shaders/flux-lens-flare.wgsl', () => ({ default: '' }))
vi.mock('vgpu', () => ({
  init: async () => ({
    onError: () => vi.fn(),
    gpu: { lost: new Promise(() => {}) },
    settled: () => Promise.resolve(),
    dispose: gpu.dispose,
  }),
  surface: (
    _gpu: unknown,
    _canvas: unknown,
    options: { size: readonly number[] },
  ) => {
    const surface = {
      size: options.size,
      dispose: vi.fn(),
      resize: vi.fn((size: readonly number[]) => {
        surface.size = size
      }),
    }
    gpu.surfaces.push(surface)
    return surface
  },
  target: () => ({ resize: vi.fn() }),
  geometry: () => ({}),
  sampler: () => ({}),
  effect: (_gpu: unknown, _shader: unknown, options: { label: string }) => ({
    compile: () => Promise.resolve(),
    set: options.label === 'flux-lens-flare' ? gpu.flareSet : vi.fn(),
  }),
  frame: gpu.frame,
  frameLoop: gpu.frameLoop,
}))

describe('flux capacitor animation lifecycle', () => {
  let renderer: FluxRenderer
  let motion: MediaQueryList
  let intersect: (visible: boolean) => void
  let flareCanvas: HTMLCanvasElement

  beforeEach(() => {
    vi.clearAllMocks()
    gpu.surfaces.length = 0
    gpu.frame.mockImplementation((_gpu, encode) => {
      encode({ pass: gpu.pass })
      return { done: Promise.resolve() }
    })
    flareCanvas = document.createElement('canvas')
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
    renderer = createFluxRenderer({
      canvas: document.createElement('canvas'),
      flareCanvas,
    })
    await renderer.ready
    expect(gpu.frameLoop).toHaveBeenCalledOnce()
    expect(flareCanvas.hidden).toBe(false)
    expect(gpu.pass).toHaveBeenCalledWith(gpu.surfaces[1], expect.anything())
    const firstLoop = gpu.frameLoop.mock.results[0].value
    intersect(false)
    expect(flareCanvas.hidden).toBe(true)
    expect(firstLoop.stop).toHaveBeenCalledOnce()
    intersect(true)
    expect(gpu.frameLoop).toHaveBeenCalledTimes(2)

    const secondLoop = gpu.frameLoop.mock.results[1].value
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden')
    document.dispatchEvent(new Event('visibilitychange'))
    expect(flareCanvas.hidden).toBe(true)
    expect(secondLoop.stop).toHaveBeenCalledOnce()
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible')
    document.dispatchEvent(new Event('visibilitychange'))
    expect(gpu.frameLoop).toHaveBeenCalledTimes(3)
    renderer.dispose()
    expect(gpu.frameLoop.mock.results[2].value.stop).toHaveBeenCalledOnce()
    expect(gpu.dispose).toHaveBeenCalledOnce()
    expect(
      gpu.surfaces.every((surface) => surface.dispose.mock.calls.length === 1),
    ).toBe(true)
    expect(flareCanvas.hidden).toBe(true)
  })

  it('keeps reduced motion still with brief charge feedback and resumes after preference changes', async () => {
    Object.defineProperty(motion, 'matches', { value: true })
    renderer = createFluxRenderer({
      canvas: document.createElement('canvas'),
      flareCanvas,
    })
    await renderer.ready
    expect(gpu.frameLoop).not.toHaveBeenCalled()
    expect(flareCanvas.hidden).toBe(true)
    expect(
      gpu.pass.mock.calls.some(([surface]) => surface === gpu.surfaces[1]),
    ).toBe(false)
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
    expect(flareCanvas.hidden).toBe(true)
    renderer.dispose()
    motion.dispatchEvent(Object.assign(new Event('change'), { matches: false }))
    expect(gpu.frameLoop).toHaveBeenCalledOnce()
  })

  it('sizes the flare to the viewport and refreshes its mesh anchor after scrolling', async () => {
    const canvas = document.createElement('canvas')
    const bounds = vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({
      left: 400,
      top: 200,
      width: 300,
      height: 200,
    } as DOMRect)
    renderer = createFluxRenderer({ canvas, flareCanvas })
    await renderer.ready
    expect(gpu.surfaces[1].size).toEqual([
      window.innerWidth,
      window.innerHeight,
    ])
    const initialSource = gpu.flareSet.mock.lastCall![0].flare.source
    bounds.mockReturnValue({
      left: 400,
      top: 100,
      width: 300,
      height: 200,
    } as DOMRect)
    window.dispatchEvent(new Event('scroll'))
    // Reduced motion draws a still mesh and updates the same camera projection.
    motion.dispatchEvent(Object.assign(new Event('change'), { matches: true }))
    const scrolledSource = gpu.flareSet.mock.lastCall![0].flare.source
    expect(scrolledSource[0]).toBeCloseTo(initialSource[0])
    expect(scrolledSource[1]).toBeCloseTo(
      initialSource[1] - 100 / window.innerHeight,
    )
    vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1200)
    window.dispatchEvent(new Event('resize'))
    expect(gpu.surfaces[1].resize).toHaveBeenCalledWith([
      1200,
      window.innerHeight,
    ])
    renderer.dispose()
    const reads = bounds.mock.calls.length
    window.dispatchEvent(new Event('scroll'))
    window.dispatchEvent(new Event('resize'))
    expect(bounds).toHaveBeenCalledTimes(reads)
  })
})

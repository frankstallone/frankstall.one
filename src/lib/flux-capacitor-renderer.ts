import type { Clock, Effect, FrameLoopHandle, Gpu, Surface } from 'vgpu'

import fluxEnergyShader from '../shaders/flux-energy.wgsl'

type Point = readonly [number, number]

type FluxEnergyRendererOptions = {
  canvas: HTMLCanvasElement
  onReady?: () => void
  onFallback?: () => void
}

export type FluxEnergyRenderer = {
  ready: Promise<void>
  setActive(active: boolean): void
  setPointer(pointer: Point | null): void
  pulse(): void
  dispose(): void
}

const FRAME_RATE = 30
const MAX_DPR = 1.5
const IDLE_POINTER = [-2, -2] as const

export function createFluxEnergyRenderer({
  canvas,
  onReady,
  onFallback,
}: FluxEnergyRendererOptions): FluxEnergyRenderer {
  let disposed = false
  let gpu: Gpu | undefined
  let output: Surface | undefined
  let energy: Effect | undefined
  let time: Clock | undefined
  let loop: FrameLoopHandle | undefined
  let pointer: Point = IDLE_POINTER
  let active = false
  let pulseStartedAt = -Infinity
  let visible = true
  let reducedMotion = false
  let aspect: Point = [760 / 620, 1]
  let observer: IntersectionObserver | undefined
  let resizeObserver: ResizeObserver | undefined
  let removeGpuErrorListener: (() => void) | undefined
  let mediaQuery: MediaQueryList | undefined
  let module: typeof import('vgpu') | undefined

  const pulseStrength = (currentTime: number) =>
    Math.exp(-Math.max(0, currentTime - pulseStartedAt) * 2.8)

  const setFrameValues = (currentTime: number) => {
    energy?.set({
      params: {
        time: currentTime,
        activity: active ? 1 : 0.34,
        pulse: pulseStrength(currentTime),
        pointer,
        aspect,
      },
    })
  }

  const drawStill = () => {
    if (!energy || !output || !time || disposed) {
      return
    }
    setFrameValues(time.time)
    energy.draw(output)
  }

  const stopLoop = () => {
    loop?.stop()
    loop = undefined
  }

  const updateLoop = () => {
    if (!module || !gpu || !energy || !output || !time || disposed) {
      return
    }

    const shouldAnimate =
      !reducedMotion && visible && document.visibilityState === 'visible'

    if (!shouldAnimate) {
      stopLoop()
      drawStill()
      return
    }

    if (loop) {
      return
    }

    loop = module.frameLoop(
      gpu,
      (frame) => {
        setFrameValues(time?.time ?? 0)
        frame.pass(output as Surface, energy as Effect)
      },
      { fps: FRAME_RATE },
    )
  }

  const resize = () => {
    if (!output || disposed) {
      return
    }

    const bounds = canvas.getBoundingClientRect()
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
    const width = Math.max(1, Math.round(bounds.width * dpr))
    const height = Math.max(1, Math.round(bounds.height * dpr))

    if (output.size[0] !== width || output.size[1] !== height) {
      output.resize([width, height])
    }
    aspect = [width / height, 1]
    energy?.set({ params: { aspect } })

    if (!loop) {
      drawStill()
    }
  }

  const handleVisibilityChange = () => updateLoop()
  const handleReducedMotionChange = (event: MediaQueryListEvent) => {
    reducedMotion = event.matches
    updateLoop()
  }
  const handleWindowResize = () => resize()

  const dispose = () => {
    if (disposed) {
      return
    }

    disposed = true
    stopLoop()
    observer?.disconnect()
    resizeObserver?.disconnect()
    removeGpuErrorListener?.()
    mediaQuery?.removeEventListener('change', handleReducedMotionChange)
    document.removeEventListener('visibilitychange', handleVisibilityChange)
    window.removeEventListener('resize', handleWindowResize)
    output?.dispose()
    gpu?.dispose()
    output = undefined
    energy = undefined
    time = undefined
    gpu = undefined
  }

  const fallback = () => {
    if (disposed) {
      return
    }
    onFallback?.()
    dispose()
  }

  const initialize = async () => {
    if (!('gpu' in navigator)) {
      onFallback?.()
      return
    }

    module = await import('vgpu')
    const nextGpu = await module.init({ label: 'flux-capacitor-hero' })
    if (disposed) {
      nextGpu.dispose()
      return
    }
    gpu = nextGpu

    const bounds = canvas.getBoundingClientRect()
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
    const width = Math.max(1, Math.round(bounds.width * dpr))
    const height = Math.max(1, Math.round(bounds.height * dpr))
    aspect = [width / height, 1]

    output = module.surface(gpu, canvas, {
      autoResize: false,
      size: [width, height],
      alphaMode: 'premultiplied',
      clearColor: [0, 0, 0, 0],
      label: 'flux-capacitor-energy-surface',
    })
    energy = module.effect(gpu, fluxEnergyShader, {
      label: 'flux-capacitor-energy',
      set: {
        params: {
          time: 0,
          activity: 0.34,
          pulse: 0,
          pointer,
          aspect,
        },
      },
    })
    time = module.clock(gpu)
    await energy.compile(output)
    if (disposed) {
      return
    }

    removeGpuErrorListener = gpu.onError(() => fallback())
    void gpu.gpu.lost.then(() => fallback())

    mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    reducedMotion = mediaQuery.matches
    mediaQuery.addEventListener('change', handleReducedMotionChange)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', handleWindowResize)
    } else {
      resizeObserver = new ResizeObserver(resize)
      resizeObserver.observe(canvas)
    }

    if (typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(([entry]) => {
        visible = entry?.isIntersecting ?? true
        updateLoop()
      })
      observer.observe(canvas)
    }

    drawStill()
    onReady?.()
    updateLoop()
  }

  const ready = initialize().catch(() => fallback())

  return {
    ready,
    setActive(nextActive) {
      if (disposed) {
        return
      }
      active = nextActive
      if (!loop) {
        drawStill()
      }
    },
    setPointer(nextPointer) {
      if (disposed) {
        return
      }
      pointer = nextPointer ?? IDLE_POINTER
      if (!loop) {
        drawStill()
      }
    },
    pulse() {
      if (disposed) {
        return
      }
      pulseStartedAt = time?.time ?? 0
      if (!loop) {
        drawStill()
      }
    },
    dispose,
  }
}

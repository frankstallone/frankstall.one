import type {
  Draw,
  Effect,
  Frame,
  FrameLoopHandle,
  Gpu,
  Surface,
  Target,
} from 'vgpu'
import { mat4, vec3 } from 'wgpu-matrix'

import meshShader from '../shaders/flux-mesh.wgsl'
import shadowShader from '../shaders/flux-shadow.wgsl'
import bloomShader from '../shaders/flux-bloom.wgsl'
import presentShader from '../shaders/flux-present.wgsl'
import flareShader from '../shaders/flux-lens-flare.wgsl'
import { flareStrength, projectFlareSource } from './flux-lens-flare'

type Point = readonly [number, number]
type Vector = [number, number, number]
type Material = {
  name: string
  baseColor: Vector
  metallic: number
  roughness: number
  emission: Vector
  alpha: number
  kind: 'opaque' | 'glass' | 'core'
  surface: number
}
type MeshAsset = {
  binary: string
  vertexCount: number
  indexCount: number
  vertexByteOffset: number
  vertexByteLength: number
  indexByteOffset: number
  vertexStride: number
  materials: Material[]
  draws: { material: number; firstIndex: number; indexCount: number }[]
  camera: {
    position: Vector
    target: Vector
    up: Vector
    orthoScale: number
    aspect: number
  }
}

type FluxRendererOptions = {
  canvas: HTMLCanvasElement
  flareCanvas: HTMLCanvasElement
  onReady?: () => void
  onFallback?: () => void
}

export type FluxRenderer = {
  ready: Promise<void>
  setActive(active: boolean): void
  setPointer(pointer: Point | null): void
  pulse(): void
  dispose(): void
}

const FRAME_RATE = 30
const MAX_DPR = 1.5
const MODEL_URL = '/models/flux-capacitor.json'

export function createFluxRenderer({
  canvas,
  flareCanvas,
  onReady,
  onFallback,
}: FluxRendererOptions): FluxRenderer {
  let disposed = false
  let initialized = false
  let readyNotified = false
  let gpu: Gpu | undefined
  let module: typeof import('vgpu') | undefined
  let asset: MeshAsset | undefined
  let output: Surface | undefined
  let flareOutput: Surface | undefined
  let flare: Effect | undefined
  let sceneTarget: Target | undefined
  let bloomTarget: Target | undefined
  let bloom: Effect | undefined
  let present: Effect | undefined
  const draws: Draw[] = []
  let loop: FrameLoopHandle | undefined
  let pointer: Point = [0.5, 0.5]
  let orbit: Point = [0, 0]
  let charge = 0
  let active = false
  let visible = true
  let reducedMotion = false
  let shaderTime = 0
  let lastFrameAt: number | undefined
  let pulseStartedAt = -Infinity
  let pulseTimer: ReturnType<typeof setTimeout> | undefined
  let observer: IntersectionObserver | undefined
  let resizeObserver: ResizeObserver | undefined
  let removeGpuErrorListener: (() => void) | undefined
  let mediaQuery: MediaQueryList | undefined
  let lightViewProjection = mat4.identity()
  let canvasBounds = canvas.getBoundingClientRect()
  let viewport: Point = [
    Math.max(1, window.innerWidth),
    Math.max(1, window.innerHeight),
  ]
  flareCanvas.hidden = true
  const abortController = new AbortController()

  const canDraw = () =>
    !disposed && visible && document.visibilityState === 'visible'

  const stopLoop = () => {
    flareCanvas.hidden = true
    loop?.stop()
    loop = undefined
    lastFrameAt = undefined
  }

  const dispose = () => {
    if (disposed) return
    disposed = true
    abortController.abort()
    stopLoop()
    clearTimeout(pulseTimer)
    pulseTimer = undefined
    observer?.disconnect()
    resizeObserver?.disconnect()
    removeGpuErrorListener?.()
    mediaQuery?.removeEventListener('change', handleReducedMotionChange)
    document.removeEventListener('visibilitychange', updateLoop)
    window.removeEventListener('resize', resize)
    window.removeEventListener('scroll', updateLayout, true)
    output?.dispose()
    flareOutput?.dispose()
    gpu?.dispose()
    draws.length = 0
    output = undefined
    flareOutput = undefined
    gpu = undefined
  }

  const fallback = (error?: unknown) => {
    if (disposed) return
    if (error) console.warn('Flux capacitor could not start WebGPU.', error)
    dispose()
    onFallback?.()
  }

  const desiredOrbit = (): Point =>
    reducedMotion
      ? [0, 0]
      : [(pointer[0] - 0.5) * 0.628, (pointer[1] - 0.5) * 0.349]

  const setFrameValues = (delta = 0) => {
    if (!asset || !output) return
    const desired = desiredOrbit()
    const smoothing = 1 - Math.exp(-delta * 9)
    orbit = reducedMotion
      ? [0, 0]
      : [
          orbit[0] + (desired[0] - orbit[0]) * smoothing,
          orbit[1] + (desired[1] - orbit[1]) * smoothing,
        ]
    charge = reducedMotion
      ? Number(active)
      : charge + (Number(active) - charge) * smoothing
    const camera = asset.camera
    const offset = vec3.subtract(camera.position, camera.target)
    const radius = vec3.length(offset)
    const yaw = Math.atan2(offset[0], -offset[1]) + orbit[0]
    const elevation = Math.asin(offset[2] / radius) + orbit[1]
    const eye: Vector = [
      camera.target[0] + Math.sin(yaw) * Math.cos(elevation) * radius,
      camera.target[1] - Math.cos(yaw) * Math.cos(elevation) * radius,
      camera.target[2] + Math.sin(elevation) * radius,
    ]
    const aspect = output.size[0] / output.size[1]
    // Blender's landscape orthographic scale specifies the frame's width.
    const height =
      (camera.orthoScale / camera.aspect) * Math.max(1, camera.aspect / aspect)
    const width = height * aspect
    const projection = mat4.ortho(
      -width / 2,
      width / 2,
      -height / 2,
      height / 2,
      0.1,
      50,
    )
    const viewProjection = mat4.multiply(
      projection,
      mat4.lookAt(eye, camera.target, camera.up),
    )
    const scene = {
      viewProjection,
      lightViewProjection,
      eye,
      charge,
      // A negative time selects a steady lamp level without a moving chase.
      time: reducedMotion ? -1 : shaderTime,
      pulse: reducedMotion
        ? Number(pulseTimer !== undefined)
        : Math.exp(-(shaderTime - pulseStartedAt) * 5),
    }
    for (const draw of draws) draw.set({ scene })
    // The upper-right concealed amber face lies behind the relay glass.
    // Coordinates match scripts/render-flux-capacitor.py's branch light block.
    const source = projectFlareSource(
      [0.62, -0.46, 0.54],
      viewProjection,
      canvasBounds,
      viewport,
    )
    const tangent = projectFlareSource(
      [1.62, -0.46, 0.54],
      viewProjection,
      canvasBounds,
      viewport,
    )
    const dx = (tangent[0] - source[0]) * viewport[0]
    const dy = (tangent[1] - source[1]) * viewport[1]
    const length = Math.hypot(dx, dy) || 1
    flare?.set({
      flare: {
        source,
        direction: [dx / length, dy / length],
        viewport,
        strength: flareStrength(orbit, charge),
        reach: Math.max(viewport[0], viewport[1]) * 0.72,
      },
    })
  }

  const encode = (frame: Frame) => {
    if (!sceneTarget || !bloomTarget || !bloom || !present || !output) return
    frame.pass(sceneTarget, (pass) => {
      for (const draw of draws) pass.draw(draw)
    })
    frame.pass(bloomTarget, bloom)
    frame.pass(output, present)
    if (flareOutput && flare && !reducedMotion && canDraw()) {
      frame.pass(flareOutput, flare)
      flareCanvas.hidden = false
    }
  }

  const drawStill = () => {
    if (!module || !gpu || !initialized || !canDraw()) return
    try {
      setFrameValues()
      const submitted = module.frame(gpu, encode)
      if (!readyNotified)
        void submitted.done.then(() => {
          if (disposed || readyNotified) return
          readyNotified = true
          onReady?.()
        })
    } catch (error) {
      fallback(error)
    }
  }

  function updateLoop() {
    if (!module || !gpu || !initialized || disposed) return
    if (reducedMotion || !canDraw()) {
      stopLoop()
      drawStill()
      return
    }
    if (loop) return
    if (!readyNotified) drawStill()
    lastFrameAt = performance.now()
    loop = module.frameLoop(
      gpu,
      (frame) => {
        if (!canDraw()) {
          stopLoop()
          return
        }
        try {
          const now = performance.now()
          const delta = Math.min((now - (lastFrameAt ?? now)) / 1000, 0.1)
          lastFrameAt = now
          shaderTime += delta
          setFrameValues(delta)
          encode(frame)
        } catch (error) {
          fallback(error)
        }
      },
      { fps: FRAME_RATE },
    )
  }

  const size = (): Point => {
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
    return [
      Math.max(1, Math.round(canvas.clientWidth * dpr)),
      Math.max(1, Math.round(canvas.clientHeight * dpr)),
    ]
  }

  const resize = () => {
    if (!output || !sceneTarget || !bloomTarget || disposed) return
    try {
      updateLayout()
      const [flareWidth, flareHeight] = viewport
      if (
        flareOutput &&
        (flareOutput.size[0] !== flareWidth ||
          flareOutput.size[1] !== flareHeight)
      )
        flareOutput.resize([flareWidth, flareHeight])
      const [width, height] = size()
      if (output.size[0] !== width || output.size[1] !== height) {
        output.resize([width, height])
        sceneTarget.resize([width, height])
        bloomTarget.resize([
          Math.max(1, Math.ceil(width / 3)),
          Math.max(1, Math.ceil(height / 3)),
        ])
        bloom?.set({ sceneTexture: sceneTarget.color })
        present?.set({
          sceneTexture: sceneTarget.color,
          bloomTexture: bloomTarget.color,
        })
      }
      if (!loop) drawStill()
    } catch (error) {
      fallback(error)
    }
  }

  function updateLayout() {
    canvasBounds = canvas.getBoundingClientRect()
    viewport = [Math.max(1, window.innerWidth), Math.max(1, window.innerHeight)]
  }

  function handleReducedMotionChange(event: MediaQueryListEvent) {
    reducedMotion = event.matches
    updateLoop()
  }

  const initialize = async () => {
    if (!('gpu' in navigator)) {
      fallback()
      return
    }
    const [loadedModule, response] = await Promise.all([
      import('vgpu'),
      fetch(MODEL_URL, { signal: abortController.signal }),
    ])
    if (disposed) return
    if (!response.ok) throw new Error(`Flux mesh: HTTP ${response.status}`)
    module = loadedModule
    asset = (await response.json()) as MeshAsset
    if (disposed) return
    const binaryResponse = await fetch(
      new URL(asset.binary, new URL(MODEL_URL, location.href)),
      {
        signal: abortController.signal,
      },
    )
    if (!binaryResponse.ok)
      throw new Error(`Flux mesh buffer: HTTP ${binaryResponse.status}`)
    const binary = await binaryResponse.arrayBuffer()
    if (disposed) return
    const nextGpu = await module.init({
      label: 'flux-capacitor-hero',
      powerPreference: 'low-power',
    })
    if (disposed) {
      nextGpu.dispose()
      return
    }
    gpu = nextGpu
    removeGpuErrorListener = gpu.onError(fallback)
    void gpu.gpu.lost.then(fallback)
    const dimensions = size()
    output = module.surface(gpu, canvas, {
      autoResize: false,
      size: dimensions,
      alphaMode: 'premultiplied',
      clearColor: [0, 0, 0, 0],
      label: 'flux-capacitor-surface',
    })
    updateLayout()
    flareOutput = module.surface(gpu, flareCanvas, {
      autoResize: false,
      size: viewport,
      alphaMode: 'premultiplied',
      clearColor: [0, 0, 0, 0],
      label: 'flux-lens-flare-surface',
    })
    sceneTarget = module.target(gpu, {
      size: dimensions,
      format: 'rgba16float',
      depth: true,
      msaa: 4,
      clearColor: [0, 0, 0, 0],
      label: 'flux-capacitor-hdr',
    })
    bloomTarget = module.target(gpu, {
      size: [
        Math.max(1, Math.ceil(dimensions[0] / 3)),
        Math.max(1, Math.ceil(dimensions[1] / 3)),
      ],
      format: 'rgba16float',
      label: 'flux-capacitor-bloom',
    })
    const shadowTarget = module.target(gpu, {
      size: [1024, 1024],
      format: 'rgba16float',
      depth: true,
      clearColor: [1, 0, 0, 1],
      label: 'flux-capacitor-shadow',
    })
    const geometry = module.geometry(gpu, {
      buffers: [
        {
          data: new Float32Array(
            binary,
            asset.vertexByteOffset,
            asset.vertexByteLength / 4,
          ),
          stride: asset.vertexStride,
          attributes: { position: 'float32x3', normal: 'float32x3' },
        },
      ],
      vertexCount: asset.vertexCount,
      indices: new Uint32Array(binary, asset.indexByteOffset, asset.indexCount),
      label: 'flux-capacitor-blender-mesh',
    })
    const linearSampler = module.sampler(gpu, {
      minFilter: 'linear',
      magFilter: 'linear',
    })
    lightViewProjection = mat4.multiply(
      mat4.ortho(-4, 4, -4, 4, 0.1, 25),
      mat4.lookAt([-6, -8, 12], [0, 0, 0], [0, 0, 1]),
    )
    const shadowDraws: Draw[] = []
    // Opaque material groups precede transparent groups in the exported model.
    const orderedDraws = [...asset.draws].sort(
      (a, b) =>
        Number(asset!.materials[a.material].kind === 'glass') -
        Number(asset!.materials[b.material].kind === 'glass'),
    )
    for (const range of orderedDraws) {
      const material = asset.materials[range.material]
      const isGlass = material.kind === 'glass'
      const slice = geometry.slice({
        firstIndex: range.firstIndex,
        indexCount: range.indexCount,
      })
      draws.push(
        module.draw(gpu, {
          shader: meshShader,
          geometry: slice,
          cull: 'back',
          depth: { write: !isGlass },
          ...(isGlass ? { blend: 'alpha' as const } : {}),
          set: {
            material: {
              ...material,
              kind: isGlass ? 1 : material.kind === 'core' ? 2 : 0,
            },
            shadowMap: shadowTarget.color,
            linearSampler,
          },
          label: material.name,
        }),
      )
      if (!isGlass)
        shadowDraws.push(
          module.draw(gpu, {
            shader: shadowShader,
            geometry: slice,
            cull: 'back',
            depth: { bias: 1, biasSlopeScale: 1.5 },
            set: { light: { viewProjection: lightViewProjection } },
            label: `shadow-${material.name}`,
          }),
        )
    }
    bloom = module.effect(gpu, bloomShader, {
      set: { sceneTexture: sceneTarget.color, linearSampler },
      label: 'flux-bloom',
    })
    present = module.effect(gpu, presentShader, {
      set: {
        sceneTexture: sceneTarget.color,
        bloomTexture: bloomTarget.color,
        linearSampler,
      },
      label: 'flux-present',
    })
    flare = module.effect(gpu, flareShader, { label: 'flux-lens-flare' })
    setFrameValues()
    await Promise.all([
      ...draws.map((draw) => draw.compile(sceneTarget)),
      ...shadowDraws.map((draw) => draw.compile(shadowTarget)),
      bloom.compile(bloomTarget),
      present.compile({ colors: [output.format] }),
      flare.compile({ colors: [flareOutput.format] }),
    ])
    if (disposed) return
    // The model and studio light stay fixed; camera orbit does not invalidate shadows.
    module.frame(gpu, (frame) =>
      frame.pass(shadowTarget, (pass) => {
        for (const draw of shadowDraws) pass.draw(draw)
      }),
    )
    mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    reducedMotion = mediaQuery.matches
    mediaQuery.addEventListener('change', handleReducedMotionChange)
    document.addEventListener('visibilitychange', updateLoop)
    window.addEventListener('resize', resize)
    window.addEventListener('scroll', updateLayout, {
      passive: true,
      capture: true,
    })
    resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(canvas)
    observer = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? false
      updateLoop()
    })
    observer.observe(canvas)
    initialized = true
    drawStill()
    await gpu.settled()
    if (disposed) return
    updateLoop()
  }

  const ready = initialize().catch(fallback)

  return {
    ready,
    setActive(nextActive) {
      if (disposed) return
      active = nextActive
      updateLoop()
    },
    setPointer(nextPointer) {
      if (disposed) return
      pointer = nextPointer
        ? [
            Math.max(0, Math.min(1, nextPointer[0])),
            Math.max(0, Math.min(1, nextPointer[1])),
          ]
        : [0.5, 0.5]
      updateLoop()
    },
    pulse() {
      if (disposed) return
      clearTimeout(pulseTimer)
      pulseStartedAt = shaderTime
      pulseTimer = setTimeout(
        () => {
          pulseTimer = undefined
          pulseStartedAt = -Infinity
          updateLoop()
        },
        reducedMotion ? 180 : 900,
      )
      updateLoop()
    },
    dispose,
  }
}

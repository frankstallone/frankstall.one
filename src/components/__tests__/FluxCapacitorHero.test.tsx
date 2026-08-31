import { act, fireEvent, render, screen } from '@testing-library/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const renderer = vi.hoisted(() => ({
  ready: Promise.resolve(),
  setActive: vi.fn(),
  setPointer: vi.fn(),
  pulse: vi.fn(),
  dispose: vi.fn(),
}))

const rendererCallbacks = vi.hoisted(
  () =>
    ({
      onReady: undefined,
      onFallback: undefined,
    }) as {
      onReady?: () => void
      onFallback?: () => void
    },
)

const createFluxEnergyRenderer = vi.hoisted(() => vi.fn(() => renderer))

vi.mock('../../lib/flux-capacitor-renderer', () => ({
  createFluxEnergyRenderer: (options: typeof rendererCallbacks) => {
    rendererCallbacks.onReady = options.onReady
    rendererCallbacks.onFallback = options.onFallback
    return createFluxEnergyRenderer()
  },
}))

import FluxCapacitorHero from '../FluxCapacitorHero'

describe('FluxCapacitorHero', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.stubGlobal('PointerEvent', MouseEvent)
    vi.clearAllMocks()
    rendererCallbacks.onReady = undefined
    rendererCallbacks.onFallback = undefined
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('server-renders the complete static machine and fallback energy', () => {
    const html = renderToStaticMarkup(<FluxCapacitorHero />)

    expect(html).toContain('flux-instrument__machine')
    expect(html).toContain('flux-static-energy')
    expect(html).toContain('flux-energy-canvas')
    expect(html.match(/flux-branch flux-branch--/g)).toHaveLength(3)
    expect(html.match(/class="flux-terminal"/g)).toHaveLength(3)
  })

  it('connects pointer, focus, charge, and teardown to the renderer', () => {
    const { container, unmount } = render(<FluxCapacitorHero />)
    const control = screen.getByRole('button', {
      name: 'Charge the energy instrument',
    })
    const instrument = container.querySelector('.flux-instrument')

    expect(instrument).toHaveAttribute('data-gpu-ready', 'false')
    expect(container.querySelector('svg')).toBeInTheDocument()
    expect(container.querySelector('canvas')).toBeInTheDocument()

    act(() => rendererCallbacks.onReady?.())
    expect(instrument).toHaveAttribute('data-gpu-ready', 'true')

    vi.spyOn(control, 'getBoundingClientRect').mockReturnValue({
      x: 0,
      y: 0,
      top: 0,
      right: 100,
      bottom: 100,
      left: 0,
      width: 100,
      height: 100,
      toJSON: () => undefined,
    })

    fireEvent.focus(control)
    expect(renderer.setActive).toHaveBeenLastCalledWith(true)

    fireEvent.pointerMove(control, {
      pointerType: 'mouse',
      clientX: 50,
      clientY: 25,
    })
    expect(renderer.setPointer).toHaveBeenLastCalledWith([0.5, 0.25])

    fireEvent.click(control)
    expect(renderer.pulse).toHaveBeenCalledOnce()
    expect(instrument).toHaveAttribute('data-pulsing', 'true')

    act(() => vi.advanceTimersByTime(900))
    expect(instrument).toHaveAttribute('data-pulsing', 'false')

    fireEvent.pointerLeave(control)
    expect(renderer.setPointer).toHaveBeenLastCalledWith(null)
    expect(renderer.setActive).toHaveBeenLastCalledWith(false)

    unmount()
    expect(renderer.dispose).toHaveBeenCalledOnce()
  })
})

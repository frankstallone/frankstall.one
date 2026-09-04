import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { mountFluxCapacitor } from './flux-capacitor-interaction'
import { createFluxRenderer } from './flux-capacitor-renderer'

vi.mock('./flux-capacitor-renderer', () => ({
  createFluxRenderer: vi.fn(),
}))

describe('flux capacitor interaction', () => {
  let root: HTMLElement
  let control: HTMLButtonElement
  let scene: HTMLElement
  let cleanup: () => void
  let motion: MediaQueryList
  const renderer = {
    ready: Promise.resolve(),
    setActive: vi.fn(),
    setPointer: vi.fn(),
    rotateBy: vi.fn(),
    pulse: vi.fn(),
    dispose: vi.fn(),
  }

  const pointer = (
    type: string,
    pointerType = 'mouse',
    options: PointerEventInit = {},
  ) => {
    const event = new MouseEvent(type, {
      bubbles: true,
      clientX: 380,
      clientY: 310,
      ...options,
    })
    Object.defineProperty(event, 'pointerType', { value: pointerType })
    Object.defineProperty(event, 'pointerId', { value: options.pointerId ?? 1 })
    Object.defineProperty(event, 'isPrimary', {
      value: options.isPrimary ?? true,
    })
    control.dispatchEvent(event)
    return event
  }

  beforeEach(() => {
    vi.clearAllMocks()
    document.body.innerHTML = `<div id="hero"><div class="flux-instrument">
      <button><span class="flux-instrument__scene"><canvas></canvas></span></button>
    </div></div>`
    root = document.querySelector('.flux-instrument')!
    control = root.querySelector('button')!
    control.setPointerCapture = vi.fn()
    control.hasPointerCapture = vi.fn().mockReturnValue(true)
    control.releasePointerCapture = vi.fn()
    scene = root.querySelector('.flux-instrument__scene')!
    motion = Object.assign(new EventTarget(), {
      matches: false,
    }) as MediaQueryList
    vi.spyOn(window, 'matchMedia').mockReturnValue(motion)
    vi.mocked(createFluxRenderer).mockReturnValue(renderer)
    vi.spyOn(control, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      width: 380,
      height: 310,
    } as DOMRect)
    cleanup = mountFluxCapacitor(root)
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('passes the pointer to the 3D renderer and resets it when the pointer leaves the hero', () => {
    pointer('pointermove')
    expect(scene.style.transform).toBe('')
    expect(renderer.setPointer).toHaveBeenLastCalledWith([1, 1])

    root.parentElement!.dispatchEvent(new Event('pointerleave'))
    expect(scene.style.transform).toBe('')
    expect(renderer.setPointer).toHaveBeenLastCalledWith(null)
  })

  it('keeps the light active until both hover and keyboard focus leave', () => {
    pointer('pointerenter')
    control.focus()
    pointer('pointerleave')
    expect(renderer.setActive).toHaveBeenLastCalledWith(true)
    control.blur()
    expect(renderer.setActive).toHaveBeenLastCalledWith(false)
  })

  it('charges through the native button click used by mouse, touch, and keyboard', () => {
    control.click()
    expect(renderer.pulse).toHaveBeenCalledOnce()
  })

  it('mounts the flare outside the clipped hero and removes it on disconnect', () => {
    const options = vi.mocked(createFluxRenderer).mock.calls[0][0]
    const flare = document.querySelector('.flux-lens-flare-canvas')!
    expect(flare.parentElement).toBe(document.body)
    expect(flare).toHaveAttribute('aria-hidden', 'true')
    expect(options.flareCanvas).toBe(flare)
    options.onReady?.()
    expect(flare).toHaveAttribute('data-ready', 'true')
    options.onFallback?.()
    expect(flare).toHaveAttribute('data-ready', 'false')
    cleanup()
    expect(flare.isConnected).toBe(false)
    cleanup = () => {}
  })

  it('removes tilt immediately when reduced motion changes, while keeping charge feedback', () => {
    pointer('pointermove')
    Object.defineProperty(motion, 'matches', { value: true })
    motion.dispatchEvent(new Event('change'))
    renderer.setPointer.mockClear()
    pointer('pointermove')
    expect(scene.style.transform).toBe('')
    expect(renderer.setPointer).not.toHaveBeenCalled()
    control.click()
    expect(renderer.pulse).toHaveBeenCalledOnce()
  })

  it('ignores touch movement that did not start on the model', () => {
    pointer('pointerenter', 'touch')
    pointer('pointermove', 'touch')
    expect(renderer.setActive).not.toHaveBeenCalled()
    expect(renderer.setPointer).not.toHaveBeenCalled()
    expect(renderer.rotateBy).not.toHaveBeenCalled()
    expect(scene.style.transform).toBe('')
  })

  it('rotates on horizontal drag, stays captured outside the model, and resets on release', () => {
    pointer('pointerdown', 'touch', { clientX: 190, clientY: 155 })
    pointer('pointermove', 'touch', { clientX: 194, clientY: 157 })
    expect(renderer.rotateBy).not.toHaveBeenCalled()
    pointer('pointermove', 'touch', { clientX: 285, clientY: 158 })
    expect(renderer.rotateBy).toHaveBeenLastCalledWith(0.25)
    expect(renderer.setActive).toHaveBeenLastCalledWith(true)
    expect(control.setPointerCapture).toHaveBeenCalledWith(1)
    pointer('pointermove', 'touch', { clientX: 475, clientY: 158 })
    expect(renderer.rotateBy).toHaveBeenLastCalledWith(0.5)
    pointer('pointerup', 'touch')
    expect(control.releasePointerCapture).toHaveBeenCalledWith(1)
    expect(renderer.setPointer).toHaveBeenLastCalledWith(null)
    expect(renderer.setActive).toHaveBeenLastCalledWith(false)
    control.dispatchEvent(new MouseEvent('click', { detail: 1 }))
    expect(renderer.pulse).not.toHaveBeenCalled()
    control.click()
    expect(renderer.pulse).toHaveBeenCalledOnce()
  })

  it('leaves vertical swipes to the browser and does not turn a later diagonal into rotation', () => {
    pointer('pointerdown', 'touch', { clientX: 190, clientY: 155 })
    const move = pointer('pointermove', 'touch', { clientX: 193, clientY: 185 })
    pointer('pointermove', 'touch', { clientX: 280, clientY: 190 })
    expect(move.defaultPrevented).toBe(false)
    expect(renderer.rotateBy).not.toHaveBeenCalled()
    pointer('pointercancel', 'touch')
    expect(control.releasePointerCapture).toHaveBeenCalledWith(1)
  })

  it('still charges on a tap after a drag', () => {
    pointer('pointerdown', 'touch', { clientX: 100 })
    pointer('pointermove', 'touch', { clientX: 200 })
    pointer('pointerup', 'touch')
    pointer('pointerdown', 'touch')
    pointer('pointerup', 'touch')
    control.dispatchEvent(new MouseEvent('click', { detail: 1 }))
    expect(renderer.pulse).toHaveBeenCalledOnce()
  })

  it.each(['pointercancel', 'lostpointercapture'])(
    'ends rotation after %s',
    (event) => {
      pointer('pointerdown', 'touch', { clientX: 100 })
      pointer('pointermove', 'touch', { clientX: 200 })
      pointer(event, 'touch')
      renderer.rotateBy.mockClear()
      pointer('pointermove', 'touch', { clientX: 300 })
      expect(renderer.rotateBy).not.toHaveBeenCalled()
      expect(renderer.setActive).toHaveBeenLastCalledWith(false)
      expect(renderer.setPointer).toHaveBeenLastCalledWith(null)
    },
  )

  it('releases the gesture for a second finger or a reduced-motion preference change', () => {
    pointer('pointerdown', 'touch', { clientX: 100 })
    pointer('pointermove', 'touch', { clientX: 200 })
    pointer('pointerdown', 'touch', { pointerId: 2, isPrimary: false })
    renderer.rotateBy.mockClear()
    pointer('pointermove', 'touch', { clientX: 300 })
    expect(renderer.rotateBy).not.toHaveBeenCalled()

    pointer('pointerdown', 'touch', { clientX: 100 })
    Object.defineProperty(motion, 'matches', { value: true })
    motion.dispatchEvent(new Event('change'))
    pointer('pointermove', 'touch', { clientX: 300 })
    expect(renderer.rotateBy).not.toHaveBeenCalled()
    expect(renderer.setPointer).toHaveBeenLastCalledWith(null)
    control.click()
    expect(renderer.pulse).toHaveBeenCalledOnce()
  })

  it('removes input listeners and releases the GPU renderer on disconnect', () => {
    cleanup()
    renderer.setPointer.mockClear()
    pointer('pointermove')
    control.click()
    expect(renderer.setPointer).not.toHaveBeenCalled()
    expect(renderer.pulse).not.toHaveBeenCalled()
    expect(renderer.dispose).toHaveBeenCalledOnce()
    cleanup = () => {}
  })
})

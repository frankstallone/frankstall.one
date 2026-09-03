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
    pulse: vi.fn(),
    dispose: vi.fn(),
  }

  const pointer = (type: string, pointerType = 'mouse') => {
    const event = new MouseEvent(type, {
      bubbles: true,
      clientX: 380,
      clientY: 310,
    })
    Object.defineProperty(event, 'pointerType', { value: pointerType })
    control.dispatchEvent(event)
  }

  beforeEach(() => {
    vi.clearAllMocks()
    document.body.innerHTML = `<div id="hero"><div class="flux-instrument">
      <button><span class="flux-instrument__scene"><canvas></canvas></span></button>
    </div></div>`
    root = document.querySelector('.flux-instrument')!
    control = root.querySelector('button')!
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

  it('does not tilt or enter hover for a touch pointer', () => {
    pointer('pointerenter', 'touch')
    pointer('pointermove', 'touch')
    expect(renderer.setActive).not.toHaveBeenCalled()
    expect(renderer.setPointer).not.toHaveBeenCalled()
    expect(scene.style.transform).toBe('')
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

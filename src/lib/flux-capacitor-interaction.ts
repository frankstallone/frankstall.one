import { createFluxRenderer } from './flux-capacitor-renderer'

export function mountFluxCapacitor(root: HTMLElement): () => void {
  const control = root.querySelector<HTMLButtonElement>('button')!
  const canvas = root.querySelector<HTMLCanvasElement>('canvas')!
  // Put the optical effect outside the hero's clipping and stacking contexts.
  const flareCanvas = document.createElement('canvas')
  flareCanvas.className = 'flux-lens-flare-canvas'
  flareCanvas.setAttribute('aria-hidden', 'true')
  flareCanvas.hidden = true
  document.body.append(flareCanvas)
  const pointerArea = root.closest<HTMLElement>('#hero') ?? root
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
  let hovered = false
  let focused = false
  let suppressClick = false
  let touch:
    | {
        id: number
        startX: number
        startY: number
        lastX: number
        width: number
        axis: 'pending' | 'horizontal' | 'vertical'
      }
    | undefined

  const renderer = createFluxRenderer({
    canvas,
    flareCanvas,
    onReady: () => {
      root.dataset.gpuReady = 'true'
      flareCanvas.dataset.ready = 'true'
    },
    onFallback: () => {
      root.dataset.gpuReady = 'false'
      flareCanvas.dataset.ready = 'false'
    },
  })

  const updateActivity = () =>
    renderer.setActive(hovered || focused || touch?.axis === 'horizontal')
  const resetPointer = () => {
    renderer.setPointer(null)
  }
  const enter = (event: PointerEvent) => {
    if (event.pointerType === 'touch') return
    hovered = true
    updateActivity()
  }
  const leave = () => {
    hovered = false
    updateActivity()
  }
  const focus = () => {
    focused = true
    updateActivity()
  }
  const blur = () => {
    focused = false
    updateActivity()
  }
  const endTouch = () => {
    if (!touch) return
    const { id } = touch
    touch = undefined
    if (control.hasPointerCapture(id)) control.releasePointerCapture(id)
    updateActivity()
    resetPointer()
  }
  const down = (event: PointerEvent) => {
    suppressClick = false
    if (event.pointerType !== 'touch') return
    // A second finger belongs to the browser's pinch gesture.
    if (!event.isPrimary) {
      endTouch()
      suppressClick = true
      return
    }
    if (motion.matches) return
    const { width } = control.getBoundingClientRect()
    if (!width) return
    touch = {
      id: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      lastX: event.clientX,
      width,
      axis: 'pending',
    }
    control.setPointerCapture(event.pointerId)
  }
  const endPointer = (event: PointerEvent) => {
    if (event.pointerId === touch?.id) endTouch()
  }
  const move = (event: PointerEvent) => {
    if (motion.matches) return
    if (event.pointerType === 'touch') {
      if (!touch || event.pointerId !== touch.id) return
      if (touch.axis === 'pending') {
        const dx = Math.abs(event.clientX - touch.startX)
        const dy = Math.abs(event.clientY - touch.startY)
        if (Math.max(dx, dy) < 8) return
        touch.axis = dx > dy ? 'horizontal' : 'vertical'
        suppressClick = true
        updateActivity()
      }
      if (touch.axis === 'horizontal') {
        renderer.rotateBy((event.clientX - touch.lastX) / touch.width)
        touch.lastX = event.clientX
      }
      return
    }
    // Pointer coordinates move the 3D camera, never the canvas element.
    const bounds = control.getBoundingClientRect()
    if (!bounds.width || !bounds.height) return
    const x = Math.min(
      1,
      Math.max(0, (event.clientX - bounds.left) / bounds.width),
    )
    const y = Math.min(
      1,
      Math.max(0, (event.clientY - bounds.top) / bounds.height),
    )
    renderer.setPointer([x, y])
  }
  const charge = (event: MouseEvent) => {
    // Releasing a drag can generate a click; keyboard activation still works.
    if (suppressClick && event.detail > 0) {
      suppressClick = false
      return
    }
    renderer.pulse()
  }
  const motionChange = () => {
    endTouch()
    resetPointer()
  }
  const windowBlur = () => {
    hovered = false
    focused = false
    endTouch()
    updateActivity()
    resetPointer()
  }

  control.addEventListener('pointerenter', enter)
  control.addEventListener('pointerleave', leave)
  control.addEventListener('focus', focus)
  control.addEventListener('blur', blur)
  control.addEventListener('click', charge)
  control.addEventListener('pointerdown', down)
  control.addEventListener('pointerup', endPointer)
  control.addEventListener('pointercancel', endPointer)
  control.addEventListener('lostpointercapture', endPointer)
  pointerArea.addEventListener('pointermove', move)
  pointerArea.addEventListener('pointerleave', resetPointer)
  motion.addEventListener('change', motionChange)
  window.addEventListener('blur', windowBlur)

  return () => {
    endTouch()
    control.removeEventListener('pointerenter', enter)
    control.removeEventListener('pointerleave', leave)
    control.removeEventListener('focus', focus)
    control.removeEventListener('blur', blur)
    control.removeEventListener('click', charge)
    control.removeEventListener('pointerdown', down)
    control.removeEventListener('pointerup', endPointer)
    control.removeEventListener('pointercancel', endPointer)
    control.removeEventListener('lostpointercapture', endPointer)
    pointerArea.removeEventListener('pointermove', move)
    pointerArea.removeEventListener('pointerleave', resetPointer)
    motion.removeEventListener('change', motionChange)
    window.removeEventListener('blur', windowBlur)
    renderer.dispose()
    flareCanvas.remove()
    root.dataset.gpuReady = 'false'
  }
}

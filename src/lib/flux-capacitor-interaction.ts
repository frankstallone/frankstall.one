import { createFluxRenderer } from './flux-capacitor-renderer'

export function mountFluxCapacitor(root: HTMLElement): () => void {
  const control = root.querySelector<HTMLButtonElement>('button')!
  const canvas = root.querySelector<HTMLCanvasElement>('canvas')!
  const pointerArea = root.closest<HTMLElement>('#hero') ?? root
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
  let hovered = false
  let focused = false

  const renderer = createFluxRenderer({
    canvas,
    onReady: () => {
      root.dataset.gpuReady = 'true'
    },
    onFallback: () => {
      root.dataset.gpuReady = 'false'
    },
  })

  const updateActivity = () => renderer.setActive(hovered || focused)
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
  const move = (event: PointerEvent) => {
    if (event.pointerType === 'touch' || motion.matches) return
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
  const charge = () => renderer.pulse()
  const windowBlur = () => {
    hovered = false
    focused = false
    updateActivity()
    resetPointer()
  }

  control.addEventListener('pointerenter', enter)
  control.addEventListener('pointerleave', leave)
  control.addEventListener('focus', focus)
  control.addEventListener('blur', blur)
  control.addEventListener('click', charge)
  pointerArea.addEventListener('pointermove', move)
  pointerArea.addEventListener('pointerleave', resetPointer)
  motion.addEventListener('change', resetPointer)
  window.addEventListener('blur', windowBlur)

  return () => {
    control.removeEventListener('pointerenter', enter)
    control.removeEventListener('pointerleave', leave)
    control.removeEventListener('focus', focus)
    control.removeEventListener('blur', blur)
    control.removeEventListener('click', charge)
    pointerArea.removeEventListener('pointermove', move)
    pointerArea.removeEventListener('pointerleave', resetPointer)
    motion.removeEventListener('change', resetPointer)
    window.removeEventListener('blur', windowBlur)
    renderer.dispose()
    root.dataset.gpuReady = 'false'
  }
}

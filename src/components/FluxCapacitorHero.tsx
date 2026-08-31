import { useEffect, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'

import {
  createFluxEnergyRenderer,
  type FluxEnergyRenderer,
} from '../lib/flux-capacitor-renderer'

const branches = [
  { id: 'left', path: 'M 214 160 L 380 320' },
  { id: 'right', path: 'M 546 160 L 380 320' },
  { id: 'lower', path: 'M 380 506 L 380 320' },
] as const

const terminals = [
  { id: 'left', x: 214, y: 160, rotate: 43 },
  { id: 'right', x: 546, y: 160, rotate: -43 },
  { id: 'lower', x: 380, y: 506, rotate: 90 },
] as const

export default function FluxCapacitorHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rendererRef = useRef<FluxEnergyRenderer | null>(null)
  const pulseTimerRef = useRef<number | null>(null)
  const [gpuReady, setGpuReady] = useState(false)
  const [isPulsing, setIsPulsing] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }

    const renderer = createFluxEnergyRenderer({
      canvas,
      onReady: () => setGpuReady(true),
      onFallback: () => setGpuReady(false),
    })
    rendererRef.current = renderer
    void renderer.ready

    return () => {
      if (pulseTimerRef.current !== null) {
        window.clearTimeout(pulseTimerRef.current)
      }
      renderer.dispose()
      rendererRef.current = null
    }
  }, [])

  const setActive = (active: boolean) => {
    rendererRef.current?.setActive(active)
  }

  const handlePointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.pointerType === 'touch') {
      return
    }

    const bounds = event.currentTarget.getBoundingClientRect()
    rendererRef.current?.setPointer([
      Math.min(1, Math.max(0, (event.clientX - bounds.left) / bounds.width)),
      Math.min(1, Math.max(0, (event.clientY - bounds.top) / bounds.height)),
    ])
  }

  const handleCharge = () => {
    rendererRef.current?.pulse()
    setIsPulsing(true)

    if (pulseTimerRef.current !== null) {
      window.clearTimeout(pulseTimerRef.current)
    }
    pulseTimerRef.current = window.setTimeout(() => {
      setIsPulsing(false)
      pulseTimerRef.current = null
    }, 900)
  }

  return (
    <figure
      className="flux-instrument"
      data-gpu-ready={gpuReady}
      data-pulsing={isPulsing}
    >
      <button
        type="button"
        className="flux-instrument__control"
        aria-label="Charge the energy instrument"
        onClick={handleCharge}
        onFocus={() => setActive(true)}
        onBlur={() => setActive(false)}
        onPointerEnter={() => setActive(true)}
        onPointerMove={handlePointerMove}
        onPointerLeave={() => {
          setActive(false)
          rendererRef.current?.setPointer(null)
        }}
      >
        <svg
          className="flux-instrument__machine"
          viewBox="0 0 760 620"
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            <filter
              id="flux-static-glow"
              x="-80%"
              y="-80%"
              width="260%"
              height="260%"
            >
              <feGaussianBlur stdDeviation="7" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <radialGradient id="flux-core-fill">
              <stop offset="0" className="flux-core-fill__center" />
              <stop offset="0.55" className="flux-core-fill__middle" />
              <stop offset="1" className="flux-core-fill__edge" />
            </radialGradient>
          </defs>

          <rect
            className="flux-case"
            x="22"
            y="20"
            width="716"
            height="580"
            rx="28"
          />
          <rect
            className="flux-case__lip"
            x="43"
            y="41"
            width="674"
            height="538"
            rx="17"
          />
          <path className="flux-case__seam" d="M 71 91 H 689" />
          <path className="flux-case__seam" d="M 71 529 H 689" />

          <g className="flux-conduits">
            {branches.map((branch) => (
              <g
                key={branch.id}
                className={`flux-branch flux-branch--${branch.id}`}
              >
                <path className="flux-branch__bed" d={branch.path} />
                <path className="flux-branch__rail" d={branch.path} />
                <path className="flux-branch__channel" d={branch.path} />
                <path className="flux-static-energy" d={branch.path} />
              </g>
            ))}
          </g>

          <g className="flux-terminals">
            {terminals.map((terminal) => (
              <g
                key={terminal.id}
                className="flux-terminal"
                transform={`translate(${terminal.x} ${terminal.y}) rotate(${terminal.rotate})`}
              >
                <rect
                  className="flux-terminal__plate"
                  x="-48"
                  y="-34"
                  width="96"
                  height="68"
                  rx="15"
                />
                <rect
                  className="flux-terminal__cap"
                  x="-29"
                  y="-24"
                  width="58"
                  height="48"
                  rx="12"
                />
                <path
                  className="flux-terminal__coil"
                  d="M -17 -16 V 16 M -6 -18 V 18 M 6 -18 V 18 M 17 -16 V 16"
                />
              </g>
            ))}
          </g>

          <g className="flux-junction">
            <circle
              className="flux-junction__housing"
              cx="380"
              cy="320"
              r="75"
            />
            <circle className="flux-junction__ring" cx="380" cy="320" r="53" />
            <circle
              className="flux-junction__core"
              cx="380"
              cy="320"
              r="31"
              fill="url(#flux-core-fill)"
            />
            <circle className="flux-junction__spark" cx="380" cy="320" r="12" />
          </g>

          <g className="flux-case__index" aria-hidden="true">
            <path d="M 70 67 H 111" />
            <path d="M 649 67 H 690" />
            <path d="M 70 553 H 111" />
            <path d="M 649 553 H 690" />
          </g>
        </svg>

        <canvas
          ref={canvasRef}
          className="flux-energy-canvas"
          aria-hidden="true"
        />
      </button>
      <figcaption className="sr-only">
        Three conduits carry light toward the center of a hand-built energy
        instrument.
      </figcaption>
    </figure>
  )
}

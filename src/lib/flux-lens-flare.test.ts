import { describe, expect, it } from 'vitest'
import { mat4 } from 'wgpu-matrix'
import { flareStrength, projectFlareSource } from './flux-lens-flare'

describe('flux lens flare projection', () => {
  const bounds = { left: 400, top: 100, width: 200, height: 300 }

  it('projects the model through its canvas into viewport coordinates, flipping GPU Y', () => {
    expect(
      projectFlareSource([0, 0, 0], mat4.identity(), bounds, [1000, 500]),
    ).toEqual([0.5, 0.5])
    expect(
      projectFlareSource([1, 1, 0], mat4.identity(), bounds, [1000, 500]),
    ).toEqual([0.6, 0.2])
  })

  it('uses the camera matrix and follows canvas scroll without changing X', () => {
    const camera = mat4.translation([0.5, 0.2, 0])
    expect(
      projectFlareSource([0, 0, 0], camera, { ...bounds, top: 0 }, [1000, 500]),
    ).toEqual([0.55, expect.closeTo(0.24)])
  })

  it('catches broad orbit angles while leaving the centered idle view quiet', () => {
    expect(flareStrength([0, 0], 0)).toBeLessThan(0.04)
    expect(flareStrength([-0.17, -0.03], 1)).toBeGreaterThan(1)
    expect(flareStrength([0.2, 0.05], 1)).toBeGreaterThan(1)
    expect(flareStrength([0.14, 0], 1)).toBeGreaterThan(0.5)
  })
})

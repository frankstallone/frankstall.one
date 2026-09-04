type Point = readonly [number, number]
type Vector = readonly [number, number, number]
type Bounds = Pick<DOMRect, 'left' | 'top' | 'width' | 'height'>

export function projectFlareSource(
  point: Vector,
  viewProjection: ArrayLike<number>,
  bounds: Bounds,
  viewport: Point,
): [number, number] {
  const [x, y, z] = point
  const m = viewProjection
  const w = m[3] * x + m[7] * y + m[11] * z + m[15]
  const clipX = (m[0] * x + m[4] * y + m[8] * z + m[12]) / w
  const clipY = (m[1] * x + m[5] * y + m[9] * z + m[13]) / w
  return [
    (bounds.left + (clipX * 0.5 + 0.5) * bounds.width) / viewport[0],
    (bounds.top + (0.5 - clipY * 0.5) * bounds.height) / viewport[1],
  ]
}

// Two narrow reflection lobes let the glass catch the camera as it orbits.
export function flareStrength(orbit: Point, charge: number): number {
  const lobe = (yaw: number, pitch: number) =>
    Math.exp(
      -(((orbit[0] - yaw) / 0.085) ** 2) - ((orbit[1] - pitch) / 0.18) ** 2,
    )
  return (
    0.025 + Math.max(lobe(-0.17, -0.03), lobe(0.2, 0.05)) * (0.3 + charge * 0.7)
  )
}

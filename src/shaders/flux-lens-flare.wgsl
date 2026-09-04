struct Flare {
  source: vec2f,
  direction: vec2f,
  viewport: vec2f,
  strength: f32,
  reach: f32,
};
@group(0) @binding(0) var<uniform> flare: Flare;

@fragment fn fragment(@location(0) uv: vec2f) -> @location(0) vec4f {
  let pixel = (uv - flare.source) * flare.viewport;
  let across = vec2f(-flare.direction.y, flare.direction.x);
  let x = dot(pixel, flare.direction);
  let y = dot(pixel, across);
  let extent = exp(-pow(abs(x) / flare.reach, 1.35));
  let taper = 1.0 - smoothstep(flare.reach * 1.1, flare.reach * 1.7, abs(x));
  // A short bright core falls into a quiet full-viewport tail. Uneven shoulders
  // suggest internal lens reflections without drawing separate ghost shapes.
  let shoulderX = (abs(x) - 115.0) / 85.0;
  let shoulder = exp(-(shoulderX * shoulderX));
  let shortCore = exp(-abs(x) / 155.0);
  let streak = (extent * 0.38 + shortCore * 0.5 + shoulder * 0.12) * taper;
  let body = exp(-(y * y) / 20.25) * streak;
  let core = exp(-(y * y) / 0.7225) * (shortCore * 0.8 + streak * 0.2);
  let fringeOffset = 3.0 + 4.0 * (1.0 - exp(-abs(x) / 180.0));
  let fringeY = y - fringeOffset;
  let fringe = exp(-(fringeY * fringeY) / 5.76) * streak;
  let nearSource = exp(-dot(pixel / vec2f(32.0, 13.0), pixel / vec2f(32.0, 13.0)));
  let glint = exp(-dot(pixel / vec2f(7.0, 3.5), pixel / vec2f(7.0, 3.5)));
  // Warm translucent pigment remains visible on paper-white page backgrounds.
  // No screen blend: all output is premultiplied for the transparent surface.
  let warm = flare.strength * (body * 0.3 + nearSource * 0.2);
  let fine = flare.strength * (core * 0.55 + nearSource * 0.28 + glint * 0.85);
  let spectral = flare.strength * fringe * 0.17;
  let alpha = clamp(warm + fine + spectral, 0.0, 0.96);
  let color = vec3f(1.0, 0.58, 0.2) * warm
    + vec3f(1.0, 0.96, 0.84) * fine
    + vec3f(0.38, 0.65, 0.83) * spectral;
  return vec4f(color * (alpha / max(warm + fine + spectral, 0.0001)), alpha);
}

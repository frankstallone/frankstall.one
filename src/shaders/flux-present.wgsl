@group(0) @binding(0) var sceneTexture: texture_2d<f32>;
@group(0) @binding(1) var bloomTexture: texture_2d<f32>;
@group(0) @binding(2) var linearSampler: sampler;
fn toneMap(color: vec3f) -> vec3f {
  return clamp((color * (2.51 * color + 0.03)) / (color * (2.43 * color + 0.59) + 0.14), vec3f(0.0), vec3f(1.0));
}
@fragment fn fragment(@location(0) uv: vec2f) -> @location(0) vec4f {
  let original = textureSample(sceneTexture, linearSampler, uv);
  let step = vec2f(0.0, 0.67) / vec2f(textureDimensions(bloomTexture));
  var glow = vec3f(0.0);
  var total = 0.0;
  for (var i = -4; i <= 4; i++) {
    let weight = exp(-f32(i * i) / 7.0);
    glow += textureSampleLevel(bloomTexture, linearSampler, uv + step * f32(i), 0.0).rgb * weight;
    total += weight;
  }
  glow = glow / total * 0.07;
  let alpha = max(original.a, clamp(max(glow.r, max(glow.g, glow.b)), 0.0, 1.0));
  let linear = toneMap((original.rgb + glow) / max(alpha, 0.001));
  let srgb = select(linear * 12.92, 1.055 * pow(linear, vec3f(1.0 / 2.4)) - 0.055, linear > vec3f(0.0031308));
  return vec4f(srgb * alpha, alpha);
}

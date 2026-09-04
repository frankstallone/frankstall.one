@group(0) @binding(0) var sceneTexture: texture_2d<f32>;
@group(0) @binding(1) var linearSampler: sampler;
@fragment fn fragment(@location(0) uv: vec2f) -> @location(0) vec4f {
  let step = vec2f(2.0, 0.0) / vec2f(textureDimensions(sceneTexture));
  var color = vec3f(0.0);
  var total = 0.0;
  for (var i = -4; i <= 4; i++) {
    let weight = exp(-f32(i * i) / 7.0);
    let sampleColor = textureSampleLevel(sceneTexture, linearSampler, uv + step * f32(i), 0.0).rgb;
    let peak = max(sampleColor.r, max(sampleColor.g, sampleColor.b));
    color += sampleColor * max(peak - 1.3, 0.0) / max(peak, 0.001) * weight;
    total += weight;
  }
  return vec4f(color / total, 1.0);
}

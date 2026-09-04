struct Light { viewProjection: mat4x4f }
@group(0) @binding(0) var<uniform> light: Light;
@vertex fn vertex(@location(0) position: vec3f, @location(1) normal: vec3f) -> @builtin(position) vec4f {
  return light.viewProjection * vec4f(position + normal * 0.001, 1.0);
}
@fragment fn fragment(@builtin(position) position: vec4f) -> @location(0) vec4f {
  return vec4f(position.z, 0.0, 0.0, 1.0);
}

struct Scene {
  viewProjection: mat4x4f,
  lightViewProjection: mat4x4f,
  eye: vec3f,
  charge: f32,
  time: f32,
  pulse: f32,
}
struct Material {
  baseColor: vec3f,
  metallic: f32,
  emission: vec3f,
  roughness: f32,
  alpha: f32,
  kind: f32,
  surface: f32,
}
@group(0) @binding(0) var<uniform> scene: Scene;
@group(0) @binding(1) var<uniform> material: Material;
@group(0) @binding(2) var shadowMap: texture_2d<f32>;
@group(0) @binding(3) var linearSampler: sampler;
struct VertexOut {
  @builtin(position) position: vec4f,
  @location(0) world: vec3f,
  @location(1) normal: vec3f,
  @location(2) shadowPosition: vec4f,
}
@vertex fn vertex(@location(0) position: vec3f, @location(1) normal: vec3f) -> VertexOut {
  var out: VertexOut;
  out.position = scene.viewProjection * vec4f(position, 1.0);
  out.world = position;
  out.normal = normal;
  out.shadowPosition = scene.lightViewProjection * vec4f(position + normal * 0.004, 1.0);
  return out;
}
fn fresnel(cosine: f32, f0: vec3f) -> vec3f {
  return f0 + (1.0 - f0) * pow(1.0 - cosine, 5.0);
}
// Broad studio softboxes reflected in actual world-space surface normals.
fn environment(direction: vec3f, roughness: f32) -> vec3f {
  let sky = mix(vec3f(0.10, 0.11, 0.12), vec3f(0.36, 0.38, 0.40), direction.z * 0.5 + 0.5);
  let key = pow(max(dot(direction, normalize(vec3f(-3.0, -4.0, 6.0))), 0.0), mix(90.0, 3.0, roughness));
  let strip = pow(max(dot(direction, normalize(vec3f(4.0, -2.0, 1.0))), 0.0), mix(160.0, 5.0, roughness));
  let front = pow(max(dot(direction, normalize(vec3f(-0.25, -1.0, 0.05))), 0.0), mix(12.0, 3.0, roughness));
  return sky + key * vec3f(3.0, 2.9, 2.75) + strip * vec3f(1.6, 1.8, 2.0) + front * vec3f(1.55, 1.58, 1.6);
}
fn shadowVisibility(position: vec4f) -> f32 {
  let projected = position.xyz / position.w;
  let uv = projected.xy * vec2f(0.5, -0.5) + 0.5;
  var visibility = 0.0;
  let texel = 1.0 / vec2f(textureDimensions(shadowMap));
  for (var y = -2; y <= 2; y++) {
    for (var x = -2; x <= 2; x++) {
      let depth = textureSampleLevel(shadowMap, linearSampler, uv + vec2f(f32(x), f32(y)) * texel * 3.0, 0.0).r;
      visibility += select(0.0, 1.0, projected.z - 0.001 < depth);
    }
  }
  return 0.42 + 0.58 * visibility / 25.0;
}
// All wear is anchored to the exported model, so it stays put during camera orbit.
fn hash(p: vec3f) -> f32 {
  var q = fract(p * 0.1031);
  q += dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
}
fn noise(p: vec3f) -> f32 {
  let cell = floor(p);
  let f = fract(p);
  let u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash(cell), hash(cell + vec3f(1, 0, 0)), u.x),
        mix(hash(cell + vec3f(0, 1, 0)), hash(cell + vec3f(1, 1, 0)), u.x), u.y),
    mix(mix(hash(cell + vec3f(0, 0, 1)), hash(cell + vec3f(1, 0, 1)), u.x),
        mix(hash(cell + vec3f(0, 1, 1)), hash(cell + vec3f(1, 1, 1)), u.x), u.y), u.z);
}
struct Finish {
  color: vec3f,
  metallic: f32,
  roughness: f32,
  dirt: f32,
}
fn agedFinish(p: vec3f, n: vec3f) -> Finish {
  var finish = Finish(material.baseColor, material.metallic, material.roughness, 0.0);
  // Lettering and energized surfaces deliberately retain their authored finish.
  if (material.surface < 0.5) { return finish; }
  let broad = noise(p * 3.1 + vec3f(17.2, 9.8, 4.1));
  let patches = noise(p * 10.5 + vec3f(5.3, 2.7, 13.1));
  let grime = smoothstep(0.38, 0.79, broad * 0.72 + patches * 0.28);
  if (material.surface < 1.5) {
    // Broad grime reaches all paint; bright edge wear belongs to the lighter enclosure.
    let luminance = dot(material.baseColor, vec3f(0.2126, 0.7152, 0.0722));
    let paintWear = smoothstep(0.12, 0.18, luminance);
    let bevel = clamp((1.0 - max(max(abs(n.x), abs(n.y)), abs(n.z))) * 5.0, 0.0, 1.0);
    let chipField = noise(p * 36.0 + vec3f(23.7, 1.8, 8.4));
    let chips = smoothstep(0.82, 0.91, chipField + bevel * 0.12)
      * smoothstep(0.57, 0.76, patches) * paintWear;
    let rub = bevel * smoothstep(0.58, 0.82, broad) * 0.06 * paintWear;
    finish.color *= 1.0 - grime * 0.16 + rub;
    finish.color = mix(finish.color, vec3f(0.26, 0.245, 0.20), chips * 0.8);
    finish.metallic = min(finish.metallic, 0.12) * (1.0 - chips);
    finish.roughness += grime * 0.09 - rub + chips * 0.12;
  } else if (material.surface < 2.5) {
    // Tarnish is a thin brown film, broken by surviving warm brass highlights.
    let tarnish = smoothstep(0.34, 0.78, broad * 0.62 + patches * 0.38);
    finish.color *= mix(vec3f(1.03, 1.015, 0.98), vec3f(0.56, 0.52, 0.46), tarnish);
    finish.metallic *= 1.0 - tarnish * 0.18;
    finish.roughness += tarnish * 0.22 - (1.0 - tarnish) * 0.035;
  } else if (material.surface < 3.5) {
    finish.color *= 0.95 + broad * 0.07;
    finish.roughness += grime * 0.08;
  } else if (material.surface < 4.5) {
    finish.color *= 0.95 + broad * 0.06;
    finish.roughness = max(finish.roughness, 0.46) + grime * 0.06;
  } else if (material.surface < 5.5) {
    // Broad handling marks and a faint uneven wipe; no opaque fog over the mechanism.
    let wipe = noise(p * vec3f(5.0, 3.0, 0.85) + vec3f(8.1, 6.4, 0.7));
    finish.dirt = smoothstep(0.5, 0.82, broad * 0.65 + wipe * 0.35);
    finish.roughness += finish.dirt * 0.13;
  } else {
    finish.color *= 1.0 - grime * 0.12;
    finish.roughness += grime * 0.13;
  }
  finish.roughness = clamp(finish.roughness, 0.045, 0.9);
  return finish;
}
fn directLight(n: vec3f, v: vec3f, l: vec3f, radiance: vec3f, finish: Finish) -> vec3f {
  let h = normalize(v + l);
  let nl = max(dot(n, l), 0.0);
  let nv = max(dot(n, v), 0.001);
  let nh = max(dot(n, h), 0.0);
  let vh = max(dot(v, h), 0.0);
  let roughness = max(finish.roughness, 0.09);
  let a2 = pow(roughness, 4.0);
  let d = a2 / max(3.14159265 * pow(nh * nh * (a2 - 1.0) + 1.0, 2.0), 0.0001);
  let k = pow(roughness + 1.0, 2.0) / 8.0;
  let g = (nv / (nv * (1.0 - k) + k)) * (nl / max(nl * (1.0 - k) + k, 0.001));
  let f = fresnel(vh, mix(vec3f(0.04), finish.color, finish.metallic));
  let specular = d * g * f / max(4.0 * nv * nl, 0.001);
  let diffuse = (1.0 - f) * (1.0 - finish.metallic) * finish.color / 3.14159265;
  return (diffuse + specular) * radiance * nl;
}
// Soft lamp pools behind the acrylic overlap as their chaser moves inward.
// The 2.1-second cycle uses a short warm-up and a longer incandescent decay.
fn lampLevel(position: vec3f) -> f32 {
  if (scene.time < 0.0) { return 0.72; }
  let radial = length(position.xz - vec2f(0.0, -0.18));
  let armLength = select(1.48, 1.16, position.z < -0.18);
  let progress = clamp((radial - 0.18) / (armLength - 0.37), 0.0, 1.0);
  var light = 0.0;
  var weight = 0.0;
  for (var lamp = 0; lamp < 3; lamp++) {
    let center = f32(lamp) * 0.5;
    let pool = exp(-pow((progress - center) / 0.34, 2.0));
    let phase = fract(scene.time / 2.1 - (1.0 - center) * 0.44);
    let warmth = smoothstep(0.0, 0.14, phase) * (1.0 - smoothstep(0.23, 0.65, phase));
    light += pool * warmth;
    weight += pool;
  }
  return 0.28 + 0.88 * light / weight;
}
@fragment fn fragment(in: VertexOut, @builtin(front_facing) front: bool) -> @location(0) vec4f {
  let n = normalize(select(-in.normal, in.normal, front));
  let finish = agedFinish(in.world, n);
  let v = normalize(scene.eye - in.world);
  let reflected = reflect(-v, n);
  let nv = max(dot(n, v), 0.0);
  let f0 = mix(vec3f(0.04), finish.color, finish.metallic);
  let f = fresnel(nv, f0);
  let env = environment(reflected, finish.roughness);
  let ambient = finish.color * (1.0 - finish.metallic) * (0.24 + 0.14 * max(n.z, 0.0));
  var color = ambient + env * f * (1.0 - 0.55 * finish.roughness);
  color += directLight(n, v, normalize(vec3f(-3.0, -4.0, 6.0)), vec3f(2.7, 2.6, 2.45), finish) * shadowVisibility(in.shadowPosition);
  color += directLight(n, v, normalize(vec3f(4.0, -2.0, 1.0)), vec3f(0.9, 1.0, 1.1), finish);
  // Persistent warm spill keeps the relay hardware visible between chaser peaks.
  let coreDistance = length(in.world - vec3f(0.0, -0.47, -0.18));
  color += finish.color * vec3f(0.24, 0.085, 0.018)
    * (0.38 + scene.charge * 0.14 + scene.pulse * 0.25) / (0.6 + coreDistance * coreDistance);
  if (material.kind > 1.5) {
    // A bounded surge retains amber instead of driving every channel to white.
    color = finish.color * 0.08 + material.emission
      * min(lampLevel(in.world) + scene.charge * 0.14 + scene.pulse * 0.32, 1.5);
  } else {
    color += material.emission;
  }
  if (material.kind > 0.5 && material.kind < 1.5) {
    let edge = pow(1.0 - nv, 5.0);
    let alpha = min(material.alpha + edge * 0.32 + finish.dirt * 0.035, 0.45);
    let reflection = env * (0.18 - finish.dirt * 0.025);
    return vec4f(reflection + finish.color * 0.02 + vec3f(0.035, 0.032, 0.026) * finish.dirt, alpha);
  }
  return vec4f(color, 1.0);
}

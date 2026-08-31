struct Params {
  time: f32,
  activity: f32,
  pulse: f32,
  pointer: vec2f,
  aspect: vec2f,
}

@group(0) @binding(0) var<uniform> params: Params;

fn instrument_space(point: vec2f) -> vec2f {
  return (point - vec2f(0.5)) * params.aspect;
}

fn segment_info(point: vec2f, start: vec2f, finish: vec2f) -> vec2f {
  let start_point = instrument_space(start);
  let finish_point = instrument_space(finish);
  let axis = finish_point - start_point;
  let offset = point - start_point;
  let progress = clamp(dot(offset, axis) / dot(axis, axis), 0.0, 1.0);
  return vec2f(length(offset - axis * progress), progress);
}

fn hash(point: vec2f) -> f32 {
  return fract(sin(dot(point, vec2f(127.1, 311.7))) * 43758.5453);
}

fn noise(point: vec2f) -> f32 {
  let cell = floor(point);
  let local = fract(point);
  let blend = local * local * (3.0 - 2.0 * local);
  return mix(
    mix(hash(cell), hash(cell + vec2f(1.0, 0.0)), blend.x),
    mix(hash(cell + vec2f(0.0, 1.0)), hash(cell + vec2f(1.0)), blend.x),
    blend.y,
  );
}

fn charge(info: vec2f, phase: f32, pointer_weight: f32) -> vec2f {
  let filament = exp(-pow(info.x / 0.010, 2.0));
  let aura = exp(-pow(info.x / 0.035, 2.0));
  let progress = fract(params.time * 0.24 + phase);
  let wrapped_distance = abs(fract(info.y - progress + 0.5) - 0.5);
  let packet = exp(-pow(wrapped_distance / 0.085, 2.0));
  let interference = 0.45 + 0.55 * pow(
    0.5 + 0.5 * sin(info.y * 31.0 - params.time * 4.2 + phase * 12.0),
    4.0,
  );
  let wake = smoothstep(0.0, 0.24, info.y) * smoothstep(1.0, 0.72, info.y);
  let level = params.activity + pointer_weight * 0.48 + params.pulse * 0.85;
  let energy = wake * level * (filament * (0.34 + packet * 1.2 + interference * 0.42) + aura * packet * 0.38);
  return vec2f(energy, max(filament * 0.72, aura * 0.26) * wake);
}

@fragment fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let point = instrument_space(uv);
  let center_uv = vec2f(0.5, 0.516129);
  let center = instrument_space(center_uv);
  let pointer = instrument_space(params.pointer);

  let left = segment_info(point, vec2f(0.281579, 0.258065), center_uv);
  let right = segment_info(point, vec2f(0.718421, 0.258065), center_uv);
  let lower = segment_info(point, vec2f(0.5, 0.816129), center_uv);

  let left_pointer = exp(-distance(pointer, instrument_space(vec2f(0.390789, 0.387097))) * 6.0);
  let right_pointer = exp(-distance(pointer, instrument_space(vec2f(0.609211, 0.387097))) * 6.0);
  let lower_pointer = exp(-distance(pointer, instrument_space(vec2f(0.5, 0.666129))) * 6.0);

  let left_charge = charge(left, 0.00, left_pointer);
  let right_charge = charge(right, 0.33, right_pointer);
  let lower_charge = charge(lower, 0.66, lower_pointer);

  let radius = length(point - center);
  let core = exp(-pow(radius / 0.040, 2.0));
  let core_aura = exp(-pow(radius / 0.105, 2.0));
  let ring = exp(-pow((radius - 0.064) / 0.009, 2.0));
  let field = 0.7 + noise(point * 44.0 + vec2f(params.time * 0.7, -params.time * 0.42)) * 0.3;
  let convergence = core * (1.0 + params.pulse * 1.8) + core_aura * 0.25 + ring * 0.45;

  let branch_energy = left_charge.x + right_charge.x + lower_charge.x;
  let coverage = clamp(max(max(left_charge.y, right_charge.y), lower_charge.y) + core_aura * 0.82 + ring * 0.45, 0.0, 1.0);
  let cool = vec3f(0.35, 0.73, 0.87);
  let white_hot = vec3f(0.88, 0.96, 1.0);
  let warm = vec3f(1.0, 0.75, 0.18);
  let energy_color = mix(cool, white_hot, clamp(branch_energy * 0.32 + core * 0.6, 0.0, 1.0));
  let color = energy_color * (branch_energy + convergence * field) + warm * core * params.pulse * 0.52;
  let alpha = clamp(coverage * (0.35 + branch_energy * 0.38 + convergence * 0.58), 0.0, 0.96);

  return vec4f(color * alpha, alpha);
}

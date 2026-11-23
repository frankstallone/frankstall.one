import {
  getFluxBackgroundSettings,
  subscribeFluxBackgroundSettings,
} from './flux-background-settings'

const vertexSource = `
attribute vec2 a_position;
void main() { gl_Position = vec4(a_position, 0.0, 1.0); }
`

const fragmentSource = `
precision highp float;
uniform vec2 u_resolution;
uniform float u_time;
uniform float u_mobile;
uniform float u_brightness;
uniform float u_bloom;
uniform float u_warmth;
uniform float u_grain;
uniform float u_scanlines;
uniform float u_spread;
uniform float u_offsetX;
uniform float u_offsetY;

float grain(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

// Distance along each arm gives the current a continuous, unhurried flow.
vec3 arm(vec2 p, vec2 direction, float seed) {
  vec2 normal = vec2(-direction.y, direction.x);
  float along = dot(p, direction);
  float across = dot(p, normal);
  float gate = smoothstep(-0.055, 0.025, along);
  float bend = sin(along * 6.0 + seed) * 0.027 * smoothstep(0.0, 0.3, along);
  float envelope = 0.72 + 0.28 * sin(along * 8.0 - u_time * 0.65 + seed);
  float distance = abs(across - bend);
  vec3 light = vec3(0.55, 0.20, 0.045) * exp(-distance * 15.0) * 0.20 * u_bloom;
  light += vec3(0.10, 0.37, 0.38) * exp(-abs(across - bend - 0.045) * 48.0) * 0.10 * u_bloom;
  for (int i = 0; i < 4; i++) {
    float strand = float(i);
    float offset = (strand - 1.5) * 0.009;
    float wave = sin(along * (24.0 + strand * 5.0) - u_time * 0.5 + seed + strand * 2.0) * 0.005;
    wave += sin(along * 61.0 + u_time * 0.3 + strand * 3.0 + seed) * 0.002;
    wave *= smoothstep(0.0, 0.14, along);
    float d = abs(across - bend - offset - wave);
    light += vec3(1.0, 0.40, 0.10) * exp(-d * 100.0) * 0.12 * envelope * u_bloom;
    light += vec3(1.0, 0.80, 0.47) * exp(-d * 620.0) * 0.65 * envelope;
  }
  return light * gate;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float aspect = u_resolution.x / u_resolution.y;
  vec2 center = mix(vec2(0.73, 0.53), vec2(0.64, 0.30), u_mobile) + vec2(u_offsetX, -u_offsetY);
  vec2 p = (uv - center) * vec2(aspect, 1.0);
  vec3 color = vec3(0.014, 0.018, 0.019);
  color += arm(p, normalize(vec2(-0.72 * u_spread, 0.78)), 1.7);
  color += arm(p, normalize(vec2(0.72 * u_spread, 0.78)), 4.8);
  color += arm(p, normalize(vec2(-0.04, -1.0)), 8.2);
  float radius = length(p);
  color += vec3(0.70, 0.29, 0.075) * exp(-radius * 7.0) * 0.24 * u_bloom;
  color += vec3(1.0, 0.73, 0.37) * exp(-radius * 58.0) * 0.65;
  color = mix(color.bgr, color, u_warmth);
  // Keep the type area quiet while the enlarged arms run beyond the frame.
  float textMask = mix(smoothstep(0.22, 0.67, uv.x), 1.0 - smoothstep(0.43, 0.78, uv.y), u_mobile);
  color = mix(vec3(0.013, 0.016, 0.017), color, 0.07 + textMask * 0.93);
  color *= 1.0 - 0.18 * smoothstep(0.3, 0.85, length(uv - 0.5));
  color = 1.0 - exp(-color * 1.35 * u_brightness);
  // The noise never uses time: patina must not shimmer behind the headline.
  color += (grain(gl_FragCoord.xy) - 0.5) * 0.018 * u_grain;
  color *= 1.0 + u_scanlines * (-0.02 + 0.02 * sin(gl_FragCoord.y * 1.57));
  gl_FragColor = vec4(color, 1.0);
}
`

const uniformSettings = [
  'brightness',
  'bloom',
  'warmth',
  'grain',
  'scanlines',
  'spread',
  'offsetX',
  'offsetY',
] as const

type Resources = {
  program: WebGLProgram
  buffer: WebGLBuffer
  resolution: WebGLUniformLocation | null
  time: WebGLUniformLocation | null
  mobile: WebGLUniformLocation | null
  settings: Record<
    (typeof uniformSettings)[number],
    WebGLUniformLocation | null
  >
}

/** Mount the decorative hero canvas. An unavailable GPU leaves its CSS fallback. */
export function mountFluxBackground(canvas: HTMLCanvasElement): () => void {
  let gl: WebGLRenderingContext | null
  try {
    gl = canvas.getContext('webgl', {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: 'low-power',
    })
  } catch {
    return () => {}
  }
  if (!gl) return () => {}
  let settings = getFluxBackgroundSettings()
  const context = gl
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
  let resources: Resources | null = null
  let disposed = false
  let lost = false
  let visible = true
  let frame = 0
  let elapsed = 0
  let previousTime = 0
  let lastDraw = 0

  function release() {
    if (!resources) return
    context.deleteBuffer(resources.buffer)
    context.deleteProgram(resources.program)
    resources = null
  }

  function initialize(): boolean {
    const shaders: WebGLShader[] = []
    const program = context.createProgram()
    const buffer = context.createBuffer()
    if (!program || !buffer) {
      if (program) context.deleteProgram(program)
      if (buffer) context.deleteBuffer(buffer)
      return false
    }
    for (const [type, source] of [
      [context.VERTEX_SHADER, vertexSource],
      [context.FRAGMENT_SHADER, fragmentSource],
    ] as const) {
      const shader = context.createShader(type)
      if (!shader) break
      shaders.push(shader)
      context.shaderSource(shader, source)
      context.compileShader(shader)
      if (!context.getShaderParameter(shader, context.COMPILE_STATUS)) break
      context.attachShader(program, shader)
    }
    context.linkProgram(program)
    const linked = context.getProgramParameter(program, context.LINK_STATUS)
    for (const shader of shaders) context.deleteShader(shader)
    if (!linked) {
      context.deleteProgram(program)
      context.deleteBuffer(buffer)
      return false
    }
    context.useProgram(program)
    context.bindBuffer(context.ARRAY_BUFFER, buffer)
    context.bufferData(
      context.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      context.STATIC_DRAW,
    )
    const position = context.getAttribLocation(program, 'a_position')
    context.enableVertexAttribArray(position)
    context.vertexAttribPointer(position, 2, context.FLOAT, false, 0, 0)
    resources = {
      program,
      buffer,
      resolution: context.getUniformLocation(program, 'u_resolution'),
      time: context.getUniformLocation(program, 'u_time'),
      mobile: context.getUniformLocation(program, 'u_mobile'),
      settings: Object.fromEntries(
        uniformSettings.map((key) => [
          key,
          context.getUniformLocation(program, `u_${key}`),
        ]),
      ) as Resources['settings'],
    }
    return true
  }

  function draw() {
    if (!resources || disposed || lost || !visible || document.hidden) return
    const bounds = canvas.getBoundingClientRect()
    if (bounds.width <= 0 || bounds.height <= 0) return
    const scale = Math.min(
      window.devicePixelRatio || 1,
      1.5,
      Math.sqrt(1_500_000 / (bounds.width * bounds.height)),
    )
    const width = Math.max(1, Math.round(bounds.width * scale))
    const height = Math.max(1, Math.round(bounds.height * scale))
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width
      canvas.height = height
      context.viewport(0, 0, width, height)
    }
    context.uniform2f(resources.resolution, width, height)
    context.uniform1f(resources.time, elapsed)
    context.uniform1f(resources.mobile, bounds.width < 760 ? 1 : 0)
    for (const key of uniformSettings)
      context.uniform1f(resources.settings[key], settings[key])
    context.drawArrays(context.TRIANGLES, 0, 3)
    canvas.dataset.ready = 'true'
  }

  function tick(time: number) {
    frame = 0
    if (
      disposed ||
      lost ||
      !resources ||
      !visible ||
      document.hidden ||
      motion.matches ||
      settings.paused ||
      settings.speed === 0
    )
      return
    if (previousTime)
      elapsed += Math.min((time - previousTime) / 1000, 0.1) * settings.speed
    previousTime = time
    if (time - lastDraw >= 1000 / 30) {
      draw()
      lastDraw = time
    }
    frame = requestAnimationFrame(tick)
  }

  function sync() {
    cancelAnimationFrame(frame)
    frame = 0
    previousTime = 0
    if (disposed || lost || !resources || !visible || document.hidden) return
    draw()
    if (!motion.matches && !settings.paused && settings.speed > 0)
      frame = requestAnimationFrame(tick)
  }

  function onLost(event: Event) {
    event.preventDefault()
    lost = true
    cancelAnimationFrame(frame)
    frame = 0
    resources = null
    delete canvas.dataset.ready
  }

  function onRestored() {
    if (disposed) return
    lost = false
    if (initialize()) sync()
  }

  if (!initialize()) return () => {}
  const unsubscribe = subscribeFluxBackgroundSettings((next) => {
    settings = next
    sync()
  })
  const resize =
    typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(sync)
  resize?.observe(canvas)
  const intersection =
    typeof IntersectionObserver === 'undefined'
      ? null
      : new IntersectionObserver(([entry]) => {
          visible = entry.isIntersecting
          sync()
        })
  intersection?.observe(canvas)
  motion.addEventListener('change', sync)
  document.addEventListener('visibilitychange', sync)
  window.addEventListener('resize', sync)
  canvas.addEventListener('webglcontextlost', onLost)
  canvas.addEventListener('webglcontextrestored', onRestored)
  sync()

  return () => {
    disposed = true
    unsubscribe()
    cancelAnimationFrame(frame)
    resize?.disconnect()
    intersection?.disconnect()
    motion.removeEventListener('change', sync)
    document.removeEventListener('visibilitychange', sync)
    window.removeEventListener('resize', sync)
    canvas.removeEventListener('webglcontextlost', onLost)
    canvas.removeEventListener('webglcontextrestored', onRestored)
    release()
    delete canvas.dataset.ready
  }
}

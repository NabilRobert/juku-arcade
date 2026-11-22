/**
 * The swirling table (D35), drawn by the graphics card: one fragment
 * shader paints marbled bands that warp and spiral, in two navy shades.
 * TableBackground.vue owns the canvas and the animation loop; this file
 * only sets up WebGL and draws one frame for a given phase.
 *
 * The animation loops: every moving term in the shader turns a whole
 * number of times per loop, so phase 2π looks exactly like phase 0.
 */

/** One loop of the swirl, in milliseconds. */
export const SWIRL_LOOP_MS = 16_000;

/** Where in the loop the swirl is at a moment: 0 at the start, up to 2π. */
export function swirlPhase(nowMs: number): number {
  return ((nowMs % SWIRL_LOOP_MS) / SWIRL_LOOP_MS) * 2 * Math.PI;
}

/** The two shades of the bands, as 0–1 RGB: deep navy and the palette's navy #1b3a57. */
const DARK_RGB = [0.051, 0.114, 0.18] as const;
const LIGHT_RGB = [0.106, 0.227, 0.341] as const;

const VERTEX_SOURCE = `
attribute vec2 a_corner;
void main() { gl_Position = vec4(a_corner, 0.0, 1.0); }
`;

// Domain warping: each pass bends the coordinates with slow sine waves, then
// the bands are rings around the centre that also turn with the angle, which
// is what makes them spiral. A wide smoothstep blurs the band edges.
const FRAGMENT_SOURCE = `
precision mediump float;
uniform vec2 u_size;
uniform float u_phase;
uniform vec3 u_dark;
uniform vec3 u_light;
void main() {
  vec2 p = (gl_FragCoord.xy - 0.5 * u_size) / u_size.y;
  for (int i = 1; i < 4; i++) {
    float f = float(i);
    p += 0.22 / f * vec2(sin(f * 2.1 * p.y + u_phase + f), cos(f * 1.7 * p.x - u_phase + f * 1.3));
  }
  float rings = sin(length(p) * 26.0 - 4.0 * u_phase + 2.0 * atan(p.y, p.x));
  gl_FragColor = vec4(mix(u_dark, u_light, smoothstep(-0.6, 0.6, rings)), 1.0);
}
`;

export interface Swirl {
  draw: (phase: number) => void;
}

function compile(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (shader === null) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return gl.getShaderParameter(shader, gl.COMPILE_STATUS) === true ? shader : null;
}

function link(gl: WebGLRenderingContext): WebGLProgram | null {
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX_SOURCE);
  const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SOURCE);
  const program = gl.createProgram();
  if (vertex === null || fragment === null || program === null) return null;
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  return gl.getProgramParameter(program, gl.LINK_STATUS) === true ? program : null;
}

/** Two triangles covering the canvas, which the fragment shader paints. */
function fillCanvas(gl: WebGLRenderingContext, program: WebGLProgram): void {
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const corner = gl.getAttribLocation(program, 'a_corner');
  gl.enableVertexAttribArray(corner);
  gl.vertexAttribPointer(corner, 2, gl.FLOAT, false, 0, 0);
}

/**
 * Sets up the shader on a canvas. Returns null when the browser can't
 * draw WebGL (old hardware, or it's switched off); the page then shows
 * the plain navy table instead.
 */
export function createSwirl(canvas: HTMLCanvasElement): Swirl | null {
  const gl = canvas.getContext('webgl', { antialias: false, depth: false });
  if (gl === null) return null;
  const program = link(gl);
  if (program === null) return null;
  gl.useProgram(program);
  fillCanvas(gl, program);
  gl.uniform3fv(gl.getUniformLocation(program, 'u_dark'), DARK_RGB);
  gl.uniform3fv(gl.getUniformLocation(program, 'u_light'), LIGHT_RGB);
  const size = gl.getUniformLocation(program, 'u_size');
  const phase = gl.getUniformLocation(program, 'u_phase');
  return {
    draw: (at) => {
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(size, canvas.width, canvas.height);
      gl.uniform1f(phase, at);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    },
  };
}

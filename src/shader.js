// Loader & compiler shader dari folder shaders/

async function fetchText(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Gagal memuat shader: ${url} (${res.status})`);
  return res.text();
}

function compile(gl, type, source, name) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Compile error (${name}):\n${log}`);
  }
  return shader;
}

export async function createProgramFromFiles(gl, vertUrl, fragUrl) {
  const [vsSrc, fsSrc] = await Promise.all([fetchText(vertUrl), fetchText(fragUrl)]);
  const vs = compile(gl, gl.VERTEX_SHADER, vsSrc, vertUrl);
  const fs = compile(gl, gl.FRAGMENT_SHADER, fsSrc, fragUrl);

  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(`Link error (${vertUrl} + ${fragUrl}):\n${log}`);
  }
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  return program;
}

// Ambil semua lokasi uniform sekaligus
export function getUniforms(gl, program, names) {
  const map = {};
  names.forEach((n) => { map[n] = gl.getUniformLocation(program, n); });
  return map;
}

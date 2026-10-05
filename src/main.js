// Entry point: inisialisasi WebGL2, memuat shader & texture, menjalankan render loop
import { createCubeData, createCubeVAO, createMarkerVAO } from './geometry.js';
import { createProgramFromFiles, getUniforms } from './shader.js';
import { loadTexture, applyTextureParams } from './texture.js';
import {
  state, LIGHT_MODES, AMBIENT_PRESETS, SHININESS_PRESETS,
  FILTER_MODES, WRAP_MODES, UV_TILES, TEXTURES,
} from './state.js';
import { setupInput, updateHeld } from './input.js';
import { createHUD } from './hud.js';
import * as m4 from './math3d.js';

const canvas = document.getElementById('glcanvas');
const hudEl = document.getElementById('hud');
const errorEl = document.getElementById('error');

function showError(msg) {
  errorEl.textContent = msg;
  errorEl.hidden = false;
}

function resizeCanvas(gl) {
  const dpr = window.devicePixelRatio || 1;
  const w = Math.floor(canvas.clientWidth * dpr);
  const h = Math.floor(canvas.clientHeight * dpr);
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  gl.viewport(0, 0, canvas.width, canvas.height);
}

async function main() {
  const gl = canvas.getContext('webgl2');
  if (!gl) { showError('WebGL2 tidak didukung di browser ini.'); return; }

  const [litProg, markerProg] = await Promise.all([
    createProgramFromFiles(gl, 'shaders/lit.vert', 'shaders/lit.frag'),
    createProgramFromFiles(gl, 'shaders/marker.vert', 'shaders/marker.frag'),
  ]);

  const litU = getUniforms(gl, litProg, [
    'u_model', 'u_view', 'u_projection', 'u_normalMatrix', 'u_uvScale', 'u_uvOffset',
    'u_texture', 'u_lightPos', 'u_viewPos', 'u_lightColor', 'u_ambientStrength',
    'u_shininess', 'u_specularStrength', 'u_useAmbient', 'u_useDiffuse', 'u_useSpecular',
  ]);
  const markerU = getUniforms(gl, markerProg, ['u_model', 'u_view', 'u_projection', 'u_color']);

  const cubeData = createCubeData();
  const cube = createCubeVAO(gl, cubeData);
  const marker = createMarkerVAO(gl, cubeData);

  const textures = await Promise.all(TEXTURES.map((t) => loadTexture(gl, t.url)));

  setupInput(canvas);
  const updateHUD = createHUD(hudEl);

  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.clearColor(0.07, 0.08, 0.1, 1);

  let last = performance.now();
  let time = 0;
  let autoAngle = 0;
  let lastParamKey = '';

  function frame(now) {
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    time += dt;

    updateHeld(dt);
    if (state.rotating) {
      state.rotY += dt * 0.7;
      state.rotX += dt * 0.35;
    }

    // Moving light: putar posisi light (dari input keyboard) mengelilingi sumbu Y
    if (state.challenges.autoLight) autoAngle += dt * 1.2;
    const c = Math.cos(autoAngle), s = Math.sin(autoAngle);
    const b = state.lightBase;
    state.light = [b[0] * c + b[2] * s, b[1], -b[0] * s + b[2] * c];

    // Kamera orbit
    const cam = state.camera;
    const eye = [
      cam.distance * Math.cos(cam.pitch) * Math.sin(cam.yaw),
      cam.distance * Math.sin(cam.pitch),
      cam.distance * Math.cos(cam.pitch) * Math.cos(cam.yaw),
    ];

    resizeCanvas(gl);
    const aspect = canvas.width / canvas.height;
    const proj = m4.perspective(m4.toRad(45), aspect, 0.1, 100);
    const view = m4.lookAt(eye, [0, 0, 0], [0, 1, 0]);
    const model = m4.multiply(m4.rotationY(state.rotY), m4.rotationX(state.rotX));

    // Texture params (hanya saat berubah)
    const tex = textures[state.textureIndex];
    const paramKey = `${state.textureIndex}|${state.filterIndex}|${state.wrapIndex}`;
    if (paramKey !== lastParamKey) {
      textures.forEach((t) => applyTextureParams(gl, t, FILTER_MODES[state.filterIndex], WRAP_MODES[state.wrapIndex]));
      lastParamKey = paramKey;
    }

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // --- Cube bertekstur + lighting ---
    const mode = LIGHT_MODES[state.modeIndex];
    gl.useProgram(litProg);
    gl.uniformMatrix4fv(litU.u_model, false, model);
    gl.uniformMatrix4fv(litU.u_view, false, view);
    gl.uniformMatrix4fv(litU.u_projection, false, proj);
    gl.uniformMatrix3fv(litU.u_normalMatrix, false, m4.normalMatrix(model));
    gl.uniform1f(litU.u_uvScale, UV_TILES[state.uvTileIndex]);
    const scroll = state.challenges.uvScroll ? time * 0.15 : 0;
    gl.uniform2f(litU.u_uvOffset, scroll, 0);
    gl.uniform3fv(litU.u_lightPos, state.light);
    gl.uniform3fv(litU.u_viewPos, eye);
    gl.uniform3f(litU.u_lightColor, 1, 1, 1);
    gl.uniform1f(litU.u_ambientStrength, AMBIENT_PRESETS[state.ambientIndex]);
    gl.uniform1f(litU.u_shininess, SHININESS_PRESETS[state.shininessIndex]);
    gl.uniform1f(litU.u_specularStrength, 0.9);
    gl.uniform1f(litU.u_useAmbient, mode.a);
    gl.uniform1f(litU.u_useDiffuse, mode.d);
    gl.uniform1f(litU.u_useSpecular, mode.s);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.uniform1i(litU.u_texture, 0);
    gl.bindVertexArray(cube.vao);
    gl.drawElements(gl.TRIANGLES, cube.indexCount, gl.UNSIGNED_SHORT, 0);

    // --- Challenge: Light position marker ---
    if (state.challenges.lightMarker) {
      const L = state.light;
      const mm = m4.multiply(m4.translation(L[0], L[1], L[2]), m4.scaling(0.12, 0.12, 0.12));
      gl.useProgram(markerProg);
      gl.uniformMatrix4fv(markerU.u_model, false, mm);
      gl.uniformMatrix4fv(markerU.u_view, false, view);
      gl.uniformMatrix4fv(markerU.u_projection, false, proj);
      gl.uniform3f(markerU.u_color, 1.0, 0.92, 0.35);
      gl.bindVertexArray(marker.vao);
      gl.drawElements(gl.TRIANGLES, marker.indexCount, gl.UNSIGNED_SHORT, 0);
    }
    gl.bindVertexArray(null);

    updateHUD();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

main().catch((err) => {
  console.error(err);
  showError(err.message);
});

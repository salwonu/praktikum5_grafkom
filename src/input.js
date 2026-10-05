// Penanganan keyboard & mouse. Mengubah `state` saja (tidak menyentuh WebGL).
import {
  state, LIGHT_MODES, AMBIENT_PRESETS, SHININESS_PRESETS,
  FILTER_MODES, WRAP_MODES, UV_TILES, TEXTURES, LIGHT_LIMIT,
} from './state.js';
import { clamp } from './math3d.js';

const held = new Set();
const LIGHT_SPEED = 3;     // unit per detik
const CAM_SPEED = 1.6;     // rad per detik
const PREVENT = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space']);

export function setupInput(canvas) {
  window.addEventListener('keydown', (e) => {
    if (PREVENT.has(e.code)) e.preventDefault();
    held.add(e.code);
    if (e.repeat) return;
    onPress(e.code);
  });
  window.addEventListener('keyup', (e) => held.delete(e.code));
  window.addEventListener('blur', () => held.clear());

  // Orbit kamera dengan drag mouse, zoom dengan scroll
  let dragging = false, lx = 0, ly = 0;
  canvas.addEventListener('mousedown', (e) => { dragging = true; lx = e.clientX; ly = e.clientY; });
  window.addEventListener('mouseup', () => { dragging = false; });
  window.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    state.camera.yaw -= (e.clientX - lx) * 0.008;
    state.camera.pitch = clamp(state.camera.pitch + (e.clientY - ly) * 0.008, -1.4, 1.4);
    lx = e.clientX; ly = e.clientY;
  });
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    state.camera.distance = clamp(state.camera.distance + e.deltaY * 0.005, 3, 15);
  }, { passive: false });
}

function cycle(i, len) { return (i + 1) % len; }

function onPress(code) {
  switch (code) {
    case 'Digit1': state.modeIndex = 0; break;   // Ambient Only
    case 'Digit2': state.modeIndex = 1; break;   // Diffuse Only
    case 'Digit3': state.modeIndex = 2; break;   // Specular Only
    case 'Digit4': state.modeIndex = 3; break;   // Ambient + Diffuse
    case 'Digit5': state.modeIndex = 4; break;   // All Components
    case 'KeyF': state.filterIndex = cycle(state.filterIndex, FILTER_MODES.length); break;
    case 'KeyW': state.wrapIndex = cycle(state.wrapIndex, WRAP_MODES.length); break;
    case 'KeyA': state.ambientIndex = cycle(state.ambientIndex, AMBIENT_PRESETS.length); break;
    case 'KeyH': state.shininessIndex = cycle(state.shininessIndex, SHININESS_PRESETS.length); break;
    case 'KeyR': state.uvTileIndex = cycle(state.uvTileIndex, UV_TILES.length); break;
    case 'KeyT': state.textureIndex = cycle(state.textureIndex, TEXTURES.length); break;
    case 'KeyM': state.challenges.autoLight = !state.challenges.autoLight; break;
    case 'KeyB': state.challenges.lightMarker = !state.challenges.lightMarker; break;
    case 'KeyS': state.challenges.uvScroll = !state.challenges.uvScroll; break;
    case 'Space': state.rotating = !state.rotating; break;
    default: break;
  }
}

// Dipanggil tiap frame: gerakan kontinu selama tombol ditahan
export function updateHeld(dt) {
  const step = LIGHT_SPEED * dt;
  const L = state.lightBase;
  if (held.has('KeyJ')) L[0] -= step;   // Light X -
  if (held.has('KeyL')) L[0] += step;   // Light X +
  if (held.has('KeyI')) L[1] += step;   // Light Y +
  if (held.has('KeyK')) L[1] -= step;   // Light Y -
  if (held.has('KeyU')) L[2] -= step;   // Light Z -
  if (held.has('KeyO')) L[2] += step;   // Light Z +
  for (let i = 0; i < 3; i++) L[i] = clamp(L[i], -LIGHT_LIMIT, LIGHT_LIMIT);

  const c = state.camera, cs = CAM_SPEED * dt;
  if (held.has('ArrowLeft'))  c.yaw += cs;
  if (held.has('ArrowRight')) c.yaw -= cs;
  if (held.has('ArrowUp'))    c.pitch = clamp(c.pitch + cs, -1.4, 1.4);
  if (held.has('ArrowDown'))  c.pitch = clamp(c.pitch - cs, -1.4, 1.4);
}

export { LIGHT_MODES };

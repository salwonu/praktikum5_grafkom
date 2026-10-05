// HUD (overlay HTML) berisi status lighting, texture, dan challenge aktif
import {
  state, LIGHT_MODES, AMBIENT_PRESETS, SHININESS_PRESETS,
  FILTER_MODES, WRAP_MODES, UV_TILES, TEXTURES,
} from './state.js';

const fmt = (v) => v.toFixed(2);

export function createHUD(el) {
  return function updateHUD() {
    const L = state.light;
    const ch = [];
    if (state.challenges.lightMarker) ch.push('Light Marker');
    if (state.challenges.autoLight) ch.push('Moving Light');
    if (state.challenges.uvScroll) ch.push('UV Scrolling');
    ch.push(`Multiple Textures (${TEXTURES[state.textureIndex].name})`);

    el.textContent = [
      `Lighting   : ${LIGHT_MODES[state.modeIndex].name}`,
      `Light Pos  : (${fmt(L[0])}, ${fmt(L[1])}, ${fmt(L[2])})`,
      `Ambient    : ${fmt(AMBIENT_PRESETS[state.ambientIndex])}`,
      `Shininess  : ${SHININESS_PRESETS[state.shininessIndex]}`,
      `Filtering  : ${FILTER_MODES[state.filterIndex]}`,
      `Wrapping   : ${WRAP_MODES[state.wrapIndex]}`,
      `UV Tiling  : ${UV_TILES[state.uvTileIndex]}x`,
      `Challenge  : ${ch.join(', ')}`,
    ].join('\n');
  };
}

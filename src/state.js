// State aplikasi + konstanta pilihan (dibaca oleh input, HUD, dan renderer)

export const LIGHT_MODES = [
  { name: 'Ambient Only',      a: 1, d: 0, s: 0 },
  { name: 'Diffuse Only',      a: 0, d: 1, s: 0 },
  { name: 'Specular Only',     a: 0, d: 0, s: 1 },
  { name: 'Ambient + Diffuse', a: 1, d: 1, s: 0 },
  { name: 'All Components',    a: 1, d: 1, s: 1 },
];
export const AMBIENT_PRESETS = [0, 0.2, 0.5];
export const SHININESS_PRESETS = [4, 32, 128];
export const FILTER_MODES = ['LINEAR', 'NEAREST'];
export const WRAP_MODES = ['REPEAT', 'CLAMP_TO_EDGE', 'MIRRORED_REPEAT'];
export const UV_TILES = [1, 2, 3];
export const TEXTURES = [
  { name: 'uv-grid', url: 'assets/textures/uv-grid.png' },
  { name: 'bricks',  url: 'assets/textures/bricks.png' },
  { name: 'checker', url: 'assets/textures/checker.png' },
];

export const state = {
  modeIndex: 4,        // All Components
  ambientIndex: 1,     // 0.2
  shininessIndex: 1,   // 32
  filterIndex: 0,      // LINEAR
  wrapIndex: 0,        // REPEAT
  uvTileIndex: 1,      // 2x supaya efek wrapping terlihat
  textureIndex: 0,

  lightBase: [2.5, 2.0, 3.0],  // posisi light yang diatur keyboard
  light: [2.5, 2.0, 3.0],      // posisi efektif (setelah moving light)

  rotating: true,
  rotX: 0.4,
  rotY: 0.0,

  camera: { yaw: 0.6, pitch: 0.35, distance: 7 },

  challenges: {
    lightMarker: true,   // Light position marker
    autoLight: false,    // Moving light otomatis
    uvScroll: false,     // UV scrolling
    // Multiple textures: selalu tersedia lewat tombol T
  },
};

export const LIGHT_LIMIT = 6;

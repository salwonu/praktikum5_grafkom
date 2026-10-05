// Pemuatan texture & pengaturan filtering / wrapping

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Gagal memuat texture: ${url}`));
    img.src = url;
  });
}

export async function loadTexture(gl, url) {
  const img = await loadImage(url);
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);   // UV (0,0) = kiri-bawah gambar
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
  return tex;
}

// Terapkan filtering (LINEAR / NEAREST) dan wrapping (REPEAT / CLAMP_TO_EDGE / MIRRORED_REPEAT)
export function applyTextureParams(gl, tex, filterName, wrapName) {
  gl.bindTexture(gl.TEXTURE_2D, tex);
  const filter = filterName === 'NEAREST' ? gl.NEAREST : gl.LINEAR;
  const wrap = { REPEAT: gl.REPEAT, CLAMP_TO_EDGE: gl.CLAMP_TO_EDGE, MIRRORED_REPEAT: gl.MIRRORED_REPEAT }[wrapName];
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap);
}

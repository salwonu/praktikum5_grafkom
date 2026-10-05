// Data cube: 24 vertex (4 per sisi) agar tiap sisi punya normal & UV sendiri.
// Setiap atribut disimpan di buffer terpisah: Position, Normal, UV.

const FACES = [
  // normal,        4 sudut (CCW dilihat dari luar)
  { n: [0, 0, 1],  v: [[-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]] },     // depan  (+Z)
  { n: [0, 0, -1], v: [[1, -1, -1], [-1, -1, -1], [-1, 1, -1], [1, 1, -1]] }, // belakang (-Z)
  { n: [0, 1, 0],  v: [[-1, 1, 1], [1, 1, 1], [1, 1, -1], [-1, 1, -1]] },     // atas   (+Y)
  { n: [0, -1, 0], v: [[-1, -1, -1], [1, -1, -1], [1, -1, 1], [-1, -1, 1]] }, // bawah  (-Y)
  { n: [1, 0, 0],  v: [[1, -1, 1], [1, -1, -1], [1, 1, -1], [1, 1, 1]] },     // kanan  (+X)
  { n: [-1, 0, 0], v: [[-1, -1, -1], [-1, -1, 1], [-1, 1, 1], [-1, 1, -1]] }, // kiri   (-X)
];
const FACE_UV = [[0, 0], [1, 0], [1, 1], [0, 1]];

export function createCubeData() {
  const positions = [];
  const normals = [];
  const uvs = [];
  const indices = [];

  FACES.forEach((face, i) => {
    face.v.forEach((p, k) => {
      positions.push(...p);
      normals.push(...face.n);
      uvs.push(...FACE_UV[k]);
    });
    const o = i * 4;
    indices.push(o, o + 1, o + 2, o, o + 2, o + 3);
  });

  return {
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
    uvs: new Float32Array(uvs),
    indices: new Uint16Array(indices),
    indexCount: indices.length,
  };
}

function makeArrayBuffer(gl, data) {
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  return buf;
}

// VAO cube lengkap: location 0 = position, 1 = normal, 2 = uv
export function createCubeVAO(gl, data) {
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  const posBuf = makeArrayBuffer(gl, data.positions);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

  const nrmBuf = makeArrayBuffer(gl, data.normals);
  gl.enableVertexAttribArray(1);
  gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);

  const uvBuf = makeArrayBuffer(gl, data.uvs);
  gl.enableVertexAttribArray(2);
  gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 0, 0);

  const idxBuf = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuf);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data.indices, gl.STATIC_DRAW);

  gl.bindVertexArray(null);
  return { vao, indexCount: data.indexCount, buffers: { posBuf, nrmBuf, uvBuf, idxBuf } };
}

// VAO marker light: hanya position (location 0), memakai ulang data cube
export function createMarkerVAO(gl, data) {
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  makeArrayBuffer(gl, data.positions);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

  const idxBuf = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuf);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data.indices, gl.STATIC_DRAW);

  gl.bindVertexArray(null);
  return { vao, indexCount: data.indexCount };
}

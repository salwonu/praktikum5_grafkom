#version 300 es
// Vertex shader objek bertekstur + lighting (perhitungan di world space)
layout(location = 0) in vec3 a_position;  // Position Buffer
layout(location = 1) in vec3 a_normal;    // Normal Buffer
layout(location = 2) in vec2 a_uv;        // UV Buffer

uniform mat4 u_model;
uniform mat4 u_view;
uniform mat4 u_projection;
uniform mat3 u_normalMatrix;   // inverse-transpose dari model (3x3)

uniform float u_uvScale;       // pengali UV (agar wrapping terlihat)
uniform vec2  u_uvOffset;      // offset UV (challenge: UV scrolling)

out vec3 v_worldPos;
out vec3 v_normal;
out vec2 v_uv;

void main() {
  vec4 worldPos = u_model * vec4(a_position, 1.0);
  v_worldPos = worldPos.xyz;
  v_normal   = normalize(u_normalMatrix * a_normal);
  v_uv       = a_uv * u_uvScale + u_uvOffset;
  gl_Position = u_projection * u_view * worldPos;
}

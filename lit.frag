#version 300 es
precision highp float;

in vec3 v_worldPos;
in vec3 v_normal;
in vec2 v_uv;

uniform sampler2D u_texture;

uniform vec3  u_lightPos;          // posisi light (world space)
uniform vec3  u_viewPos;           // posisi kamera (world space) -> specular
uniform vec3  u_lightColor;
uniform float u_ambientStrength;   // 0 / 0.2 / 0.5
uniform float u_shininess;         // 4 / 32 / 128
uniform float u_specularStrength;

// Flag komponen (0.0 / 1.0) sesuai mode lighting
uniform float u_useAmbient;
uniform float u_useDiffuse;
uniform float u_useSpecular;

out vec4 outColor;

void main() {
  vec3 N = normalize(v_normal);
  vec3 L = normalize(u_lightPos - v_worldPos);
  vec3 V = normalize(u_viewPos  - v_worldPos);   // arah ke kamera

  // Texture sampling
  vec3 texColor = texture(u_texture, v_uv).rgb;

  // Ambient
  vec3 ambient = u_ambientStrength * u_lightColor * texColor;

  // Diffuse (Lambert)
  float diff = max(dot(N, L), 0.0);
  vec3 diffuse = diff * u_lightColor * texColor;

  // Specular (Phong) - bergantung pada posisi kamera lewat V
  vec3 R = reflect(-L, N);
  float spec = (diff > 0.0) ? pow(max(dot(V, R), 0.0), u_shininess) : 0.0;
  vec3 specular = u_specularStrength * spec * u_lightColor;

  vec3 color = u_useAmbient  * ambient
             + u_useDiffuse  * diffuse
             + u_useSpecular * specular;

  outColor = vec4(color, 1.0);
}

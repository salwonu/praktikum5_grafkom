# Praktikum 5 – Textured Cube dengan Lighting (WebGL2)

Pengembangan project *Rotating 3D Cube* Pertemuan 4 menjadi object bertekstur dengan pencahayaan
**ambient, diffuse, dan specular** yang dapat diamati dan dikontrol secara interaktif.

**Identitas**
- Kelompok 15
- Anggota  :
1. Nadine Aulia Putri Fanani - 5025231206
2. Salwa Fitri Fadiyah Hanan - 5025231220


**Cara Menjalankan**
Aplikasi memakai ES Modules dan `fetch` untuk memuat shader, sehingga **harus dibuka lewat web server lokal**

Gunakan ekstensi *Live Server* di VS Code. Dapat juga di-deploy ke GitHub Pages.

**Struktur Folder**
```
index.html        halaman + canvas + HUD
style.css
src/
  main.js         inisialisasi WebGL2, render loop
  state.js        state aplikasi & konstanta pilihan
  input.js        keyboard & mouse (hanya mengubah state)
  hud.js          overlay HUD
  geometry.js     data cube (Position/Normal/UV buffer) + VAO
  shader.js       loader/compile/link shader
  texture.js      load texture, filtering, wrapping
  math3d.js       helper matriks 4x4, lookAt, perspective, normal matrix
shaders/
  lit.vert / lit.frag        cube bertekstur + lighting
  marker.vert / marker.frag  marker posisi light
assets/textures/  uv-grid.png, bricks.png, checker.png (128x128)

**Daftar Kontrol** 
| Tombol | Fungsi |
|---|---|
| J / L | Light X − / + |
| I / K | Light Y + / − |
| U / O | Light Z − / + |
| 1 / 2 / 3 | Ambient Only / Diffuse Only / Specular Only |
| 4 | Ambient + Diffuse |
| 5 | All Components |
| A | Ambient strength: 0 → 0.2 → 0.5 |
| H | Shininess: 4 → 32 → 128 |
| F | Filtering LINEAR ↔ NEAREST |
| W | Wrapping REPEAT → CLAMP_TO_EDGE → MIRRORED_REPEAT |
| R | UV tiling 1x → 2x → 3x (agar wrapping terlihat) |
| T | Ganti texture (Challenge: Multiple Textures) |
| M | Moving light otomatis (Challenge) |
| S | UV scrolling (Challenge) |
| B | Light position marker on/off (Challenge) |
| Space | Pause / lanjut rotasi |
| Drag mouse / panah | Orbit kamera (untuk mengamati specular dari sudut berbeda) |
| Scroll | Zoom |

**Texture & Parameter Lighting**
- Texture: `uv-grid.png` (gradien U/V, grid, panah, penanda sudut), `bricks.png`, `checker.png`; semua 128×128, dimuat dengan `UNPACK_FLIP_Y_WEBGL` agar UV (0,0) = kiri-bawah.
- Setiap sisi cube punya 4 vertex sendiri (24 vertex) sehingga normal dan UV per sisi benar. Atribut disimpan di tiga buffer terpisah: Position (location 0), Normal (1), UV (2).
- Lighting dihitung di fragment shader pada world space:
  - Ambient  = `ambientStrength × lightColor × texColor`
  - Diffuse  = `max(dot(N, L), 0) × lightColor × texColor`
  - Specular = `specularStrength × pow(max(dot(V, R), 0), shininess) × lightColor`, dengan `R = reflect(-L, N)` dan `V = normalize(viewPos − worldPos)`, sehingga highlight berubah mengikuti posisi kamera.
- Parameter: specular strength 0.9 (tetap), light color putih, ambient ∈ {0, 0.2, 0.5}, shininess ∈ {4, 32, 128}.
- Normal ditransformasi dengan normal matrix (inverse-transpose model 3×3).
- Depth test aktif (`DEPTH_TEST`, `LEQUAL`); cube berputar di sumbu X dan Y.

**Challenge yang Dikerjakan**
1. **Light position marker** – kubus kecil kuning di posisi light (shader terpisah tanpa lighting).
2. **Moving light otomatis** – posisi light dari keyboard diputar mengelilingi sumbu Y (tombol M).
3. **Multiple textures** – tiga texture, ganti dengan T.
4. **UV scrolling** – offset UV bertambah terhadap waktu (tombol S); paling jelas terlihat bersama wrapping.

**Hasil Eksperimen**
> Tabel di bawah berisi pengamatan yang diharapkan dari rumus shader:

| Eksperimen | Nilai / Mode | Pengamatan |
|---|---|---|
| Ambient | 0 | Pada mode Ambient Only objek hitam; pada All Components sisi yang membelakangi light hitam pekat |
| Ambient | 0.2 | Texture terlihat redup merata; sisi gelap masih samar terbaca |
| Ambient | 0.5 | Texture lebih terang dan kontras terang-gelap antar sisi mengecil |
| Shininess | 4 | Highlight lebar dan lembut |
| Shininess | 32 | Highlight sedang |
| Shininess | 128 | Highlight sempit dan tajam; mudah hilang saat kamera/light digeser |
| Filtering | NEAREST | Piksel texture tampak kotak-kotak, garis grid bergerigi |
| Filtering | LINEAR | Transisi halus, texture tampak lebih blur saat diperbesar |
| Wrapping | Repeat | Texture berulang saat tiling 2x/3x |
| Wrapping | Clamp | Texture tidak berulang; piksel tepi memanjang (terlihat jelas saat UV scrolling) |
| Wrapping | Mirror | Texture berulang dengan cermin bergantian |
| Lighting | Ambient | Warna texture rata tanpa bayangan |
| Lighting | Diffuse | Sisi menghadap light terang, bergradasi mengikuti sudut |
| Lighting | Specular | Hanya bercak highlight putih; berubah saat kamera diorbit |
| Lighting | All | Gabungan texture, shading, dan highlight |

**Kendala yang Ditemukan**
- Wrapping tidak terlihat karena UV hanya 0–1 → ditambahkan UV tiling (R) dan UV scrolling.
- Texture terbalik secara vertikal → diatasi dengan `UNPACK_FLIP_Y_WEBGL`.
- Filtering tidak memakai mipmap sehingga bisa tampak berkelip saat cube jauh/kecil.



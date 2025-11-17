// src/ui/tutorial3D.js

const tutorialData = {
  pc: [
    "Halo! Saya Instruktur PC anda.",
    "Silakan ambil Motherboard di meja.",
    "Pasang Processor (CPU) ke soket.",
    "Pasang RAM hingga bunyi 'klik'.",
    "Rakitan PC siap dimulai!",
  ],
  laptop: [
    "Halo! Ini adalah Station Laptop.",
    "Tugas kita mengganti komponen laptop.",
    "Buka casing belakang & lepas baterai.",
    "Ganti RAM dengan yang baru.",
    "Tutup kembali casing dengan rapi.",
  ],
  server: [
    "Selamat datang di Ruang Server.",
    "Kita akan memasang unit ke Rack.",
    "Siapkan Rack Mount di slot yang pas.",
    "Masukkan Server & UPS.",
    "Pastikan semua indikator hijau.",
  ],
};

export function create3DDialog(scene, category) {
  // 1. CARI KARAKTER
  let targetMesh = scene.getMeshByName("F_MED_Mechanical_Engineer.mo");
  if (!targetMesh) {
    targetMesh = scene.meshes.find((m) => m.name.includes("Engineer"));
  }

  // Jika karakter tidak ada (Main Menu), stop.
  if (!targetMesh) return;

  // Bersihkan dialog lama
  const oldBox = scene.getMeshByName("tutorialBox");
  if (oldBox) oldBox.dispose();

  // 2. Buat Box
  const box = BABYLON.MeshBuilder.CreateBox(
    "tutorialBox",
    {
      width: 2.8,
      height: 1.6,
      depth: 0.1,
    },
    scene
  );

  // 3. POSISI
  const charPos = targetMesh.getAbsolutePosition().clone();
  box.position = charPos;

  // --- PERUBAHAN DI SINI (GESER KANAN) ---
  box.position.y += 2.0; // Tetap di atas (sejajar kepala)

  // Ganti dari (-=) menjadi (+=) agar pindah ke kanan
  box.position.x += 2.5;

  // Majukan sedikit agar tidak tembus tembok
  box.position.z -= 0.5;

  box.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
  box.renderingGroupId = 1;

  // 4. GUI Texture
  const advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(box);

  // Background
  const bg = new BABYLON.GUI.Rectangle();
  bg.width = 1;
  bg.height = 1;
  bg.color = "#00ffff";
  bg.thickness = 4;
  bg.background = "rgba(0, 0, 0, 0.9)";
  bg.cornerRadius = 30;
  advancedTexture.addControl(bg);

  // Teks
  const textBlock = new BABYLON.GUI.TextBlock();
  textBlock.text = tutorialData[category] ? tutorialData[category][0] : "Siap.";
  textBlock.color = "white";
  textBlock.fontSize = 42;
  textBlock.textWrapping = true;
  textBlock.resizeToFit = true;
  textBlock.paddingTop = "30px";
  textBlock.paddingLeft = "30px";
  textBlock.paddingRight = "30px";
  textBlock.paddingBottom = "100px";
  bg.addControl(textBlock);

  // Tombol
  const btn = BABYLON.GUI.Button.CreateSimpleButton("btnNext", "LANJUT >");
  btn.width = "220px";
  btn.height = "70px";
  btn.color = "white";
  btn.background = "#008888";
  btn.cornerRadius = 20;
  btn.fontSize = 28;
  btn.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
  btn.paddingBottom = "30px";
  bg.addControl(btn);

  // Logika
  let step = 0;
  const steps = tutorialData[category] || [];

  btn.onPointerUpObservable.add(() => {
    step++;
    if (step < steps.length) {
      textBlock.text = steps[step];
    } else {
      textBlock.text = "Selesai.";
      btn.isVisible = false;
      setTimeout(() => {
        box.dispose();
      }, 2000);
    }
  });

  return box;
}

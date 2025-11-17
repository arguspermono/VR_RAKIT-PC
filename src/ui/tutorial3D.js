// src/ui/tutorial3D.js

import { playTalk, playCheer } from "../audio/audioManager.js"; // <--- IMPORT AUDIO

const tutorialData = {
  pc: [
    "Halo! Perkenalkan nama saya Machina, hari ini saya akan menjadi instruktur perakitan PC anda.",
    "Izinkan saya menjelaskan bebrapa komponen PC di depan anda.",
    "Processor atau CPU berfungsi sebagai otak komputer yang memproses semua instruksi dari perangkat lunak, menjalankan perhitungan, dan mengendalikan seluruh operasi sistem.",
    "RAM menyimpan data dari aplikasi yang sedang Anda jalankan agar CPU dapat mengaksesnya dengan sangat cepat.",
    "GPU bertanggung jawab penuh untuk menghasilkan semua gambar 3D, efek visual dalam game, dan rendering video.",
    "PSU mengambil listrik dari dinding dan mengubahnya menjadi tegangan yang sesuai dan aman untuk didistribusikan ke Motherboard dan semua komponen lainnya.",
    "Harddisk adalah tempat sistem operasi (Windows), semua game, dan semua file pribadi Anda disimpan dalam jangka panjang.",
    "Langkah pertama adalah ambil processor (CPU) dan letakkan ke dalam cpu socket di Motherboard.",
    "Langkah kedua pasang RAM ke dalam socket di Motherboard.",
    "Langkah ketiga pasang GPU ke dalam socket di Motherboard.",
    "Langkah keempat pasang Motherboard ke dalam socket di casing PC.",
    "Langkah kelima pasang PSU ke dalam socket di casing PC.",
    "Langkah keenam pasang Harddisk ke dalam socket di casing PC.",
    "Yeay, kamu sudah berhasil merakit sebuah PC!",
  ],
  laptop: [
    "Halo! Perkenalkan nama saya Machina, hari ini saya akan menjadi instruktur perakitan Laptop anda.",
    "Izinkan saya menjelaskan bebrapa komponen Laptop di depan anda.",
    "Baterai menyimpan energi listrik yang memungkinkan laptop tetap menyala tanpa harus terhubung ke adaptor.",
    "RAM menyimpan data dari aplikasi yang sedang Anda jalankan agar CPU dapat mengaksesnya dengan sangat cepat.",
    "SSD menyimpan sistem operasi, aplikasi, dan data. Kecepatannya jauh lebih cepat dibanding HDD sehingga mempercepat booting, loading program, dan transfer file.",
    "Langkah pertama adalah ambil RAM dan pasang ke dalam socket di Motherboard.",
    "Langkah kedua pasang SSD ke dalam socket di Motherboard.",
    "Langkah ketiga pasang Baterai ke dalam socket di Motherboard.",
    "Yeay, kamu sudah berhasil merakit Laptop!",
  ],
  server: [
    "Halo! Perkenalkan nama saya Machina, hari ini saya akan menjadi instruktur perakitan Server anda.",
    "Izinkan saya menjelaskan bebrapa komponen Server di depan anda.",
    "MISC adalah penampung komponen kecil tambahan dalam server yang bukan komponen utama.",
    "NAS (Network Attached Storage) adalah perangkat penyimpanan yang terhubung ke jaringan dan berfungsi khusus sebagai tempat menyimpan data bersama.",
    "UPS (Uninterruptible Power Supply) adalah perangkat eksternal yang menyediakan cadangan daya saat listrik padam atau turun.",
    "Console adalah antarmuka untuk mengontrol server.",
    "Server adalah komputer khusus yang tugas utamanya adalah melayani permintaan dari perangkat lain (client) dalam sebuah jaringan.",
    "Langkah pertama pasang MISC ke dalam rak server.",
    "Langkah kedua pasang NAS ke dalam rak server.",
    "Langkah ketiga pasang UPS ke dalam rak server.",
    "Langkah keempat pasang Console ke dalam rak server.",
    "Langkah kelima pasang Server ke dalam rak server.",
    "Yeay, kamu sudah berhasil merakit Server!",
  ],
};

// ====================================================================
// FINAL: TUTORIAL 3D STATIC (DENGAN AUDIO)
// ====================================================================
export function create3DDialog(scene, category) {
  if (!scene) return;

  // Bersihkan dialog lama
  const oldBox = scene.getMeshByName("tutorialBox");
  if (oldBox) oldBox.dispose();

  // ------------------------------------------------------------
  // BOX STATIC
  // ------------------------------------------------------------
  const box = BABYLON.MeshBuilder.CreateBox(
    "tutorialBox",
    { width: 3.0, height: 1.6, depth: 0.1 },
    scene
  );

  box.position = new BABYLON.Vector3(2.0, 1.5, 3.0);
  box.billboardMode = BABYLON.Mesh.BILLBOARDMODE_NONE;
  box.isPickable = true;
  box.renderingGroupId = 1;

  // GUI
  const adt = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(box);

  const bg = new BABYLON.GUI.Rectangle();
  bg.width = 1;
  bg.height = 1;
  bg.color = "#00ffff";
  bg.thickness = 4;
  bg.background = "rgba(0, 0, 0, 0.85)";
  bg.cornerRadius = 25;
  adt.addControl(bg);

  // ------------------------------------------------------------
  // TEXT
  // ------------------------------------------------------------
  const steps = tutorialData[category] || ["Tutorial tidak ditemukan."];
  let stepIndex = 0;

  const textBlock = new BABYLON.GUI.TextBlock();
  textBlock.text = steps[0];
  textBlock.color = "white";
  textBlock.fontSize = 42;
  textBlock.textWrapping = true;
  textBlock.resizeToFit = true;
  textBlock.paddingTop = "30px";
  textBlock.paddingLeft = "30px";
  textBlock.paddingRight = "30px";
  textBlock.paddingBottom = "100px";
  bg.addControl(textBlock);

  // ------------------------------------------------------------
  // TOMBOL KEMBALI
  // ------------------------------------------------------------
  const btnBack = BABYLON.GUI.Button.CreateSimpleButton("btnBack", "< KEMBALI");
  btnBack.width = "240px";
  btnBack.height = "70px";
  btnBack.color = "white";
  btnBack.background = "#444";
  btnBack.cornerRadius = 20;
  btnBack.fontSize = 28;
  btnBack.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
  btnBack.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
  btnBack.paddingLeft = "30px";
  btnBack.paddingBottom = "25px";
  btnBack.isPointerBlocker = true;
  btnBack.isVisible = false;
  bg.addControl(btnBack);

  btnBack.onPointerClickObservable.add(() => {
    if (stepIndex > 0) {
      stepIndex--;
      textBlock.text = steps[stepIndex];

      // --- AUDIO: Talk Sound ---
      playTalk();

      if (stepIndex === 0) btnBack.isVisible = false;
    }
  });

  // ------------------------------------------------------------
  // TOMBOL LANJUT
  // ------------------------------------------------------------
  const btnNext = BABYLON.GUI.Button.CreateSimpleButton("btnNext", "LANJUT >");
  btnNext.width = "240px";
  btnNext.height = "70px";
  btnNext.color = "white";
  btnNext.background = "#008888";
  btnNext.cornerRadius = 20;
  btnNext.fontSize = 28;
  btnNext.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
  btnNext.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
  btnNext.paddingRight = "30px";
  btnNext.paddingBottom = "25px";
  btnNext.isPointerBlocker = true;
  bg.addControl(btnNext);

  btnNext.onPointerClickObservable.add(() => {
    stepIndex++;

    if (stepIndex < steps.length) {
      textBlock.text = steps[stepIndex];
      btnBack.isVisible = true;

      // --- AUDIO: Talk Sound ---
      playTalk();
    } else {
      textBlock.text = "Selesai.";
      btnNext.isVisible = false;
      btnBack.isVisible = true;

      // --- AUDIO: Cheering Sound (Finished) ---
      playCheer();

      setTimeout(() => {
        box.dispose();
      }, 1800);
    }
  });

  return box;
}

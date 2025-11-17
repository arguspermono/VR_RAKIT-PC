// src/ui/tutorial3D.js

import { playTalk, playCheer } from "../audio/audioManager.js";

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

export function create3DDialog(scene, category) {
  // 1. PENGAMAN GANDA
  if (!scene.__app) return;
  if (scene.activeCamera && scene.activeCamera.name !== "playerCam") return;

  // 2. CARI KARAKTER
  let targetMesh = scene.getMeshByName("F_MED_Mechanical_Engineer.mo");
  if (!targetMesh) {
    targetMesh = scene.meshes.find((m) => m.name.includes("Engineer"));
  }
  if (!targetMesh) return;

  // Bersihkan dialog lama
  const oldBox = scene.getMeshByName("tutorialBox");
  if (oldBox) oldBox.dispose();

  // 3. BUAT PLANE (UI)
  const box = BABYLON.MeshBuilder.CreatePlane(
    "tutorialBox",
    {
      width: 3.0,
      height: 1.8,
      sideOrientation: BABYLON.Mesh.DOUBLESIDE 
    },
    scene
  );

  box.isPickable = true;

  // 4. ATUR POSISI
  const charPos = targetMesh.getAbsolutePosition().clone();
  box.position = charPos;
  box.position.y += 2.2; 
  box.position.x += 2.8; 
  box.position.z -= 0.2; 

  // Static Mode
  box.billboardMode = BABYLON.Mesh.BILLBOARDMODE_NONE;
  box.renderingGroupId = 0; 

  // 5. GUI TEXTURE
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

  // Teks Setup
  const steps = tutorialData[category] || ["Tutorial data tidak ditemukan."];
  let stepIndex = 0;

  const textBlock = new BABYLON.GUI.TextBlock();
  textBlock.text = ""; // Kosongkan awal, nanti diisi efek typing
  textBlock.color = "white";
  textBlock.fontSize = 38;
  textBlock.textWrapping = true;
  textBlock.resizeToFit = true;
  textBlock.paddingTop = "30px";
  textBlock.paddingLeft = "30px";
  textBlock.paddingRight = "30px";
  textBlock.paddingBottom = "120px";
  bg.addControl(textBlock);

  // ============================================================
  // ⌨️ EFEK TYPEWRITER (RUNNING TEXT)
  // ============================================================
  let typingInterval = null;

  function typeText(fullText) {
    // 1. Reset: Hentikan ketikan sebelumnya jika ada
    if (typingInterval) clearInterval(typingInterval);
    
    // 2. Bersihkan teks saat ini
    textBlock.text = ""; 
    
    let charIndex = 0;
    
    // 3. Mulai mengetik huruf demi huruf
    typingInterval = setInterval(() => {
        // Cek jika box sudah ditutup/didispose agar tidak error
        if (box.isDisposed() || textBlock.isDisposed) {
            clearInterval(typingInterval);
            return;
        }

        // Tambahkan satu huruf
        textBlock.text += fullText.charAt(charIndex);
        charIndex++;

        // Jika sudah selesai semua huruf, stop interval
        if (charIndex >= fullText.length) {
            clearInterval(typingInterval);
        }
    }, 20); // <-- Kecepatan ketik (makin kecil makin cepat, 20ms - 50ms ideal)
  }
  // ============================================================

  // Jalankan teks pertama kali
  typeText(steps[0]);

  // --- TOMBOL KEMBALI ---
  const btnBack = BABYLON.GUI.Button.CreateSimpleButton("btnBack", "< KEMBALI");
  btnBack.width = "220px";
  btnBack.height = "70px";
  btnBack.color = "white";
  btnBack.background = "#555";
  btnBack.cornerRadius = 20;
  btnBack.fontSize = 28;
  btnBack.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
  btnBack.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
  btnBack.paddingLeft = "30px";
  btnBack.paddingBottom = "30px";
  btnBack.isVisible = false;
  btnBack.isPointerBlocker = true;
  bg.addControl(btnBack);

  // --- TOMBOL LANJUT ---
  const btnNext = BABYLON.GUI.Button.CreateSimpleButton("btnNext", "LANJUT >");
  btnNext.width = "220px";
  btnNext.height = "70px";
  btnNext.color = "white";
  btnNext.background = "#008888";
  btnNext.cornerRadius = 20;
  btnNext.fontSize = 28;
  btnNext.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
  btnNext.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
  btnNext.paddingRight = "30px";
  btnNext.paddingBottom = "30px";
  btnNext.isPointerBlocker = true;
  bg.addControl(btnNext);

  // --- LOGIKA TOMBOL ---
  
  btnBack.onPointerClickObservable.add(() => {
    if (stepIndex > 0) {
      stepIndex--;
      
      // Ganti text biasa menjadi typeText
      typeText(steps[stepIndex]); 
      
      playTalk();
      btnNext.isVisible = true;
      if (stepIndex === 0) btnBack.isVisible = false;
    }
  });

  btnNext.onPointerClickObservable.add(() => {
    stepIndex++;

    if (stepIndex < steps.length) {
      // Ganti text biasa menjadi typeText
      typeText(steps[stepIndex]);
      
      playTalk();
      btnBack.isVisible = true;
    } else {
      // Ganti text biasa menjadi typeText
      typeText("Tutorial Selesai. Selamat bekerja!");
      
      playCheer();
      btnNext.isVisible = false;
      btnBack.isVisible = false;
      
      setTimeout(() => {
        box.dispose();
        // Hentikan typing jika box ditutup paksa oleh timeout
        if (typingInterval) clearInterval(typingInterval);
      }, 3500); // Waktu tutup diperlama sedikit biar teks selesai terbaca
    }
  });

  return box;
}
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

// ====================================================================
// FINAL: TUTORIAL 3D STATIC (DENGAN TOMBOL KEMBALI)
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
  box.billboardMode = BABYLON.Mesh.BILLBOARDMODE_NONE; // TIDAK GOYANG
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
  btnBack.isVisible = false; // hanya muncul step > 0
  bg.addControl(btnBack);

  btnBack.onPointerClickObservable.add(() => {
    if (stepIndex > 0) {
      stepIndex--;
      textBlock.text = steps[stepIndex];

      // kalau sudah kembali ke step 0, sembunyikan tombol
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
      btnBack.isVisible = true; // aktifkan tombol kembali
    } else {
      textBlock.text = "Selesai.";
      btnNext.isVisible = false;
      btnBack.isVisible = true;

      setTimeout(() => {
        box.dispose();
      }, 1800);
    }
  });

  return box;
}

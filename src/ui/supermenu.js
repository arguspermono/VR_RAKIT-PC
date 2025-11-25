// src/ui/supermenu.js

// ============================================================
// 🎵 AUDIO SYSTEM
// ============================================================
let _audioInitialized = false;
let _clickSfx = null;
let _bgm = null;
let _bgmStarted = false;
let activeModal = null;
let closeBtn3D = null;

function initSuperAudio() {
  if (_audioInitialized) return;
  _audioInitialized = true;

  try {
    _clickSfx = new Audio("./assets/audio/button-click-sfx.mp3");
    _clickSfx.volume = 0.8;
  } catch (e) {}

  try {
    _bgm = new Audio("./assets/audio/bgm-ambience.mp3");
    _bgm.loop = true;
    _bgm.volume = 0.35;
  } catch (e) {}
}

function playClick() {
  if (!_clickSfx) return;
  try {
    _clickSfx.currentTime = 0;
    _clickSfx.play();
  } catch (e) {}
}

function startBGM() {
  if (!_bgm || _bgmStarted) return;
  try {
    _bgm.play();
    _bgmStarted = true;
  } catch (e) {}
}

// ============================================================
// 🪟 INIT GLOBAL CLOSE BUTTON (Hanya 1 tombol)
// ============================================================
function initCloseBtn(scene) {
  if (closeBtn3D) return; // sudah dibuat

  const manager = new BABYLON.GUI.GUI3DManager(scene);
  manager.useUtilityLayer = false; // FIX: Agar konsisten dengan scene utama

  closeBtn3D = new BABYLON.GUI.HolographicButton("btnCloseModal");
  manager.addControl(closeBtn3D);

  const txt = new BABYLON.GUI.TextBlock();
  txt.text = "CLOSE";
  txt.color = "#00FFFF";
  txt.fontSize = 30;
  txt.fontStyle = "bold";
  txt.height = "30px";
  txt.shadowColor = "#008888";
  txt.shadowBlur = 6;
  txt.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
  txt.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
  closeBtn3D.content = txt;

  closeBtn3D.scaling = new BABYLON.Vector3(1, 0.4, 1);
  closeBtn3D.cornerRadius = 5;

  if (closeBtn3D.backMaterial) {
    closeBtn3D.backMaterial.albedoColor = new BABYLON.Color3(0.05, 0.05, 0.1);
    closeBtn3D.backMaterial.alpha = 1;
  }

  closeBtn3D.isVisible = false; // default hidden

  closeBtn3D.onPointerDownObservable.add(() => {
    if (activeModal) {
      if (activeModal.backdrop) activeModal.backdrop.dispose();
      if (activeModal.panel) activeModal.panel.dispose();
      activeModal = null;
    }
    closeBtn3D.isVisible = false;
    playClick();
  });
}

// =====================================================================
// 🪟 MODAL SYSTEM (SIDE LAYOUT - KANAN)
// =====================================================================
function createModal({ scene, title, content }) {
  // Hapus modal lama jika ada
  if (activeModal) {
    if (activeModal.backdrop) activeModal.backdrop.dispose();
    if (activeModal.panel) activeModal.panel.dispose();
    activeModal = null;
  }

  // --- KONFIGURASI POSISI (SAMPING KANAN) ---
  const MODAL_X = 3.0; // Geser ke kanan (4 meter)
  const MODAL_Y = 1.2; // Tinggi mata duduk
  const MODAL_Z = 5.0; // Jarak kedalaman (sedikit maju dari menu utama)

  // Rotasi Y: Agar panel menghadap ke kiri (ke arah player)
  const MODAL_ROT_Y = 0.6; // Sekitar -35 derajat

  // ================= BACKDROP =================
  const backdrop = BABYLON.MeshBuilder.CreatePlane(
    "modalBackdrop",
    { width: 3, height: 8 }, // Tinggi ditambah agar visual aman
    scene
  );
  // Posisikan sedikit di belakang panel
  backdrop.position = new BABYLON.Vector3(MODAL_X, 1.0, MODAL_Z + 0.1);
  backdrop.rotation.y = MODAL_ROT_Y; // Rotasi mengikuti panel
  backdrop.isPickable = false;

  const backdropMat = new BABYLON.StandardMaterial("modalBackdropMat", scene);
  backdropMat.diffuseColor = new BABYLON.Color3(0, 0, 0);
  backdropMat.alpha = 0.8;
  backdrop.material = backdropMat;

  // ================= PANEL =================
  const panel = BABYLON.MeshBuilder.CreatePlane(
    "modalPanel",
    { width: 2.8, height: 3.0 },
    scene
  );
  panel.position = new BABYLON.Vector3(MODAL_X, MODAL_Y, MODAL_Z);
  panel.rotation.y = MODAL_ROT_Y; // Rotasi menghadap player
  panel.isPickable = true;

  const mat = new BABYLON.StandardMaterial("glassMat", scene);
  mat.diffuseColor = new BABYLON.Color3(0.05, 0.06, 0.08);
  mat.alpha = 1.0;
  mat.emissiveColor = new BABYLON.Color3(0.02, 0.03, 0.04);
  mat.specularColor = new BABYLON.Color3(0.3, 0.5, 0.8);
  mat.backFaceCulling = false;
  panel.material = mat;

  // ================= UI TEXT =================
  const tex = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(
    panel,
    1024,
    1024,
    true
  );

  const container = new BABYLON.GUI.Rectangle();
  container.thickness = 0;
  tex.addControl(container);

  const stack = new BABYLON.GUI.StackPanel();
  stack.paddingTop = "50px";
  container.addControl(stack);

  // --- TITLE ---
  const titleText = new BABYLON.GUI.TextBlock();
  titleText.text = title.toUpperCase();
  titleText.fontSize = 70;
  titleText.color = "#FFFFFF";
  titleText.height = "100px";
  titleText.shadowBlur = 20;
  titleText.shadowColor = "#00FFFF";
  stack.addControl(titleText);

  // --- BODY ---
  const body = new BABYLON.GUI.TextBlock();
  body.text = content;
  body.fontSize = 38;
  body.color = "#FFFFAA";
  body.width = "85%";
  body.textWrapping = true;
  body.height = "700px";
  body.textHorizontalAlignment =
    BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
  stack.addControl(body);

  // ================= TOMBOL CLOSE GLOBAL =================
  if (closeBtn3D) {
    // Kita hitung posisi tombol close agar pas di bawah panel yang miring
    const offsetZ = -0.2; // Maju ke depan panel (local Z)
    const offsetY = -1.5; // Turun ke bawah (local Y)

    // Rumus rotasi sederhana untuk menempatkan tombol di depan panel yang miring
    closeBtn3D.position.x = MODAL_X + Math.sin(MODAL_ROT_Y) * offsetZ;
    closeBtn3D.position.z = MODAL_Z + Math.cos(MODAL_ROT_Y) * offsetZ;
    closeBtn3D.position.y = MODAL_Y + offsetY;

    // Samakan rotasi tombol dengan panel
    closeBtn3D.mesh.rotation.y = MODAL_ROT_Y;

    closeBtn3D.isVisible = true;
  }

  // Simpan modal aktif
  activeModal = { backdrop, panel, closeBtn: closeBtn3D };

  return activeModal;
}

// =====================================================================
// 🛠️ BUTTON CREATOR (Original Style)
// =====================================================================
function createSuperButton(name, label, panel, onClick) {
  const btn = new BABYLON.GUI.HolographicButton(name);
  panel.addControl(btn);

  // 📏 UKURAN TOMBOL (Original)
  btn.scaling = new BABYLON.Vector3(1.1, 0.55, 1);
  btn.cornerRadius = 5;

  if (btn.backMaterial) {
    btn.backMaterial.albedoColor = new BABYLON.Color3(0.05, 0.05, 0.1);
    btn.backMaterial.alpha = 0.8;
  }

  const txt = new BABYLON.GUI.TextBlock();
  txt.text = label.toUpperCase();
  txt.color = "#00FFFF";

  // 🔡 FONT (Original)
  txt.fontSize = 22;
  txt.fontStyle = "bold";
  txt.height = "40px";
  txt.shadowColor = "#008888";
  txt.shadowBlur = 6;

  btn.content = txt;

  btn.onPointerEnterObservable.add(() => {
    txt.color = "#FFFFFF";
  });
  btn.onPointerOutObservable.add(() => {
    txt.color = "#00FFFF";
  });

  btn.onPointerDownObservable.add(() => {
    playClick();
    if (onClick) onClick();
  });

  return btn;
}

// =====================================================================
// 🚀 SUPER MENU (FIXED INTERACTION)
// =====================================================================
export function createSuperMenu({
  scene,
  onStart,
  onAbout,
  onCredits,
  onHowTo,
}) {
  initSuperAudio();
  initCloseBtn(scene);

  // [FIX 1] Gunakan mode scene utama agar interaksi VR lebih akurat
  const manager = new BABYLON.GUI.GUI3DManager(scene);
  manager.useUtilityLayer = false;

  // ───── LOAD ENVIRONMENT ─────────
  BABYLON.SceneLoader.ImportMesh(
    "",
    "./assets/",
    "computer_lab.glb",
    scene,
    (meshes) => {
      meshes.forEach((m) => {
        m.scaling = new BABYLON.Vector3(1, 1, 1);
        m.position = new BABYLON.Vector3(0, 0, 0);
        m.isPickable = false; // Environment tidak boleh mengganggu raycast
      });
      startBGM();
    }
  );

  // Setup Kamera Awal (Non-VR)
  const cam = scene.activeCamera;
  if (cam) {
    cam.position = new BABYLON.Vector3(0, 1.6, 2);
    cam.setTarget(new BABYLON.Vector3(0, 1.4, 3));
  }

  // ───── BACK GLASS (Background Kaca - TENGAH) ─────────
  const glass = BABYLON.MeshBuilder.CreatePlane(
    "glassBack",
    {
      width: 3.5,
      height: 3.8,
    },
    scene
  );
  // Posisi Kaca di Z = 5.95
  glass.position = new BABYLON.Vector3(0, 1.4, 5.95);

  const mat = new BABYLON.StandardMaterial("glassMat", scene);
  mat.diffuseColor = new BABYLON.Color3(0.1, 0.12, 0.18);
  mat.alpha = 0.3;
  mat.emissiveColor = new BABYLON.Color3(0.05, 0.08, 0.1);
  mat.specularColor = new BABYLON.Color3(0.3, 0.5, 0.8);
  mat.backFaceCulling = false;
  glass.material = mat;

  // [FIX 2] Matikan isPickable pada kaca agar laser bisa tembus ke tombol
  glass.isPickable = false;

  // ───── PANEL BUTTON 3D (TENGAH) ─────────
  const panel = new BABYLON.GUI.Container3D();
  manager.addControl(panel);

  // [FIX 3] Majukan posisi panel tombol ke Z = 5.8
  panel.position = new BABYLON.Vector3(0, 1.1, 5.8);

  // ───── JUDUL (Dinaikkan) ─────────
  const titlePlane = BABYLON.MeshBuilder.CreatePlane(
    "superTitle",
    {
      width: 4,
      height: 1,
    },
    scene
  );
  titlePlane.position = new BABYLON.Vector3(0, 2.7, 4.8);

  const titleTex = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(
    titlePlane,
    2048,
    512,
    true
  );

  const titleText = new BABYLON.GUI.TextBlock();
  titleText.text = "CRAFTLAB SIMULATION";
  titleText.color = "white";
  titleText.fontSize = 150;
  titleText.fontFamily = "Monospace";
  titleText.fontStyle = "bold";
  titleText.shadowColor = "#00AAFF";
  titleText.shadowBlur = 20;
  titleTex.addControl(titleText);

  // ───── BUTTONS (Original Layout) ─────────

  // 1. START
  const btnStart = createSuperButton(
    "btnStart",
    "Start Simulation",
    panel,
    onStart
  );
  btnStart.position = new BABYLON.Vector3(0, 1.2, 0);

  // 2. HOW TO PLAY
  const handleHowTo = onHowTo
    ? onHowTo
    : () => {
        createModal({
          scene,
          title: "How To Play",
          content:
            "PANDUAN KONTROL VR:\n\n" +
            "1. BERGERAK:\n" +
            "   Gunakan Joystick Kiri/Kanan untuk Teleport.\n\n" +
            "2. INTERAKSI OBJEK:\n" +
            "   - Arahkan tangan ke komponen.\n" +
            "   - Tekan tombol TRIGGER/GRIP untuk mengambil (Grab).\n\n" +
            "3. ALUR PERAKITAN:\n" +
            "   - Bawa komponen ke Casing.\n" +
            "   - Cari area hijau (Snap Zone).\n" +
            "   - Lepas tombol untuk memasang.\n\n" +
            "Selamat mencoba!",
        });
      };
  const btnHowTo = createSuperButton(
    "btnHowTo",
    "How To Play",
    panel,
    handleHowTo
  );
  btnHowTo.position = new BABYLON.Vector3(0, 0.45, 0);

  // 3. ABOUT
  const btnAbout = createSuperButton("btnAbout", "About", panel, () => {
    createModal({
      scene,
      title: "About",
      content:
        "Craftlab adalah Game VR imersif dan interaktif untuk media edukasi praktikum perakitan hardware. Aplikasi ini mensimulasikan proses perakitan PC Desktop, Laptop, dan Webserver secara realistis dengan tutorial langkah demi langkah.\n\nMelalui lingkungan virtual yang aman, pengguna dapat mempelajari urutan dan teknik perakitan tanpa risiko merusak komponen fisik.",
    });
  });
  btnAbout.position = new BABYLON.Vector3(0, -0.3, 0);

  // 4. CREDITS
  const btnCredits = createSuperButton("btnCredits", "Credits", panel, () => {
    createModal({
      scene,
      title: "Credits",
      content:
        "Dosen Pembimbing:\n" +
        "Bapak Sritrusta Sukaridhoto, ST., Ph.D.\n\n" +
        "Asisten Dosen:\n" +
        "Faris Saifullah (D4 IT RPL)\n\n" +
        "Tim Pengembang (Kelompok 2):\n" +
        "M. Rafif Nuha Daniswara\n" +
        "Ignatius Calvin Anggoro\n" +
        "Angelica Tamara Sitorus\n" +
        "Arya Bagus Permono\n" +
        "Erlangga Rahmansyah\n" +
        "Hernawan Aprilianda Hamzah\n\n" +
        "Didukung oleh: PENS - Teknologi Rekayasa Multimedia",
    });
  });
  btnCredits.position = new BABYLON.Vector3(0, -1.05, 0);

  // --- 2. Inisialisasi XR ---
  try {
    scene
      .createDefaultXRExperienceAsync({
        disableTeleportation: true,
      })
      .then((xrExperience) => {
        console.log("XR Initialized for Super Menu");
      });
  } catch (e) {
    console.warn("XR Not Supported");
  }

  return panel;
}

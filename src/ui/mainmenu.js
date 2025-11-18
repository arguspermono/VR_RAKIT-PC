// src/ui/mainmenu.js

// ============================================================
// 🎵 AUDIO SYSTEM
// ============================================================
let _audioInitialized = false;
let _clickSfx = null;
let _bgm = null;
let _bgmStarted = false;

function initMenuAudio() {
  if (_audioInitialized) return;
  _audioInitialized = true;

  try {
    _clickSfx = new Audio("./assets/audio/button-click-sfx.mp3");
    _clickSfx.volume = 0.8;
  } catch (e) {
    console.warn("Failed to load click SFX", e);
  }

  try {
    _bgm = new Audio("./assets/audio/bgm-ambience.mp3");
    _bgm.loop = true;
    _bgm.volume = 0.35;
  } catch (e) {
    console.warn("Failed to load BGM", e);
  }
}

function playMenuClick() {
  if (!_clickSfx) return;
  try {
    _clickSfx.currentTime = 0;
    _clickSfx.play();
  } catch (e) {
    console.warn("Failed to play click SFX", e);
  }
}

function startMenuBGM() {
  if (!_bgm || _bgmStarted) return;
  try {
    _bgm.play();
    _bgmStarted = true;
  } catch (e) {
    console.warn("Failed to play BGM", e);
  }
}

// ============================================================
// 🛠️ HELPER: CREATE FUTURISTIC BUTTON (UPDATED SIZE)
// ============================================================
function createCyberButton(name, mainText, subText, panel, onClick) {
  const btn = new BABYLON.GUI.HolographicButton(name);
  panel.addControl(btn);

  // 1. UPDATE: Perlebar tombol (Scaling X) agar teks panjang muat
  // Sebelumnya 1.1 -> Sekarang 1.6
  btn.scaling = new BABYLON.Vector3(1.2, 0.8, 1);
  btn.cornerRadius = 5;

  // Material Belakang (Dark Glass Look)
  if (btn.backMaterial) {
    btn.backMaterial.albedoColor = new BABYLON.Color3(0.05, 0.05, 0.1);
    btn.backMaterial.alpha = 0.8;
  }

  // Isi Tombol
  const stack = new BABYLON.GUI.StackPanel();
  stack.isVertical = true;
  stack.width = "100%";
  btn.content = stack;

  // Teks Utama (Besar & Neon)
  const title = new BABYLON.GUI.TextBlock();
  title.text = mainText.toUpperCase();
  title.color = "#00FFFF"; // Cyan Neon

  // 2. UPDATE: Kecilkan Font Size
  // Sebelumnya 34 -> Sekarang 22 (Supaya tidak kepotong)
  title.fontSize = 22;
  title.fontStyle = "bold";

  // Height diatur agar teks tidak mepet
  title.height = "30px";

  title.shadowColor = "#008888";
  title.shadowBlur = 5;
  stack.addControl(title);

  // Teks Sub (Kecil & Techy)
  const subtitle = new BABYLON.GUI.TextBlock();
  subtitle.text = `>> ${subText} <<`;
  subtitle.color = "#AAAAAA";
  subtitle.fontSize = 12; // Kecilkan sedikit juga (sebelumnya 14)
  subtitle.height = "20px";
  stack.addControl(subtitle);

  // Event Handler
  btn.onPointerUpObservable.add(() => {
    playMenuClick();
    startMenuBGM();
    // Animasi klik
    const anim = BABYLON.Animation.CreateAndStartAnimation(
      "btnClick",
      btn,
      "scaling",
      60,
      10,
      btn.scaling,
      new BABYLON.Vector3(1.7, 0.9, 1.2),
      BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
    );

    if (onClick) onClick();
  });

  // Efek Hover
  btn.onPointerEnterObservable.add(() => {
    title.color = "#FFFFFF";
    subtitle.color = "#00FFFF";
  });
  btn.onPointerOutObservable.add(() => {
    title.color = "#00FFFF";
    subtitle.color = "#AAAAAA";
  });

  return btn;
}

// ============================================================
// MAIN MENU (LAYOUT MANUAL AGAR SIMETRIS)
// ============================================================
export function createMainMenu({
  scene,
  onStartPC,
  onStartLaptop,
  onStartServer,
}) {
  initMenuAudio();

  const manager = new BABYLON.GUI.GUI3DManager(scene);

  // LOAD ROOM
  BABYLON.SceneLoader.ImportMesh(
    "",
    "./assets/",
    "computer_lab.glb",
    scene,
    (meshes) => {
      meshes.forEach((m) => {
        m.scaling = new BABYLON.Vector3(1, 1, 1);
        m.position = new BABYLON.Vector3(0, 0, 0);
      });

      const cam = scene.activeCamera;
      cam.position = new BABYLON.Vector3(0, 1.6, 1);
      cam.setTarget(new BABYLON.Vector3(0, 1.3, 2));
      cam.applyGravity = false;
      cam.checkCollisions = false;
    }
  );

  // 1. UBAH PANEL JADI CONTAINER (Agar bisa atur posisi manual)
  const panel = new BABYLON.GUI.Container3D();
  manager.addControl(panel);
  panel.position = new BABYLON.Vector3(0, 1, 4);

  // TITLE TEXT
  const titlePlane = BABYLON.MeshBuilder.CreatePlane(
    "titlePlane",
    { width: 4.5, height: 1.0 },
    scene
  );
  titlePlane.position = new BABYLON.Vector3(0, 2.3, 4);

  const titleTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(
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
  titleTexture.addControl(titleText);

  // ============================================================
  // TOMBOL DENGAN POSISI MANUAL (SIMETRIS)
  // ============================================================

  // Kita simpan tombol dalam variabel agar bisa diatur posisinya
  const btnPC = createCyberButton(
    "btnPC",
    "Mulai Rakit PC",
    "DESKTOP WORKSTATION",
    panel,
    onStartPC
  );

  const btnLaptop = createCyberButton(
    "btnLaptop",
    "Mulai Rakit Laptop",
    "PORTABLE DEVICE",
    panel,
    onStartLaptop
  );

  const btnServer = createCyberButton(
    "btnServer",
    "Mulai Rakit Server",
    "ENTERPRISE RACK",
    panel,
    onStartServer
  );

  // 2. ATUR KOORDINAT X (Agar jaraknya pasti sama)
  // Karena lebar tombol sekitar 1.6, kita beri jarak antar pusat tombol sejauh 1.9 atau 2.0

  btnPC.position = new BABYLON.Vector3(-1.5, 0, 0); // Geser Kiri
  btnLaptop.position = new BABYLON.Vector3(0, 0, 0); // Tetap di Tengah
  btnServer.position = new BABYLON.Vector3(1.5, 0, 0); // Geser Kanan

  // ENABLE VR
  try {
    scene.createDefaultXRExperienceAsync({
      floorMeshes: [],
      disableTeleportation: true,
      uiOptions: {
        sessionMode: "immersive-vr",
      },
    });
  } catch (e) {
    console.warn("WebXR not supported here", e);
  }

  return panel;
}

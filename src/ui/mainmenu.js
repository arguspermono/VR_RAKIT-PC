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
function createCyberButton(name, mainText, mainDevice, subText, panel, onClick) {
  const btn = new BABYLON.GUI.HolographicButton(name);
  panel.addControl(btn);

  btn.scaling = new BABYLON.Vector3(1.2, 0.8, 1);
  btn.cornerRadius = 5;

  // Material Belakang (Dark Glass Look) 
  if (btn.backMaterial) { 
    btn.backMaterial.albedoColor = new BABYLON.Color3(0.05, 0.05, 0.1); 
    btn.backMaterial.alpha = 0.8; 
  }

  const stack = new BABYLON.GUI.StackPanel();
  stack.isVertical = true;
  stack.width = "100%";
  stack.paddingTop = "20px";
  stack.paddingBottom = "20px";
  stack.paddingLeft = "40px";
  stack.paddingRight = "40px";
  btn.content = stack;

  // MAIN TITLE
  const title = new BABYLON.GUI.TextBlock();
  title.text = mainText.toUpperCase();
  title.color = "#00FFFF";
  title.fontSize = 22;
  title.fontStyle = "bold";
  title.height = "30px";
  title.shadowColor = "#008888";
  title.shadowBlur = 5;
  stack.addControl(title);

  // 🔥 NEW: MAIN DEVICE (PC / LAPTOP / SERVER)
  const deviceText = new BABYLON.GUI.TextBlock();
  deviceText.text = mainDevice.toUpperCase();
  deviceText.color = "#00FFFF";  // sama neon cyan
  deviceText.fontSize = 18;
  deviceText.height = "24px";
  deviceText.shadowColor = "#008888";
  deviceText.shadowBlur = 6;
  stack.addControl(deviceText);

  // SUBTEXT
  const subtitle = new BABYLON.GUI.TextBlock();
  subtitle.text = `>> ${subText} <<`;
  subtitle.color = "#AAAAAA";
  subtitle.fontSize = 12;
  subtitle.height = "20px";
  stack.addControl(subtitle);

  // Event dan hover...
  btn.onPointerEnterObservable.add(() => {
    title.color = "#FFFFFF";
    deviceText.color = "#FFFFFF";    // ikut hover
    subtitle.color = "#00FFFF";
  });

  btn.onPointerOutObservable.add(() => {
    title.color = "#00FFFF";
    deviceText.color = "#00FFFF";    // kembali ke cyan
    subtitle.color = "#AAAAAA";
  });
  
  btn.onPointerUpObservable.add(() => {
    playClick();
    if (onClick) onClick();
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
    "Mulai Rakit",
    "PC",
    "DESKTOP WORKSTATION",
    panel,
    onStartPC
  );

  const btnLaptop = createCyberButton(
    "btnLaptop",
    "Mulai Rakit",
    "Laptop",
    "PORTABLE DEVICE",
    panel,
    onStartLaptop
  );

  const btnServer = createCyberButton(
    "btnServer",
    "Mulai Rakit",
    "Server",
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

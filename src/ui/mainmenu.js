// src/ui/mainmenu.js

// ============================================================
// 🎵 AUDIO SYSTEM (DARI KODE B)
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
// MAIN MENU (VISUAL DARI KODE A + AUDIO)
// ============================================================
export function createMainMenu({
  scene,
  onStartPC,
  onStartLaptop,
  onStartServer,
}) {
  // 1. Inisialisasi Audio saat menu dibuat
  initMenuAudio();

  const manager = new BABYLON.GUI.GUI3DManager(scene);

  // ============================================================
  // LOAD BACKGROUND ROOM (GLB)
  // ============================================================
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

      // Camera setup dari Kode A
      const cam = scene.activeCamera;
      cam.position = new BABYLON.Vector3(0, 1.6, 1);
      cam.setTarget(new BABYLON.Vector3(0, 1.3, 2));
      cam.applyGravity = false;
      cam.checkCollisions = false;
    }
  );

  // ============================================================
  // 3D MENU PANEL (Posisi dari Kode A)
  // ============================================================
  const panel = new BABYLON.GUI.StackPanel3D();
  manager.addControl(panel);
  panel.position = new BABYLON.Vector3(0, 1, 4);

  // ============================================================
  // TITLE TEXT (Tampilan Bagus dari Kode A)
  // ============================================================
  const titlePlane = BABYLON.MeshBuilder.CreatePlane(
    "titlePlane",
    { width: 3.5, height: 0.8 },
    scene
  );

  titlePlane.position = new BABYLON.Vector3(0, 2.2, 4);

  const titleTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(
    titlePlane,
    2048,
    512,
    true
  );

  const titleText = new BABYLON.GUI.TextBlock();
  titleText.text =
    "Selamat Datang di 'CraftLab', Dunia Simulasi Perakitan Komputer";
  titleText.color = "white";
  titleText.fontSize = 130;
  titleText.fontStyle = "bold";
  titleText.resizeToFit = true;
  titleText.textWrapping = true;
  titleText.paddingTop = "10px";
  titleText.paddingBottom = "10px";
  titleText.paddingLeft = "20px";
  titleText.paddingRight = "20px";

  titleTexture.addControl(titleText);

  // ============================================================
  // BUTTONS (Logika Kode A + Sisipan Audio)
  // ============================================================

  // Tombol PC
  const btnPC = new BABYLON.GUI.HolographicButton("startPC");
  btnPC.text = "Mulai Perakitan PC";
  panel.addControl(btnPC);
  btnPC.onPointerUpObservable.add(() => {
    playMenuClick(); // Audio
    startMenuBGM(); // Audio
    if (onStartPC) onStartPC();
  });

  // Tombol Laptop
  const btnLaptop = new BABYLON.GUI.HolographicButton("startLaptop");
  btnLaptop.text = "Mulai Perakitan Laptop";
  panel.addControl(btnLaptop);
  btnLaptop.onPointerUpObservable.add(() => {
    playMenuClick(); // Audio
    startMenuBGM(); // Audio
    if (onStartLaptop) onStartLaptop();
  });

  // Tombol Server
  const btnServer = new BABYLON.GUI.HolographicButton("startServer");
  btnServer.text = "Mulai Perakitan Server";
  panel.addControl(btnServer);
  btnServer.onPointerUpObservable.add(() => {
    playMenuClick(); // Audio
    startMenuBGM(); // Audio
    if (onStartServer) onStartServer();
  });

  // ============================================================
  // ENABLE VR LANGSUNG DI MAIN MENU (Dari Kode A)
  // ============================================================
  // Ini penting agar tombol kacamata VR muncul
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

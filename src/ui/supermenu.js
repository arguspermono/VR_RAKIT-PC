// src/ui/supermenu.js

// ============================================================
// 🎵 AUDIO SYSTEM (re-use dari mainmenu.js)
// ============================================================
let _audioInitialized = false;
let _clickSfx = null;
let _bgm = null;
let _bgmStarted = false;

function initSuperAudio() {
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

function playClick() {
  if (_clickSfx) {
    try {
      _clickSfx.currentTime = 0;
      _clickSfx.play();
    } catch (e) {}
  }
}

function startBGM() {
  if (!_bgm || _bgmStarted) return;
  try {
    _bgm.play();
    _bgmStarted = true;
  } catch (e) {}
}



// ============================================================
// SUPER MENU
// ============================================================
export function createSuperMenu({ scene, onStart, onAbout, onCredits }) {

  // INIT AUDIO
  initSuperAudio();

  const manager = new BABYLON.GUI.GUI3DManager(scene);

  // ============================================================
  // LOAD BACKGROUND ROOM (computer_lab.glb)
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

      // Camera angle khusus SuperMenu
      const cam = scene.activeCamera;
      cam.position = new BABYLON.Vector3(0, 1.6, 2);
      cam.setTarget(new BABYLON.Vector3(0, 1.4, 3));
      cam.applyGravity = false;
      cam.checkCollisions = false;

      // Start BGM ketika world muncul
      startBGM();
    }
  );



  // ============================================================
  // PANEL 3D
  // ============================================================
  const panel = new BABYLON.GUI.StackPanel3D();
  manager.addControl(panel);
  panel.position = new BABYLON.Vector3(0, 1.2, 6);



  // ============================================================
  // TITLE
  // ============================================================
  const titlePlane = BABYLON.MeshBuilder.CreatePlane(
    "superTitle",
    { width: 3, height: 0.8 },
    scene
  );
  titlePlane.position = new BABYLON.Vector3(0, 2.3, 6);

  const titleTex = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(
    titlePlane,
    2048,
    512,
    true
  );

  const titleText = new BABYLON.GUI.TextBlock();
  titleText.text = "CRAFTLAB";
  titleText.fontSize = 150;
  titleText.color = "white";
  titleText.fontStyle = "bold";
  titleText.resizeToFit = true;
  titleTex.addControl(titleText);



  // ============================================================
  // BUTTONS
  // ============================================================

  // START
  const btnStart = new BABYLON.GUI.HolographicButton("superStart");
  btnStart.text = "START";
  panel.addControl(btnStart);
  btnStart.onPointerUpObservable.add(() => {
    playClick();
    if (onStart) onStart();
  });

  // ABOUT
  const btnAbout = new BABYLON.GUI.HolographicButton("superAbout");
  btnAbout.text = "ABOUT";
  panel.addControl(btnAbout);
  btnAbout.onPointerUpObservable.add(() => {
    playClick();
    if (onAbout) onAbout();
  });

  // CREDITS
  const btnCredits = new BABYLON.GUI.HolographicButton("superCredits");
  btnCredits.text = "CREDITS";
  panel.addControl(btnCredits);
  btnCredits.onPointerUpObservable.add(() => {
    playClick();
    if (onCredits) onCredits();
  });



  // ============================================================
  // ENABLE XR BUTTON (seperti MainMenu)
  // ============================================================
  try {
    scene.createDefaultXRExperienceAsync({
      floorMeshes: [],
      disableTeleportation: true,
      uiOptions: {
        sessionMode: "immersive-vr",
      },
    });
  } catch (e) {
    console.warn("WebXR not supported", e);
  }

  return panel;
}

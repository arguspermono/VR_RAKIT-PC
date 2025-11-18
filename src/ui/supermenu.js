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
// 🛠️ MATCHING MAIN MENU BUTTON STYLE
// ============================================================
function createSuperButton(name, label, panel, onClick) {
  const btn = new BABYLON.GUI.HolographicButton(name);
  panel.addControl(btn);

  // scaling serupa mainmenu
  btn.scaling = new BABYLON.Vector3(1.2, 0.8, 1);
  btn.cornerRadius = 5;

  // === MATCHING DARK GLASS BACK MATERIAL ===
  if (btn.backMaterial) {
    btn.backMaterial.albedoColor = new BABYLON.Color3(0.05, 0.05, 0.1);
    btn.backMaterial.alpha = 0.8;
  }

  // === CUSTOM TEXT CONTROL ===
  const txt = new BABYLON.GUI.TextBlock();
  txt.text = label.toUpperCase();
  txt.color = "#00FFFF";
  txt.fontSize = 26;
  txt.fontStyle = "bold";
  txt.height = "40px";
  txt.shadowColor = "#008888";
  txt.shadowBlur = 6;

  btn.content = txt;

  // === HOVER EFFECT ===
  btn.onPointerEnterObservable.add(() => {
    txt.color = "#FFFFFF";
  });

  btn.onPointerOutObservable.add(() => {
    txt.color = "#00FFFF";
  });

  btn.onPointerUpObservable.add(() => {
    playClick();
    if (onClick) onClick();
  });

  return btn;
}



// ============================================================
// SUPER MENU — MATCHING MAIN MENU VISUAL
// ============================================================
export function createSuperMenu({ scene, onStart, onAbout, onCredits }) {

  initSuperAudio();

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
      cam.position = new BABYLON.Vector3(0, 1.6, 2);
      cam.setTarget(new BABYLON.Vector3(0, 1.4, 3));

      startBGM();
    }
  );


  // ============================================================
  // PANEL 3D — MATCH MAIN MENU
  // ============================================================
  const panel = new BABYLON.GUI.Container3D();
  manager.addControl(panel);
  panel.position = new BABYLON.Vector3(0, 1.1, 6);


  // ============================================================
  // BACK GLASS — disesuaikan agar tidak bentrok tombol
  // ============================================================
  const glass = BABYLON.MeshBuilder.CreatePlane(
    "glassBack",
    { width: 3.8, height: 4.2 },
    scene
  );
  glass.position = new BABYLON.Vector3(0, 1.4, 5.95);

  const mat = new BABYLON.StandardMaterial("glassMat", scene);
  mat.diffuseColor = new BABYLON.Color3(0.1, 0.12, 0.18);
  mat.alpha = 0.45; // lebih gelap mendekati main menu bg tone
  mat.emissiveColor = new BABYLON.Color3(0.05, 0.08, 0.1);
  mat.specularColor = new BABYLON.Color3(0.3, 0.5, 0.8);
  mat.backFaceCulling = false;

  const noiseTex = new BABYLON.Texture("./assets/textures/noise64.png", scene);
  noiseTex.level = 0.25;
  mat.opacityTexture = noiseTex;

  glass.material = mat;


  // ============================================================
  // TITLE — MATCHING MAIN MENU
  // ============================================================
  const titlePlane = BABYLON.MeshBuilder.CreatePlane(
    "superTitle",
    { width: 4, height: 1.0 },
    scene
  );
  titlePlane.position = new BABYLON.Vector3(0, 2.4, 6);

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


  // ============================================================
  // BUTTONS — MATCHED STYLE
  // ============================================================
  const btnStart = createSuperButton("btnStart", "Start", panel, onStart);
  btnStart.position = new BABYLON.Vector3(0, 0.6, 0);

  const btnAbout = createSuperButton("btnAbout", "About", panel, onAbout);
  btnAbout.position = new BABYLON.Vector3(0, -0.3, 0);

  const btnCredits = createSuperButton("btnCredits", "Credits", panel, onCredits);
  btnCredits.position = new BABYLON.Vector3(0, -1.2, 0);


  // XR
  try {
    scene.createDefaultXRExperienceAsync({
      floorMeshes: [],
      disableTeleportation: true,
      uiOptions: {
        sessionMode: "immersive-vr",
      },
    });
  } catch (e) {}

  return panel;
}

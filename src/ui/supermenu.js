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
      activeModal.backdrop.dispose();
      activeModal.panel.dispose();
      activeModal = null;
    }
    closeBtn3D.isVisible = false;
    playClick();
  });
}

// =====================================================================
// 🪟 MODAL SYSTEM (About & Credits)
// =====================================================================
function createModal({ scene, title, content }) {
  // Hapus modal lama jika ada
  if (activeModal) {
    if (activeModal.backdrop) activeModal.backdrop.dispose();
    if (activeModal.panel) activeModal.panel.dispose();
    activeModal = null;
  }

  // ================= BACKDROP =================
  const backdrop = BABYLON.MeshBuilder.CreatePlane("modalBackdrop", {
    width: 2,
    height: 2.2
  }, scene);
  backdrop.position = new BABYLON.Vector3(0, 1.0, 5.6);
  backdrop.isPickable = true;

  const backdropMat = new BABYLON.StandardMaterial("modalBackdropMat", scene);
  backdropMat.diffuseColor = new BABYLON.Color3(0, 0, 0);
  backdropMat.alpha = 1;
  backdrop.material = backdropMat;

  // ================= PANEL =================
  const panel = BABYLON.MeshBuilder.CreatePlane("modalPanel", {
    width: 2.0,
    height: 1.6
  }, scene);
  panel.position = new BABYLON.Vector3(0, 1.0, 5.5);
  panel.isPickable = true;

  const mat = new BABYLON.StandardMaterial("glassMat", scene);
  mat.diffuseColor = new BABYLON.Color3(0.05, 0.06, 0.08);
  mat.alpha = 1.0;
  mat.emissiveColor = new BABYLON.Color3(0.02, 0.03, 0.04);
  mat.specularColor = new BABYLON.Color3(0.3, 0.5, 0.8);
  mat.backFaceCulling = false;
  panel.material = mat;

  // ================= UI TEXT =================
  const tex = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(panel, 1024, 1024, true);
  tex.rootContainer.zIndex = 10;

  const container = new BABYLON.GUI.Rectangle();
  container.thickness = 0;
  tex.addControl(container);

  const stack = new BABYLON.GUI.StackPanel();
  stack.paddingTop = "15px";
  stack.paddingLeft = "20px";
  stack.paddingRight = "20px";
  stack.spacing = 15;
  container.addControl(stack);

  // --- TITLE ---
  const titleText = new BABYLON.GUI.TextBlock();
  titleText.text = title.toUpperCase();
  titleText.fontSize = 65;
  titleText.color = "#FFFFFF";
  titleText.height = "70px";
  titleText.shadowBlur = 20;
  titleText.shadowColor = "#00FFFF";
  titleText.outlineColor = "#000000";
  titleText.outlineWidth = 3;
  titleText.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
  stack.addControl(titleText);

  // --- BODY ---
  const body = new BABYLON.GUI.TextBlock();
  body.text = content;
  body.fontSize = 44;
  body.color = "#FFFFAA";
  body.width = "80%";
  body.textWrapping = true;
  body.height = "550px";
  body.resizeToFit = true;
  body.shadowBlur = 15;
  body.shadowColor = "#000000";
  body.outlineColor = "#333333";
  body.outlineWidth = 1.5;
  body.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
  stack.addControl(body);

  // ================= TOMBOL CLOSE GLOBAL =================
  if (closeBtn3D) {
    closeBtn3D.position = new BABYLON.Vector3(panel.position.x, panel.position.y - 1.2, panel.position.z + 0.05);
    closeBtn3D.isVisible = true;
  }

  // Simpan modal aktif
  activeModal = { backdrop, panel, closeBtn: closeBtn3D };

  return activeModal;
}


// =====================================================================
// 🛠️ BUTTON CREATOR (matching main menu style)
// =====================================================================
function createSuperButton(name, label, panel, onClick) {
  const btn = new BABYLON.GUI.HolographicButton(name);
  panel.addControl(btn);

  btn.scaling = new BABYLON.Vector3(1.2, 0.6, 1);
  btn.cornerRadius = 5;

  if (btn.backMaterial) {
    btn.backMaterial.albedoColor = new BABYLON.Color3(0.05, 0.05, 0.1);
    btn.backMaterial.alpha = 0.8;
  }

  const txt = new BABYLON.GUI.TextBlock();
  txt.text = label.toUpperCase();
  txt.color = "#00FFFF";
  txt.fontSize = 26;
  txt.fontStyle = "bold";
  txt.height = "40px";
  txt.shadowColor = "#008888";
  txt.shadowBlur = 6;

  btn.content = txt;

  btn.onPointerEnterObservable.add(() => { txt.color = "#FFFFFF"; });
  btn.onPointerOutObservable.add(() => { txt.color = "#00FFFF"; });

  // ⬅ PERBAIKAN: klik langsung tanpa perlu pointer keluar
  btn.onPointerDownObservable.add(() => {
    playClick();
    if (onClick) onClick();
  });

  return btn;
}


// =====================================================================
//  SUPER MENU (Full Ready)
// =====================================================================
export function createSuperMenu({ scene, onStart, onAbout, onCredits }) {

  initSuperAudio();
  initCloseBtn(scene);

  const manager = new BABYLON.GUI.GUI3DManager(scene);

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
      });

      const cam = scene.activeCamera;
      cam.position = new BABYLON.Vector3(0, 1.6, 2);
      cam.setTarget(new BABYLON.Vector3(0, 1.4, 3));

      startBGM();
    }
  );

  // ───── PANEL BUTTON 3D ─────────
  const panel = new BABYLON.GUI.Container3D();
  manager.addControl(panel);
  panel.position = new BABYLON.Vector3(0, 1.1, 6);


  // ───── BACK GLASS ─────────
  const glass = BABYLON.MeshBuilder.CreatePlane("glassBack", {
    width: 3.8,
    height: 3
  }, scene);
  glass.position = new BABYLON.Vector3(0, 1.4, 5.95);

  const mat = new BABYLON.StandardMaterial("glassMat", scene);
  mat.diffuseColor = new BABYLON.Color3(0.1, 0.12, 0.18);
  mat.alpha = 0.7;
  mat.emissiveColor = new BABYLON.Color3(0.05, 0.08, 0.1);
  mat.specularColor = new BABYLON.Color3(0.3, 0.5, 0.8);
  mat.backFaceCulling = false;

  const noiseTex = new BABYLON.Texture("./assets/textures/noise64.png", scene);
  noiseTex.level = 0.25;
  mat.opacityTexture = noiseTex;

  glass.material = mat;


  // ───── TITLE TEXT ─────────
  const titlePlane = BABYLON.MeshBuilder.CreatePlane("superTitle", {
    width: 4,
    height: 1.0
  }, scene);
  titlePlane.position = new BABYLON.Vector3(0, 2.4, 5);

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


  // ───── BUTTONS ─────────
  const btnStart = createSuperButton("btnStart", "Start", panel, onStart);
  btnStart.position = new BABYLON.Vector3(0, 0.8, 0);

  const btnAbout = createSuperButton("btnAbout", "About", panel, () => {
    createModal({
      scene,
      title: "About",
      content:
        "Craftlab adalah Game VR imersif dan interaktif untuk media edukasi praktikum perakitan hardware. Aplikasi ini mensimulasikan proses perakitan PC Desktop, Laptop, dan Webserver secara realistis dengan tutorial langkah demi langkah. Melalui lingkungan virtual yang aman, pengguna dapat mempelajari urutan dan teknik perakitan tanpa risiko merusak komponen fisik, sehingga sangat efektif untuk pembelajaran kejuruan.\n"
    });
  });
  btnAbout.position = new BABYLON.Vector3(0, -0, 0);

  const btnCredits = createSuperButton("btnCredits", "Credits", panel, () => {
    createModal({
      scene,
      title: "Credits",
      content:
        "Dosen pembimbing: \n" + 
        "Bapak Sritrusta Sukaridhoto, ST., Ph.D.\n\n" +
        "Didukung oleh Politeknik Elektronika Negeri Surabaya, Jurusan Teknologi Rekayasa Multimedia.\n\n" +
        "Tim pengembang Kelompok 2:\n" +
        "M. Rafif Nuha Daniswara\n" +
        "Ignatius Calvin Anggoro\n" +
        "Angelica Tamara Sitorus\n" +
        "Arya Bagus Permono\n" +
        "Erlangga Rahmansyah \n" +
        "Hernawan Aprilianda Hamzah \n\n" +
        "Harapan kami Craftlab VR dapat meningkatkan pengalaman praktikum dan pembelajaran di pendidikan kejuruan."        
    });
  });
  btnCredits.position = new BABYLON.Vector3(0, -0.8, 0);


  // XR optional
  try {
    scene.createDefaultXRExperienceAsync({
      disableTeleportation: true
    });
  } catch (e) {}

  return panel;
}

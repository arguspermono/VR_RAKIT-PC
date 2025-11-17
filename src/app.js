// src/app.js
import { createMainMenu } from "./ui/mainmenu.js";

const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

let currentScene = null;
let menuScene = null;
let currentKind = null; // ← jenis scene aktif (pc / laptop / server)

export async function resetScene() {
  if (!currentKind) return;

  console.log("Reset scene:", currentKind);

  // 1. Dispose scene lama
  if (currentScene) {
    try {
      currentScene.dispose();
    } catch (e) {
      console.warn(e);
    }
    currentScene = null;
  }

  // 2. Load ulang scene berdasarkan jenisnya
  try {
    if (currentKind === "pc") {
      const mod = await import("./scenes/scenePC.js");
      currentScene = await mod.createScenePC(engine, canvas);
    } else if (currentKind === "laptop") {
      const mod = await import("./scenes/sceneLaptop.js");
      currentScene = await mod.createSceneLaptop(engine, canvas);
    } else if (currentKind === "server") {
      const mod = await import("./scenes/sceneServer.js");
      currentScene = await mod.createSceneServer(engine, canvas);
    }
  } catch (e) {
    console.error("Failed to reset scene:", e);
    window.location.reload(); // fallback
  }

  console.log("Scene reloaded OK");
}

async function startScene(kind) {
  // simpan jenis scene
  currentKind = kind;

  // dispose menu
  if (menuScene) {
    try {
      menuScene.dispose();
    } catch (e) {}
    menuScene = null;
  }

  // load scene
  try {
    if (kind === "pc") {
      const mod = await import("./scenes/scenePC.js");
      currentScene = await mod.createScenePC(engine, canvas);
    } else if (kind === "laptop") {
      const mod = await import("./scenes/sceneLaptop.js");
      currentScene = await mod.createSceneLaptop(engine, canvas);
    } else if (kind === "server") {
      const mod = await import("./scenes/sceneServer.js");
      currentScene = await mod.createSceneServer(engine, canvas);
    }
  } catch (e) {
    console.error("Scene load failed:", e);
    window.location.reload();
  }

  engine.runRenderLoop(() => {
    if (currentScene) currentScene.render();
  });
}

function showMenu() {
  menuScene = new BABYLON.Scene(engine);
  menuScene.clearColor = new BABYLON.Color3(0.1, 0.1, 0.1);

  const cam = new BABYLON.UniversalCamera(
    "menuCam",
    new BABYLON.Vector3(0, 1.5, -3),
    menuScene
  );
  cam.setTarget(BABYLON.Vector3.Zero());
  cam.attachControl(canvas, true);

  new BABYLON.HemisphericLight(
    "menuLight",
    new BABYLON.Vector3(0, 1, 0),
    menuScene
  );

  const overlay = BABYLON.MeshBuilder.CreatePlane(
    "blackOverlay",
    { width: 5, height: 3 },
    menuScene
  );
  overlay.position = new BABYLON.Vector3(0, 1.5, 1);
  overlay.isPickable = false;
  const mat = new BABYLON.StandardMaterial("overlayMat", menuScene);
  mat.diffuseColor = new BABYLON.Color3(0, 0, 0);
  mat.alpha = 0.45;
  overlay.material = mat;

  createMainMenu({
    scene: menuScene,
    onStartPC: () => startScene("pc"),
    onStartLaptop: () => startScene("laptop"),
    onStartServer: () => startScene("server"),
  });

  engine.runRenderLoop(() => {
    if (menuScene) menuScene.render();
  });
}

showMenu();
window.addEventListener("resize", () => engine.resize());

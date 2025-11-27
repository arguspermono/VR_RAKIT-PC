// src/app.js
import { createMainMenu } from "./ui/mainmenu.js";
import { createSuperMenu } from "./ui/supermenu.js";

const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

// SINGLE MAIN SCENE (only 1)
const scene = new BABYLON.Scene(engine);
scene.clearColor = new BABYLON.Color3(0, 0, 0);

const camera = new BABYLON.UniversalCamera(
  "mainCam",
  new BABYLON.Vector3(0, 1.5, -3),
  scene
);
camera.setTarget(BABYLON.Vector3.Zero());
camera.attachControl(canvas, true);

new BABYLON.HemisphericLight("mainLight", new BABYLON.Vector3(0, 1, 0), scene);

// XR helper (single instance for whole app)
let xrHelper = null;
let xrReady = false; // whether XR helper created
let xrSessionActive = false; // whether user already entered XR

async function initXRHelper() {
  if (xrHelper || xrReady) return xrHelper;
  xrReady = true;
  try {
    xrHelper = await scene.createDefaultXRExperienceAsync({
      // disableDefaultUI: true, // optionally disable built-in UI
      disableTeleportation: true,
    });
    console.log("Global XR helper ready");
  } catch (e) {
    console.warn("Failed to init XR helper:", e);
    xrHelper = null;
  }
  return xrHelper;
}

/**
 * Try to enter XR session. Must be called from user gesture (pointerdown).
 * If device/browser blocks XR (http or unsupported), error will be thrown/handled by caller.
 */
export async function enterXRSession() {
  if (!xrHelper) await initXRHelper();
  if (!xrHelper) throw new Error("XR not available");
  if (xrSessionActive) return xrHelper;
  // try to enter immersive session — require user gesture
  await xrHelper.baseExperience.enterXRAsync("immersive-vr", "local-floor");
  xrSessionActive = true;
  console.log("Entered XR session");
  return xrHelper;
}

/**
 * getXRHelper — for menus or scenes that want a reference. Might be null if XR not supported.
 */
export function getXRHelper() {
  return xrHelper;
}

// --------------------- ROOT NODES (TransformNode) ---------------------
let superMenuRoot = null;
let mainMenuRoot = null;
let pcRoot = null;
let laptopRoot = null;
let serverRoot = null;

// utility: disable all app roots
function hideAllRoots() {
  if (superMenuRoot) superMenuRoot.setEnabled(false);
  if (mainMenuRoot) mainMenuRoot.setEnabled(false);
  if (pcRoot) pcRoot.setEnabled(false);
  if (laptopRoot) laptopRoot.setEnabled(false);
  if (serverRoot) serverRoot.setEnabled(false);
}

// startSimulation expects imported modules to return a TransformNode root when called with (scene).
// If module still uses old signature (engine, canvas) we attempt to fallback but warn.
async function startSimulation(kind) {
  hideAllRoots();

  try {
    if (kind === "pc") {
      if (!pcRoot) {
        const mod = await import("./scenes/scenePC.js");
        // prefer createScenePC(scene) signature
        if (typeof mod.createScenePC === "function") {
          // allow both async or sync returns
          const maybeRoot = await mod.createScenePC(scene);
          if (maybeRoot && maybeRoot.setEnabled) pcRoot = maybeRoot;
        }
        // fallback: old style that creates its own scene (NOT RECOMMENDED)
        if (!pcRoot && typeof mod.createScenePC === "function") {
          console.warn("scenePC: returned no root. If this file creates its own scene, update it to accept the existing scene and return a TransformNode root.");
        }
      }
      if (pcRoot) pcRoot.setEnabled(true);
    }

    if (kind === "laptop") {
      if (!laptopRoot) {
        const mod = await import("./scenes/sceneLaptop.js");
        if (typeof mod.createSceneLaptop === "function") {
          const maybeRoot = await mod.createSceneLaptop(scene);
          if (maybeRoot && maybeRoot.setEnabled) laptopRoot = maybeRoot;
        }
        if (!laptopRoot) {
          console.warn("sceneLaptop: returned no root. Update scene to accept the existing scene and return a TransformNode root.");
        }
      }
      if (laptopRoot) laptopRoot.setEnabled(true);
    }

    if (kind === "server") {
      if (!serverRoot) {
        const mod = await import("./scenes/sceneServer.js");
        if (typeof mod.createSceneServer === "function") {
          const maybeRoot = await mod.createSceneServer(scene);
          if (maybeRoot && maybeRoot.setEnabled) serverRoot = maybeRoot;
        }
        if (!serverRoot) {
          console.warn("sceneServer: returned no root. Update scene to accept the existing scene and return a TransformNode root.");
        }
      }
      if (serverRoot) serverRoot.setEnabled(true);
    }
  } catch (e) {
    console.error("Failed to start simulation:", e);
  }
}

// --------------------- CREATE MENUS ---------------------
(async function bootstrapMenus() {
  // init XR helper in background (won't enter XR) so menus can access xrHelper object
  initXRHelper().catch(() => {});

  // create super menu and main menu (they should return a TransformNode root)
  superMenuRoot = createSuperMenu({
    scene,
    xrHelper,
    onStart: async ({ enterXR = false } = {}) => {
      // Called when user presses "Start Simulation" from supermenu.
      // enterXR flag: if true, attempt to enter XR before switching to main menu.
      try {
        if (enterXR) {
          // must be called from user gesture to succeed
          await enterXRSession();
        }
      } catch (err) {
        console.warn("Could not enter XR:", err);
      }

      // show main menu
      hideAllRoots();
      if (!mainMenuRoot) {
        mainMenuRoot = createMainMenu({
          scene,
          xrHelper,
          onStartPC: () => startSimulation("pc"),
          onStartLaptop: () => startSimulation("laptop"),
          onStartServer: () => startSimulation("server"),
        });
      }
      mainMenuRoot.setEnabled(true);
    },
  });

  // initially show super menu only
  if (superMenuRoot) {
    superMenuRoot.setEnabled(true);
  }
})();

// --------------------- MAIN RENDER LOOP ---------------------
engine.runRenderLoop(() => {
  scene.render();
});

window.addEventListener("resize", () => engine.resize());

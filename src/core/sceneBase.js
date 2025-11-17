// src/core/sceneBase.js
import { setupColliders } from "./collisions.js";
import { setupControls } from "./controls.js";

export async function createSceneBase(engine, canvas) {
  const scene = new BABYLON.Scene(engine);
  scene.clearColor = new BABYLON.Color3(0.86, 0.9, 0.95);
  scene.collisionsEnabled = true;

  // CAMERA
  const camera = new BABYLON.UniversalCamera(
    "playerCam",
    new BABYLON.Vector3(0, 1.7, -2),
    scene
  );
  camera.attachControl(canvas, true);
  camera.speed = 0.12;
  camera.angularSensibility = 800;
  camera.checkCollisions = true;
  camera.applyGravity = true;
  camera.ellipsoid = new BABYLON.Vector3(0.3, 0.9, 0.3);
  camera.minZ = 0.1;

  new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, 1, 0), scene);

  // PHYSICS (optional if available)
  if (typeof Ammo === "function") {
    try {
      await Ammo();
      const plugin = new BABYLON.AmmoJSPlugin(true, Ammo);
      scene.enablePhysics(new BABYLON.Vector3(0, -9.81, 0), plugin);
    } catch (e) {
      console.warn("Ammo init failed", e);
    }
  }

  // LOAD ENVIRONMENT (lab + table)
  const lab = await BABYLON.SceneLoader.ImportMeshAsync(
    "",
    "assets/",
    "computer_lab.glb",
    scene
  );
  lab.meshes.forEach((m) => (m.checkCollisions = true));

  const tableMesh =
    lab.meshes.find((m) => {
      try {
        return /table|meja|longtable/i.test(m.name);
      } catch (e) {
        return false;
      }
    }) || lab.meshes.find((m) => m.name.toLowerCase().includes("desk"));

  // Basic app context (scenes will add their loaded parts)
  scene.__app = {
    camera,
    table: tableMesh || null,
    loaded: {}, // scene-specific loaders populate this
    slots: {},
    xr: null,
  };

  setupColliders(scene);
  setupControls(scene);

  // XR init (best-effort)
  try {
    const xr = await scene.createDefaultXRExperienceAsync({
      floorMeshes: scene.meshes.filter((m) => m.checkCollisions),
    });
    scene.__app.xr = xr;
  } catch (e) {
    console.warn("XR init failed", e);
  }

  return scene;
}

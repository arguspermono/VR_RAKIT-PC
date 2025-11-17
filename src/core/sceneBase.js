// src/core/sceneBase.js
import { setupColliders } from "./collisions.js";
import { setupControls } from "./controls.js";
import { sendMyPosition, onRemotePosition } from "../network/webrtc.js";

let remoteAvatar = null;

export async function createSceneBase(engine, canvas) {
  const scene = new BABYLON.Scene(engine);
  scene.clearColor = new BABYLON.Color3(0.86, 0.9, 0.95);
  scene.collisionsEnabled = true;

  // =========================
  // CAMERA (desktop mode)
  // =========================
  const camera = new BABYLON.UniversalCamera(
    "playerCam",
    new BABYLILON.Vector3(0, 1.7, -2),
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

  // =========================
  // PHYSICS (optional)
  // =========================
  if (typeof Ammo === "function") {
    try {
      await Ammo();
      const plugin = new BABYLON.AmmoJSPlugin(true, Ammo);
      scene.enablePhysics(new BABYLON.Vector3(0, -9.81, 0), plugin);
    } catch (e) {
      console.warn("Ammo init failed", e);
    }
  }

  // =========================
  // LOAD ENVIRONMENT
  // =========================
  const lab = await BABYLON.SceneLoader.ImportMeshAsync("", "assets/", "computer_lab.glb", scene);
  lab.meshes.forEach((m) => (m.checkCollisions = true));

  const tableMesh =
    lab.meshes.find((m) => /table|meja|longtable/i.test(m.name)) ||
    lab.meshes.find((m) => m.name.toLowerCase().includes("desk"));

  scene.__app = {
    camera,
    table: tableMesh || null,
    loaded: {},
    slots: {},
    xr: null,
  };

  setupColliders(scene);
  setupControls(scene);

  // =========================
  // REMOTE AVATAR
  // =========================
  remoteAvatar = BABYLON.MeshBuilder.CreateSphere(
    "remoteAvatar",
    { diameter: 0.3 },
    scene
  );

  const mat = new BABYLON.StandardMaterial("remoteMat", scene);
  mat.diffuseColor = new BABYLON.Color3(0.2, 0.4, 1);
  remoteAvatar.material = mat;

  // keep it hidden until data arrives
  remoteAvatar.position.set(0, -999, 0);

  // =========================
  // RECEIVE REMOTE UPDATES
  // =========================
  onRemotePosition((pos) => {
    if (!pos) return;

    // show avatar only once data exists
    if (remoteAvatar.position.y < -10) {
      remoteAvatar.position.y = pos.y;
    }

    remoteAvatar.position.set(pos.x, pos.y, pos.z);
    remoteAvatar.rotation.y = pos.rotY;
  });

  // =========================
  // XR SUPPORT
  // =========================
  try {
    const xr = await scene.createDefaultXRExperienceAsync({
      floorMeshes: scene.meshes.filter((m) => m.checkCollisions),
    });

    scene.__app.xr = xr;

    // SEND POSITION (XR)
    scene.onBeforeRenderObservable.add(() => {
      const head = xr.baseExperience.camera;

      sendMyPosition({
        x: head.position.x,
        y: head.position.y,
        z: head.position.z,
        rotY: head.rotation.y,
      });
    });
  } catch (e) {
    console.warn("XR init failed", e);

    // FALLBACK: send position using desktop camera
    scene.onBeforeRenderObservable.add(() => {
      sendMyPosition({
        x: camera.position.x,
        y: camera.position.y,
        z: camera.position.z,
        rotY: camera.rotation.y,
      });
    });
  }

  return scene;
}

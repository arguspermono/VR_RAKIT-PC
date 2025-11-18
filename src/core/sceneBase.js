// src/core/sceneBase.js
import { setupColliders } from "./collisions.js";
import { setupControls } from "./controls.js";

// VARIABEL GLOBAL MODULE (Singleton)
// Ini akan menyimpan instance Ammo agar tidak perlu loading ulang saat reset
let ammoInstance = null;

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

  // --- PERBAIKAN PHYSICS INIT (SINGLETON) ---
  // Cek apakah script Ammo sudah ada
  if (typeof Ammo !== "undefined") {
    // Jika instance belum ada, kita init. Jika sudah ada (hasil reset sebelumnya), LEWATI init.
    if (!ammoInstance) {
      if (typeof Ammo === "function") {
        try {
          // Panggil factory function sekali saja seumur hidup app
          ammoInstance = await Ammo();
          console.log("Ammo.js initialized for the first time.");
        } catch (e) {
          console.warn("Ammo init failed", e);
        }
      } else {
        // Fallback jika Ammo sudah berbentuk objek
        ammoInstance = Ammo;
      }
    }

    // Aktifkan physics menggunakan instance yang sudah disimpan
    if (ammoInstance) {
      const plugin = new BABYLON.AmmoJSPlugin(true, ammoInstance);
      scene.enablePhysics(new BABYLON.Vector3(0, -9.81, 0), plugin);
      console.log("Physics Engine enabled on new scene.");
    }
  }
  // ------------------------------------------

  // LOAD ENVIRONMENT
  const lab = await BABYLON.SceneLoader.ImportMeshAsync(
    "",
    "assets/",
    "computer_lab.glb",
    scene
  );
  lab.meshes.forEach((m) => {
    m.checkCollisions = true;
  });

  // CARI MEJA
  const tableMesh =
    lab.meshes.find((m) => {
      try {
        return /table|meja|longtable/i.test(m.name);
      } catch (e) {
        return false;
      }
    }) || lab.meshes.find((m) => m.name.toLowerCase().includes("desk"));

  // --- COLLIDER MEJA (HIDDEN) ---
  if (tableMesh && scene.getPhysicsEngine()) {
    const bounds = tableMesh.getBoundingInfo().boundingBox;
    const width = bounds.maximumWorld.x - bounds.minimumWorld.x;
    const height = bounds.maximumWorld.y - bounds.minimumWorld.y;
    const depth = bounds.maximumWorld.z - bounds.minimumWorld.z;
    const center = bounds.centerWorld;

    const tableCollider = BABYLON.MeshBuilder.CreateBox(
      "DebugTableCollider",
      { width, height, depth },
      scene
    );

    tableCollider.position = center.clone();
    tableCollider.position.y += 0.06;

    const debugMat = new BABYLON.StandardMaterial("debugMatTable", scene);
    debugMat.diffuseColor = new BABYLON.Color3(1, 0, 0);
    debugMat.alpha = 0.5;
    tableCollider.material = debugMat;

    tableCollider.isVisible = false;

    tableCollider.physicsImpostor = new BABYLON.PhysicsImpostor(
      tableCollider,
      BABYLON.PhysicsImpostor.BoxImpostor,
      { mass: 0, friction: 0.8, restitution: 0.0 },
      scene
    );
  }

  // --- COLLIDER LANTAI (DIPERLUAS) ---
  const floorMesh = lab.meshes.find(
    (m) =>
      m.name.toLowerCase().includes("floor") ||
      m.name.toLowerCase().includes("ground") ||
      m.name.toLowerCase().includes("lantai")
  );

  if (floorMesh && scene.getPhysicsEngine()) {
    const bounds = floorMesh.getBoundingInfo().boundingBox;

    // Paksa ukuran besar (100m) agar tidak jatuh ke void
    const rawWidth = bounds.maximumWorld.x - bounds.minimumWorld.x;
    const rawDepth = bounds.maximumWorld.z - bounds.minimumWorld.z;
    const width = rawWidth < 100 ? 100 : rawWidth;
    const depth = rawDepth < 100 ? 100 : rawDepth;

    const rawHeight = bounds.maximumWorld.y - bounds.minimumWorld.y;
    const height = rawHeight < 0.05 ? 0.05 : rawHeight;
    const center = bounds.centerWorld;

    const floorCollider = BABYLON.MeshBuilder.CreateBox(
      "DebugFloorCollider",
      { width, height, depth },
      scene
    );

    floorCollider.position = center.clone();
    if (rawHeight < 0.05) {
      floorCollider.position.y -= height / 2;
    }

    const floorDebugMat = new BABYLON.StandardMaterial("debugMatFloor", scene);
    floorDebugMat.diffuseColor = new BABYLON.Color3(1, 0, 0);
    floorDebugMat.alpha = 0.5;
    floorCollider.material = floorDebugMat;

    floorCollider.isVisible = false;

    floorCollider.physicsImpostor = new BABYLON.PhysicsImpostor(
      floorCollider,
      BABYLON.PhysicsImpostor.BoxImpostor,
      { mass: 0, friction: 0.5, restitution: 0.1 },
      scene
    );
  }

  scene.__app = {
    camera,
    table: tableMesh || null,
    loaded: {},
    slots: {},
    xr: null,
  };

  setupColliders(scene);
  setupControls(scene);

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

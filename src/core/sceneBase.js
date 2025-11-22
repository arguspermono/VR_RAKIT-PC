// src/core/sceneBase.js
import { setupColliders } from "./collisions.js";
import { setupControls } from "./controls.js";

// Singleton instance untuk AmmoJS (Physics)
let ammoInstance = null;

export async function createSceneBase(engine, canvas) {
  const scene = new BABYLON.Scene(engine);
  scene.clearColor = new BABYLON.Color3(0.86, 0.9, 0.95);

  // -----------------------------------------------------------------
  // [FIX 1] INISIALISASI STATE APLIKASI
  // -----------------------------------------------------------------
  // Ini wajib ada karena scenePC.js mengakses scene.__app
  scene.__app = {
    loaded: {},
    table: null, // Nanti diisi setelah lab loaded
  };

  // 1. AKTIFKAN SISTEM COLLISION GLOBAL
  scene.collisionsEnabled = true;

  // 2. CAMERA STANDARD (Player)
  const camera = new BABYLON.UniversalCamera(
    "playerCam",
    new BABYLON.Vector3(0, 1.7, -2), // Posisi awal
    scene
  );
  camera.attachControl(canvas, true);
  camera.speed = 0.12;
  camera.angularSensibility = 800;

  camera.checkCollisions = true;
  camera.applyGravity = true;
  camera.ellipsoid = new BABYLON.Vector3(0.3, 0.9, 0.3);
  camera.minZ = 0.1;

  // 3. PENCAHAYAAN DASAR
  new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, 1, 0), scene);

  // -----------------------------------------------------------------
  // [FIX 2] LOAD ENVIRONMENT (BACKGROUND / RUANGAN)
  // -----------------------------------------------------------------
  try {
    // Memuat computer_lab.glb agar background muncul
    const labRes = await BABYLON.SceneLoader.ImportMeshAsync(
      "",
      "assets/",
      "computer_lab.glb",
      scene
    );

    // Setting properti untuk environment
    labRes.meshes.forEach((m) => {
      m.checkCollisions = true; // Agar tidak tembus
      m.isPickable = false; // Agar tidak mengganggu klik barang
      m.freezeWorldMatrix(); // Optimasi performa
    });

    // Mencari meja untuk spawn point barang (Logika sederhana mencari mesh dengan nama 'Table')
    // Jika nama mesh di blender berbeda, sesuaikan string ini.
    const tableMesh = labRes.meshes.find(
      (m) =>
        m.name.toLowerCase().includes("table") ||
        m.name.toLowerCase().includes("meja")
    );

    if (tableMesh) {
      scene.__app.table = tableMesh;
    } else {
      console.warn(
        "Mesh meja tidak ditemukan, menggunakan mesh pertama sebagai referensi spawn."
      );
      scene.__app.table = labRes.meshes[1]; // Fallback
    }
  } catch (e) {
    console.error("Gagal memuat environment:", e);
  }

  // =====================================================================
  // 🧱 GLOBAL ENVIRONMENT COLLIDERS (Invisible Walls & Floor)
  // =====================================================================
  const createGlobalCollider = (name, w, h, d, x, y, z) => {
    const box = BABYLON.MeshBuilder.CreateBox(
      name,
      { width: w, height: h, depth: d },
      scene
    );
    box.position = new BABYLON.Vector3(x, y, z);
    box.isVisible = false;
    box.checkCollisions = true;
    box.isPickable = false;
    return box;
  };

  createGlobalCollider("globalFloor", 50, 0.2, 50, 0, -0.1, 0);
  createGlobalCollider("globalWallFront", 25, 10, 1, 0, 5, 10.5);
  createGlobalCollider("globalWallBack", 25, 10, 1, 0, 5, -10.5);
  createGlobalCollider("globalWallLeft", 1, 10, 25, -10.5, 5, 0);
  createGlobalCollider("globalWallRight", 1, 10, 25, 10.5, 5, 0);

  // =====================================================================

  // 4. PHYSICS ENGINE SETUP (Ammo.js)
  if (typeof Ammo !== "undefined") {
    if (!ammoInstance) {
      ammoInstance = await Ammo();
    }
    const physicsPlugin = new BABYLON.AmmoJSPlugin(true, ammoInstance);
    scene.enablePhysics(new BABYLON.Vector3(0, -9.81, 0), physicsPlugin);
  }

  return scene;
}

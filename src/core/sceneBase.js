// src/core/sceneBase.js
import { setupColliders } from "./collisions.js";
import { setupControls } from "./controls.js";

// Singleton instance untuk AmmoJS (Physics)
let ammoInstance = null;

export async function createSceneBase(engine, canvas) {
  const scene = new BABYLON.Scene(engine);
  scene.clearColor = new BABYLON.Color3(0.86, 0.9, 0.95);

  // 1. AKTIFKAN SISTEM COLLISION GLOBAL
  scene.collisionsEnabled = true;

  // 2. CAMERA STANDARD (Player)
  // Kamera ini akan digunakan jika scene tidak membuat kamera sendiri
  const camera = new BABYLON.UniversalCamera(
    "playerCam",
    new BABYLON.Vector3(0, 1.7, -2), // Posisi awal
    scene
  );
  camera.attachControl(canvas, true);
  camera.speed = 0.12;
  camera.angularSensibility = 800;

  // Setup Collision Kamera (Agar player tidak tembus benda)
  camera.checkCollisions = true;
  camera.applyGravity = true;
  camera.ellipsoid = new BABYLON.Vector3(0.3, 0.9, 0.3); // Ukuran badan player
  camera.minZ = 0.1;

  // 3. PENCAHAYAAN DASAR
  new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, 1, 0), scene);

  // =====================================================================
  // 🧱 GLOBAL ENVIRONMENT COLLIDERS (Invisible Walls & Floor)
  // =====================================================================
  // Karena semua scene (Menu, PC, Laptop) pakai ruangan "computer_lab.glb"
  // Kita pasang pengamannya di sini saja biar otomatis ada di mana-mana.

  const createGlobalCollider = (name, w, h, d, x, y, z) => {
    const box = BABYLON.MeshBuilder.CreateBox(
      name,
      { width: w, height: h, depth: d },
      scene
    );
    box.position = new BABYLON.Vector3(x, y, z);
    box.isVisible = false; // Tidak terlihat
    box.checkCollisions = true; // Bisa ditabrak/diinjak
    box.isPickable = false; // Klik tembus (tidak menghalangi mouse)
    return box;
  };

  // A. Lantai Aman (Alas) - Mencegah jatuh jika lantai model bolong
  createGlobalCollider("globalFloor", 50, 0.2, 50, 0, -0.1, 0);

  // B. Tembok Batas (Agar player tidak keluar ruangan)
  // Asumsi ruangan 20x20 meter
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
  
import { setupColliders } from "./collisions.js";
import { setupControls } from "./controls.js";

// Singleton instance untuk AmmoJS
let ammoInstance = null;

export async function createSceneBase(engine, canvas) {
  const scene = new BABYLON.Scene(engine);
  scene.clearColor = new BABYLON.Color3(0.86, 0.9, 0.95);

  // -----------------------------------------------------------------
  // [1] SETUP PHYSICS ENGINE
  // -----------------------------------------------------------------
  if (typeof Ammo !== "undefined") {
    if (!ammoInstance) {
      ammoInstance = await Ammo();
    }
    const physicsPlugin = new BABYLON.AmmoJSPlugin(true, ammoInstance);
    scene.enablePhysics(new BABYLON.Vector3(0, -9.81, 0), physicsPlugin);
  }

  scene.__app = {
    loaded: {},
    table: null,
  };

  scene.collisionsEnabled = true;

  // -----------------------------------------------------------------
  // [2] CAMERA & LIGHT
  // -----------------------------------------------------------------
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

  // -----------------------------------------------------------------
  // [3] MATERIAL DEBUG (Warna Transparan)
  // -----------------------------------------------------------------
  const debugMatLantai = new BABYLON.StandardMaterial("debugMatLantai", scene);
  debugMatLantai.diffuseColor = new BABYLON.Color3(1, 0, 0); // Merah
  debugMatLantai.alpha = 0.5;

  const debugMatMeja = new BABYLON.StandardMaterial("debugMatMeja", scene);
  debugMatMeja.diffuseColor = new BABYLON.Color3(0, 1, 1); // Cyan
  debugMatMeja.alpha = 0.5;

  // -----------------------------------------------------------------
  // [4] FUNGSI HELPER: BUAT BOX COLLIDER (DENGAN OFFSET Y)
  // -----------------------------------------------------------------
  const createColliderFromMesh = (
    meshRef,
    name,
    material,
    frictionVal,
    offsetY = 0
  ) => {
    // 1. Ambil ukuran dari mesh referensi
    const boundingBox = meshRef.getBoundingInfo().boundingBox;

    const width = boundingBox.extendSizeWorld.x * 2;
    const height = boundingBox.extendSizeWorld.y * 2;
    const depth = boundingBox.extendSizeWorld.z * 2;

    // 2. Buat Box Primitif
    const collider = BABYLON.MeshBuilder.CreateBox(
      name,
      {
        width: width,
        height: height,
        depth: depth,
      },
      scene
    );

    // 3. Posisikan di tengah, lalu geser sesuai offsetY
    collider.position = boundingBox.centerWorld.clone();
    collider.position.y += offsetY; // <--- INI PENGATUR NAIK/TURUNNYA

    // 4. Setup Visual & Fisika
    collider.material = material;
    collider.isVisible = false; // Set ke false jika ingin menyembunyikan kotak debug

    collider.physicsImpostor = new BABYLON.PhysicsImpostor(
      collider,
      BABYLON.PhysicsImpostor.BoxImpostor,
      { mass: 0, friction: frictionVal, restitution: 0 },
      scene
    );

    collider.checkCollisions = true;
    return collider;
  };

  // -----------------------------------------------------------------
  // [5] DINDING PEMBATAS MANUAL
  // -----------------------------------------------------------------
  const createInvisibleWall = (name, w, h, d, x, y, z) => {
    const box = BABYLON.MeshBuilder.CreateBox(
      name,
      { width: w, height: h, depth: d },
      scene
    );
    box.position = new BABYLON.Vector3(x, y, z);
    box.isVisible = false;
    box.checkCollisions = true;
    return box;
  };
  createInvisibleWall("globalWallFront", 25, 10, 1, 0, 5, 10.5);
  createInvisibleWall("globalWallBack", 25, 10, 1, 0, 5, -10.5);
  createInvisibleWall("globalWallLeft", 1, 10, 25, -10.5, 5, 0);
  createInvisibleWall("globalWallRight", 1, 10, 25, 10.5, 5, 0);

  // -----------------------------------------------------------------
  // [6] LOAD ENVIRONMENT
  // -----------------------------------------------------------------
  try {
    const labRes = await BABYLON.SceneLoader.ImportMeshAsync(
      "",
      "assets/",
      "computer_lab.glb",
      scene
    );

    labRes.meshes.forEach((m) => {
      // --- A. LANTAI ---
      if (m.name === "GRAVITY_LANTAI") {
        // [ATUR KETINGGIAN DISINI]
        // -0.02 artinya turun 2cm ke bawah (biar tidak flicker dengan lantai asli)
        createColliderFromMesh(
          m,
          "collider_lantai",
          debugMatLantai,
          0.5,
          -0.45
        );

        m.isVisible = false; // Sembunyikan mesh referensi
      }

      // --- B. MEJA ---
      else if (m.name === "GRAVITY_MEJA") {
        // [ATUR KETINGGIAN DISINI]
        // Ubah -0.05 menjadi angka yang kamu mau.
        // Semakin besar minusnya (misal -0.2), kotak biru akan makin turun.
        const tableCollider = createColliderFromMesh(
          m,
          "collider_meja",
          debugMatMeja,
          1.0,
          -0.45
        );

        scene.__app.table = tableCollider;
        m.isVisible = false; // Sembunyikan mesh referensi
      }

      // --- C. VISUAL LAINNYA ---
      else {
        m.freezeWorldMatrix();
        m.checkCollisions = true;
        m.isPickable = false;
      }
    });

    if (!scene.__app.table) {
      scene.__app.table = labRes.meshes[0];
    }
  } catch (e) {
    console.error("Gagal memuat environment:", e);
  }

  return scene;
}

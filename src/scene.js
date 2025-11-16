// project/src/scene.js
import {
  findMeshByName,
  autoPlacePartsOnTable,
  applyComponentScale,
} from "./utils.js";
import { detectSlots } from "./slots.js";
import { setupColliders } from "./collisions.js";

export async function createScene(engine, canvas) {
  const scene = new BABYLON.Scene(engine);
  scene.clearColor = new BABYLON.Color3(0.86, 0.9, 0.95);
  scene.collisionsEnabled = true;

  // 1. AKTIFKAN FISIKA
  const gravity = new BABYLON.Vector3(0, -9.81, 0);
  try {
    scene.enablePhysics(gravity, new BABYLON.CannonJSPlugin());
  } catch (e) {
    console.warn(
      "Gagal mengaktifkan fisika (Cannon.js). Pastikan library sudah di-load.",
      e
    );
  }

  // CAMERA (FPS)
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

  // LIGHT
  new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, 1, 0), scene);

  // LOAD ENVIRONMENT (computer_lab.glb)
  const lab = await BABYLON.SceneLoader.ImportMeshAsync(
    "",
    "assets/",
    "computer_lab.glb",
    scene
  );

  lab.meshes.forEach((m) => {
    m.checkCollisions = true;

    // TAMBAHKAN IMPOSTOR STATIS KE LINGKUNGAN
    if (
      m.name.toLowerCase().includes("floor") ||
      m.name.toLowerCase().includes("table") ||
      m.name.toLowerCase().includes("wall")
    ) {
      m.physicsImpostor = new BABYLON.PhysicsImpostor(
        m,
        BABYLON.PhysicsImpostor.BoxImpostor,
        { mass: 0, friction: 0.7, restitution: 0.1 },
        scene
      );
    }
  });

  const tableMesh =
    lab.meshes.find((m) => m.name.includes("LongTable")) || null;

  console.log("TABLE FOUND:", tableMesh?.name);

  // LOAD ALL COMPONENTS
  const assetList = [
    { key: "case", file: "pc_case.glb" },
    { key: "mobo", file: "motherboard.glb" },
    { key: "cpu", file: "processor.glb" },
    { key: "gpu", file: "GPU.glb" },
    { key: "ram1", file: "ram_1.glb" },
    { key: "ram2", file: "ram_2.glb" },
    { key: "ram3", file: "ram_3.glb" },
    { key: "ram4", file: "ram_4.glb" },
    { key: "psu", file: "PSU.glb" },
  ];

  const loaded = {};

  for (const a of assetList) {
    try {
      const res = await BABYLON.SceneLoader.ImportMeshAsync(
        "",
        "assets/",
        a.file,
        scene
      );

      loaded[a.key] = {
        root: res.meshes[0],
        meshes: res.meshes,
      };

      res.meshes.forEach((m) => {
        m.isPickable = true;
      });
    } catch (e) {
      console.warn(`Failed to load ${a.key}:`, e);
    }
  }

  // SCALE COMPONENTS
  applyComponentScale(loaded);

  // AUTO PLACE ALL PARTS ON TABLE
  autoPlacePartsOnTable(tableMesh, loaded);

  // STORE INTO scene.__app FOR OTHER MODULES
  scene.__app = {
    camera: scene.activeCamera,
    table: tableMesh,
    loaded,
    slots: {}, // akan di-set segera setelah detectSlots dipanggil
    xr: null,
  };

  // DETECT SLOTS (PANGGIL DI SINI setelah semua asset loaded)
  try {
    scene.__app.slots = detectSlots(scene);
  } catch (e) {
    console.warn("detectSlots error:", e);
    scene.__app.slots = {};
  }

  // SETUP COLLIDERS (Sekarang akan setup Physics Impostors)
  setupColliders(scene);

  // --- KODE DEBUG DITAMBAHKAN ---
  // Tampilkan wireframe Physics Impostor
  const physicsViewer = new BABYLON.Debug.PhysicsViewer(scene);
  Object.values(scene.__app.loaded).forEach((item) => {
    if (item.root && item.root.physicsImpostor) {
      physicsViewer.showImpostor(item.root.physicsImpostor);
    }
  });
  // --------------------------------

  // ENABLE WEBXR + LASER POINTER
  try {
    const xr = await scene.createDefaultXRExperienceAsync({
      floorMeshes: scene.meshes.filter(
        (m) => m.physicsImpostor && m.physicsImpostor.mass === 0
      ),
    });

    console.log("✔ WebXR Ready");

    // Perbaikan: Tambahkan Pengecekan 'if'
    if (xr.featuresManager) {
      try {
        xr.featuresManager.enableFeature(
          BABYLON.WebXRFeatureName.POINTER_SELECTION,
          "stable",
          {
            enablePointerSelectionOnAllControllers: true,
          }
        );
      } catch (e) {
        console.warn(
          "pointer selection enable failed (maybe already enabled):",
          e
        );
      }
    } else {
      console.warn("XR FeaturesManager tidak tersedia.");
    }

    xr.input.onControllerAddedObservable.add((controller) => {
      console.log("🕹 Controller detected:", controller.inputSource.handedness);
    });

    scene.__app.xr = xr;
  } catch (e) {
    console.warn("Failed to initialize XR:", e);
  }

  return scene;
}

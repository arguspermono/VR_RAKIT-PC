// src/scenes/sceneLaptop.js
import { createSceneBase } from "../core/sceneBase.js";
import { attachInteractions } from "../core/interactions.js";
import { createTutorialManager } from "../core/tutorialManager.js";
import { createHUD } from "../ui/uiButtons.js";
import { resetScene } from "../app.js";
import { applyComponentScale, autoPlacePartsOnTable } from "../core/utils.js";
import { detectSlots } from "../core/slots.js";
import { create3DDialog } from "../ui/tutorial3D.js";

export async function createSceneLaptop(engine, canvas) {
  const scene = await createSceneBase(engine, canvas);

  // --- PANGGIL DIALOG TUTORIAL ---
  create3DDialog(scene, "laptop");
  // -------------------------------

  // load laptop-specific assets
  const assetList = [
    { key: "casing_laptop", file: "casing_laptop.glb" },
    { key: "ram1_laptop", file: "ram1_lap.glb" },
    { key: "ram2_laptop", file: "ram2_lap.glb" },
    { key: "nvme_laptop", file: "nvme.glb" },
    { key: "battery_laptop", file: "battery.glb" },
  ];

  scene.__app.loaded = scene.__app.loaded || {};

  for (const a of assetList) {
    try {
      const res = await BABYLON.SceneLoader.ImportMeshAsync(
        "",
        "assets/",
        a.file,
        scene
      );
      const root = res.meshes[0];
      res.meshes.forEach((m) => (m.isPickable = true));
      scene.__app.loaded[a.key] = { key: a.key, root, meshes: res.meshes };
      if (scene.getPhysicsEngine() && root) {
        try {
          root.physicsImpostor = new BABYLON.PhysicsImpostor(
            root,
            BABYLON.PhysicsImpostor.BoxImpostor,
            { mass: a.key === "casing_laptop" ? 0 : 1 },
            scene
          );
        } catch (e) {}
      }
    } catch (e) {
      console.warn("Failed to load", a.file, e);
    }
  }

  applyComponentScale(scene.__app.loaded);
  if (scene.__app.table)
    autoPlacePartsOnTable(scene.__app.table, scene.__app.loaded);

  // --- PERBAIKAN POSISI LAPTOP ---
  const casing = scene.__app.loaded["casing_laptop"];
  if (casing && casing.root) {
    // Cek apakah ada meja untuk referensi tinggi
    if (scene.__app.table) {
      const tableBounds = scene.__app.table.getBoundingInfo().boundingBox;
      // Set posisi Y tepat di atas meja + sedikit offset (0.01) agar tidak tenggelam
      casing.root.position.y = tableBounds.maximumWorld.y + 0.1;
    } else {
      // Fallback manual jika meja tidak terdeteksi (turunkan dari 0.5 jika masih terlalu tinggi)
      casing.root.position.y = 0.01;
    }

    casing.root.position.z -= 0.5; // maju sedikit agar tidak nabrak meja
  }

  // detect slots (uses casing_laptop meshes)
  scene.__app.slots = detectSlots(scene);

  try {
    attachInteractions(scene);
  } catch (e) {
    console.warn(e);
  }

  // laptop tutorial order (custom)
  try {
    const order = [
      "ram1_laptop",
      "ram2_laptop",
      "nvme_laptop",
      "battery_laptop",
    ];
    scene.__tutorial = createTutorialManager(scene, order);
  } catch (e) {
    console.warn("createTutorialManager failed", e);
  }

  // HUD
  createHUD(
    scene,
    () => window.location.reload(),
    () => resetScene()
  );

  return scene;
}

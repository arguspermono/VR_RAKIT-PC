// src/scenes/sceneServer.js
import { createSceneBase } from "../core/sceneBase.js";
import { attachInteractions } from "../core/interactions.js";
import { createTutorialManager } from "../core/tutorialManager.js";
import { createHUD } from "../ui/uiButtons.js";
import { resetScene } from "../app.js";
import {
  applyComponentScale,
  autoPlacePartsOnTable,
  placeServerRackAndItems,
} from "../core/utils.js";
import { detectSlots } from "../core/slots.js";
import { create3DDialog } from "../ui/tutorial3D.js";

export async function createSceneServer(engine, canvas) {
  const scene = await createSceneBase(engine, canvas);

  // --- PANGGIL DIALOG TUTORIAL ---
  create3DDialog(scene, "server");

  // list of server/rack assets
  const assetList = [
    { key: "server_rack", file: "server_rack.glb" },
    { key: "misc", file: "misc.glb" },
    { key: "nas", file: "nas.glb" },
    { key: "ups", file: "ups.glb" },
    { key: "console", file: "console.glb" },
    { key: "server", file: "server.glb" },
  ];

  scene.__app.loaded = scene.__app.loaded || {};

  // 1. LOAD ASSETS (TANPA FISIKA DULU)
  for (const a of assetList) {
    try {
      const res = await BABYLON.SceneLoader.ImportMeshAsync(
        "",
        "assets/",
        a.file,
        scene
      );
      const root = res.meshes[0] || null;
      res.meshes.forEach((m) => (m.isPickable = true));

      // Simpan data aset
      scene.__app.loaded[a.key] = { key: a.key, root, meshes: res.meshes };

      // HAPUS BLOK PHYSICS DI SINI -- Kita pasang nanti setelah posisi pas
    } catch (e) {
      console.warn("Failed to load", a.file, e);
    }
  }

  // 2. ATUR POSISI VISUAL (SCALE & PLACE)
  applyComponentScale(scene.__app.loaded);
  placeServerRackAndItems(scene.__app.table, scene.__app.loaded);

  if (scene.__app.table)
    autoPlacePartsOnTable(scene.__app.table, scene.__app.loaded);

  // --- PERBAIKAN POSISI SERVER RACK ---
  const rack = scene.__app.loaded["server_rack"];
  if (rack && rack.root) {
    // Naikkan Server Rack (visual)
    rack.root.position.y = 0.2; // 20cm dari lantai
  }

  // 3. BARU PASANG FISIKA (SETELAH POSISI FINAL)
  if (scene.getPhysicsEngine()) {
    Object.keys(scene.__app.loaded).forEach((key) => {
      const item = scene.__app.loaded[key];
      if (item.root) {
        try {
          // Tentukan massa: Rack diam (0), komponen lain jatuh (1)
          const massValue = key === "server_rack" ? 0 : 1;

          item.root.physicsImpostor = new BABYLON.PhysicsImpostor(
            item.root,
            BABYLON.PhysicsImpostor.BoxImpostor,
            { mass: massValue, friction: 0.5, restitution: 0.1 },
            scene
          );
        } catch (e) {
          console.warn("Physics fail for", key);
        }
      }
    });
  }

  // detect slots
  scene.__app.slots = detectSlots(scene);

  // interactions + tutorial
  try {
    attachInteractions(scene);
  } catch (e) {
    console.warn(e);
  }

  try {
    const order = ["misc", "nas", "ups", "console", "server"];
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

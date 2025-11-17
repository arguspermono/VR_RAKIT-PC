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
// IMPORT BARU
import { create3DDialog } from "../ui/tutorial3D.js";

export async function createSceneServer(engine, canvas) {
  const scene = await createSceneBase(engine, canvas);

  // --- PANGGIL DIALOG TUTORIAL ---
  create3DDialog(scene, "server");
  // -------------------------------

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

  // load assets sequentially
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
      scene.__app.loaded[a.key] = { key: a.key, root, meshes: res.meshes };

      if (scene.getPhysicsEngine() && root) {
        try {
          root.physicsImpostor = new BABYLON.PhysicsImpostor(
            root,
            BABYLON.PhysicsImpostor.BoxImpostor,
            { mass: a.key === "server_rack" ? 0 : 1 },
            scene
          );
        } catch (e) {}
      }
    } catch (e) {
      console.warn("Failed to load", a.file, e);
    }
  }

  // scale + place
  applyComponentScale(scene.__app.loaded);

  // place rack and small items
  placeServerRackAndItems(scene.__app.table, scene.__app.loaded);

  // fallback placement
  if (scene.__app.table)
    autoPlacePartsOnTable(scene.__app.table, scene.__app.loaded);

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

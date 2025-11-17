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

export async function createSceneServer(engine, canvas) {
  const scene = await createSceneBase(engine, canvas);

  // list of server/rack assets
  const assetList = [
    { key: "server_rack", file: "server_rack.glb" },
    { key: "misc1", file: "misc1.glb" },
    { key: "misc2", file: "misc2.glb" },
    { key: "nas", file: "nas.glb" },
    { key: "ups", file: "ups.glb" },
    { key: "console", file: "console.glb" },
    // server units 1..9
    { key: "server1", file: "server1.glb" },
    { key: "server2", file: "server2.glb" },
    { key: "server3", file: "server3.glb" },
    { key: "server4", file: "server4.glb" },
    { key: "server5", file: "server5.glb" },
    { key: "server6", file: "server6.glb" },
    { key: "server7", file: "server7.glb" },
    { key: "server8", file: "server8.glb" },
    { key: "server9", file: "server9.glb" },
  ];

  scene.__app.loaded = scene.__app.loaded || {};

  // load assets sequentially (keeps code simple and predictable)
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
      // lightweight physics impostor
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

  // place rack and small items: rack in front of table (not blocking camera)
  placeServerRackAndItems(scene.__app.table, scene.__app.loaded);

  // add generic table auto-placement fallback for any leftover
  if (scene.__app.table)
    autoPlacePartsOnTable(scene.__app.table, scene.__app.loaded);

  // detect slots (for rack + others)
  scene.__app.slots = detectSlots(scene);

  // interactions + tutorial
  try {
    attachInteractions(scene);
  } catch (e) {
    console.warn(e);
  }

  try {
    const order = [
      "misc1",
      "misc2",
      "nas",
      "ups",
      "console",
      "server1",
      "server2",
      "server3",
      "server4",
      "server5",
      "server6",
      "server7",
      "server8",
      "server9",
    ];
    scene.__tutorial = createTutorialManager(scene, order);
  } catch (e) {
    console.warn("createTutorialManager failed", e);
  }

  // HUD top-left
  createHUD(
    scene,
    () => window.location.reload(),
    () => resetScene()
  );

  return scene;
}

// src/scenes/sceneServer.js
import { createSceneBase } from "../core/sceneBase.js";
import { attachInteractions } from "../core/interactions.js";
import { createTutorialManager } from "../core/tutorialManager.js";
import { createHUD } from "../ui/uiButtons.js";
import {
  applyComponentScale,
  autoPlacePartsOnTable,
  placeServerRackAndItems,
} from "../core/utils.js";
import { detectSlots } from "../core/slots.js";
import { create3DDialog } from "../ui/tutorial3D.js";

// MENERIMA PARAMETER onExitApp
export async function createSceneServer(engine, canvas, onExitApp) {
  const scene = await createSceneBase(engine, canvas);
  create3DDialog(scene, "server");

  const assetList = [
    { key: "server_rack", file: "server_rack.glb" },
    { key: "misc", file: "misc.glb" },
    { key: "nas", file: "nas.glb" },
    { key: "ups", file: "ups.glb" },
    { key: "console", file: "console.glb" },
    { key: "server", file: "server.glb" },
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
      const root = res.meshes[0] || null;
      res.meshes.forEach((m) => (m.isPickable = true));
      scene.__app.loaded[a.key] = { key: a.key, root, meshes: res.meshes };
    } catch (e) {
      console.warn(e);
    }
  }

  applyComponentScale(scene.__app.loaded);
  placeServerRackAndItems(scene.__app.table, scene.__app.loaded);
  if (scene.__app.table)
    autoPlacePartsOnTable(scene.__app.table, scene.__app.loaded);

  const rack = scene.__app.loaded["server_rack"];
  if (rack && rack.root) {
    rack.root.position.y = 0.2;
  }

  if (scene.getPhysicsEngine()) {
    Object.keys(scene.__app.loaded).forEach((key) => {
      const item = scene.__app.loaded[key];
      if (item.root) {
        try {
          const massValue = key === "server_rack" ? 0 : 1;
          item.root.physicsImpostor = new BABYLON.PhysicsImpostor(
            item.root,
            BABYLON.PhysicsImpostor.BoxImpostor,
            { mass: massValue, friction: 0.5, restitution: 0.1 },
            scene
          );
        } catch (e) {}
      }
    });
  }

  scene.__app.slots = detectSlots(scene);
  try {
    attachInteractions(scene);
  } catch (e) {}
  try {
    const order = ["misc", "nas", "ups", "console", "server"];
    scene.__tutorial = createTutorialManager(scene, order);
  } catch (e) {}

  // --- LOGIC RESET BARANG (GENERIC) ---
  const initialStates = [];
  function saveInitialStates() {
    Object.values(scene.__app.loaded).forEach((item) => {
      if (item.root) {
        initialStates.push({
          mesh: item.root,
          position: item.root.position.clone(),
          rotation: item.root.rotationQuaternion
            ? item.root.rotationQuaternion.clone()
            : item.root.rotation.clone(),
        });
      }
    });
  }

  function handleResetObjects() {
    console.log("🔄 Resetting objects...");
    initialStates.forEach((state) => {
      const mesh = state.mesh;
      if (!mesh) return;

      mesh.setParent(null); // PENTING: LEPAS PARENT

      if (mesh.physicsImpostor) {
        mesh.physicsImpostor.setLinearVelocity(BABYLON.Vector3.Zero());
        mesh.physicsImpostor.setAngularVelocity(BABYLON.Vector3.Zero());
        mesh.physicsImpostor.sleep();
        setTimeout(() => mesh.physicsImpostor.wakeUp(), 50);
      }

      mesh.position.copyFrom(state.position);
      if (mesh.rotationQuaternion)
        mesh.rotationQuaternion.copyFrom(state.rotation);
      else mesh.rotation.copyFrom(state.rotation);

      mesh.computeWorldMatrix(true);
    });
  }

  saveInitialStates();

  // --- HUD ---
  createHUD(
    scene,
    () => {
      if (onExitApp) onExitApp();
      else window.location.reload();
    },
    handleResetObjects
  );

  return scene;
}

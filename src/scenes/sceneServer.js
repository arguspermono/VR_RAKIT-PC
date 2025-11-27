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

  // --- LOGIC RESET BARANG (FIXED) ---
  const initialStates = [];
  function saveInitialStates() {
    Object.values(scene.__app.loaded).forEach((item) => {
      if (item.root) {
        initialStates.push({
          key: item.key,
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
    console.log("🔄 Resetting Server objects (Full Reset)...");

    const slots = scene.__app.slots;
    if (slots) {
      for (const key in slots) {
        const slot = slots[key];
        slot.used = false;
        if (slot.mesh) slot.mesh.setEnabled(true);
      }
    }

    initialStates.forEach((state) => {
      const mesh = state.mesh;
      if (!mesh) return;

      mesh.setParent(null);
      mesh.isPickable = true;

      if (!mesh.physicsImpostor || mesh.physicsImpostor.isDisposed) {
        const massValue = state.key === "server_rack" ? 0 : 1;
        mesh.physicsImpostor = new BABYLON.PhysicsImpostor(
          mesh,
          BABYLON.PhysicsImpostor.BoxImpostor,
          { mass: massValue, friction: 0.5, restitution: 0.1 },
          scene
        );
      } else {
        mesh.physicsImpostor.setLinearVelocity(BABYLON.Vector3.Zero());
        mesh.physicsImpostor.setAngularVelocity(BABYLON.Vector3.Zero());
        mesh.physicsImpostor.wakeUp();
      }

      mesh.position.copyFrom(state.position);
      if (mesh.rotationQuaternion)
        mesh.rotationQuaternion.copyFrom(state.rotation);
      else mesh.rotation.copyFrom(state.rotation);

      mesh.computeWorldMatrix(true);
    });

    if (scene.__tutorial && typeof scene.__tutorial.reset === "function") {
      scene.__tutorial.reset();
      console.log("✅ Tutorial Logic Reset to Step 0");
    }
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

  // =========================================================
  // 🔥 FIX VR: Inisialisasi Ulang WebXR
  // =========================================================
  // try {
  //   const floorMesh = scene.getMeshByName("collider_lantai");

  //   const xr = await scene.createDefaultXRExperienceAsync({
  //     floorMeshes: floorMesh ? [floorMesh] : [],
  //     disableTeleportation: false,
  //     uiOptions: {
  //       sessionMode: "immersive-vr",
  //     },
  //   });

  //   scene.__app.xr = xr;
  //   console.log("✅ VR Initialized for Server Scene");
  // } catch (e) {
  //   console.warn("❌ VR Not Supported in Server Scene:", e);
  // }

  return scene;
}

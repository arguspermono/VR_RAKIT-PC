// src/scenes/scenePC.js
import { createSceneBase } from "../core/sceneBase.js";
import { attachInteractions } from "../core/interactions.js";
import { createTutorialManager } from "../core/tutorialManager.js";
import { createHUD } from "../ui/uiButtons.js";
import { applyComponentScale, autoPlacePartsOnTable } from "../core/utils.js";
import { detectSlots } from "../core/slots.js";
import { create3DDialog } from "../ui/tutorial3D.js";

// MENERIMA PARAMETER onExitApp
export async function createScenePC(engine, canvas, onExitApp) {
  const scene = await createSceneBase(engine, canvas);
  create3DDialog(scene, "pc");

  const assetList = [
    { key: "case", file: "pc_case.glb" },
    { key: "mobo", file: "motherboard.glb" },
    { key: "cpu", file: "processor.glb" },
    { key: "gpu", file: "GPU.glb" },
    { key: "ram1_pc", file: "ram_1_pc.glb" },
    { key: "ram2_pc", file: "ram_2_pc.glb" },
    { key: "hdd", file: "hardisk.glb" },
    { key: "psu", file: "PSU.glb" },
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
      res.meshes.forEach((m) => {
        m.isPickable = true;
        m.checkCollisions = true;
      });
      scene.__app.loaded[a.key] = { key: a.key, root, meshes: res.meshes };

      if (scene.getPhysicsEngine() && root) {
        const massValue = a.key === "case" ? 0 : 1;
        root.physicsImpostor = new BABYLON.PhysicsImpostor(
          root,
          BABYLON.PhysicsImpostor.BoxImpostor,
          { mass: massValue, friction: 0.5, restitution: 0.1 },
          scene
        );
      }
    } catch (e) {
      console.warn(e);
    }
  }

  applyComponentScale(scene.__app.loaded);
  if (scene.__app.table)
    autoPlacePartsOnTable(scene.__app.table, scene.__app.loaded);

  const pcCase = scene.__app.loaded["case"];
  if (pcCase && pcCase.root && scene.__app.table) {
    const tableBounds = scene.__app.table.getBoundingInfo().boundingBox;
    pcCase.root.position.y = tableBounds.maximumWorld.y + 0.02;
  }

  scene.__app.slots = detectSlots(scene);
  try {
    attachInteractions(scene);
  } catch (e) {}
  try {
    scene.__tutorial = createTutorialManager(scene);
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

  saveInitialStates(); // Simpan posisi awal

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

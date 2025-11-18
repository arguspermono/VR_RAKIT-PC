// src/scenes/scenePC.js
import { createSceneBase } from "../core/sceneBase.js";
import { attachInteractions } from "../core/interactions.js";
import { createTutorialManager } from "../core/tutorialManager.js";
import { createHUD } from "../ui/uiButtons.js";
import { resetScene } from "../app.js";
import { applyComponentScale, autoPlacePartsOnTable } from "../core/utils.js";
import { detectSlots } from "../core/slots.js";
import { create3DDialog } from "../ui/tutorial3D.js";

export async function createScenePC(engine, canvas) {
  // 1. Load Base Scene
  const scene = await createSceneBase(engine, canvas);

  // --- 2. PANGGIL DIALOG TUTORIAL ---
  create3DDialog(scene, "pc");

  // 3. Load PC-specific assets
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
        try {
          // Casing tetap Mass 0 (Statis)
          const massValue = a.key === "case" ? 0 : 1;

          root.physicsImpostor = new BABYLON.PhysicsImpostor(
            root,
            BABYLON.PhysicsImpostor.BoxImpostor,
            { mass: massValue, friction: 0.5, restitution: 0.1 },
            scene
          );
        } catch (e) {
          console.warn("Failed adding physics to", a.key, e);
        }
      }
    } catch (e) {
      console.warn("Failed to load", a.file, e);
    }
  }

  applyComponentScale(scene.__app.loaded);
  if (scene.__app.table)
    autoPlacePartsOnTable(scene.__app.table, scene.__app.loaded);

  // --- PERBAIKAN POSISI CASING PC ---
  const pcCase = scene.__app.loaded["case"];
  if (pcCase && pcCase.root && scene.__app.table) {
    // Ambil tinggi permukaan meja
    const tableBounds = scene.__app.table.getBoundingInfo().boundingBox;

    // UPDATE: Naikkan sedikit (+ 0.02) agar tidak tenggelam
    pcCase.root.position.y = tableBounds.maximumWorld.y + 0.02;
  }

  // detect slots, interactions, tutorial
  scene.__app.slots = detectSlots(scene);
  try {
    attachInteractions(scene);
  } catch (e) {
    console.warn(e);
  }
  try {
    scene.__tutorial = createTutorialManager(scene);
  } catch (e) {}

  // HUD
  createHUD(
    scene,
    () => window.location.reload(),
    () => resetScene()
  );

  return scene;
}

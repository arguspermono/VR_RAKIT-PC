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

  // CAMERA
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

  // PHYSICS
  if (typeof Ammo === "function") {
    await Ammo();
    const plugin = new BABYLON.AmmoJSPlugin(true, Ammo);
    scene.enablePhysics(new BABYLON.Vector3(0, -9.81, 0), plugin);
    console.log("✔ Ammo Physics Enabled");
  }

  // LOAD ENV
  const lab = await BABYLON.SceneLoader.ImportMeshAsync(
    "",
    "assets/",
    "computer_lab.glb",
    scene
  );
  lab.meshes.forEach((m) => (m.checkCollisions = true));

  const tableMesh = lab.meshes.find((m) => m.name.includes("LongTable"));

  // LOAD COMPONENTS
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
    const res = await BABYLON.SceneLoader.ImportMeshAsync(
      "",
      "assets/",
      a.file,
      scene
    );

    const root = res.meshes[0];
    res.meshes.forEach((m) => (m.isPickable = true));

    loaded[a.key] = {
      key: a.key,
      root,
      meshes: res.meshes,
    };

    // basic impostor
    if (scene.getPhysicsEngine()) {
      const imp = new BABYLON.PhysicsImpostor(
        root,
        BABYLON.PhysicsImpostor.BoxImpostor,
        { mass: a.key === "case" ? 0 : 1 },
        scene
      );
      root.physicsImpostor = imp;
    }
  }

  applyComponentScale(loaded);
  autoPlacePartsOnTable(tableMesh, loaded);

  scene.__app = {
    camera,
    table: tableMesh,
    loaded,
    slots: {},
    xr: null,
  };

  scene.__app.slots = detectSlots(scene);
  setupColliders(scene);

  // XR
  try {
    const xr = await scene.createDefaultXRExperienceAsync({
      floorMeshes: scene.meshes.filter((m) => m.checkCollisions),
    });

    xr.featuresManager.enableFeature(
      BABYLON.WebXRFeatureName.POINTER_SELECTION,
      "stable",
      { enablePointerSelectionOnAllControllers: true }
    );

    scene.__app.xr = xr;
  } catch (e) {
    console.warn("XR Init failed", e);
  }

  return scene;
}

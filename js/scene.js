// project/src/scene.js
import {
  findMeshByName,
  autoPlacePartsOnTable,
  applyComponentScale,
} from "./utils.js";

export async function createScene(engine, canvas) {
  const scene = new BABYLON.Scene(engine);
  scene.clearColor = new BABYLON.Color3(0.86, 0.9, 0.95);
  scene.collisionsEnabled = true;

  // -----------------------------------------------------------
  // CAMERA (FPS)
  // -----------------------------------------------------------
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

  // -----------------------------------------------------------
  // LOAD ENVIRONMENT (computer_lab.glb)
  // -----------------------------------------------------------
  const lab = await BABYLON.SceneLoader.ImportMeshAsync(
    "",
    "assets/",
    "computer_lab.glb",
    scene
  );

  lab.meshes.forEach((m) => (m.checkCollisions = true));

  const tableMesh =
    lab.meshes.find((m) => m.name.includes("LongTable")) || null;

  console.log("TABLE FOUND:", tableMesh?.name);

  // -----------------------------------------------------------
  // LOAD ALL COMPONENTS
  // -----------------------------------------------------------
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
        m.checkCollisions = false;
      });
    } catch (e) {
      console.warn(`Failed to load ${a.key}:`, e);
    }
  }

  // -----------------------------------------------------------
  // SCALE COMPONENTS
  // -----------------------------------------------------------
  applyComponentScale(loaded);

  // -----------------------------------------------------------
  // AUTO PLACE ALL PARTS ON TABLE
  // -----------------------------------------------------------
  autoPlacePartsOnTable(tableMesh, loaded);

  // -----------------------------------------------------------
  // STORE INTO scene.__app FOR OTHER MODULES
  // -----------------------------------------------------------
  scene.__app = {
    camera,
    table: tableMesh,
    loaded,
  };

  // -----------------------------------------------------------
  // ENABLE WEBXR + LASER POINTER
  // -----------------------------------------------------------
  scene
    .createDefaultXRExperienceAsync({
      floorMeshes: scene.meshes.filter((m) => m.checkCollisions),
    })
    .then((xr) => {
      console.log("✔ WebXR Ready");

      // Aktifkan laser pointer
      xr.pointerSelection =
        xr.pointerSelection ||
        xr.featuresManager.enableFeature(
          BABYLON.WebXRFeatureName.POINTER_SELECTION,
          "stable"
        );

      xr.pointerSelection.enablePointerSelection();

      // Debug: cek controller
      xr.input.onControllerAddedObservable.add((controller) => {
        console.log(
          "🕹 Controller detected:",
          controller.inputSource.handedness
        );
      });
    });

  return scene;
}

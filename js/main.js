import { setupGrabSystem } from "./grabSystem.js";

const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

const createScene = async () => {
  const scene = new BABYLON.Scene(engine);
  scene.clearColor = new BABYLON.Color3(0.85, 0.9, 1.0);

  const camera = new BABYLON.UniversalCamera(
    "camera",
    new BABYLON.Vector3(0, 1.6, -3),
    scene
  );
  camera.attachControl(canvas, true);

  const light = new BABYLON.HemisphericLight(
    "light",
    new BABYLON.Vector3(0, 1, 0),
    scene
  );

  const ground = BABYLON.MeshBuilder.CreateGround(
    "ground",
    { width: 6, height: 6 },
    scene
  );
  const gMat = new BABYLON.StandardMaterial("gMat", scene);
  gMat.diffuseColor = new BABYLON.Color3(0.7, 0.7, 0.7);
  ground.material = gMat;

  // Optional background
  BABYLON.SceneLoader.ImportMeshAsync("", "assets/", "computer_lab.glb", scene)
    .then(() => console.log("Background loaded"))
    .catch(() => console.warn("Background not found"));

  // Buat kotak yang bisa digrab
  const box = BABYLON.MeshBuilder.CreateBox("grabBox", { size: 0.25 }, scene);
  box.position = new BABYLON.Vector3(0, 0.25, 0);
  const boxMat = new BABYLON.StandardMaterial("boxMat", scene);
  boxMat.diffuseColor = new BABYLON.Color3(0.2, 0.5, 1);
  box.material = boxMat;

  // Buat target snap
  const snapTarget = BABYLON.MeshBuilder.CreateBox(
    "snapTarget",
    { size: 0.3 },
    scene
  );
  snapTarget.position = new BABYLON.Vector3(0.8, 0.18, 0);
  const snapMat = new BABYLON.StandardMaterial("snapMat", scene);
  snapMat.diffuseColor = new BABYLON.Color3(0.2, 1, 0.2);
  snapMat.alpha = 0.4;
  snapTarget.material = snapMat;

  // Aktifkan WebXR
  const xr = await scene.createDefaultXRExperienceAsync({
    floorMeshes: [ground],
  });

  // Gunakan sistem grab modular
  setupGrabSystem(scene, xr, box, snapTarget);

  return scene;
};

createScene().then((scene) => {
  engine.runRenderLoop(() => scene.render());
});

window.addEventListener("resize", () => engine.resize());

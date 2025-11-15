// project/src/main.js
import { createScene } from "./scene.js";
import { setupControls } from "./controls.js";
import { attachInteractions } from "./interactions.js";

const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

(async function init() {
  const scene = await createScene(engine, canvas);

  // WASD + XR
  const controls = setupControls(scene);

  // Grab + Snap interactions
  attachInteractions(scene);

  engine.runRenderLoop(() => scene.render());
})();

window.addEventListener("resize", () => engine.resize());

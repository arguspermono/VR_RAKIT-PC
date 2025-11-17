import { createScene } from "./scene.js";
import { setupControls } from "./controls.js";
import { attachInteractions } from "./interactions.js";
import { createTutorialManager } from "./tutorialManager.js";

const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

(async function init() {
  const scene = await createScene(engine, canvas);

  setupControls(scene);
  attachInteractions(scene);

  // Tutorial system
  const tutorial = createTutorialManager(scene);
  scene.__tutorial = tutorial;

  engine.runRenderLoop(() => scene.render());
})();

window.addEventListener("resize", () => engine.resize());

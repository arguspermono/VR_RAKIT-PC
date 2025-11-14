import { createScene } from "./scene.js";

const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

let scene = await createScene(engine, canvas);

engine.runRenderLoop(() => {
  scene.render();
});

window.addEventListener("resize", function () {
  engine.resize();
});

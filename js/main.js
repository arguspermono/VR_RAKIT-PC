import { createScene } from "./scene.js";

const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

async function start() {
  const scene = await createScene(engine, canvas);
  engine.runRenderLoop(() => scene.render());
}

start();
window.addEventListener("resize", () => engine.resize());

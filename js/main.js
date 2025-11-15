import { createScene } from "./scene.js";

const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

// UI elements
const menu = document.getElementById("mainMenu");
const startBtn = document.getElementById("startBtn");

let scene = null;

// === START ONLY AFTER BUTTON CLICK ===
startBtn.addEventListener("click", async () => {
  // hide menu
  menu.style.display = "none";

  // Create Babylon scene
  scene = await createScene(engine, canvas);

  // Start rendering
  engine.runRenderLoop(() => {
    scene.render();
  });

  engine.resize();
});

// Keep canvas sized
window.addEventListener("resize", () => engine.resize());

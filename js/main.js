import { createScene } from "./scene.js";

const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

// Ambil elemen menu
const menu = document.getElementById("mainMenu");
const startBtn = document.getElementById("startBtn");

let scene = null;

// Jangan buat scene apapun sebelum tombol diklik

startBtn.addEventListener("click", async () => {
  // Hide main menu
  menu.style.display = "none";

  // Create the real scene
  scene = await createScene(engine, canvas);

  engine.runRenderLoop(() => {
    scene.render();
  });
});

// Resize handler
window.addEventListener("resize", () => {
  engine.resize();
});

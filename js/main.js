// import { createScene } from "./scene.js"
// import { createMainMenu } from "./mainmenu.js"

// const canvas = document.getElementById("renderCanvas");
// const engine = new BABYLON.Engine(canvas, true);

// // Ambil elemen menu
// const menu = document.getElementById("mainMenu");
// const startBtn = document.getElementById("startBtn");

// let scene = null;

// // Jangan buat scene apapun sebelum tombol diklik

// startBtn.addEventListener("click", async () => {
//   // Hide main menu
//   menu.style.display = "none";

//   // Create the real scene
//   scene = await createScene(engine, canvas);

//   engine.runRenderLoop(() => {
//     scene.render();
//   });
// });

// // Resize handler
// window.addEventListener("resize", () => {
//   engine.resize();
// });

import { createMainMenu } from "./mainmenu.js";
import { createScene } from "./scene.js";

const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

let scene = new BABYLON.Scene(engine);

// tampilkan main menu
await createMainMenu({
  scene,
  onStart: async () => {
    scene = await createScene(engine, canvas);
  }
});

engine.runRenderLoop(() => {
  scene.render();
});

window.addEventListener("resize", () => engine.resize());

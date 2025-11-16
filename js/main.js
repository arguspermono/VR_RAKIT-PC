let canvas = document.getElementById("renderCanvas");
let engine = new BABYLON.Engine(canvas, true);

let scene = new BABYLON.Scene(engine);

// tampilkan main menu dahulu
createMainMenu({
  scene,
  onStart: async () => {
    scene.dispose(); // hapus scene menu
    scene = await createScene(engine, canvas); // scene utama
  }
});

// render
engine.runRenderLoop(() => {
  scene.render();
});

window.addEventListener("resize", () => engine.resize());

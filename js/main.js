const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

// =========================
// === 1) BUAT MENU SCENE ===
// =========================
let menuScene = new BABYLON.Scene(engine);
menuScene.clearColor = new BABYLON.Color3(0.1, 0.1, 0.1);

// Kamera Menu
const menuCamera = new BABYLON.UniversalCamera(
    "menuCam",
    new BABYLON.Vector3(0, 1.5, -3),
    menuScene
);
menuCamera.setTarget(BABYLON.Vector3.Zero());
menuCamera.attachControl(canvas, true);

// ================================
// === 2) BUAT XR DI MENU SCENE ===
// ================================
let xrHelper = null;

menuScene.createDefaultXRExperienceAsync({
    uiOptions: { sessionMode: "immersive-vr" },
    optionalFeatures: true
}).then(xr => {
    xrHelper = xr;
});

// ==============================
// === 3) BUAT MAIN MENU 3D UI ===
// ==============================
createMainMenu({
    scene: menuScene,
    xr: xrHelper,
    onStart: async () => {
        console.log("Start button pressed!");

        const gameScene = await createScene(engine, canvas);

        menuScene.dispose();
        menuScene = null;

        engine.runRenderLoop(() => gameScene.render());

        if (xrHelper) {
            xrHelper.baseExperience.enterXRAsync("immersive-vr");
        }
    }
});


// =============================
// === 4) Render loop = Menu ===
// =============================
engine.runRenderLoop(() => {
    if (menuScene) menuScene.render();
});

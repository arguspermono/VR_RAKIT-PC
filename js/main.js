const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

// =========================
// === 1) MENU SCENE =======
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
// === 2) XR HANYA DIBUAT DI SINI ==
// ================================
let xrHelper = null;

menuScene.createDefaultXRExperienceAsync({
    uiOptions: { sessionMode: "immersive-vr" },
    optionalFeatures: true
}).then(xr => {
    xrHelper = xr;

    // Buat UI 3D setelah XR siap → aman
    createMainMenu({
        scene: menuScene,
        xr: xrHelper,
        onStart: startGame
    });
});

// =============================
// === 3) Render Menu Loop =====
// =============================
engine.runRenderLoop(() => {
    if (menuScene) menuScene.render();
});

// ==============================
// === 4) MULAI GAMEPLAY =========
// ==============================
async function startGame() {

    console.log("Start button pressed!");

    const gameScene = await createScene(engine, canvas);

    // Hapus menu
    menuScene.dispose();
    menuScene = null;

    // Pindahkan XR tanpa bikin baru
    await xrHelper.baseExperience.enterXRAsync(
        "immersive-vr",
        "viewer", // paling aman
        gameScene
    );

    engine.runRenderLoop(() => {
        gameScene.render();
    });
}

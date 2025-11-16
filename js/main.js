const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

let menuScene = new BABYLON.Scene(engine);

// Warna background menu
menuScene.clearColor = new BABYLON.Color3(0.1, 0.1, 0.1);

// Kamera menu
let menuCamera = new BABYLON.UniversalCamera("menuCam",
    new BABYLON.Vector3(0, 1, -3),
    menuScene
);
menuCamera.setTarget(BABYLON.Vector3.Zero());
menuCamera.attachControl(canvas, true);

// === 🔥 WebXR dibuat di scene menu (biar tombol VR langsung ada) ===
let xrHelper = null;
menuScene.createDefaultXRExperienceAsync({
    uiOptions: { sessionMode: "immersive-vr" },
    optionalFeatures: true
}).then(xr => {
    xrHelper = xr;    // simpan, nanti dipakai lagi
});

// === Render loop untuk menu ===
engine.runRenderLoop(() => {
    if (menuScene) menuScene.render();
});

// === START BUTTON ===
document.getElementById("startBtn").addEventListener("click", async () => {
    // Load scene gameplay
    const gameScene = await createScene(engine, canvas);

    // Hentikan render menu, ganti ke game scene
    menuScene.dispose();
    menuScene = null;

    // Render loop baru
    engine.runRenderLoop(() => {
        if (gameScene) gameScene.render();
    });

    // === Pindahkan XR helper ke scene gameplay ===
    if (xrHelper) {
        xrHelper.baseExperience.enterXRAsync("immersive-vr");
    }
});

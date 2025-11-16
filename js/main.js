const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

// ===============
// MENU SCENE
// ===============
let menuScene = new BABYLON.Scene(engine);
menuScene.clearColor = new BABYLON.Color3(0.1, 0.1, 0.1);

const menuCamera = new BABYLON.UniversalCamera(
    "menuCam",
    new BABYLON.Vector3(0, 1.5, -3),
    menuScene
);
menuCamera.setTarget(BABYLON.Vector3.Zero());
menuCamera.attachControl(canvas, true);

// ===============
// XR MENU
// ===============
menuScene.createDefaultXRExperienceAsync({
    uiOptions: { sessionMode: "inline" },   // PAKAI "inline" AGAR TIDAK CRASH
    optionalFeatures: true
}).then(menuXR => {

    // setelah XR siap, buat UI menu
    createMainMenu({
        scene: menuScene,
        onStart: startGame
    });

});

// ===============
// Render Menu
// ===============
engine.runRenderLoop(() => {
    if (menuScene) menuScene.render();
});

// ===============
// START GAME
// ===============
async function startGame() {

    console.log("Start pressed!");

    // load scene game
    const gameScene = await createScene(engine, canvas);

    // hapus menu
    menuScene.dispose();
    menuScene = null;

    // buat XR BARU untuk game
    const gameXR = await gameScene.createDefaultXRExperienceAsync({
        uiOptions: { sessionMode: "immersive-vr" }, 
        optionalFeatures: true
    });

    // render game
    engine.runRenderLoop(() => gameScene.render());
}

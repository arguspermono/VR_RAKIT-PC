const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

// MAIN MENU SCENE
let menuScene = new BABYLON.Scene(engine);
menuScene.clearColor = new BABYLON.Color3(0.1, 0.1, 0.1);

const menuCamera = new BABYLON.UniversalCamera(
    "menuCam",
    new BABYLON.Vector3(0, 1.5, -3),
    menuScene
);
menuCamera.setTarget(BABYLON.Vector3.Zero());
menuCamera.attachControl(canvas, true);

let xrHelper = null;

// XR untuk MAIN MENU pakai "inline"
menuScene.createDefaultXRExperienceAsync({
    uiOptions: { sessionMode: "inline" },
    optionalFeatures: true
}).then(menuXR => {
    xrHelper = menuXR;

    createMainMenu({
        scene: menuScene,
        onStartPC: () => startGame(createScenePC),
        onStartLaptop: () => startGame(createSceneLaptop),
        onStartServer: () => startGame(createSceneServer)
    });
});

// Render Menu
engine.runRenderLoop(() => {
    if (menuScene) menuScene.render();
});

// START GAME FUNCTION
async function startGame(createSceneFunction) {
    console.log("Start pressed!");

    const newScene = await createSceneFunction(engine, canvas);

    // Hapus menu
    menuScene.dispose();
    menuScene = null;

    // Mulai XR di scene BARU
    const xr = await newScene.createDefaultXRExperienceAsync({
        uiOptions: { sessionMode: "immersive-vr" },
        optionalFeatures: true
    });

    engine.runRenderLoop(() => newScene.render());
}
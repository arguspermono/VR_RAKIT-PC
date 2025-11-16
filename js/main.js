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

// =============================
// BLACK TRANSPARENT OVERLAY (Darkening Layer)
// =============================
const overlay = BABYLON.MeshBuilder.CreatePlane(
    "blackOverlay",
    { width: 5, height: 3 },
    menuScene
);

overlay.position = new BABYLON.Vector3(0, 1.5, 1);  
overlay.isPickable = false;

// Material transparan
const overlayMat = new BABYLON.StandardMaterial("overlayMat", menuScene);
overlayMat.diffuseColor = new BABYLON.Color3(0, 0, 0); // hitam
overlayMat.alpha = 0.45; // transparansi (0.0–1.0)
overlay.material = overlayMat;

// Always face camera
menuScene.onBeforeRenderObservable.add(() => {
    overlay.position = menuCamera.position
        .add(menuCamera.getForwardRay().direction.scale(1.2));

    overlay.lookAt(menuCamera.position);
});

// =============================
// LOAD BACKGROUND GLB
// =============================
BABYLON.SceneLoader.Append(
    "assets/", "computer_lab.glb",
    menuScene,
    (scene) => {
        console.log("Computer Lab Loaded for Menu");

        scene.meshes.forEach(mesh => {
            mesh.isPickable = false;
            mesh.checkCollisions = false;
        });

        const root = scene.meshes[0];
        if (root) {
            root.position = new BABYLON.Vector3(0, 0, 2);
            root.scaling = new BABYLON.Vector3(1, 1, 1);
        }

        const light = new BABYLON.HemisphericLight(
            "menuLight",
            new BABYLON.Vector3(0, 1, 0),
            menuScene
        );
        light.intensity = 1.2;
    }
);

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
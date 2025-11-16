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

    const panel = createMainMenu({
        scene: menuScene,
        onStartPC: () => startGame(createScenePC),
        onStartLaptop: () => startGame(createSceneLaptop),
        onStartServer: () => startGame(createSceneServer)
    });

    // buat anchor (TransformNode) dan link panel ke anchor
    const anchor = new BABYLON.TransformNode("menuAnchor", menuScene);
    if (panel.linkToTransformNode) {
        panel.linkToTransformNode(anchor);
    } else if (panel.linkToTransformNode === undefined && panel.linkedTransformNode === undefined) {
        // beberapa versi GUI pakai cara berbeda; linkToTransformNode biasanya ada
        // tapi bila tidak, kita bisa set panel.position to anchor.position on update (fallback)
    }

    // update posisi/rotasi anchor setiap frame supaya panel selalu menghadap camera
    menuScene.onBeforeRenderObservable.add(() => {
        // forward direction (unit vector)
        const forward = menuCamera.getForwardRay().direction;

        // target position: 1.2m di depan kamera, sedikit turun
        const targetPos = menuCamera.position
            .add(forward.scale(1.2))
            .add(new BABYLON.Vector3(0, -0.2, 0));

        anchor.position.copyFrom(targetPos);

        // biar anchor menghadap kamera (transform node punya lookAt)
        anchor.lookAt(menuCamera.position);
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
// src/ui/mainmenu.js
export function createMainMenu({
  scene,
  onStartPC,
  onStartLaptop,
  onStartServer,
}) {
  const manager = new BABYLON.GUI.GUI3DManager(scene);

  // ============================================================
  // LOAD BACKGROUND ROOM (GLB)
  // ============================================================
  BABYLON.SceneLoader.ImportMesh(
    "",
    "./assets/",
    "computer_lab.glb",
    scene,
    (meshes) => {
      meshes.forEach((m) => {
        m.scaling = new BABYLON.Vector3(1, 1, 1);
        m.position = new BABYLON.Vector3(0, 0, 0);
      });

      // camera fix so menu is nicely framed
      const cam = scene.activeCamera;
      cam.position = new BABYLON.Vector3(0, 1.6, 1);
      cam.setTarget(new BABYLON.Vector3(0, 1.3, 2));
      cam.applyGravity = false;
      cam.checkCollisions = false;
    }
  );

  // ============================================================
  // 3D MENU PANEL
  // ============================================================
  const panel = new BABYLON.GUI.StackPanel3D();
  manager.addControl(panel);
  panel.position = new BABYLON.Vector3(0, 1, 4);

  // ============================================================
  // TITLE TEXT (Sudah Diperbaiki)
  // ============================================================
  const titlePlane = BABYLON.MeshBuilder.CreatePlane(
    "titlePlane",
    { width: 3.5, height: 0.8 },
    scene
  );

  titlePlane.position = new BABYLON.Vector3(0, 2.2, 4);

  const titleTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(
    titlePlane,
    2048,
    512,
    true
  );

  const titleText = new BABYLON.GUI.TextBlock();
  titleText.text =
    "Selamat Datang di 'CraftLab', Dunia Simulasi Perakitan Komputer";
  titleText.color = "white";
  titleText.fontSize = 130;
  titleText.fontStyle = "bold";
  titleText.resizeToFit = true;
  titleText.textWrapping = true;
  titleText.paddingTop = "10px";
  titleText.paddingBottom = "10px";
  titleText.paddingLeft = "20px";
  titleText.paddingRight = "20px";

  titleTexture.addControl(titleText);

  // ============================================================
  // BUTTONS
  // ============================================================
  const btnPC = new BABYLON.GUI.HolographicButton("startPC");
  btnPC.text = "Mulai Perakitan PC";
  panel.addControl(btnPC);
  btnPC.onPointerUpObservable.add(() => onStartPC && onStartPC());

  const btnLaptop = new BABYLON.GUI.HolographicButton("startLaptop");
  btnLaptop.text = "Mulai Perakitan Laptop";
  panel.addControl(btnLaptop);
  btnLaptop.onPointerUpObservable.add(() => onStartLaptop && onStartLaptop());

  const btnServer = new BABYLON.GUI.HolographicButton("startServer");
  btnServer.text = "Mulai Perakitan Server";
  panel.addControl(btnServer);
  btnServer.onPointerUpObservable.add(() => onStartServer && onStartServer());

  // ============================================================
  // ENABLE VR LANGSUNG DI MAIN MENU
  // ============================================================
  scene.createDefaultXRExperienceAsync({
    floorMeshes: [],
    disableTeleportation: true,
  });

  return panel;
}

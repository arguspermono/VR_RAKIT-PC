function createMainMenu({ scene, onStartPC, onStartLaptop, onStartServer }) {

  const manager = new BABYLON.GUI.GUI3DManager(scene);

  // PANEL 3D
  const panel = new BABYLON.GUI.StackPanel3D();
  panel.margin = 0.2;
  panel.orientation = BABYLON.GUI.Container3D.VERTICAL;

  manager.addControl(panel);
  panel.position = new BABYLON.Vector3(0, 1.4, 2);
  panel.scaling = new BABYLON.Vector3(1.2, 1.2, 1.2);

  // ============================
  // GLASS BACKGROUND
  // ============================
  const glass = BABYLON.MeshBuilder.CreatePlane("glassBg", { width: 2, height: 3 }, scene);

  const glassMat = new BABYLON.StandardMaterial("glassMat", scene);
  glassMat.diffuseColor = new BABYLON.Color3(1, 1, 1);
  glassMat.alpha = 0.18; // lebih pekat
  glassMat.emissiveColor = new BABYLON.Color3(1, 1, 1);
  glassMat.emissiveIntensity = 0.25;

  glass.material = glassMat;

  // tempel ke panel mesh
  glass.parent = panel.mesh;
  glass.position.z = -0.25; // agak belakang

  // ============================
  // TITLE
  // ============================
  const titlePlane = BABYLON.MeshBuilder.CreatePlane(
    "titlePlane", { width: 1.6, height: 0.5 }, scene
  );
  titlePlane.parent = panel.mesh;
  titlePlane.position = new BABYLON.Vector3(0, 1.15, 0.05);

  const titleUI = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(titlePlane);
  const titleText = new BABYLON.GUI.TextBlock();
  titleText.text = "PC ASSEMBLY";
  titleText.color = "white";
  titleText.fontSize = 82;

  titleUI.addControl(titleText);

  // ============================
  // BUTTON CREATOR (aman)
  // ============================
  function createGlassButton(text, callback) {
    const btn = new BABYLON.GUI.HolographicButton(text);

    // scaling aman → mesh pasti ada setelah addControl
    btn.onReady = () => {
      btn.scaling = new BABYLON.Vector3(0.9, 0.9, 0.9);
    };

    // kaca tombol
    const mat = new BABYLON.StandardMaterial("btnMat", scene);
    mat.diffuseColor = new BABYLON.Color3(1, 1, 1);
    mat.alpha = 0.25;
    mat.emissiveColor = new BABYLON.Color3(1, 1, 1);
    mat.emissiveIntensity = 0.1;

    btn.backMaterial = mat;
    btn.frontMaterial = mat;

    btn.text = text;
    btn.onPointerUpObservable.add(callback);

    panel.addControl(btn); // aman, ini baru attach ke stack

    return btn;
  }

  // ============================
  // ADD BUTTONS (vertical)
  // ============================
  createGlassButton("PC", onStartPC);
  createGlassButton("Laptop", onStartLaptop);
  createGlassButton("Server", onStartServer);

  return panel;
}

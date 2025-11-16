function createMainMenu({ scene, onStartPC, onStartLaptop, onStartServer }) {

  const manager = new BABYLON.GUI.GUI3DManager(scene);

  // PANEL 3D UTAMA
  const panel = new BABYLON.GUI.StackPanel3D();
  panel.margin = 0.3;
  manager.addControl(panel);

  panel.position = new BABYLON.Vector3(0, 1.5, 2);

  // GLASS BACKGROUND
  const glass = BABYLON.MeshBuilder.CreatePlane("glassBg", { width: 2, height: 2.8 }, scene);
  const glassMat = new BABYLON.StandardMaterial("glassMat", scene);

  glassMat.diffuseColor = new BABYLON.Color3(1, 1, 1);
  glassMat.alpha = 0.18;
  glassMat.specularColor = new BABYLON.Color3(1, 1, 1);
  glassMat.environmentIntensity = 0.8;
  glassMat.backFaceCulling = false;

  glass.material = glassMat;
  glass.parent = panel.mesh;
  glass.position.z = -0.05;


  // ============================
  // TITLE (Teknik Baru - AGAR WORK)
  // ============================

  // Plane kecil untuk title
  const titlePlane = BABYLON.MeshBuilder.CreatePlane("titlePlane", { width: 1.6, height: 0.4 }, scene);
  titlePlane.parent = panel.mesh;
  titlePlane.position = new BABYLON.Vector3(0, 1.1, 0);

  const titleUI = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(titlePlane);

  const titleText = new BABYLON.GUI.TextBlock();
  titleText.text = "PC ASSEMBLY";
  titleText.color = "white";
  titleText.fontSize = 82;
  titleText.fontStyle = "bold";
  titleUI.addControl(titleText);


  // ============================
  // GLASS BUTTON FACTORY
  // ============================
  function createGlassButton(text, callback) {
    const btn = new BABYLON.GUI.HolographicButton(text);

    const mat = new BABYLON.StandardMaterial("btnMat", scene);
    mat.diffuseColor = new BABYLON.Color3(1, 1, 1);
    mat.alpha = 0.25;
    mat.specularColor = new BABYLON.Color3(1, 1, 1);
    mat.environmentIntensity = 1;

    btn.backMaterial = mat;
    btn.frontMaterial = mat;

    btn.text = text;
    btn.scaling = new BABYLON.Vector3(1.2, 0.45, 1);

    btn.onPointerUpObservable.add(callback);
    panel.addControl(btn);

    return btn;
  }

  // BUTTON SET
  createGlassButton("PC", onStartPC);
  createGlassButton("LAPTOP", onStartLaptop);
  createGlassButton("SERVER", onStartServer);

  return panel;
}

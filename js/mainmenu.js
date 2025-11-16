function createMainMenu({ scene, onStartPC, onStartLaptop, onStartServer }) {

  const manager = new BABYLON.GUI.GUI3DManager(scene);

  // PANEL 3D
  const panel = new BABYLON.GUI.StackPanel3D();
  panel.margin = 0.3;
  manager.addControl(panel);

  panel.position = new BABYLON.Vector3(0, 1.5, 2);

  // PANEL BACKGROUND (GLASS)
  const glass = BABYLON.MeshBuilder.CreatePlane("glassBg", { width: 2, height: 2.8 }, scene);
  const glassMat = new BABYLON.StandardMaterial("glassMat", scene);

  glassMat.diffuseColor = new BABYLON.Color3(1, 1, 1);
  glassMat.alpha = 0.15;                           // Transparan
  glassMat.specularColor = new BABYLON.Color3(1, 1, 1);
  glassMat.emissiveColor = new BABYLON.Color3(1, 1, 1);
  glassMat.backFaceCulling = false;

  glass.material = glassMat;
  glass.parent = panel.mesh;
  glass.position.z = -0.05;                         // Di belakang tombol

  // Titik untuk blur
  glassMat.indexOfRefraction = 0.98;
  glassMat.environmentIntensity = 0.8;

  // === TITLE ===
  const title = new BABYLON.GUI.HolographicSlate("titleBox");
  title.title = "PC ASSEMBLY";
  title.dimensions = new BABYLON.Vector2(1.4, 0.45);
  title.titleBarHeight = 0.001;                    // Hilangkan title bar
  title.content.viewport = new BABYLON.Viewport(0, 0, 1, 1);
  title.backPlate.material.alpha = 0;              // Hilangkan plate belakang
  title.frontPlateMargin = 0.05;

  // Style text
  const titleBlock = new BABYLON.GUI.TextBlock();
  titleBlock.text = "PC ASSEMBLY";
  titleBlock.color = "white";
  titleBlock.fontSize = 68;
  titleBlock.fontStyle = "bold";

  title.content.addControl(titleBlock);

  panel.addControl(title);

  // Helper buat tombol glass
  function createGlassButton(text, callback) {
    const btn = new BABYLON.GUI.HolographicButton(text);

    const mat = new BABYLON.StandardMaterial("glassBtnMat", scene);
    mat.diffuseColor = new BABYLON.Color3(1, 1, 1);
    mat.alpha = 0.23; // lebih gelap
    mat.specularColor = new BABYLON.Color3(1, 1, 1);
    mat.environmentIntensity = 1;
    mat.backFaceCulling = false;

    btn.pointLightColor = new BABYLON.Color3(0, 0, 0);
    btn.backMaterial = mat;
    btn.frontMaterial = mat;

    btn.text = text;
    btn.onPointerUpObservable.add(callback);

    btn.scaling = new BABYLON.Vector3(1.2, 0.4, 1);

    return btn;
  }

  // BUTTON SET
  panel.addControl(createGlassButton("PC", onStartPC));
  panel.addControl(createGlassButton("LAPTOP", onStartLaptop));
  panel.addControl(createGlassButton("SERVER", onStartServer));

  return panel;
}

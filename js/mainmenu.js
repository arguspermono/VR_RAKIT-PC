function createMainMenu({ scene, onStartPC, onStartLaptop, onStartServer }) {

  const manager = new BABYLON.GUI.GUI3DManager(scene);

  // PANEL 3D UTAMA
  const panel = new BABYLON.GUI.StackPanel3D();
  panel.margin = 0.3;
  panel.orientation = BABYLON.GUI.Container3D.VERTICAL;   // ⬅ vertikal
  manager.addControl(panel);

  panel.position = new BABYLON.Vector3(0, 1.5, 2);

  // ============================
  // GLASS BACKGROUND (lebih pekat)
  // ============================
  const glass = BABYLON.MeshBuilder.CreatePlane("glassBg", { width: 2, height: 3 }, scene);
  const glassMat = new BABYLON.StandardMaterial("glassMat", scene);

  glassMat.diffuseColor = new BABYLON.Color3(1, 1, 1);
  glassMat.alpha = 0.28;     // lebih pekat
  glassMat.specularColor = new BABYLON.Color3(1, 1, 1);
  glassMat.environmentIntensity = 1.2;
  glassMat.emissiveColor = new BABYLON.Color3(1,1,1);
  glassMat.emissiveIntensity = 0.15;
  glassMat.backFaceCulling = false;

  glass.material = glassMat;
  glass.parent = panel.mesh;
  glass.position.z = -0.05;


  // ============================
  // TITLE
  // ============================
  const titlePlane = BABYLON.MeshBuilder.CreatePlane(
    "titlePlane", { width: 1.6, height: 0.5 }, scene
  );

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
  // BUTTON FACTORY (anti gepeng)
  // ============================
  function createGlassButton(text, callback) {
    const btn = new BABYLON.GUI.HolographicButton(text);

    // button glass material
    const mat = new BABYLON.StandardMaterial("btnMat", scene);
    mat.diffuseColor = new BABYLON.Color3(1, 1, 1);
    mat.alpha = 0.25;
    mat.specularColor = new BABYLON.Color3(1, 1, 1);
    mat.environmentIntensity = 1;
    mat.backFaceCulling = false;

    btn.backMaterial = mat;
    btn.frontMaterial = mat;

    // label text
    btn.text = text;

    // scale supaya tidak gepeng
    btn.scaling = new BABYLON.Vector3(1, 1, 1);
    btn.mesh.scaling.y = 1.5;   // biar lebih “padat”
    btn.mesh.scaling.x = 1.3;

    btn.onPointerUpObservable.add(callback);
    panel.addControl(btn);

    return btn;
  }

  // BUTTON SET (vertikal)
  createGlassButton("PC", onStartPC);
  createGlassButton("LAPTOP", onStartLaptop);
  createGlassButton("SERVER", onStartServer);

  return panel;
}

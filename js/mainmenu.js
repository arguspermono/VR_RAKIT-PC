function createMainMenu({ scene, onStartPC, onStartLaptop, onStartServer }) {

  const manager = new BABYLON.GUI.GUI3DManager(scene);

  // PANEL 3D UTAMA
  const panel = new BABYLON.GUI.StackPanel3D();
  panel.margin = 0.3;

  // WAJIB!!! → mode vertikal
  panel.orientation = BABYLON.GUI.Container3D.VERTICAL;
  
  manager.addControl(panel);

  // POSISI PANEL → MENGHADAP KAMERA
  panel.position = new BABYLON.Vector3(0, 1.4, 2);
  panel.rotationQuaternion = BABYLON.Quaternion.Identity(); // hadap kamera

  // Besarkan panel mesh (default terlalu kecil)
  panel.scaling = new BABYLON.Vector3(1.2, 1.2, 1.2);


  // ============================
  // GLASS BACKGROUND
  // ============================
  const glass = BABYLON.MeshBuilder.CreatePlane("glassBg", { width: 2, height: 3 }, scene);
  const glassMat = new BABYLON.StandardMaterial("glassMat", scene);

  glassMat.diffuseColor = new BABYLON.Color3(1, 1, 1);
  glassMat.alpha = 0.25;
  glassMat.backFaceCulling = false;
  glassMat.specularColor = new BABYLON.Color3(1, 1, 1);
  glassMat.emissiveColor = new BABYLON.Color3(1,1,1);
  glassMat.emissiveIntensity = 0.15;
  glass.material = glassMat;

  // Tempel glass ke panel
  glass.parent = panel.mesh;
  glass.position.z = -0.1;


  // ============================
  // TITLE (tidak gepeng)
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
  titleUI.addControl(titleText);


  // ============================
  // BUTTON FACTORY (fix hilang)
  // ============================
  function createGlassButton(text, callback) {
    const btn = new BABYLON.GUI.HolographicButton(text);

    // BUTTON SCALE WAJIB (default sangat kecil!)
    btn.scaling = new BABYLON.Vector3(0.8, 0.8, 0.8);

    // KASIH Z-OFFSET → AGAR TIDAK MENYATU DENGAN GLASS (fix tombol hilang)
    btn.position = new BABYLON.Vector3(0, 0, 0.1);

    // Material kaca tombol
    const mat = new BABYLON.StandardMaterial("btnMat", scene);
    mat.diffuseColor = new BABYLON.Color3(1, 1, 1);
    mat.alpha = 0.3;
    mat.backFaceCulling = false;

    btn.backMaterial = mat;
    btn.frontMaterial = mat;

    btn.text = text;
    btn.onPointerUpObservable.add(callback);

    panel.addControl(btn);

    return btn;
  }

  // BUTTON ORDER – pasti vertikal
  createGlassButton("PC", onStartPC);
  createGlassButton("LAPTOP", onStartLaptop);
  createGlassButton("SERVER", onStartServer);

  return panel;
}

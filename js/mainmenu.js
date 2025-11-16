function createMainMenu({ scene, onStartPC, onStartLaptop, onStartServer }) {

  const manager = new BABYLON.GUI.GUI3DManager(scene);

  // PANEL UTAMA ===================================================
  const panel = new BABYLON.GUI.StackPanel3D();
  panel.margin = 0.25;
  panel.orientation = BABYLON.GUI.Container3D.VERTICAL;

  manager.addControl(panel);
  panel.position = new BABYLON.Vector3(0, 1.4, 1.9); 
  panel.scaling = new BABYLON.Vector3(1.2, 1.2, 1.2);


  // GLASS BACKGROUND ==============================================
  const glass = BABYLON.MeshBuilder.CreatePlane("glassBg", { 
    width: 2.3, 
    height: 3 
  }, scene);

  const glassMat = new BABYLON.StandardMaterial("glassMat", scene);
  glassMat.diffuseColor = new BABYLON.Color3(1, 1, 1);
  glassMat.alpha = 0.22;            // lebih pekat
  glassMat.emissiveColor = new BABYLON.Color3(1, 1, 1);
  glassMat.emissiveIntensity = 0.25;

  glass.material = glassMat;

  // tempel ke panel mesh
  glass.parent = panel.mesh;

  // lebih ke belakang → tombol berada di "dalam glass"
  glass.position.z = -0.35;


  // ============================ TITLE =============================
  const titlePlane = BABYLON.MeshBuilder.CreatePlane("titlePlane", { 
    width: 2.2,   // lebih besar
    height: 0.7 
  }, scene);

  titlePlane.parent = panel.mesh;

  // posisinya lebih tinggi sedikit tapi masih dalam kaca
  titlePlane.position = new BABYLON.Vector3(0, 1.2, 0.1);

  const titleUI = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(titlePlane);
  const titleText = new BABYLON.GUI.TextBlock();

  titleText.text = "HARDWARE ASSEMBLY";
  titleText.color = "white";
  titleText.fontSize = 120;      // diperbesar
  titleText.fontStyle = "bold";

  titleUI.addControl(titleText);


  // =================== BUTTON CREATOR =============================
  function createGlassButton(text, callback) {

    const btn = new BABYLON.GUI.HolographicButton(text);

    // panggil scaling setelah mesh dibuat
    btn.onReady = () => {
      btn.scaling = new BABYLON.Vector3(1.1, 1.1, 1.1);
    };

    // kaca ringan
    const mat = new BABYLON.StandardMaterial("btnMat", scene);
    mat.diffuseColor = new BABYLON.Color3(1, 1, 1);
    mat.alpha = 0.28; 
    mat.emissiveColor = new BABYLON.Color3(1, 1, 1);
    mat.emissiveIntensity = 0.15;

    btn.backMaterial = mat;
    btn.frontMaterial = mat;

    btn.text = text;
    btn.onPointerUpObservable.add(callback);

    // offset ke depan supaya tombol tidak masuk ke dalam mesh kaca
    btn.position = new BABYLON.Vector3(0, 0, 0.12);

    panel.addControl(btn);

    return btn;
  }


  // =========================== BUTTONS ============================
  createGlassButton("PC", onStartPC);
  createGlassButton("Laptop", onStartLaptop);
  createGlassButton("Server", onStartServer);

  return panel;
}

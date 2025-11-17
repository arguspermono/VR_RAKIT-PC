// src/ui/mainmenu.js
export function createMainMenu({
  scene,
  onStartPC,
  onStartLaptop,
  onStartServer,
}) {
  const manager = new BABYLON.GUI.GUI3DManager(scene);

  const panel = new BABYLON.GUI.StackPanel3D();
  manager.addControl(panel);

  panel.position = new BABYLON.Vector3(0, 1, 2);

  // ============================================================
  // TITLE TEXT (2D GUI on a transparent plane)
  // ============================================================
  const titlePlane = BABYLON.MeshBuilder.CreatePlane(
    "titlePlane",
    {
      size: 1.8,
    },
    scene
  );
  titlePlane.position = new BABYLON.Vector3(0, 2, 2); // naikkan di atas tombol
  titlePlane.rotation = new BABYLON.Vector3(0, 0, 0);

  const titleTexture =
    BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(titlePlane);

  const titleText = new BABYLON.GUI.TextBlock();
  titleText.text = "Selamat Datang di Simulasi Perakitan Komputer";
  titleText.color = "white";
  titleText.fontSize = 64;
  titleText.fontStyle = "bold";
  titleText.textWrapping = true;

  titleTexture.addControl(titleText);

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

  return panel;
}

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

  panel.position = new BABYLON.Vector3(0, 1.5, 2);

  const btnPC = new BABYLON.GUI.HolographicButton("startPC");
  btnPC.text = "Start PC";
  panel.addControl(btnPC);
  btnPC.onPointerUpObservable.add(() => onStartPC && onStartPC());

  const btnLaptop = new BABYLON.GUI.HolographicButton("startLaptop");
  btnLaptop.text = "Start Laptop";
  panel.addControl(btnLaptop);
  btnLaptop.onPointerUpObservable.add(() => onStartLaptop && onStartLaptop());

  const btnServer = new BABYLON.GUI.HolographicButton("startServer");
  btnServer.text = "Start Server";
  panel.addControl(btnServer);
  btnServer.onPointerUpObservable.add(() => onStartServer && onStartServer());

  return panel;
}

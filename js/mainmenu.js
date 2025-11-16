async function createMainMenu({ scene, onStart }) {

  // GUI 3D Manager
  const manager = new BABYLON.GUI.GUI3DManager(scene);

  const panel = new BABYLON.GUI.StackPanel3D();
  manager.addControl(panel);

  // kamera sementara
  let cam = new BABYLON.FreeCamera("menuCam", new BABYLON.Vector3(0, 1.6, -3), scene);
  cam.setTarget(BABYLON.Vector3.Zero());
  cam.attachControl(true);

  panel.position = new BABYLON.Vector3(0, 1.5, 2);

  // button
  const startBtn = new BABYLON.GUI.HolographicButton("startBtn");
  startBtn.text = "Start";
  panel.addControl(startBtn);

  startBtn.onPointerUpObservable.add(() => {
    panel.dispose();
    if (onStart) onStart();
  });

  return panel;
}

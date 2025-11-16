function createMainMenu({ scene, xr, onStart }) {

  // MANAGER GUI 3D
  const manager = new BABYLON.GUI.GUI3DManager(scene);

  const panel = new BABYLON.GUI.StackPanel3D();
  manager.addControl(panel);

  panel.position = new BABYLON.Vector3(0, 1.5, 2);

  // Button START
  const startBtn = new BABYLON.GUI.HolographicButton("startBtn");
  startBtn.text = "Start";
  panel.addControl(startBtn);

  startBtn.onPointerUpObservable.add(() => {
    if (onStart) onStart();
  });

  // Button VR
  const vrBtn = new BABYLON.GUI.HolographicButton("vrBtn");
  vrBtn.text = "Enter VR";
  panel.addControl(vrBtn);

  vrBtn.onPointerUpObservable.add(() => {
    if (xr) xr.baseExperience.enterXRAsync("immersive-vr");
  });

  return panel;
}

function createMainMenu({ scene, onStart }) {

  const manager = new BABYLON.GUI.GUI3DManager(scene);

  const panel = new BABYLON.GUI.StackPanel3D();
  manager.addControl(panel);

  panel.position = new BABYLON.Vector3(0, 1.5, 2);

  const btn = new BABYLON.GUI.HolographicButton("startBtn");
  btn.text = "Start";
  panel.addControl(btn);

  btn.onPointerUpObservable.add(() => {
    if (onStart) onStart();
  });

  return panel;
}

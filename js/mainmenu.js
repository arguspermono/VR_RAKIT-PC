export function createMainMenu({ scene, xr, onStart }) {

  const manager = new BABYLON.GUI.GUI3DManager(scene);

  // PANEL UI 3D
  const panel = new BABYLON.GUI.StackPanel3D();
  manager.addControl(panel);

  // Di depan kamera
  panel.position = new BABYLON.Vector3(0, 1.5, 2);

  // --- START BUTTON ---
  const startBtn = new BABYLON.GUI.HolographicButton("startBtn");
  startBtn.text = "Start";
  panel.addControl(startBtn);

  startBtn.onPointerUpObservable.add(() => {
    panel.dispose();
    if (onStart) onStart();
  });

  // --- VR BUTTON ---
  const vrBtn = new BABYLON.GUI.HolographicButton("vrBtn");
  vrBtn.text = "Enter VR";
  panel.addControl(vrBtn);

  vrBtn.onPointerUpObservable.add(() => {
    if (xr) {
      xr.baseExperience.enterXRAsync("immersive-vr");
    }
  });

  return panel;
}

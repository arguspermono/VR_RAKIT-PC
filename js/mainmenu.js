import { attachInteractions } from "./interactions.js"

export async function createMainMenu({ scene, onStart }) {

  // MANAGER GUI 3D
  const manager = new BABYLON.GUI.GUI3DManager(scene);

  // PANEL 3D
  const panel = new BABYLON.GUI.StackPanel3D();
  manager.addControl(panel);

  // Letakkan panel di depan kamera
  panel.position = new BABYLON.Vector3(0, 1.5, 2);

  // BUTTON START
  const startBtn = new BABYLON.GUI.HolographicButton("startBtn");
  startBtn.text = "Start";
  panel.addControl(startBtn);

  startBtn.onPointerUpObservable.add(() => {
    panel.dispose();
    if (onStart) onStart();
  });

  return panel;
}



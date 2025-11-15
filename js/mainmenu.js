import { attachInteractions } from "./interactions.js"

export async function createMainMenu({ scene, onStart }) {

  const manager = new BABYLON.GUI.GUI3DManager(scene);

  const panel = new BABYLON.GUI.StackPanel3D();
  manager.addControl(panel);

  panel.position = new BABYLON.Vector3(0, 1.5, 2);

  const startBtn = new BABYLON.GUI.HolographicButton("startBtn");
  startBtn.text = "Start";
  panel.addControl(startBtn);

  startBtn.onPointerUpObservable.add(() => {
    panel.dispose();
    if (onStart) onStart();
  });

  return panel;
}


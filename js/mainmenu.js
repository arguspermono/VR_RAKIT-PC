import { attachInteractions } from "./interactions.js"
import * as GUI from "https://cdn.babylonjs.com/gui/babylon.gui.min.js";

export async function createMainMenu({ scene, onStart }) {
  // Manager GUI 3D
  const manager = new GUI.GUI3DManager(scene);

  // Panel tempat tombol
  const panel = new GUI.StackPanel3D();
  manager.addControl(panel);

  // Posisi panel berada di depan kamera
  panel.position = new BABYLON.Vector3(0, 1.5, 2);

  // ==== Tombol START ====
  const startBtn = new GUI.HolographicButton("startBtn");
  startBtn.text = "Start";
  panel.addControl(startBtn);

  startBtn.onPointerUpObservable.add(() => {
    // Hapus menu
    panel.dispose();

    // Jalankan callback ke main.js
    if (onStart) onStart();
  });

  return panel;
}

// src/ui/uiButtons.js
import { playClick } from "../audio/audioManager.js";

export function createHUD(scene, onExit, onReset) {
  const posX = -2.2;
  const posY = 1.8;
  const wallZ = 2.5;
  const gapY = -0.6;

  const manager = new BABYLON.GUI.GUI3DManager(scene);

  function makeHoloButton(name, text, offsetY, callback) {
    const btn = new BABYLON.GUI.HolographicButton(name);
    manager.addControl(btn);

    btn.position = new BABYLON.Vector3(posX, posY + offsetY, wallZ);
    btn.scaling = new BABYLON.Vector3(1.5, 0.5, 1);
    btn.cornerRadius = 5;

    if (btn.backMaterial) {
      btn.backMaterial.albedoColor = new BABYLON.Color3(0.05, 0.05, 0.1);
      btn.backMaterial.alpha = 0.7;
    }

    const txt = new BABYLON.GUI.TextBlock();
    txt.text = text;
    txt.color = "#00FFFF";
    txt.fontSize = 36;
    txt.fontStyle = "bold";
    txt.scaleY = 1.5;
    txt.shadowColor = "#008888";
    txt.shadowBlur = 5;
    btn.content = txt;

    btn.onPointerEnterObservable.add(() => {
      txt.color = "#FFFFFF";
      if (btn.backMaterial) btn.backMaterial.alpha = 0.9;
    });
    btn.onPointerOutObservable.add(() => {
      txt.color = "#00FFFF";
      if (btn.backMaterial) btn.backMaterial.alpha = 0.7;
    });

    btn.onPointerDownObservable.add(() => {
      playClick();
      if (callback) callback();
    });

    return btn;
  }

  // 1. EXIT
  makeHoloButton("btnExit", "EXIT", 0, () => {
    if (onExit) onExit();
  });

  // 2. RESET
  makeHoloButton("btnReset", "RESET", gapY, () => {
    if (onReset) onReset();
  });
}

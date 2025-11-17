// src/ui/uiButtons.js

import { playClick, toggleMute } from "../audio/audioManager.js"; // <--- Import toggleMute

export function createHUD(scene, onExit, onReset) {
  const posX = -2;
  const posY = 1.5;
  const gapY = -0.5;
  const wallZ = 2.5;
  const scale = 0.7;

  function makePanel(name, text, offsetY, callback) {
    const plane = BABYLON.MeshBuilder.CreatePlane(
      name,
      { width: 1.2 * scale, height: 0.55 * scale },
      scene
    );

    plane.position = new BABYLON.Vector3(posX, posY + offsetY, wallZ);
    plane.rotation = new BABYLON.Vector3(0, 0, 0);
    plane.isPickable = true;
    plane.renderingGroupId = 3;

    const mat = new BABYLON.StandardMaterial(name + "_mat", scene);
    mat.backFaceCulling = false;
    mat.diffuseColor = new BABYLON.Color3(1, 1, 1);
    plane.material = mat;

    const tex = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(
      plane,
      1024,
      512
    );
    const rect = new BABYLON.GUI.Rectangle();
    rect.background = "white";
    rect.thickness = 3;
    rect.color = "black";
    rect.cornerRadius = 12;
    rect.isPointerBlocker = true;
    tex.addControl(rect);

    const label = new BABYLON.GUI.TextBlock();
    label.text = text;
    label.fontSize = 52;
    label.color = "black";
    label.fontWeight = "bold";
    rect.addControl(label);

    rect.onPointerClickObservable.add(() => {
      playClick(); // Sound efek klik
      // Kirim label & rect ke callback agar bisa diubah warnanya
      if (callback) callback(label, rect);
    });

    return { plane, label, rect };
  }

  // 1. Tombol EXIT
  makePanel("btnExit", "EXIT", 0, onExit);

  // 2. Tombol RESET
  makePanel("btnReset", "RESET", gapY, onReset);

  // 3. Tombol MUTE (Baru)
  makePanel("btnMute", "MUTE", gapY * 2, (label, rect) => {
    // Panggil Toggle Mute & Ambil status terbaru
    const isNowMuted = toggleMute();

    // Ubah Tampilan Tombol sesuai status
    if (isNowMuted) {
      label.text = "UNMUTE";
      label.color = "white";
      rect.background = "#cc0000"; // Merah = Audio Mati
    } else {
      label.text = "MUTE";
      label.color = "black";
      rect.background = "white"; // Putih = Audio Nyala
    }
  });

  return;
}

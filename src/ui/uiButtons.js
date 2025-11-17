// src/ui/uiButtons.js
// 3D EXIT & RESET panels on wall

export function createHUD(scene, onExit, onReset) {
  // ---- posisi dinding depan ----
  const wallZ = 5; // ubah sesuai posisi dinding ruangan
  const posY = 2; // tinggi tombol
  const scale = 1.0; // ukuran panel

  function makePanel(name, text, xPos, callback) {
    // Panel 3D sebagai plane
    const plane = BABYLON.MeshBuilder.CreatePlane(
      name,
      { width: 1.6 * scale, height: 0.8 * scale },
      scene
    );

    plane.position = new BABYLON.Vector3(xPos, posY, wallZ);
    plane.rotation = new BABYLON.Vector3(0, Math.PI, 0); // menghadap player
    plane.isPickable = true;

    const texture = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(plane);

    const rect = new BABYLON.GUI.Rectangle();
    rect.background = "rgba(0,0,0,0.7)";
    rect.thickness = 4;
    rect.color = "white";
    rect.cornerRadius = 20;
    texture.addControl(rect);

    const lbl = new BABYLON.GUI.TextBlock();
    lbl.text = text;
    lbl.fontSize = 60;
    lbl.color = "white";
    rect.addControl(lbl);

    rect.onPointerClickObservable.add(() => callback && callback());
    return plane;
  }

  // Buat tombol EXIT & RESET
  const btnExit = makePanel("btnExit", "EXIT", -2, onExit);
  const btnReset = makePanel("btnReset", "RESET", 2, onReset);

  return { btnExit, btnReset };
}

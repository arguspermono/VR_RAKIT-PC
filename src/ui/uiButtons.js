// src/ui/uiButtons.js

export function createHUD(scene, onExit, onReset) {
  const posX = -2; // kiri layar
  const posY = 1.5; // tinggi tombol pertama
  const gapY = -0.5; // jarak antar tombol
  const wallZ = 2.5; // posisi depan dinding
  const scale = 0.7; // ukuran tombol lebih kecil

  function makePanel(name, text, offsetY, callback) {
    const plane = BABYLON.MeshBuilder.CreatePlane(
      name,
      { width: 1.2 * scale, height: 0.55 * scale },
      scene
    );

    // POSISI TOMBOL DI KIRI SEMUA
    plane.position = new BABYLON.Vector3(posX, posY + offsetY, wallZ);

    // JANGAN DIPUTAR (agar teks tidak kebalik)
    plane.rotation = new BABYLON.Vector3(0, 0, 0);

    plane.isPickable = true;
    plane.renderingGroupId = 3;

    // MATERIAL (agar tekstur GUI tidak mirror)
    const mat = new BABYLON.StandardMaterial(name + "_mat", scene);
    mat.backFaceCulling = false;
    mat.diffuseColor = new BABYLON.Color3(1, 1, 1);
    plane.material = mat;

    // UI
    const tex = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(
      plane,
      1024,
      512
    );
    const rect = new BABYLON.GUI.Rectangle();
    rect.background = "white"; // 🔥 BOX PUTIH
    rect.thickness = 3;
    rect.color = "black"; // 🔥 BORDER HITAM
    rect.cornerRadius = 12;
    rect.isPointerBlocker = true;
    tex.addControl(rect);

    const label = new BABYLON.GUI.TextBlock();
    label.text = text;
    label.fontSize = 52;
    label.color = "black"; // 🔥 TEXT HITAM
    label.fontWeight = "bold";
    rect.addControl(label);

    rect.onPointerClickObservable.add(() => callback && callback());
    return plane;
  }

  // Buat tombol EXIT (atas) & RESET (bawah)
  const btnExit = makePanel("btnExit", "EXIT", 0, onExit);
  const btnReset = makePanel("btnReset", "RESET", gapY, onReset);

  return { btnExit, btnReset };
}

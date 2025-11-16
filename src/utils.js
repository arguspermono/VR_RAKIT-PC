export function findMeshByName(meshes, name) {
  const low = name.toLowerCase();
  return meshes.find((m) => m.name.toLowerCase().includes(low)) || null;
}

// SCALE
export function applyComponentScale(loaded) {
  if (loaded.cpu)
    loaded.cpu.root.scaling = new BABYLON.Vector3(0.18, 0.18, 0.18);
  if (loaded.gpu)
    loaded.gpu.root.scaling = new BABYLON.Vector3(0.45, 0.45, 0.45);
  if (loaded.mobo)
    loaded.mobo.root.scaling = new BABYLON.Vector3(0.4, 0.4, 0.4);
  if (loaded.psu) loaded.psu.root.scaling = new BABYLON.Vector3(0.5, 0.5, 0.5);

  ["ram1", "ram2", "ram3", "ram4"].forEach((r) => {
    if (loaded[r]) loaded[r].root.scaling = new BABYLON.Vector3(0.3, 0.3, 0.3);
  });

  if (loaded.case) loaded.case.root.scaling = new BABYLON.Vector3(1, 1, 1);
}

// AUTO PLACE ON TABLE
export function autoPlacePartsOnTable(tableMesh, loaded) {
  if (!tableMesh) return;

  const tableTop = tableMesh.getBoundingInfo().boundingBox.maximumWorld.y;
  const bb = tableMesh.getBoundingInfo().boundingBox;
  const tableCenterZ = (bb.minimumWorld.z + bb.maximumWorld.z) / 2;

  const zOffset = -0.1;
  const yOffset = 0.05;

  let startX = tableMesh.position.x + 0.8;
  const stepX = -0.55;

  const order = [
    loaded.case,
    loaded.mobo,
    loaded.cpu,
    loaded.gpu,
    loaded.psu,
    loaded.ram1,
    loaded.ram2,
    loaded.ram3,
    loaded.ram4,
  ];

  order.forEach((item) => {
    if (!item || !item.root) return;

    item.root.position = new BABYLON.Vector3(
      startX,
      tableTop + yOffset,
      tableCenterZ + zOffset
    );
    startX += stepX;
  });
}

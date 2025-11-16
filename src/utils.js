// project/src/utils.js

// -----------------------------------------------------------
// FIND MESH BY NAME (partial match)
// -----------------------------------------------------------
export function findMeshByName(meshes, name) {
  const low = name.toLowerCase();
  return meshes.find((m) => m.name.toLowerCase().includes(low)) || null;
}

// -----------------------------------------------------------
// SCALE ALL COMPONENTS
// -----------------------------------------------------------
export function applyComponentScale(loaded) {
  if (loaded.cpu)
    loaded.cpu.root.scaling = new BABYLON.Vector3(0.18, 0.18, 0.18);

  if (loaded.gpu)
    loaded.gpu.root.scaling = new BABYLON.Vector3(0.45, 0.45, 0.45);

  if (loaded.mobo)
    loaded.mobo.root.scaling = new BABYLON.Vector3(0.4, 0.4, 0.4);

  if (loaded.psu) loaded.psu.root.scaling = new BABYLON.Vector3(0.5, 0.5, 0.5);

  if (loaded.ram1)
    loaded.ram1.root.scaling = new BABYLON.Vector3(0.3, 0.3, 0.3);
  if (loaded.ram2)
    loaded.ram2.root.scaling = new BABYLON.Vector3(0.3, 0.3, 0.3);
  if (loaded.ram3)
    loaded.ram3.root.scaling = new BABYLON.Vector3(0.3, 0.3, 0.3);
  if (loaded.ram4)
    loaded.ram4.root.scaling = new BABYLON.Vector3(0.3, 0.3, 0.3);

  if (loaded.case) loaded.case.root.scaling = new BABYLON.Vector3(1, 1, 1);
}

// -----------------------------------------------------------
// AUTO PLACE PARTS ON TABLE — SIMPLE FLOATING VERSION
// -----------------------------------------------------------
export function autoPlacePartsOnTable(tableMesh, loaded) {
  if (!tableMesh) return;

  // Tinggi meja
  const tableTop = tableMesh.getBoundingInfo().boundingBox.maximumWorld.y;

  // Dapatkan pusat Z permukaan meja
  const bb = tableMesh.getBoundingInfo().boundingBox;
  const tableCenterZ = (bb.minimumWorld.z + bb.maximumWorld.z) / 2;

  // Offset kecil ke arah belakang meja (tuning)
  const zOffset = -0.1; // geser 10 cm ke belakang

  // Tinggi sedikit melayang
  const yOffset = 0.05;

  // Mulai dari sisi kanan meja
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

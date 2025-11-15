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
// AUTO PLACE PARTS ON TABLE
// -----------------------------------------------------------
export function autoPlacePartsOnTable(tableMesh, loaded) {
  if (!tableMesh) return;

  const tableTop =
    tableMesh.getBoundingInfo().boundingBox.maximumWorld.y + 0.02;

  let offsetX = -0.3;
  let offsetZ = 0;

  for (const key of Object.keys(loaded)) {
    const root = loaded[key].root;
    if (!root) continue;

    root.position = new BABYLON.Vector3(
      tableMesh.position.x + offsetX,
      tableTop,
      tableMesh.position.z + offsetZ
    );

    offsetX += 0.25;
    if (offsetX > 0.3) {
      offsetX = -0.3;
      offsetZ += 0.25;
    }
  }
}

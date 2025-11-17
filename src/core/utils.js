// src/core/utils.js
export function findMeshByName(meshes, name) {
  const low = name.toLowerCase();
  return (
    (meshes || []).find((m) => m.name && m.name.toLowerCase().includes(low)) ||
    null
  );
}

export function applyComponentScale(loaded) {
  if (!loaded) return;

  if (loaded.cpu)
    loaded.cpu.root.scaling = new BABYLON.Vector3(0.18, 0.18, 0.18);
  if (loaded.gpu)
    loaded.gpu.root.scaling = new BABYLON.Vector3(0.45, 0.45, 0.45);
  if (loaded.mobo)
    loaded.mobo.root.scaling = new BABYLON.Vector3(0.4, 0.4, 0.4);
  if (loaded.psu) loaded.psu.root.scaling = new BABYLON.Vector3(0.5, 0.5, 0.5);
  if (loaded.cooler)
    loaded.cooler.root.scaling = new BABYLON.Vector3(0.4, 0.4, 0.4);
  if (loaded.hdd)
    loaded.hdd.root.scaling = new BABYLON.Vector3(0.35, 0.35, 0.35);

  // laptop
  if (loaded.casing_laptop)
    loaded.casing_laptop.root.scaling = new BABYLON.Vector3(0.9, 0.9, 0.9);
  if (loaded.ram1_laptop)
    loaded.ram1_laptop.root.scaling = new BABYLON.Vector3(0.2, 0.2, 0.2);
  if (loaded.ram2_laptop)
    loaded.ram2_laptop.root.scaling = new BABYLON.Vector3(0.2, 0.2, 0.2);
  if (loaded.nvme_laptop)
    loaded.nvme_laptop.root.scaling = new BABYLON.Vector3(0.12, 0.12, 0.12);
  if (loaded.battery_laptop)
    loaded.battery_laptop.root.scaling = new BABYLON.Vector3(0.45, 0.45, 0.45);

  // pc ram
  if (loaded.ram1_pc)
    loaded.ram1_pc.root.scaling = new BABYLON.Vector3(0.3, 0.3, 0.3);
  if (loaded.ram2_pc)
    loaded.ram2_pc.root.scaling = new BABYLON.Vector3(0.3, 0.3, 0.3);

  if (loaded.case) loaded.case.root.scaling = new BABYLON.Vector3(1, 1, 1);

  // server rack
  if (loaded.server_rack)
    loaded.server_rack.root.scaling = new BABYLON.Vector3(1, 1, 1);

  for (let i = 1; i <= 9; i++) {
    const k = `server${i}`;
    if (loaded[k]) loaded[k].root.scaling = new BABYLON.Vector3(0.9, 0.9, 0.9);
  }

  if (loaded.misc)
    loaded.misc.root.scaling = new BABYLON.Vector3(0.45, 0.45, 0.45);
  if (loaded.nas) loaded.nas.root.scaling = new BABYLON.Vector3(0.5, 0.5, 0.5);
  if (loaded.ups) loaded.ups.root.scaling = new BABYLON.Vector3(0.5, 0.5, 0.5);
  if (loaded.console)
    loaded.console.root.scaling = new BABYLON.Vector3(0.5, 0.5, 0.5);
}

export function placeServerRackAndItems(tableMesh, loaded) {
  if (!tableMesh || !loaded) return;

  const bb = tableMesh.getBoundingInfo().boundingBox;
  const tableCenterX = tableMesh.position.x;
  const tableCenterZ = (bb.minimumWorld.z + bb.maximumWorld.z) / 2;
  const tableTopY = bb.maximumWorld.y;

  // place rack
  const rack = loaded.server_rack && loaded.server_rack.root;
  if (rack) {
    const offsetZ = (bb.maximumWorld.z - bb.minimumWorld.z) * 0.35;
    rack.position = new BABYLON.Vector3(
      tableCenterX,
      tableTopY + 0.02,
      tableCenterZ + offsetZ
    );
    rack.rotation = new BABYLON.Vector3(0, Math.PI, 0);
  }

  // small items on table
  const items = ["misc", "nas", "ups", "console", "server"];

  let startX = tableCenterX - 0.9;
  const stepX = 0.45;

  items.forEach((k) => {
    const it = loaded[k];
    if (!it || !it.root) return;
    it.root.position = new BABYLON.Vector3(
      startX,
      tableTopY + 0.28,
      tableCenterZ - 0.2
    );
    startX += stepX;
  });

  // server units staging area
  let sx = tableCenterX - 1.2;
  for (let i = 1; i <= 9; i++) {
    const key = `server${i}`;
    const it = loaded[key];
    if (!it || !it.root) continue;
    it.root.position = new BABYLON.Vector3(sx, tableTopY + 0.28, tableCenterZ);
    sx += 0.28;
  }
} // <-- FIX: fungsi ditutup di sini!

export function autoPlacePartsOnTable(tableMesh, loaded) {
  if (!tableMesh || !loaded) return;

  const tableTop = tableMesh.getBoundingInfo().boundingBox.maximumWorld.y;
  const bb = tableMesh.getBoundingInfo().boundingBox;
  const tableCenterZ = (bb.minimumWorld.z + bb.maximumWorld.z) / 2;

  const zOffset = -0.1;
  const yOffset = 0.25;

  // laptop placement
  if (loaded.casing_laptop) {
    const casing = loaded.casing_laptop.root;
    const baseX = tableMesh.position.x + 0.6;
    let sx = baseX;

    const laptopOrder = [
      "ram1_laptop",
      "ram2_laptop",
      "nvme_laptop",
      "battery_laptop",
    ];

    laptopOrder.forEach((key) => {
      const item = loaded[key];
      if (!item || !item.root) return;
      item.root.position = new BABYLON.Vector3(
        sx,
        tableTop + yOffset,
        tableCenterZ + zOffset
      );
      sx += 0.35;
    });

    casing.position = new BABYLON.Vector3(
      tableMesh.position.x,
      tableTop + 0.02,
      tableCenterZ
    );

    return;
  }

  // fallback PC placement
  let startX = tableMesh.position.x + 2.0;
  const stepX = -0.55;

  const order = [
    loaded.case,
    loaded.mobo,
    loaded.cpu,
    loaded.gpu,
    loaded.psu,
    loaded.hdd,
    loaded.ram1_pc,
    loaded.ram2_pc,
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

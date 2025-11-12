window.addEventListener("DOMContentLoaded", () => {
  const scene = document.querySelector("a-scene");
  const container = document.querySelector("#scene-objects");

  // === SETUP PLAYER + CONTROLLERS ===
  const playerRig = document.createElement("a-entity");
  playerRig.setAttribute("id", "playerRig");
  playerRig.setAttribute("position", "0 1.6 3");

  // Kamera (bisa jalan dan lihat sekitar di desktop)
  const camera = document.createElement("a-entity");
  camera.setAttribute("id", "camera");
  camera.setAttribute("camera", "");
  camera.setAttribute("look-controls", "pointerLockEnabled: true");
  camera.setAttribute("wasd-controls", "");
  playerRig.appendChild(camera);

  // Controller kanan (grab + teleport)
  const rightHand = document.createElement("a-entity");
  rightHand.setAttribute("laser-controls", "hand: right");
  rightHand.setAttribute("raycaster", "objects: .interactable");
  rightHand.setAttribute(
    "super-hands",
    "colliderEvent: raycaster-intersection; colliderEventProperty: els; grabStartButtons: triggerdown; grabEndButtons: triggerup"
  );
  rightHand.setAttribute(
    "teleport-controls",
    "cameraRig: #playerRig; teleportOrigin: #camera; type: line; button: trigger; collisionEntities: #ground;"
  );
  playerRig.appendChild(rightHand);

  // Controller kiri (grab saja)
  const leftHand = document.createElement("a-entity");
  leftHand.setAttribute("laser-controls", "hand: left");
  leftHand.setAttribute("raycaster", "objects: .interactable");
  leftHand.setAttribute("super-hands", "");
  playerRig.appendChild(leftHand);

  scene.appendChild(playerRig);

  // === TAMBAHKAN OBJEK INTERAKTIF ===
  const items = [
    { model: "#wooden_box", pos: "0 0 -1", scale: "0.2 0.2 0.2" },
    { model: "#toolbox", pos: "0.8 0 -1", scale: "0.25 0.25 0.25" },
    { model: "#screwdriver", pos: "-0.8 0.2 -1", scale: "0.3 0.3 0.3" },
    { model: "#screw", pos: "-0.2 0.2 -0.8", scale: "0.05 0.05 0.05" },
  ];

  items.forEach((item) => {
    const el = document.createElement("a-entity");
    el.setAttribute("gltf-model", item.model);
    el.setAttribute("class", "interactable");
    el.setAttribute("position", item.pos);
    el.setAttribute("scale", item.scale);
    el.setAttribute("hoverable", "");
    el.setAttribute("grabbable", "");
    el.setAttribute("stretchable", "");
    el.setAttribute("draggable", "");
    el.setAttribute("snap-listener", "");
    container.appendChild(el);
  });

  // === SNAP TARGET ===
  const snap = document.createElement("a-box");
  snap.setAttribute("id", "snapSocket");
  snap.setAttribute("class", "snap-target");
  snap.setAttribute("position", "0 0.2 -1.5");
  snap.setAttribute("depth", "0.05");
  snap.setAttribute("height", "0.5");
  snap.setAttribute("width", "0.5");
  snap.setAttribute("material", "color: #2b7; opacity: 0.6");
  container.appendChild(snap);
});

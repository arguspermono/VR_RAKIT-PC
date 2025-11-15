import { attachInteractions } from "./interactions.js";

export async function createScene(engine, canvas) {
  const scene = new BABYLON.Scene(engine);
  scene.clearColor = new BABYLON.Color3(0.85, 0.9, 1);

  // -----------------------------------------------------------
  // CAMERA — FPS STYLE
  // -----------------------------------------------------------
  const camera = new BABYLON.UniversalCamera(
    "playerCam",
    new BABYLON.Vector3(0, 1.7, 0),
    scene
  );
  camera.attachControl(canvas, true);

  // Fix clipping (agar objek tidak hilang ketika dekat)
  camera.minZ = 0.01;

  // Enable collisions
  scene.collisionsEnabled = true;
  camera.checkCollisions = true;
  camera.applyGravity = true;

  // Collider shape (capsule)
  camera.ellipsoid = new BABYLON.Vector3(0.4, 0.9, 0.4);
  camera.ellipsoidOffset = new BABYLON.Vector3(0, 0.9, 0);

  // Movement smoothing
  camera.speed = 0.4;
  camera.inertia = 0.2;

  // Gravity smooth
  scene.gravity = new BABYLON.Vector3(0, -0.15, 0);
  camera.collisionMask = 1;

  // WASD
  camera.keysUp.push(87); // W
  camera.keysDown.push(83); // S
  camera.keysLeft.push(65); // A
  camera.keysRight.push(68); // D

  // -----------------------------------------------------------
  // LIGHTING
  // -----------------------------------------------------------
  new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, 1, 0), scene);

  // -----------------------------------------------------------
  // LOAD COMPUTER LAB ENVIRONMENT
  // -----------------------------------------------------------
  const labResult = await BABYLON.SceneLoader.ImportMeshAsync(
    null,
    "assets/",
    "computer_lab.glb",
    scene
  );

  // Activate collisions for all environment meshes
  labResult.meshes.forEach((m) => {
    m.checkCollisions = true;
  });

  // Try finding a table mesh
  const tableMesh =
    labResult.meshes.find((m) => /table|meja/i.test(m.name)) ||
    labResult.meshes.find((m) => m.name.toLowerCase().includes("desk"));

  // -----------------------------------------------------------
  // LOAD MOTHERBOARD & CPU
  // -----------------------------------------------------------
  const moboResult = await BABYLON.SceneLoader.ImportMeshAsync(
    null,
    "assets/",
    "motherboard.glb",
    scene
  );

  const procResult = await BABYLON.SceneLoader.ImportMeshAsync(
    null,
    "assets/",
    "processor.glb",
    scene
  );

  const mobo = moboResult.meshes[0];
  const processor = procResult.meshes[0];

  // -----------------------------------------------------------
  // PLACE MOTHERBOARD ON TABLE
  // -----------------------------------------------------------
  if (mobo && tableMesh) {
    mobo.scaling = new BABYLON.Vector3(0.4, 0.4, 0.4);

    const tableBB = tableMesh.getBoundingInfo().boundingBox;
    const tableTop = tableBB.maximumWorld.y;
    const tablePos = tableMesh.getAbsolutePosition();

    mobo.position = new BABYLON.Vector3(
      tablePos.x,
      tableTop + 0.02,
      tablePos.z
    );
    mobo.rotation = new BABYLON.Vector3(0, Math.PI, 0);
  }

  // -----------------------------------------------------------
  // PLACE PROCESSOR ABOVE MOBO
  // -----------------------------------------------------------
  if (processor && mobo) {
    processor.scaling = new BABYLON.Vector3(0.2, 0.2, 0.2);

    const mpos = mobo.getAbsolutePosition();

    processor.position = new BABYLON.Vector3(
      mpos.x + 0.05,
      mpos.y + 0.05,
      mpos.z
    );
  }

  processor.isPickable = true;
  processor.checkCollisions = false;

  // -----------------------------------------------------------
  // INTERACTIONS (drag + snap CPU)
  // -----------------------------------------------------------
  attachInteractions({
    scene,
    processor,
    mobo,
    moboResult,
    socketNames: ["socket", "socket_cpu", "cpu_socket"],
  });

  // --- AUTO ALIGN CAMERA TO FLOOR ---
  const floorMesh = labResult.meshes.find((m) =>
    /floor|lantai|ground/i.test(m.name)
  );

  if (floorMesh) {
    const floorBB = floorMesh.getBoundingInfo().boundingBox;
    const floorY = floorBB.maximumWorld.y;

    // posisi mata = floor + ellipsoidOffset.y
    camera.position.y = floorY + camera.ellipsoidOffset.y;

    console.log("Floor Y:", floorY, "Camera Y:", camera.position.y);
  }

  return scene;
}

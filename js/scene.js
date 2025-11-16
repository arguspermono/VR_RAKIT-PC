async function createScene(engine, canvas) {

  const scene = new BABYLON.Scene(engine);
  scene.clearColor = new BABYLON.Color3(0.85, 0.9, 1);

  // CAMERA
  const camera = new BABYLON.UniversalCamera(
    "playerCam",
    new BABYLON.Vector3(0, 0.2, 0),
    scene
  );
  camera.attachControl(canvas, true);

  camera.minZ = 0.01;
  scene.collisionsEnabled = true;
  camera.checkCollisions = true;
  camera.applyGravity = true;

  camera.ellipsoid = new BABYLON.Vector3(0.4, 0.9, 0.4);
  camera.ellipsoidOffset = new BABYLON.Vector3(0, 0.9, 0);

  camera.speed = 0.4;
  camera.inertia = 0.2;

  scene.gravity = new BABYLON.Vector3(0, -0.15, 0);
  camera.collisionMask = 1;

  camera.keysUp.push(87);
  camera.keysDown.push(83);
  camera.keysLeft.push(65);
  camera.keysRight.push(68);

  new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, 1, 0), scene);

  // =============================
  // ===   LOAD COMPUTER LAB   ===
  // =============================
  const labResult = await BABYLON.SceneLoader.ImportMeshAsync(
    null, "assets/", "computer_lab.glb", scene
  );

  labResult.meshes.forEach(m => m.checkCollisions = true);

  const tableMesh =
    labResult.meshes.find(m => /table|meja/i.test(m.name)) ||
    labResult.meshes.find(m => m.name.toLowerCase().includes("desk"));

  // Motherboard
  const moboResult = await BABYLON.SceneLoader.ImportMeshAsync(
    null, "assets/", "motherboard.glb", scene
  );

  // Processor
  const procResult = await BABYLON.SceneLoader.ImportMeshAsync(
    null, "assets/", "processor.glb", scene
  );

  const mobo = moboResult.meshes[0];
  const processor = procResult.meshes[0];

  // Posisi motherboard
  if (mobo && tableMesh) {
    mobo.scaling = new BABYLON.Vector3(0.4, 0.4, 0.4);

    const tableBB = tableMesh.getBoundingInfo().boundingBox;
    const tableTop = tableBB.maximumWorld.y;
    const tablePos = tableMesh.getAbsolutePosition();

    mobo.position = new BABYLON.Vector3(
      tablePos.x, tableTop + 0.02, tablePos.z
    );

    mobo.rotation = new BABYLON.Vector3(0, Math.PI, 0);
  }

  // CPU
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

  // Interactions
  attachInteractions({
    scene,
    processor,
    mobo,
    moboResult,
    socketNames: ["socket", "socket_cpu", "cpu_socket"],
  });

  // Align camera to floor
  const floorMesh = labResult.meshes.find(m =>
    /floor|lantai|ground/i.test(m.name)
  );

  if (floorMesh) {
    const floorBB = floorMesh.getBoundingInfo().boundingBox;
    const floorY = floorBB.maximumWorld.y;
    camera.position.y = floorY + camera.ellipsoidOffset.y;
  }

  return scene;
}



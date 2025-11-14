import { attachInteractions } from "./interactions.js";

export async function createScene(engine, canvas) {
  const scene = new BABYLON.Scene(engine);
  scene.clearColor = new BABYLON.Color3(0.85, 0.9, 1);

  // Camera: sedikit lebih tinggi dari sebelumnya (player POV)
  const camera = new BABYLON.UniversalCamera(
    "playerCam",
    new BABYLON.Vector3(0, 9.0, -2.5),
    scene
  );
  camera.attachControl(canvas, true);

  // Lighting
  const hemi = new BABYLON.HemisphericLight(
    "hemi",
    new BABYLON.Vector3(0, 1, 0),
    scene
  );
  hemi.intensity = 0.9;

  // Load environment (computer lab). We *do not* create a separate ground plane.
  // Put the GLB files into `assets/` and adapt mesh name checks if lab uses different names.
  const labResult = await BABYLON.SceneLoader.ImportMeshAsync(
    null,
    "assets/",
    "computer_lab.glb",
    scene
  ).catch((err) => {
    console.warn("Gagal memuat computer_lab.glb:", err);
    return { meshes: [] };
  });

  // Find a table mesh inside the lab (try a set of likely names). Adjust if your model berbeda.
  const tableMesh =
    labResult.meshes.find((m) => /table|meja/i.test(m.name)) ||
    labResult.meshes.find((m) => m.name.toLowerCase().includes("desk"));
  if (!tableMesh)
    console.warn(
      "Meja tidak ditemukan di glb. Pastikan mesh table/meja ada (cek nama)."
    );

  // If the lab GLB contains a root transform, optionally center the world to the lab's root
  const labRoot = labResult.meshes.length ? labResult.meshes[0] : null;
  if (labRoot) {
    // Option: move camera relative to lab root so the world origin effectively becomes the lab
    // If your lab model is positioned far away, uncomment to recenter:
    // scene.rootNodes.forEach(n => { if (n !== labRoot) n.parent = labRoot; });
  }

  // Load motherboard and processor (separate files). We'll place them on the table.
  const moboResult = await BABYLON.SceneLoader.ImportMeshAsync(
    null,
    "assets/",
    "motherboard.glb",
    scene
  ).catch(() => ({ meshes: [] }));
  const procResult = await BABYLON.SceneLoader.ImportMeshAsync(
    null,
    "assets/",
    "processor.glb",
    scene
  ).catch(() => ({ meshes: [] }));

  const mobo = moboResult.meshes.length ? moboResult.meshes[0] : null;
  const processor = procResult.meshes.length ? procResult.meshes[0] : null;

  // Standard scaling & fallback positions
  if (mobo) {
    mobo.scaling = new BABYLON.Vector3(0.4, 0.4, 0.4);
    if (tableMesh) {
      // place motherboard onto table surface using the table absolute position
      const tpos = tableMesh.getAbsolutePosition();
      const bbox = mobo.getBoundingInfo().boundingBox;
      const heightHalf = bbox.extendSize.y * mobo.scaling.y;
      mobo.position = tpos.add(new BABYLON.Vector3(0, heightHalf + 0.02, 0));
      // match orientation if needed
      mobo.rotation = new BABYLON.Vector3(0, Math.PI, 0);
      // parent to table so it moves with table (optional)
      // mobo.setParent(tableMesh);
    } else {
      mobo.position = new BABYLON.Vector3(0, 1.0, -1);
    }
  }

  if (processor) {
    processor.scaling = new BABYLON.Vector3(0.2, 0.2, 0.2);
    if (tableMesh && mobo) {
      // try to snap processor near the motherboard's socket — we attempt to find a mesh named 'socket' inside motherboard.
      const socket = moboResult.meshes.find((mm) =>
        /socket|cpu/i.test(mm.name)
      );
      if (socket) {
        const sPos = socket.getAbsolutePosition();
        processor.position = sPos.add(new BABYLON.Vector3(0, 0.03, 0));
      } else {
        // otherwise place processor slightly above the motherboard
        const mpos = mobo.getAbsolutePosition();
        const bbox = processor.getBoundingInfo().boundingBox;
        const heightHalf = bbox.extendSize.y * processor.scaling.y;
        processor.position = mpos.add(
          new BABYLON.Vector3(0, 0.06 + heightHalf, 0.05)
        );
      }
    } else {
      processor.position = new BABYLON.Vector3(0.5, 1.2, -1);
    }
    processor.isPickable = true;
  }

  // If you still want a visible floor for locomotion or XR floor alignment, create a thin invisible collider that matches the lab floor.
  // We'll attempt to find a mesh named "floor" in the lab GLB and use it as a floorMesh for XR; otherwise we leave none.
  const floorMesh = labResult.meshes.find((m) =>
    /floor|lantai|ground/i.test(m.name)
  );

  // XR experience. If a floor mesh exists, use it so player stands on lab floor instead of a separate plane.
  const xr = await scene.createDefaultXRExperienceAsync({
    floorMeshes: floorMesh ? [floorMesh] : [],
  });
  // Raise XR camera a bit if needed
  if (xr.baseExperience && xr.baseExperience.camera) {
    const rig = xr.baseExperience.camera.parent;
    if (rig) rig.position = rig.position.add(new BABYLON.Vector3(0, 0.0, 0));
  }

  // Attach interactions (drag + snap) if processor exists and socket found
  attachInteractions({
    scene,
    processor,
    mobo,
    moboResult,
    socketNames: ["socket", "socket_cpu", "cpu_socket"],
  });

  return scene;
}

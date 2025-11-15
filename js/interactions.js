// project/src/interactions.js
import { findMeshByName } from "./utils.js";

export function attachInteractions(scene) {
  const { loaded } = scene.__app;
  if (!loaded.cpu || !loaded.mobo) return;

  const processor = loaded.cpu.root;
  const moboMeshes = loaded.mobo.meshes;

  // -----------------------------------------------------------
  // FIND CPU SOCKET
  // -----------------------------------------------------------
  const socketNames = ["socket", "socket_cpu", "cpu_socket"];

  let socketCPU = null;

  for (const m of moboMeshes) {
    const name = m.name.toLowerCase();
    if (socketNames.some((sn) => name.includes(sn))) {
      socketCPU = m;
      break;
    }
  }

  if (!socketCPU) {
    console.warn("⚠ CPU Socket Not Found!");
    return;
  }

  console.log("✅ CPU Socket Found:", socketCPU.name);

  // -----------------------------------------------------------
  // HIGHLIGHT LAYER
  // -----------------------------------------------------------
  const hl = new BABYLON.HighlightLayer("hl", scene);

  const highlight = (mesh, color) => {
    hl.addMesh(mesh, color);
  };

  const unhighlight = (mesh) => hl.removeMesh(mesh);

  // -----------------------------------------------------------
  // DRAG BEHAVIOR
  // -----------------------------------------------------------
  const drag = new BABYLON.PointerDragBehavior({
    dragPlaneNormal: new BABYLON.Vector3(0, 1, 0),
  });

  processor.addBehavior(drag);

  drag.onDragStartObservable.add(() => {
    highlight(socketCPU, BABYLON.Color3.Yellow());
  });

  drag.onDragObservable.add(() => {
    const D = BABYLON.Vector3.Distance(
      processor.getAbsolutePosition(),
      socketCPU.getAbsolutePosition()
    );

    if (D < 0.12) highlight(socketCPU, BABYLON.Color3.Green());
    else highlight(socketCPU, BABYLON.Color3.Yellow());
  });

  drag.onDragEndObservable.add(() => {
    const D = BABYLON.Vector3.Distance(
      processor.getAbsolutePosition(),
      socketCPU.getAbsolutePosition()
    );

    if (D < 0.12) {
      processor.position.copyFrom(socketCPU.getAbsolutePosition());
      processor.position.y += 0.015;

      highlight(socketCPU, BABYLON.Color3.Green());
    } else {
      unhighlight(socketCPU);
    }
  });
}

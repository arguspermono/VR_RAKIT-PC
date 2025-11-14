export function attachInteractions({
  scene,
  processor,
  mobo,
  moboResult,
  socketNames,
}) {
  if (!processor) return;

  processor.isPickable = true;

  // Drag behavior (mouse)
  const drag = new BABYLON.PointerDragBehavior({
    dragPlaneNormal: new BABYLON.Vector3(0, 1, 0),
  });
  drag.useObjectCenter = true;
  processor.addBehavior(drag);

  // Snap to socket
  drag.onDragEndObservable.add(() => {
    const socket = moboResult.meshes.find((m) =>
      socketNames.some((n) => m.name.toLowerCase().includes(n))
    );
    if (!socket) return;

    const sPos = socket.getAbsolutePosition();
    const distance = BABYLON.Vector3.Distance(processor.position, sPos);

    if (distance < 0.2) {
      processor.position = sPos.add(new BABYLON.Vector3(0, 0.02, 0));
    }
  });
}

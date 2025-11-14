export function attachInteractions({
  scene,
  processor,
  mobo,
  moboResult,
  socketNames = [],
}) {
  if (!processor) return;

  // try to find socket inside motherboard import result meshes
  const socket =
    moboResult && moboResult.meshes
      ? moboResult.meshes.find((m) =>
          socketNames.some((n) => m.name.toLowerCase().includes(n))
        )
      : null;

  const setProcColor = (col) => {
    processor
      .getChildMeshes()
      .forEach((m) => m.material && (m.material.emissiveColor = col));
  };
  const setSocketColor = (col) => {
    if (socket && socket.material) socket.material.emissiveColor = col;
  };

  const SNAP_DISTANCE = 0.12;
  let isSnapped = false;

  const drag = new BABYLON.PointerDragBehavior({
    dragPlaneNormal: new BABYLON.Vector3(0, 1, 0),
  });
  processor.addBehavior(drag);

  drag.onDragStartObservable.add(() => {
    setProcColor(new BABYLON.Color3(0.2, 0.6, 1));
    setSocketColor(new BABYLON.Color3(1, 0.6, 0.1));
  });

  drag.onDragObservable.add(() => {
    if (!socket) return;
    const dist = BABYLON.Vector3.Distance(
      processor.getAbsolutePosition(),
      socket.getAbsolutePosition()
    );
    if (dist < SNAP_DISTANCE) setSocketColor(new BABYLON.Color3(1, 0.6, 0.1));
    else setSocketColor(BABYLON.Color3.Black());
  });

  drag.onDragEndObservable.add(() => {
    if (!socket) return;
    const dist = BABYLON.Vector3.Distance(
      processor.getAbsolutePosition(),
      socket.getAbsolutePosition()
    );
    if (dist < SNAP_DISTANCE) {
      // snap processor to socket
      processor.setAbsolutePosition(
        socket.getAbsolutePosition().add(new BABYLON.Vector3(0, 0.02, 0))
      );
      isSnapped = true;
    } else {
      isSnapped = false;
    }
    setProcColor(BABYLON.Color3.Black());
    setSocketColor(BABYLON.Color3.Black());
  });

  // allow picking snapped item to un-snap
  scene.onPointerDown = (evt, pickInfo) => {
    if (!isSnapped) return;
    if (
      pickInfo.hit &&
      processor.getChildMeshes().includes(pickInfo.pickedMesh)
    ) {
      isSnapped = false;
      processor.position.y += 0.05;
    }
  };

  // basic hover color
  scene.onPointerObservable.add(() => {
    if (isSnapped || drag.dragging) return;
    const pick = scene.pick(scene.pointerX, scene.pointerY);
    if (
      pick.hit &&
      pick.pickedMesh &&
      processor.getChildMeshes().includes(pick.pickedMesh)
    )
      setProcColor(new BABYLON.Color3(0.2, 0.5, 1));
    else setProcColor(BABYLON.Color3.Black());
  }, BABYLON.PointerEventTypes.POINTERMOVE);
}

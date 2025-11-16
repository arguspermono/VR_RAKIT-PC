function getSlot(key, slots) {
  if (key === "mobo") return slots.mobo;
  if (key === "cpu") return slots.cpu;
  if (key.startsWith("ram")) return slots[key];
  if (key === "gpu") return slots.gpu_mobo;
  if (key === "psu") return slots.psu;
  if (key === "hdd") return slots.hdd;
  if (key.startsWith("fan")) return slots.fan;
  return null;
}

// MAIN SNAP FUNCTION
function snapObject(item, root, slot) {
  if (!slot || !slot.mesh) return null;

  const clone = root.clone(root.name + "_placed");

  clone.position.copyFrom(slot.mesh.getAbsolutePosition());

  if (slot.mesh.rotationQuaternion)
    clone.rotationQuaternion = slot.mesh.rotationQuaternion.clone();

  clone.scaling.copyFrom(root.scaling);

  // disable original
  root.setEnabled(false);
  if (root.physicsImpostor) {
    root.physicsImpostor.dispose();
    root.physicsImpostor = null;
  }

  slot.mesh.setEnabled(false);
  slot.used = true;

  clone.isPickable = false;
  if (clone.physicsImpostor) {
    clone.physicsImpostor.dispose();
    clone.physicsImpostor = null;
  }

  return clone;
}

export function attachInteractions(scene) {
  const { loaded, slots } = scene.__app;
  const hl = new BABYLON.HighlightLayer("HL", scene);

  // === MOUSE DRAG ===
  Object.keys(loaded).forEach((key) => {
    if (key === "case") return;

    const item = loaded[key];
    const root = item.root;
    const slot = getSlot(key, slots);

    if (!slot) return;

    const drag = new BABYLON.PointerDragBehavior({
      dragPlaneNormal: new BABYLON.Vector3(0, 1, 0),
    });
    root.addBehavior(drag);

    let canSnap = false;

    drag.onDragObservable.add(() => {
      if (slot.used) return;

      const dist = BABYLON.Vector3.Distance(
        root.getAbsolutePosition(),
        slot.mesh.getAbsolutePosition()
      );

      hl.removeAllMeshes();
      if (dist < 0.25) {
        canSnap = true;
        hl.addMesh(root, BABYLON.Color3.Green());
        hl.addMesh(slot.mesh, BABYLON.Color3.Yellow());
      } else canSnap = false;
    });

    drag.onDragEndObservable.add(() => {
      hl.removeAllMeshes();
      if (!canSnap || slot.used) return;

      const placed = snapObject(item, root, slot);
      if (placed) {
        hl.addMesh(placed, BABYLON.Color3.Green());
        setTimeout(() => hl.removeAllMeshes(), 800);
      }
    });
  });

  // === VR ===
  const xr = scene.__app.xr;
  if (!xr) return;

  xr.input.onControllerAddedObservable.add((ctrl) => {
    ctrl.onMotionControllerInitObservable.add((mc) => {
      const trig = mc.getComponent("trigger");
      const sqz = mc.getComponent("squeeze");
      const hand = ctrl.grip || ctrl.pointer;

      let grabbed = null;

      function tryGrab() {
        if (grabbed) return;

        for (const key of Object.keys(loaded)) {
          const item = loaded[key];
          const root = item.root;
          const slot = getSlot(key, slots);
          if (!slot || slot.used) continue;

          const dist = BABYLON.Vector3.Distance(
            root.getAbsolutePosition(),
            hand.getAbsolutePosition()
          );

          if (dist < 0.22) {
            grabbed = { item, root, slot };
            if (root.physicsImpostor) root.physicsImpostor.sleep();
            root.setParent(hand);
            return;
          }
        }
      }

      function release() {
        if (!grabbed) return;

        const { item, root, slot } = grabbed;
        grabbed = null;

        root.setParent(null);
        if (root.physicsImpostor) root.physicsImpostor.wakeUp();

        const dist = BABYLON.Vector3.Distance(
          root.getAbsolutePosition(),
          slot.mesh.getAbsolutePosition()
        );

        if (dist < 0.22 && !slot.used) {
          const placed = snapObject(item, root, slot);
          if (placed) {
            hl.addMesh(placed, BABYLON.Color3.Green());
            setTimeout(() => hl.removeAllMeshes(), 800);
          }
        }
      }

      [trig, sqz].forEach((btn) => {
        btn?.onButtonStateChangedObservable.add((state) => {
          if (state.pressed) tryGrab();
          else release();
        });
      });
    });
  });
}

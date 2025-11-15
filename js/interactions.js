// project/src/interactions.js
import { detectSlots } from "./slots.js";

export function attachInteractions(scene) {
  const { loaded } = scene.__app;

  // ============================================================
  // 1. AUTO DETECT ALL SLOTS (BLUE CUBES)
  // ============================================================
  const slots = detectSlots(scene);

  // ============================================================
  // 2. MOUSE DRAG (Tetap berjalan)
  // ============================================================
  const hlMouse = new BABYLON.HighlightLayer("HL_MOUSE", scene);

  Object.keys(loaded).forEach((key) => {
    const item = loaded[key];
    if (!item || !item.root) return;

    const root = item.root;
    const drag = new BABYLON.PointerDragBehavior({
      dragPlaneNormal: new BABYLON.Vector3(0, 1, 0),
    });

    root.addBehavior(drag);

    let closestSlot = null;

    drag.onDragObservable.add(() => {
      closestSlot = null;
      let minDist = 999;

      const pos = root.getAbsolutePosition();

      for (const sKey in slots) {
        const s = slots[sKey];
        if (s.used) continue;

        const dist = BABYLON.Vector3.Distance(
          pos,
          s.mesh.getAbsolutePosition()
        );

        if (dist < minDist) {
          minDist = dist;
          closestSlot = s;
        }
      }

      hlMouse.removeAllMeshes();

      if (closestSlot && minDist < 0.25) {
        hlMouse.addMesh(root, BABYLON.Color3.Green());
        hlMouse.addMesh(
          closestSlot.mesh,
          BABYLON.Color3.FromHexString("#FFA500")
        );
      }
    });

    drag.onDragEndObservable.add(() => {
      if (!closestSlot) return;

      const dist = BABYLON.Vector3.Distance(
        root.getAbsolutePosition(),
        closestSlot.mesh.getAbsolutePosition()
      );

      if (dist < 0.25) {
        root.position.copyFrom(closestSlot.mesh.getAbsolutePosition());
        root.position.y += 0.02;
        closestSlot.used = true;

        hlMouse.addMesh(root, BABYLON.Color3.Green());
        hlMouse.addMesh(
          closestSlot.mesh,
          BABYLON.Color3.FromHexString("#FFA500")
        );
      } else {
        hlMouse.removeAllMeshes();
      }
    });
  });

  // ============================================================
  // 3. VR GRAB + VR SNAP (Motherboard → MB_P ONLY)
  // ============================================================
  const xr = scene.__app.xr;
  if (!xr) {
    console.warn("VR belum aktif, VR grab tidak diinisialisasi");
    return;
  }

  const mobo = loaded.mobo?.root;
  if (!mobo) {
    console.warn("Motherboard tidak ditemukan!");
    return;
  }

  // Temukan slot MB_P
  const moboSlot = Object.values(slots).find((s) =>
    s.mesh.name.includes("MB_P")
  );
  if (!moboSlot) {
    console.warn("MB_P tidak ditemukan!");
    return;
  }

  // Highlight layer untuk VR
  const hlVR = new BABYLON.HighlightLayer("HL_VR", scene);

  const colorGreen = BABYLON.Color3.Green();
  const colorOrange = BABYLON.Color3.FromHexString("#FFA500");

  let grabbed = false;
  let grabbingController = null;

  // Helper highlight
  function highlightMobo() {
    loaded.mobo.meshes.forEach((mesh) => hlVR.addMesh(mesh, colorGreen));
  }
  function highlightSlot() {
    hlVR.addMesh(moboSlot.mesh, colorOrange);
    moboSlot.mesh.getChildMeshes().forEach((c) => hlVR.addMesh(c, colorOrange));
  }
  function clearHL() {
    hlVR.removeAllMeshes();
  }

  // VR controller events
  xr.input.onControllerAddedObservable.add((controller) => {
    controller.onMotionControllerInitObservable.add((mc) => {
      const trigger = mc.getComponent("trigger");
      const squeeze = mc.getComponent("squeeze");

      const tryGrab = () => {
        if (grabbed) return;

        const hand = controller.grip || controller.pointer;
        const dist = BABYLON.Vector3.Distance(
          mobo.getBoundingInfo().boundingBox.centerWorld,
          hand.position
        );

        if (dist < 0.25) {
          grabbed = true;
          grabbingController = controller;

          mobo.setParent(hand);

          highlightMobo();

          console.log("✔ VR GRAB motherboard");
        }
      };

      const releaseGrab = () => {
        if (!grabbed) return;

        mobo.setParent(null);
        grabbed = false;

        const moboCenter = mobo.getBoundingInfo().boundingBox.centerWorld;
        const slotCenter =
          moboSlot.mesh.getBoundingInfo().boundingBox.centerWorld;

        const dist = BABYLON.Vector3.Distance(moboCenter, slotCenter);

        if (dist < 0.2) {
          // SNAP!
          mobo.position.copyFrom(slotCenter);
          mobo.position.y += 0.015;

          highlightMobo();
          highlightSlot();

          moboSlot.used = true;

          console.log("✔ VR SNAP motherboard → MB_P");
        } else {
          clearHL();
        }
      };

      trigger.onButtonStateChangedObservable.add((state) => {
        if (state.pressed) tryGrab();
        else releaseGrab();
      });

      squeeze.onButtonStateChangedObservable.add((state) => {
        if (state.pressed) tryGrab();
        else releaseGrab();
      });

      // Preview snap
      scene.onBeforeRenderObservable.add(() => {
        if (!grabbed) return;

        const moboCenter = mobo.getBoundingInfo().boundingBox.centerWorld;
        const slotCenter =
          moboSlot.mesh.getBoundingInfo().boundingBox.centerWorld;

        const dist = BABYLON.Vector3.Distance(moboCenter, slotCenter);

        clearHL();

        if (dist < 0.25) {
          highlightMobo();
          highlightSlot();
        }
      });
    });
  });
}

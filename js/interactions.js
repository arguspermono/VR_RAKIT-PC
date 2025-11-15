// project/src/interactions.js
import { findMeshByName } from "./utils.js";

export function attachInteractions(scene) {
  const { loaded, slots } = scene.__app;

  // ============================================================
  // 1. MOUSE DRAG (Diubah: Filter 'case')
  // ============================================================
  const hlMouse = new BABYLON.HighlightLayer("HL_MOUSE", scene);

  // Filter 'case' agar tidak bisa di-drag
  Object.keys(loaded)
    .filter((key) => key !== "case")
    .forEach((key) => {
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

          // Parenting sesuai hierarki
          if (key === "mobo" && loaded.case) root.setParent(loaded.case.root);

          if (
            ["cpu", "ram1", "ram2", "ram3", "ram4", "gpu"].includes(key) &&
            loaded.mobo
          ) {
            root.setParent(loaded.mobo.root);
          }

          if (["psu", "hdd", "fan"].includes(key) && loaded.case) {
            root.setParent(loaded.case.root);
          }

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
  // 2. VR GRAB + VR SNAP (Diubah: Filter 'case')
  // ============================================================
  const xr = scene.__app.xr;
  if (!xr) {
    console.warn("VR belum aktif, VR grab tidak diinisialisasi");
    return;
  }

  const hlVR = new BABYLON.HighlightLayer("HL_VR", scene);
  const colorGreen = BABYLON.Color3.Green();
  const colorOrange = BABYLON.Color3.FromHexString("#FFA500");

  // helper: valid slot for component key (hierarki)
  function getValidSlotFor(key) {
    if (key === "mobo") return slots.mobo;
    if (key === "cpu") return slots.cpu;
    if (key === "ram1") return slots.ram1;
    if (key === "ram2") return slots.ram2;
    if (key === "ram3") return slots.ram3;
    if (key === "ram4") return slots.ram4;
    if (key === "gpu") return slots.gpu_mobo;
    if (key === "psu") return slots.psu;
    if (key === "hdd") return slots.hdd;
    if (key === "fan") return slots.fan;
    return null;
  }

  // find main mesh to highlight (largest mesh) to avoid highlighting tiny submeshes
  function getMainMesh(item) {
    if (!item || !item.meshes) return item?.root;
    let biggest = item.meshes[0];
    let max = 0;
    item.meshes.forEach((m) => {
      try {
        const ext = m.getBoundingInfo().boundingBox.extendSizeWorld;
        const size = ext.x + ext.y + ext.z;
        if (size > max) {
          max = size;
          biggest = m;
        }
      } catch {}
    });
    return biggest;
  }

  // Filter 'case' agar tidak bisa di-grab
  Object.keys(loaded)
    .filter((key) => key !== "case")
    .forEach((key) => {
      const item = loaded[key];
      if (!item || !item.root) return;

      const slot = getValidSlotFor(key);
      if (!slot || !slot.mesh) return;

      const root = item.root;
      const mainMesh = getMainMesh(item);

      xr.input.onControllerAddedObservable.add((controller) => {
        controller.onMotionControllerInitObservable.add((mc) => {
          const trigger = mc.getComponent("trigger");
          const squeeze = mc.getComponent("squeeze");

          let grabbed = false;

          const tryGrab = () => {
            if (grabbed) return;

            const hand = controller.grip || controller.pointer;
            if (!hand) return;

            const dist = BABYLON.Vector3.Distance(
              root.getAbsolutePosition(),
              hand.getAbsolutePosition()
            );

            if (dist < 0.22) {
              grabbed = true;
              root.setParent(hand);

              if (mainMesh) hlVR.addMesh(mainMesh, colorGreen);
            }
          };

          const releaseGrab = () => {
            if (!grabbed) return;

            root.setParent(null);
            grabbed = false;

            const dist = BABYLON.Vector3.Distance(
              root.getAbsolutePosition(),
              slot.mesh.getAbsolutePosition()
            );

            hlVR.removeAllMeshes();

            if (dist < 0.22) {
              // snap & hierarchy
              root.position.copyFrom(slot.mesh.getAbsolutePosition());
              root.position.y += 0.02;
              slot.used = true;

              if (key === "mobo" && loaded.case)
                root.setParent(loaded.case.root);

              if (
                ["cpu", "ram1", "ram2", "ram3", "ram4", "gpu"].includes(key) &&
                loaded.mobo
              ) {
                root.setParent(loaded.mobo.root);
              }

              if (["psu", "hdd", "fan"].includes(key) && loaded.case) {
                root.setParent(loaded.case.root);
              }

              if (mainMesh) hlVR.addMesh(mainMesh, colorGreen);
              hlVR.addMesh(slot.mesh, colorOrange);
            }
          };

          if (trigger) {
            trigger.onButtonStateChangedObservable.add((state) => {
              if (state.pressed) tryGrab();
              else releaseGrab();
            });
          }
          if (squeeze) {
            squeeze.onButtonStateChangedObservable.add((state) => {
              if (state.pressed) tryGrab();
              else releaseGrab();
            });
          }

          // preview highlight while grabbed
          scene.onBeforeRenderObservable.add(() => {
            if (!grabbed) return;
            const dist = BABYLON.Vector3.Distance(
              root.getAbsolutePosition(),
              slot.mesh.getAbsolutePosition()
            );
            hlVR.removeAllMeshes();
            if (dist < 0.25) {
              if (mainMesh) hlVR.addMesh(mainMesh, colorGreen);
              hlVR.addMesh(slot.mesh, colorOrange);
            }
          });
        });
      });
    });
}

// project/src/interactions.js
import { findMeshByName } from "./utils.js";

// Helper dipindahkan ke atas agar bisa dipakai Mouse & VR
function getValidSlotFor(key, slots) {
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

export function attachInteractions(scene) {
  const { loaded, slots } = scene.__app;

  // ============================================================
  // 1. MOUSE DRAG (Diperbaiki: Hanya cek slot yang valid)
  // ============================================================
  const hlMouse = new BABYLON.HighlightLayer("HL_MOUSE", scene);

  Object.keys(loaded)
    .filter((key) => key !== "case")
    .forEach((key) => {
      const item = loaded[key];
      if (!item || !item.root) return;

      // Ambil slot yang valid untuk item INI
      const validSlot = getValidSlotFor(key, slots);

      // Jika item ini tidak punya slot (misal: kabel), jangan tambahkan behavior
      if (!validSlot || !validSlot.mesh) {
        // console.log(`Item ${key} tidak punya slot valid, drag dibatalkan.`);
        return;
      }

      const root = item.root;
      const drag = new BABYLON.PointerDragBehavior({
        dragPlaneNormal: new BABYLON.Vector3(0, 1, 0),
      });

      root.addBehavior(drag);

      let canSnap = false;

      // --- LOGIKA DRAG (Highlight) DIPERBAIKI ---
      drag.onDragObservable.add(() => {
        if (validSlot.used) {
          hlMouse.removeAllMeshes();
          return; // Slot sudah terisi
        }

        canSnap = false;
        const pos = root.getAbsolutePosition();
        const dist = BABYLON.Vector3.Distance(
          pos,
          validSlot.mesh.getAbsolutePosition()
        );

        hlMouse.removeAllMeshes();

        if (dist < 0.25) {
          canSnap = true;
          hlMouse.addMesh(root, BABYLON.Color3.Green());
          hlMouse.addMesh(
            validSlot.mesh,
            BABYLON.Color3.FromHexString("#FFA500")
          );
        }
      });

      // --- LOGIKA DRAG END (Snap) DIPERBAIKI ---
      drag.onDragEndObservable.add(() => {
        hlMouse.removeAllMeshes();

        if (!canSnap || validSlot.used) return;

        // Snap ke posisi slot
        root.position.copyFrom(validSlot.mesh.getAbsolutePosition());
        root.position.y += 0.02; // sedikit offset
        validSlot.used = true;

        // Hentikan fisika agar objek tidak jatuh setelah di-snap
        if (root.physicsImpostor) {
          root.physicsImpostor.setMass(0);
          root.physicsImpostor.sleep();
        }

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

        // Final highlight
        hlMouse.addMesh(root, BABYLON.Color3.Green());
        hlMouse.addMesh(
          validSlot.mesh,
          BABYLON.Color3.FromHexString("#FFA500")
        );
      });
    });

  // ============================================================
  // 2. VR GRAB + VR SNAP (hierarki-aware)
  // ============================================================
  const xr = scene.__app.xr;
  if (!xr) {
    console.warn("VR belum aktif, VR grab tidak diinisialisasi");
    return;
  }

  const hlVR = new BABYLON.HighlightLayer("HL_VR", scene);
  const colorGreen = BABYLON.Color3.Green();
  const colorOrange = BABYLON.Color3.FromHexString("#FFA500");

  // (findMainMesh helper tetap sama)
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

  // Loop VR Grab
  Object.keys(loaded)
    .filter((key) => key !== "case")
    .forEach((key) => {
      const item = loaded[key];
      if (!item || !item.root) return;

      // Ambil slot valid menggunakan helper
      const slot = getValidSlotFor(key, slots);
      if (!slot || !slot.mesh) return;

      const root = item.root;
      const mainMesh = getMainMesh(item);

      // Pastikan impostor ada
      if (!root.physicsImpostor) return;

      xr.input.onControllerAddedObservable.add((controller) => {
        controller.onMotionControllerInitObservable.add((mc) => {
          const trigger = mc.getComponent("trigger");
          const squeeze = mc.getComponent("squeeze");

          let grabbed = false;
          const hand = controller.grip || controller.pointer;
          if (!hand) return;

          const tryGrab = () => {
            if (grabbed || slot.used) return;

            const dist = BABYLON.Vector3.Distance(
              root.getAbsolutePosition(),
              hand.getAbsolutePosition()
            );

            if (dist < 0.22) {
              grabbed = true;

              // Nonaktifkan fisika sementara
              root.physicsImpostor.sleep();
              root.setParent(hand); // Parenting ke tangan

              if (mainMesh) hlVR.addMesh(mainMesh, colorGreen);
            }
          };

          const releaseGrab = () => {
            if (!grabbed) return;

            root.setParent(null); // Lepas dari tangan
            grabbed = false;

            // Aktifkan lagi fisika (akan jatuh jika tidak di-snap)
            root.physicsImpostor.wakeUp();

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

              // Matikan fisika permanen setelah snap
              root.physicsImpostor.setMass(0);
              root.physicsImpostor.sleep();

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
            if (!grabbed || slot.used) return;
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

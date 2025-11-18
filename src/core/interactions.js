// src/core/interactions.js
// ============================================================================
// Features:
// ✔ Audio Integration
// ✔ Physics Logic (Revised):
//    - DRAG: Mass TETAP 1 (Dynamic). Gerak pakai Velocity (Bisa tabrak meja).
//    - DROP: Lepas Velocity -> Jatuh natural.
//    - SNAP: Physics DISPOSE (Mati total).
// ============================================================================

import { playPick, playPut, playCheer } from "../audio/audioManager.js";

// --------------------------- Utils ---------------------------

function debug(...args) {
  try {
    console.log("[INTERACT]", ...args);
  } catch (e) {}
}

function getMainMesh(item) {
  if (!item) return null;
  if (!item.meshes || item.meshes.length === 0) return item.root || null;

  let big = item.meshes[0];
  let max = 0;
  for (const m of item.meshes) {
    try {
      const b = m.getBoundingInfo().boundingBox.extendSizeWorld;
      const s = b.x + b.y + b.z;
      if (s > max) {
        max = s;
        big = m;
      }
    } catch (e) {}
  }
  return big;
}

function getAbsPos(mesh) {
  try {
    return mesh.getAbsolutePosition();
  } catch (e) {
    return mesh.position.clone();
  }
}

function quatCorrection(x, y, z) {
  return BABYLON.Quaternion.FromEulerAngles(
    BABYLON.Tools.ToRadians(x),
    BABYLON.Tools.ToRadians(y),
    BABYLON.Tools.ToRadians(z)
  );
}

// --------------------------- ROTATION FIX TABLE ---------------------------
const ROT_FIX = {
  mobo: quatCorrection(0, 180, 0),
  psu: quatCorrection(0, 180, 0),
  gpu: quatCorrection(0, 0, 0),
  ram1_pc: quatCorrection(0, 0, 90),
  ram2_pc: quatCorrection(0, 0, 90),
  ram1_laptop: quatCorrection(0, 0, 0),
  ram2_laptop: quatCorrection(0, 0, 0),
  console: quatCorrection(0, 270, 0),
  misc: quatCorrection(0, 270, 0),
  ups: quatCorrection(0, 270, 0),
  nas: quatCorrection(0, 270, 0),
  server: quatCorrection(0, 270, 0),
};

// --------------------------- Ghost Material ---------------------------
let _ghostMat = null;
function ghostMaterial(scene) {
  if (_ghostMat) return _ghostMat;
  _ghostMat = new BABYLON.StandardMaterial("__ghost_mat__", scene);
  _ghostMat.alpha = 0.35;
  _ghostMat.emissiveColor = new BABYLON.Color3(0.5, 0.7, 1);
  return _ghostMat;
}

function makeGhost(main, scene) {
  try {
    const g = main.clone(main.name + "_ghost");
    g.getChildMeshes().forEach((m) => {
      m.material = ghostMaterial(scene);
      m.isPickable = false;
    });
    g.material = ghostMaterial(scene);
    g.isPickable = false;
    g.renderingGroupId = 1;
    return g;
  } catch (e) {
    return null;
  }
}

// --------------------------- Slot Lookup ---------------------------
function getSlot(key, slots) {
  if (!slots) return null;
  if (key === "mobo") return slots.mobo;
  if (key === "cpu") return slots.cpu;
  if (key === "hdd") return slots.hdd;
  if (key === "ram1_pc") return slots.ram1_pc;
  if (key === "ram2_pc") return slots.ram2_pc;
  if (key === "ram1_laptop") return slots.ram1_laptop;
  if (key === "ram2_laptop") return slots.ram2_laptop;
  if (key === "gpu") return slots.gpu_mobo || slots.gpu;
  if (key === "psu") return slots.psu;
  if (key === "nvme_laptop") return slots.nvme_laptop;
  if (key === "battery_laptop") return slots.battery_laptop;
  if (key === "misc") return slots.slot_misc;
  if (key === "nas") return slots.slot_nas;
  if (key === "ups") return slots.slot_ups;
  if (key === "console") return slots.slot_console;
  if (key === `server`) return slots.slot_server;
  return null;
}

// --------------------------- SNAP FUNCTION ---------------------------
function snapItem(item, slot, scene) {
  const root = item.root;
  const loaded = scene.__app.loaded;

  let slotPos = getAbsPos(slot.mesh).clone();
  if (item.key === "gpu") slotPos.z -= 0.025;
  if (item.key.startsWith("ram")) slotPos.z -= 0.03;
  if (item.key === "mobo") slotPos.z -= 0.001;

  let finalQuat;
  if (item.key === "mobo") {
    finalQuat = ROT_FIX.mobo;
  } else {
    finalQuat = ROT_FIX[item.key] || BABYLON.Quaternion.Identity();
  }

  root.setParent(null);
  root.setAbsolutePosition(slotPos);
  root.rotationQuaternion = finalQuat;

  if (loaded.mobo) {
    if (
      item.key === "cpu" ||
      item.key === "gpu" ||
      item.key.startsWith("ram")
    ) {
      root.setParent(loaded.mobo.root);
    }
  }

  // 5. SNAP: HAPUS FISIK TOTAL
  if (root.physicsImpostor) {
    root.physicsImpostor.dispose();
    root.physicsImpostor = null;
  }

  root.isPickable = false;
  slot.used = true;
  slot.mesh.setEnabled(false);
  slot.mesh.isPickable = false;

  return root;
}

const COLOR_GREEN = BABYLON.Color3.Green();
const COLOR_YELLOW = new BABYLON.Color3(1, 0.8, 0.2);

// --------------------------- attachInteractions ---------------------------
export function attachInteractions(scene) {
  const app = scene.__app;
  const loaded = app.loaded;
  const slots = app.slots;
  const xr = app.xr;

  const hl = new BABYLON.HighlightLayer("HL_INTERACT", scene);

  const checkAllDone = () => {
    let allDone = true;
    for (const key of Object.keys(loaded)) {
      if (key === "case") continue;
      const slot = getSlot(key, slots);
      if (slot && !slot.used) {
        allDone = false;
        break;
      }
    }
    if (allDone) {
      console.log("🎉 Perakitan Selesai!");
      playCheer();
    }
  };

  // ===========================
  // MOUSE DRAG INTERACTION (PHYSICS-BASED)
  // ===========================
  Object.keys(loaded).forEach((key) => {
    if (key === "case") return;

    const item = loaded[key];
    const root = item.root;
    const main = getMainMesh(item);
    const slot = getSlot(key, slots);
    if (!slot) return;

    // 1. Gunakan Drag Behavior tanpa Plane Normal (Bebas 3D)
    const drag = new BABYLON.PointerDragBehavior();

    // 2. PENTING: Matikan moveAttached agar posisi tidak dipaksa (tembus collider)
    // Kita akan gerakkan manual pakai Physics Velocity
    drag.moveAttached = false;

    root.addBehavior(drag);

    let ghost = null;
    let canSnap = false;

    drag.onDragStartObservable.add(() => {
      if (!slot.used) {
        playPick();
        // Pastikan impostor aktif & Dynamic (Mass > 0) agar bisa tabrak meja
        if (root.physicsImpostor) {
          root.physicsImpostor.wakeUp();
          // Jangan setMass(0)! Biarkan Mass 1 agar collision dengan Static Object jalan.
        }
      }
    });

    drag.onDragObservable.add((event) => {
      if (slot.used) return;
      if (!root.physicsImpostor) return;

      // 3. LOGIKA GERAK: Tarik objek ke arah mouse menggunakan Velocity
      // Ini membuat physics engine tetap menghitung tabrakan
      const targetPos = event.dragPlanePoint;
      const currentPos = root.getAbsolutePosition();

      // Hitung vektor arah ke mouse
      const diff = targetPos.subtract(currentPos);

      // Scale factor (kecepatan ikut mouse). 15 cukup responsif.
      // Semakin besar, semakin kuat tarikannya (tapi bisa tembus jika terlalu cepat).
      const velocity = diff.scale(15);

      // Terapkan Velocity
      root.physicsImpostor.setLinearVelocity(velocity);

      // Matikan Rotasi (Angular) agar barang tidak muter-muter saat ditarik
      root.physicsImpostor.setAngularVelocity(BABYLON.Vector3.Zero());

      // Reset rotasi visual biar tegak lurus (opsional, agar rapi)
      // root.rotationQuaternion = BABYLON.Quaternion.Identity();

      // --- Logic Snap Highlight ---
      const dist = BABYLON.Vector3.Distance(
        getMainMesh(item).getAbsolutePosition(),
        getAbsPos(slot.mesh)
      );
      hl.removeAllMeshes();
      const tolerance = item.key === "console" ? 0.55 : 0.25;

      if (dist < tolerance) {
        canSnap = true;
        hl.addMesh(main, COLOR_GREEN);
        hl.addMesh(slot.mesh, COLOR_YELLOW);

        if (!ghost) ghost = makeGhost(main, scene);
        if (ghost) {
          ghost.setAbsolutePosition(getAbsPos(slot.mesh));
          ghost.rotationQuaternion =
            ROT_FIX[key] || BABYLON.Quaternion.Identity();
          ghost.setEnabled(true);
        }
      } else {
        canSnap = false;
        if (ghost) ghost.setEnabled(false);
      }
    });

    drag.onDragEndObservable.add(() => {
      hl.removeAllMeshes();
      if (ghost) ghost.setEnabled(false);

      if (canSnap && !slot.used && scene.__tutorial.allowSnap(item.key)) {
        // SNAP: Physics Dispose
        const placed = snapItem(item, slot, scene);
        scene.__tutorial.onSnapped(item.key);
        playPut();
        hl.addMesh(placed, COLOR_GREEN);
        setTimeout(() => hl.removeAllMeshes(), 800);
        checkAllDone();
      } else {
        // DROP: Lepaskan Velocity, biarkan jatuh
        if (root.physicsImpostor) {
          // Dampen velocity supaya tidak terlempar kencang saat dilepas
          root.physicsImpostor.setLinearVelocity(
            root.physicsImpostor.getLinearVelocity().scale(0.1)
          );
          root.physicsImpostor.setAngularVelocity(BABYLON.Vector3.Zero());
        }
      }
    });
  });

  // ===========================
  // VR INTERACTION (Biarkan Default / Parenting)
  // ===========================
  // Catatan: VR menggunakan parenting ke tangan, jadi collision fisika
  // saat grab VR agak kompleks (perlu Physics Constraint).
  // Kode di bawah ini adalah logika standar Grab-Parent-Drop.
  if (app.xr) {
    const xr = app.xr;
    xr.input.onControllerAddedObservable.add((controller) => {
      controller.onMotionControllerInitObservable.add((mc) => {
        const trigger = mc.getComponent("trigger");
        const squeeze = mc.getComponent("squeeze");
        const hand = controller.grip || controller.pointer;
        let grabbed = null;
        let ghost = null;

        const tryGrab = () => {
          if (grabbed) return;
          for (const key of Object.keys(loaded)) {
            if (key === "case") continue;
            const item = loaded[key];
            if (!getSlot(key, slots) || getSlot(key, slots).used) continue;

            const dist = BABYLON.Vector3.Distance(
              getMainMesh(item).getAbsolutePosition(),
              hand.getAbsolutePosition()
            );
            if (dist < 0.22) {
              grabbed = { key, item, slot: getSlot(key, slots) };
              // VR: Matikan physics saat dipegang (biar tidak berat/jatuh dari tangan)
              if (item.root.physicsImpostor)
                item.root.physicsImpostor.setMass(0);
              item.root.setParent(hand);
              item.root.position = BABYLON.Vector3.Zero();
              playPick();
              return;
            }
          }
        };

        const releaseGrab = () => {
          if (!grabbed) return;
          const { key, item, slot } = grabbed;
          grabbed = null;
          item.root.setParent(null);

          // VR Drop: Kembalikan Mass 1 agar jatuh
          if (item.root.physicsImpostor) item.root.physicsImpostor.setMass(1);

          const dist = BABYLON.Vector3.Distance(
            getMainMesh(item).getAbsolutePosition(),
            getAbsPos(slot.mesh)
          );
          if (dist < 0.22 && scene.__tutorial.allowSnap(key)) {
            const placed = snapItem(item, slot, scene);
            scene.__tutorial.onSnapped(key);
            playPut();
            hl.addMesh(placed, COLOR_GREEN);
            setTimeout(() => hl.removeAllMeshes(), 800);
            checkAllDone();
          }
          if (ghost) ghost.setEnabled(false);
        };

        [trigger, squeeze].forEach((btn) => {
          if (!btn) return;
          btn.onButtonStateChangedObservable.add((s) => {
            if (s.pressed) tryGrab();
            else releaseGrab();
          });
        });
      });
    });
  }
}

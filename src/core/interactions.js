// src/core/interactions.js
// ============================================================================
// Features:
// ✔ Audio Integration (Pick, Put, & Auto Cheer on Finish)
// ✔ GPU offset fix
// ✔ RAM upright fix
// ✔ CPU/GPU/RAM parented to MOBO
// ✔ Ghost preview
// ✔ VR + mouse drag working
// ============================================================================

// 1. TAMBAHKAN playCheer DI IMPORT
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
    debug("Ghost fail", e);
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

  const clone = root.clone(root.name + "_SNAPPED");
  clone.setAbsolutePosition(slotPos);
  clone.rotationQuaternion = finalQuat;
  clone.scaling.copyFrom(root.scaling);
  clone.isPickable = false;

  if (loaded.mobo) {
    if (
      item.key === "cpu" ||
      item.key === "gpu" ||
      item.key.startsWith("ram")
    ) {
      clone.setParent(loaded.mobo.root);
    }
  }

  root.setEnabled(false);
  if (root.physicsImpostor) {
    root.physicsImpostor.dispose();
    root.physicsImpostor = null;
  }

  slot.used = true;
  slot.mesh.setEnabled(false);
  slot.mesh.isPickable = false;

  return clone;
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

  // 2. FUNGSI CEK KELENGKAPAN (AUTO CHEER)
  const checkAllDone = () => {
    let allDone = true;
    // Cek setiap item yang diload
    for (const key of Object.keys(loaded)) {
      if (key === "case") continue; // Abaikan casing

      const slot = getSlot(key, slots);
      // Jika item punya slot, tapi slotnya belum 'used', berarti belum selesai
      if (slot && !slot.used) {
        allDone = false;
        break;
      }
    }

    if (allDone) {
      console.log("🎉 Perakitan Selesai! Memutar audio cheering...");
      playCheer();
    }
  };

  // ===========================
  // MOUSE DRAG INTERACTION
  // ===========================
  Object.keys(loaded).forEach((key) => {
    if (key === "case") return;

    const item = loaded[key];
    const root = item.root;
    const main = getMainMesh(item);
    const slot = getSlot(key, slots);
    if (!slot) return;

    const drag = new BABYLON.PointerDragBehavior({
      dragPlaneNormal: new BABYLON.Vector3(0, 1, 0),
    });
    root.addBehavior(drag);

    let ghost = null;
    let canSnap = false;

    drag.onDragStartObservable.add(() => {
      if (!slot.used) playPick();
    });

    drag.onDragObservable.add(() => {
      if (slot.used) return;
      const dist = BABYLON.Vector3.Distance(
        getAbsPos(main),
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
        const placed = snapItem(item, slot, scene);
        scene.__tutorial.onSnapped(item.key);

        playPut(); // Bunyi 'Tak'

        hl.addMesh(placed, COLOR_GREEN);
        setTimeout(() => hl.removeAllMeshes(), 800);

        // 3. CEK SELESAI SETELAH PASANG (MOUSE)
        checkAllDone();
      }
    });
  });

  // ===================================================
  // VR INTERACTION
  // ===================================================
  if (!xr) return;

  xr.input.onControllerAddedObservable.add((controller) => {
    controller.onMotionControllerInitObservable.add((mc) => {
      const trigger = mc.getComponent("trigger");
      const squeeze = mc.getComponent("squeeze");
      const hand = controller.grip || controller.pointer;

      let grabbed = null;
      let ghost = null;

      function tryGrab() {
        if (grabbed) return;

        for (const key of Object.keys(loaded)) {
          if (key === "case") continue;

          const item = loaded[key];
          const main = getMainMesh(item);
          const slot = getSlot(key, slots);
          if (!slot || slot.used) continue;

          const dist = BABYLON.Vector3.Distance(
            getAbsPos(main),
            hand.getAbsolutePosition()
          );

          if (dist < 0.22) {
            grabbed = { key, item, main, slot, root: item.root };
            item.root.setParent(hand);
            playPick();
            return;
          }
        }
      }

      function releaseGrab() {
        if (!grabbed) return;
        const { key, item, main, slot, root } = grabbed;
        grabbed = null;

        root.setParent(null);

        const dist = BABYLON.Vector3.Distance(
          getAbsPos(main),
          getAbsPos(slot.mesh)
        );

        if (dist < 0.22 && !slot.used) {
          if (scene.__tutorial.allowSnap(key)) {
            const placed = snapItem(item, slot, scene);
            scene.__tutorial.onSnapped(key);

            playPut(); // Bunyi 'Tak'

            hl.addMesh(placed, COLOR_GREEN);
            setTimeout(() => hl.removeAllMeshes(), 800);

            // 4. CEK SELESAI SETELAH PASANG (VR)
            checkAllDone();
          }
        }

        if (ghost) ghost.setEnabled(false);
      }

      [trigger, squeeze].forEach((btn) => {
        if (!btn) return;
        btn.onButtonStateChangedObservable.add((state) => {
          if (state.pressed) tryGrab();
          else releaseGrab();
        });
      });
    });
  });
}

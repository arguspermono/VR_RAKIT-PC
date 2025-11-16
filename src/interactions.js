// interactions.js — FINAL FIX (GPU offset + RAM upright + ignore slot rotation)
// ===============================================================
// Features:
// ✔ Mouse drag snap
// ✔ VR grab snap
// ✔ Slot auto-detection
// ✔ Correct RAM/GPU orientation
// ✔ GPU depth offset fix
// ✔ Ghost preview
// ✔ Highlight slot & item
// ✔ Ignores wrong GLB slot rotations
// ===============================================================

// --------------------------- Utils ---------------------------
function debug(...args) {
  try {
    console.log("[INTERACT]", ...args);
  } catch (e) {}
}

function warn(...args) {
  try {
    console.warn("[INTERACT WARN]", ...args);
  } catch (e) {}
}

function getMainMesh(item) {
  if (!item) return null;
  if (!item.meshes || item.meshes.length === 0) return item.root || null;

  let biggest = item.meshes[0];
  let max = 0;

  item.meshes.forEach((m) => {
    try {
      const b = m.getBoundingInfo().boundingBox.extendSizeWorld;
      const size = b.x + b.y + b.z;
      if (size > max) {
        max = size;
        biggest = m;
      }
    } catch (e) {}
  });

  return biggest;
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

// --------------------------- Rotation Fix (Absolute Orientation) ---------------------------
// GPU uses model's own rotation, RAM rotated upright
const ROT_FIX = {
  psu: quatCorrection(0, 180, 0),

  // GPU: identity → use model orientation (correct for your model)
  gpu: quatCorrection(0, 0, 0),

  // RAM: your model needs +90° Z to stand upright
  ram1: quatCorrection(0, 0, 90),
  ram2: quatCorrection(0, 0, 90),
  ram3: quatCorrection(0, 0, 90),
  ram4: quatCorrection(0, 0, 90),
};

// --------------------------- Ghost Material ---------------------------
let _ghostMat = null;

function ghostMaterial(scene) {
  if (_ghostMat) return _ghostMat;
  _ghostMat = new BABYLON.StandardMaterial("__ghost_mat__", scene);
  _ghostMat.alpha = 0.35;
  _ghostMat.emissiveColor = new BABYLON.Color3(0.5, 0.7, 1);
  _ghostMat.disableLighting = false;
  return _ghostMat;
}

function makeGhost(mainMesh, scene) {
  try {
    const ghost = mainMesh.clone(mainMesh.name + "_ghost");
    ghost.getChildMeshes().forEach((m) => {
      m.material = ghostMaterial(scene);
      m.isPickable = false;
    });
    ghost.material = ghostMaterial(scene);
    ghost.isPickable = false;
    ghost.renderingGroupId = 1;
    return ghost;
  } catch (e) {
    warn("makeGhost failed", e);
    return null;
  }
}

// --------------------------- Slot Lookup ---------------------------
function getSlot(key, slots) {
  if (key === "mobo") return slots.mobo;
  if (key === "cpu") return slots.cpu;
  if (key.startsWith("ram")) return slots[key];
  if (key === "gpu") return slots.gpu_mobo || slots.gpu_case || slots.gpu;
  if (key === "psu") return slots.psu;
  if (key.startsWith("hdd")) return slots.hdd1 || slots.hdd2 || slots.hdd;
  if (key.startsWith("fan"))
    return slots.fan || slots.fan1 || slots.fan2 || slots.fan3;
  return null;
}

// --------------------------- SNAP SYSTEM ---------------------------
function snapItem(item, slot, scene) {
  const root = item.root;

  // Base position = slot position
  let slotPos = getAbsPos(slot.mesh).clone();

  // ---------------- GPU OFFSET FIX ----------------
  if (item.key === "gpu") {
    slotPos.z -= 0.025; // adjust deeper/outer. Increase if still inside.
  }

  // ---------------- RAM OFFSET FIX (thin clearance) --------------
  if (item.key.startsWith("ram")) {
    slotPos.z -= 0.01; // small pull outward
  }

  // Final rotation = ROT_FIX only (ignore slot mesh rotation)
  const finalQuat = ROT_FIX[item.key] || BABYLON.Quaternion.Identity();

  const clone = root.clone(root.name + "_SNAPPED");
  clone.setAbsolutePosition(slotPos);
  clone.rotationQuaternion = finalQuat;
  clone.scaling.copyFrom(root.scaling);
  clone.isPickable = false;

  if (clone.physicsImpostor) {
    clone.physicsImpostor.dispose();
    clone.physicsImpostor = null;
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

// --------------------------- Highlight Colors ---------------------------
const COLOR_GREEN = BABYLON.Color3.Green();
const COLOR_YELLOW = new BABYLON.Color3(1, 0.8, 0.2);

// --------------------------- attachInteractions ---------------------------
export function attachInteractions(scene) {
  const app = scene.__app;
  const loaded = app.loaded;
  const slots = app.slots;
  const xr = app.xr;

  debug("attachInteractions: READY");

  const hl = new BABYLON.HighlightLayer("HL_INTERACT", scene);

  // -------------------- MOUSE DRAG SYSTEM --------------------
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

    drag.onDragObservable.add(() => {
      if (slot.used) return;

      const dist = BABYLON.Vector3.Distance(
        getAbsPos(main),
        getAbsPos(slot.mesh)
      );

      hl.removeAllMeshes();

      if (dist < 0.25) {
        canSnap = true;

        hl.addMesh(main, COLOR_GREEN);
        hl.addMesh(slot.mesh, COLOR_YELLOW);

        if (!ghost) ghost = makeGhost(main, scene);
        if (ghost) {
          ghost.setAbsolutePosition(getAbsPos(slot.mesh));

          // Ghost uses same orientation as final snap
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

      if (!canSnap || slot.used) return;

      const placed = snapItem(item, slot, scene);
      hl.addMesh(placed, COLOR_GREEN);
      setTimeout(() => hl.removeAllMeshes(), 800);
    });
  });

  // -------------------- VR SYSTEM --------------------
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

            if (item.root.physicsImpostor) item.root.physicsImpostor.sleep();
            item.root.setParent(hand);
            return;
          }
        }
      }

      function releaseGrab() {
        if (!grabbed) return;

        const { key, item, main, slot, root } = grabbed;
        grabbed = null;

        root.setParent(null);
        if (root.physicsImpostor) root.physicsImpostor.wakeUp();

        const dist = BABYLON.Vector3.Distance(
          getAbsPos(main),
          getAbsPos(slot.mesh)
        );

        if (dist < 0.22 && !slot.used) {
          const placed = snapItem(item, slot, scene);
          hl.addMesh(placed, COLOR_GREEN);
          setTimeout(() => hl.removeAllMeshes(), 800);
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

      scene.onBeforeRenderObservable.add(() => {
        if (!grabbed) return;

        const { key, main, slot } = grabbed;

        const dist = BABYLON.Vector3.Distance(
          getAbsPos(main),
          getAbsPos(slot.mesh)
        );

        if (dist < 0.22 && !slot.used) {
          if (!ghost) ghost = makeGhost(main, scene);
          if (ghost) {
            ghost.setAbsolutePosition(getAbsPos(slot.mesh));

            ghost.rotationQuaternion =
              ROT_FIX[key] || BABYLON.Quaternion.Identity();

            ghost.setEnabled(true);
          }
        } else {
          if (ghost) ghost.setEnabled(false);
        }
      });
    });
  });
}

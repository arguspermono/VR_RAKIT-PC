// interactions.js — FINAL STABLE VERSION
// ===============================================================
// Features:
// ✔ Mouse drag snap
// ✔ VR grab snap
// ✔ Slot auto-detection
// ✔ Auto-correct rotation for PSU/GPU/RAM
// ✔ Ghost preview (translucent)
// ✔ Highlight slot and main
// ✔ Debug printer, no fatal errors
// ✔ Safe color usage (no Color3.Orange())
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

function getAbsQuat(mesh) {
  if (mesh.rotationQuaternion) return mesh.rotationQuaternion.clone();
  return BABYLON.Quaternion.FromEulerVector(
    mesh.rotation || BABYLON.Vector3.Zero()
  );
}

function quatCorrection(degX, degY, degZ) {
  const rad = new BABYLON.Vector3(
    BABYLON.Tools.ToRadians(degX),
    BABYLON.Tools.ToRadians(degY),
    BABYLON.Tools.ToRadians(degZ)
  );
  return BABYLON.Quaternion.FromEulerVector(rad);
}

// Rotation auto-fix
const ROT_FIX = {
  psu: quatCorrection(0, 180, 0),
  gpu: quatCorrection(0, 90, 0),
  ram1: quatCorrection(0, 0, 0),
  ram2: quatCorrection(0, 0, 0),
  ram3: quatCorrection(0, 0, 0),
  ram4: quatCorrection(0, 0, 0),
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
  if (!slots) return null;
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

// --------------------------- SNAP SYSTEM (clone → replace) ---------------------------
function snapItem(item, slot, scene) {
  const root = item.root;
  const slotMesh = slot.mesh;

  const slotPos = getAbsPos(slotMesh);
  const slotRot = getAbsQuat(slotMesh);

  const fix = ROT_FIX[item.key] || BABYLON.Quaternion.Identity();
  const finalQuat = slotRot.multiply(fix);

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
  slotMesh.setEnabled(false);
  slotMesh.isPickable = false;

  return clone;
}

// --------------------------- Highlight Colors ---------------------------
const COLOR_GREEN = BABYLON.Color3.Green();
const COLOR_YELLOW = new BABYLON.Color3(1, 0.8, 0.2); // previously Orange() but manual
const COLOR_BLUE = new BABYLON.Color3(0.3, 0.5, 1);

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
    if (!slot || !slot.mesh) {
      warn("No slot for", key);
      return;
    }

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
      debug(`DRAG ${key} dist=${dist.toFixed(3)}`);

      hl.removeAllMeshes();

      if (dist < 0.25) {
        canSnap = true;

        hl.addMesh(main, COLOR_GREEN);
        hl.addMesh(slot.mesh, COLOR_YELLOW);

        if (!ghost) ghost = makeGhost(main, scene);
        if (ghost) {
          ghost.setAbsolutePosition(getAbsPos(slot.mesh));
          ghost.rotationQuaternion = getAbsQuat(slot.mesh).multiply(
            ROT_FIX[key] || BABYLON.Quaternion.Identity()
          );
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

      if (!canSnap || slot.used) {
        debug(`NOT SNAPPED: ${key}`);
        return;
      }

      const placed = snapItem(item, slot, scene);
      debug(`SNAPPED: ${key} -> ${slot.mesh.name}`);
      hl.addMesh(placed, COLOR_GREEN);
      setTimeout(() => hl.removeAllMeshes(), 800);
    });
  });

  // -------------------- VR SYSTEM --------------------
  if (!xr) {
    warn("XR not initialized");
    return;
  }

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
          debug(`VR SNAPPED: ${key}`);

          hl.addMesh(placed, COLOR_GREEN);
          setTimeout(() => hl.removeAllMeshes(), 800);
        } else {
          debug(`VR NOT SNAPPED: ${key}`);
        }

        if (ghost) ghost.setEnabled(false);
      }

      controller.onDisposeObservable.add(() => {
        if (ghost) ghost.dispose();
      });

      [trigger, squeeze].forEach((btn) => {
        if (!btn) return;
        btn.onButtonStateChangedObservable.add((state) => {
          if (state.pressed) tryGrab();
          else releaseGrab();
        });
      });

      scene.onBeforeRenderObservable.add(() => {
        if (!grabbed) return;

        const { key, item, main, slot } = grabbed;
        const dist = BABYLON.Vector3.Distance(
          getAbsPos(main),
          getAbsPos(slot.mesh)
        );

        if (dist < 0.22 && !slot.used) {
          if (!ghost) ghost = makeGhost(main, scene);
          if (ghost) {
            ghost.setAbsolutePosition(getAbsPos(slot.mesh));
            ghost.rotationQuaternion = getAbsQuat(slot.mesh).multiply(
              ROT_FIX[key] || BABYLON.Quaternion.Identity()
            );
            ghost.setEnabled(true);
          }
        } else {
          if (ghost) ghost.setEnabled(false);
        }
      });
    });
  });
}

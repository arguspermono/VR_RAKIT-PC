// src/core/interactions.js
// ============================================================================
// Features:
// ✔ Audio Integration
// ✔ Physics Logic (Revised)
// ✔ AI Component Identity Card (NEW)
// ============================================================================

import { playPick, playPut, playCheer } from "../audio/audioManager.js";

// --- AI CARD START ---
// Import service AI yang baru kita buat
import { getComponentInsight } from "./aiService.js";
// --- AI CARD END ---

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
  // --- Penyesuaian kecil agar nama file glb (processor) cocok ---
  if (key === "processor") return slots.cpu;
  // ---
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
      item.key === "processor" || // Penyesuaian
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

// --- AI CARD START ---
// Variabel global untuk UI & Kartu AI
let ui_scanner = null;
let currentCard = null;

/**
 * Menampilkan kartu info AI di atas mesh
 * @param {BABYLON.AbstractMesh} mesh - Mesh untuk diikuti
 * @param {object} data - Data dari AI { role, desc, funFact }
 */
function showIdentityCard(mesh, data) {
  if (!ui_scanner) {
    ui_scanner =
      BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI_SCANNER");
  }

  // Hapus kartu lama jika ada
  if (currentCard) currentCard.dispose();

  // 📌 Ukuran diperbesar (dari 220x110 → 320x160)
  const rect = new BABYLON.GUI.Rectangle();
  rect.width = "400px";
  rect.height = "200px";
  rect.cornerRadius = 14;
  rect.color = "#00d2ff";
  rect.thickness = 2.5;
  rect.background = "rgba(0, 0, 0, 0.85)";

  // 📌 ROLE — lebih besar
  const roleText = new BABYLON.GUI.TextBlock();
  roleText.text = data.role.toUpperCase();
  roleText.color = data.role === "SCANNING..." ? "yellow" : "#00d2ff";
  roleText.fontSize = 22; // sebelumnya 16
  roleText.fontWeight = "bold";
  roleText.top = "-55px"; // disesuaikan dgn ukuran baru
  rect.addControl(roleText);

  // 📌 DESC — lebih besar & lebih mudah dibaca
  const descText = new BABYLON.GUI.TextBlock();
  descText.text = data.desc;
  descText.color = "white";
  descText.fontSize = 16; // sebelumnya 12
  descText.textWrapping = true;
  descText.top = "-5px";
  descText.width = "92%";
  rect.addControl(descText);

  // 📌 FUN FACT — lebih besar
  const factText = new BABYLON.GUI.TextBlock();
  factText.text = data.funFact === "..." ? "..." : "INFO: " + data.funFact;
  factText.color = "yellow";
  factText.fontSize = 14; // sebelumnya 10
  factText.textWrapping = true;
  factText.top = "55px";
  factText.width = "92%";
  rect.addControl(factText);

  ui_scanner.addControl(rect);

  // 📌 Offset dinaikkan sedikit supaya proporsional
  rect.linkWithMesh(mesh);
  rect.linkOffsetY = -140;

  currentCard = rect;
}

/**
 * Sembunyikan kartu info AI
 */
function hideCard() {
  if (currentCard) {
    currentCard.dispose();
    currentCard = null;
  }
}
// --- AI CARD END ---

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
      if (key === "case" || key === "server_rack" || key === "casing_laptop")
        continue; // Abaikan casing
      const slot = getSlot(key, slots);
      if (slot && !slot.used) {
        allDone = false;
        break;
      }
    }
    if (allDone) {
      debug("🎉 Perakitan Selesai!");
      playCheer();
    }
  };

  // ===========================
  // MOUSE DRAG INTERACTION (PHYSICS-BASED)
  // ===========================
  Object.keys(loaded).forEach((key) => {
    // Abaikan casing/rak
    if (key === "case" || key === "server_rack" || key === "casing_laptop")
      return;

    const item = loaded[key];
    const root = item.root;
    const main = getMainMesh(item);
    const slot = getSlot(key, slots);
    if (!slot) return;

    const drag = new BABYLON.PointerDragBehavior();
    drag.moveAttached = false;
    root.addBehavior(drag);

    let ghost = null;
    let canSnap = false;

    drag.onDragStartObservable.add(() => {
      if (!slot.used) {
        playPick();
        if (root.physicsImpostor) {
          root.physicsImpostor.wakeUp();
        }

        // --- AI CARD START ---
        // Tampilkan "Scanning..." saat dipegang
        showIdentityCard(root, {
          role: "SCANNING...",
          desc: "Mengidentifikasi komponen...",
          funFact: "...",
        });

        // Panggil AI (Async)
        getComponentInsight(key).then((aiData) => {
          // Update kartu HANYA jika masih dipegang
          if (currentCard && currentCard._linkedMesh === root) {
            showIdentityCard(root, aiData);
          }
        });
        // --- AI CARD END ---
      }
    });

    drag.onDragObservable.add((event) => {
      // ... (KODE LAMA ANDA, TIDAK DIUBAH) ...
      if (slot.used) return;
      if (!root.physicsImpostor) return;
      const targetPos = event.dragPlanePoint;
      const currentPos = root.getAbsolutePosition();
      const diff = targetPos.subtract(currentPos);
      const velocity = diff.scale(15);
      root.physicsImpostor.setLinearVelocity(velocity);
      root.physicsImpostor.setAngularVelocity(BABYLON.Vector3.Zero());
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
      // --- AI CARD START ---
      hideCard(); // Sembunyikan kartu saat dilepas
      // --- AI CARD END ---

      hl.removeAllMeshes();
      if (ghost) ghost.setEnabled(false);

      if (canSnap && !slot.used && scene.__tutorial.allowSnap(item.key)) {
        const placed = snapItem(item, slot, scene);
        scene.__tutorial.onSnapped(item.key);
        playPut();
        hl.addMesh(placed, COLOR_GREEN);
        setTimeout(() => hl.removeAllMeshes(), 800);
        checkAllDone();
      } else {
        if (root.physicsImpostor) {
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
            // Abaikan casing
            if (
              key === "case" ||
              key === "server_rack" ||
              key === "casing_laptop"
            )
              continue;

            const item = loaded[key];
            if (!getSlot(key, slots) || getSlot(key, slots).used) continue;

            const dist = BABYLON.Vector3.Distance(
              getMainMesh(item).getAbsolutePosition(),
              hand.getAbsolutePosition()
            );
            if (dist < 0.22) {
              grabbed = { key, item, slot: getSlot(key, slots) };
              if (item.root.physicsImpostor)
                item.root.physicsImpostor.setMass(0);
              item.root.setParent(hand);
              item.root.position = BABYLON.Vector3.Zero();
              playPick();

              // --- AI CARD START (VR) ---
              showIdentityCard(item.root, {
                role: "SCANNING...",
                desc: "Mengidentifikasi komponen...",
                funFact: "...",
              });
              getComponentInsight(key).then((aiData) => {
                // Update HANYA jika masih dipegang
                if (grabbed && grabbed.key === key) {
                  showIdentityCard(item.root, aiData);
                }
              });
              // --- AI CARD END (VR) ---
              return;
            }
          }
        };

        const releaseGrab = () => {
          if (!grabbed) return;

          // --- AI CARD START (VR) ---
          hideCard(); // Sembunyikan saat dilepas
          // --- AI CARD END (VR) ---

          const { key, item, slot } = grabbed;
          grabbed = null;
          item.root.setParent(null);

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

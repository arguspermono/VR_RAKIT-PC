// src/core/slots.js (only detectSlots function shown)
import { findMeshByName } from "./utils.js";

export function detectSlots(scene) {
  const loaded = scene.__app.loaded || {};
  const slots = {};

  function add(name, mesh) {
    if (mesh) slots[name] = { mesh, used: false };
  }

  // PC / mobo slots (kept existing logic)
  if (loaded.case) {
    const c = loaded.case.meshes;
    add("mobo", findMeshByName(c, "MB_P"));
    add("psu", findMeshByName(c, "PSU_P"));
    add("hdd", findMeshByName(c, "HDD_P"));
  }

  if (loaded.mobo) {
    const m = loaded.mobo.meshes;
    add("cpu", findMeshByName(m, "CPU_SOCKET"));
    add("cooler", findMeshByName(m, "COOLER"));
    add("ram1_pc", findMeshByName(m, "RAM1_P"));
    add("ram2_pc", findMeshByName(m, "RAM2_P"));
    add("gpu_mobo", findMeshByName(m, "GPU_P"));
  }

  // Laptop casing slots (explicit keys)
  if (loaded.casing_laptop) {
    const c = loaded.casing_laptop.meshes;
    add("ram1_laptop", findMeshByName(c, "SLOT_RAM1"));
    add("ram2_laptop", findMeshByName(c, "SLOT_RAM2"));
    add("nvme_laptop", findMeshByName(c, "SLOT_NVME"));
    add("battery_laptop", findMeshByName(c, "SLOT_BATTERY"));
  }

  // --- SERVER RACK SLOTS ---
  if (loaded.server_rack) {
    const r = loaded.server_rack.meshes;
    // misc slots
    add("slot_misc1", findMeshByName(r, "SLOT_MISC1"));
    add("slot_misc2", findMeshByName(r, "SLOT_MISC2"));
    add("slot_nas", findMeshByName(r, "SLOT_NAS"));
    add("slot_ups", findMeshByName(r, "SLOT_UPS"));
    add("slot_console", findMeshByName(r, "SLOT_CONSOLE"));
    // server unit slots (1..9)
    for (let i = 1; i <= 9; i++) {
      add(`slot_server${i}`, findMeshByName(r, `SLOT_SERVER${i}`));
    }
  }

  console.log("SLOTS DETECTED:", Object.keys(slots));
  return slots;
}

// src/core/slots.js
import { findMeshByName } from "./utils.js";

export function detectSlots(scene) {
  const loaded = scene.__app.loaded || {};
  const slots = {};

  function add(name, mesh) {
    if (mesh) slots[name] = { mesh, used: false };
  }

  // CASE (PC)
  if (loaded.case) {
    const c = loaded.case.meshes;
    add("mobo", findMeshByName(c, "MB_P"));
    add("psu", findMeshByName(c, "PSU_P"));
    add("hdd", findMeshByName(c, "HDD_P"));
  }

  // MOBO (PC)
  if (loaded.mobo) {
    const m = loaded.mobo.meshes;
    add("cpu", findMeshByName(m, "CPU_SOCKET"));
    add("cooler", findMeshByName(m, "COOLER"));
    add("ram1_pc", findMeshByName(m, "RAM1_P"));
    add("ram2_pc", findMeshByName(m, "RAM2_P"));
    add("gpu_mobo", findMeshByName(m, "GPU_P"));
  }

  // LAPTOP casing slots (explicit)
  if (loaded.casing_laptop) {
    const c = loaded.casing_laptop.meshes;
    add("ram1_laptop", findMeshByName(c, "SLOT_RAM1"));
    add("ram2_laptop", findMeshByName(c, "SLOT_RAM2"));
    add("nvme_laptop", findMeshByName(c, "SLOT_NVME"));
    add("battery_laptop", findMeshByName(c, "SLOT_BATTERY"));
  }

  console.log("SLOTS:", slots);
  return slots;
}

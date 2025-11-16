import { findMeshByName } from "./utils.js";

export function detectSlots(scene) {
  const loaded = scene.__app.loaded;
  const slots = {};

  function add(name, mesh) {
    if (mesh) slots[name] = { mesh, used: false };
  }

  // CASE (mounting points)
  if (loaded.case) {
    const c = loaded.case.meshes;
    add("mobo", findMeshByName(c, "MB_P"));
    add("psu", findMeshByName(c, "PSU_P"));
    add("hdd", findMeshByName(c, "HDD_P"));
    add("fan", findMeshByName(c, "FCS_P"));
  }

  // MOBO
  if (loaded.mobo) {
    const m = loaded.mobo.meshes;
    add("cpu", findMeshByName(m, "CPU_SOCKET"));
    add("cooler", findMeshByName(m, "COOLER"));
    add("ram1", findMeshByName(m, "RAM1_P"));
    add("ram2", findMeshByName(m, "RAM2_P"));
    add("gpu_mobo", findMeshByName(m, "GPU_P"));
  }

  console.log("SLOTS:", slots);
  return slots;
}

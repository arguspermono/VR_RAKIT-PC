import { findMeshByName } from "./utils.js";

export function detectSlots(scene) {
  const loaded = scene.__app.loaded;
  const slots = {};

  const add = (name, mesh) => {
    if (mesh) slots[name] = { mesh, used: false };
  };

  // CASE
  if (loaded.case) {
    const c = loaded.case.meshes;
    add("mobo", findMeshByName(c, "MB_P"));
    add("psu", findMeshByName(c, "PSU_P"));
    add("hdd", findMeshByName(c, "HDD_P"));
    add("fan1", findMeshByName(c, "FCS1"));
    add("fan2", findMeshByName(c, "FCS2"));
    add("fan3", findMeshByName(c, "FCS3"));
  }

  // MOBO
  if (loaded.mobo) {
    const m = loaded.mobo.meshes;
    add("cpu", findMeshByName(m, "CPU_SOCKET"));
    add("ram1", findMeshByName(m, "RAM1_P"));
    add("ram2", findMeshByName(m, "RAM2_P"));
    add("ram3", findMeshByName(m, "RAM3_P"));
    add("ram4", findMeshByName(m, "RAM4_P"));
    add("gpu_mobo", findMeshByName(m, "GPU_P"));
  }

  // fallback
  if (!slots.fan) add("fan", slots.fan1?.mesh);
  if (!slots.gpu_mobo) {
    const fb = scene.meshes.find((m) => m.name.toLowerCase().includes("pcie"));
    if (fb) add("gpu_mobo", fb);
  }

  console.log("SLOTS:", slots);
  return slots;
}

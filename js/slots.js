// project/src/slots.js
import { findMeshByName } from "./utils.js";

export function detectSlots(scene) {
  const loaded = scene.__app?.loaded || {};
  const slots = {};

  const addSlot = (name, mesh) => {
    if (mesh) {
      slots[name] = {
        mesh,
        used: false,
      };
    }
  };

  // CASE slots (GPU, PSU, Motherboard mount, HDD)
  if (loaded.case) {
    const c = loaded.case.meshes;

    addSlot("psu", findMeshByName(c, "PSU_P"));
    addSlot("gpu", findMeshByName(c, "GPU_P"));
    addSlot("motherboard", findMeshByName(c, "MB_P"));
    addSlot("hdd", findMeshByName(c, "HDD_P"));
  }

  // MOTHERBOARD slots (CPU, RAM, GPU-P)
  if (loaded.mobo) {
    const m = loaded.mobo.meshes;

    addSlot("cpu", findMeshByName(m, "CPU_SOCKET"));
    addSlot("ram1", findMeshByName(m, "RAM1_P"));
    addSlot("ram2", findMeshByName(m, "RAM2_P"));
    addSlot("ram3", findMeshByName(m, "RAM3_P"));
    addSlot("ram4", findMeshByName(m, "RAM4_P"));
    addSlot("gpu_mobo", findMeshByName(m, "PCIe_P"));
  }

  console.log("SLOTS FOUND:", slots);
  return slots;
}

// project/src/slots.js
import { findMeshByName } from "./utils.js";

// detectSlots: mencari slot di loaded.* terlebih dahulu.
// Jika tidak ditemukan, fallback cari di keseluruhan scene.meshes,
// ini untuk menangani kasus slot berada di parent/other nodes.
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

  // 1) CASE slots (cari di loaded.case.meshes jika ada)
  if (loaded.case) {
    const c = loaded.case.meshes;

    addSlot("mobo", findMeshByName(c, "MB_P"));
    addSlot("psu", findMeshByName(c, "PSU_P"));
    addSlot("hdd", findMeshByName(c, "HDD_P"));
    addSlot("fan1", findMeshByName(c, "FCS1"));
    addSlot("fan2", findMeshByName(c, "FCS2"));
    addSlot("fan3", findMeshByName(c, "FCS3"));
    addSlot("hdd1", findMeshByName(c, "HDD1_P"));
    addSlot("hdd2", findMeshByName(c, "HDD2_P"));
  }

  // 2) MOTHERBOARD slots (cari di loaded.mobo.meshes jika ada)
  if (loaded.mobo) {
    const m = loaded.mobo.meshes;

    addSlot("cpu", findMeshByName(m, "CPU_SOCKET"));
    addSlot("cooler", findMeshByName(m, "COOLER"));
    addSlot("ram1", findMeshByName(m, "RAM1_P"));
    addSlot("ram2", findMeshByName(m, "RAM2_P"));
    addSlot("ram3", findMeshByName(m, "RAM3_P"));
    addSlot("ram4", findMeshByName(m, "RAM4_P"));
    addSlot("gpu", findMeshByName(m, "GPU_P"));
  }

  // 3) FALLBACK: jika slot penting belum ketemu, cari di scene.meshes (global)
  //    ini menangkap jika slot berada di case root yang berbeda atau penamaan tidak konsisten.
  const ensure = (key, query) => {
    if (!slots[key]) {
      const found = scene.meshes.find((mm) =>
        mm.name.toLowerCase().includes(query.toLowerCase())
      );
      if (found) addSlot(key, found);
    }
  };

  ensure("mobo", "mb_p");
  ensure("psu", "psu_p");
  ensure("gpu_case", "gpu_p");
  ensure("hdd", "hdd_p");
  ensure("fan", "fan_p");

  ensure("cpu", "cpu_socket");
  ensure("ram1", "ram1_p");
  ensure("ram2", "ram2_p");
  ensure("ram3", "ram3_p");
  ensure("ram4", "ram4_p");
  ensure("gpu_mobo", "pcie_p");

  console.log("SLOTS FOUND:", slots);
  return slots;
}

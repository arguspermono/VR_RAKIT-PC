// project/src/slots.js
import { findMeshByName } from "./utils.js";

export function detectSlots(scene) {
  const loaded = scene.__app?.loaded || {};
  const slots = {};

  // CPU socket inside motherboard mesh group
  if (loaded.motherboard) {
    const mMeshes = loaded.motherboard.meshes;
    // common names we saw earlier: cpu_socket, socket_cpu, SOCKET_CPU
    const cpu =
      findMeshByName(mMeshes, "cpu_socket") ||
      findMeshByName(mMeshes, "socket_cpu") ||
      findMeshByName(mMeshes, "SOCKET_CPU");
    slots.cpu = cpu || null;
  }

  // GPU slot: often named "GPU P" or "GPU_P" or "gpu"
  if (loaded.motherboard) {
    const mMeshes = loaded.motherboard.meshes;
    const gpu =
      findMeshByName(mMeshes, "GPU P") ||
      findMeshByName(mMeshes, "GPU_P") ||
      findMeshByName(mMeshes, "gpu");
    slots.gpu = gpu || null;
  }

  // PSU slot in case
  if (loaded.case) {
    const cMeshes = loaded.case.meshes;
    const psu =
      findMeshByName(cMeshes, "PSU P") ||
      findMeshByName(cMeshes, "PSU_P") ||
      findMeshByName(cMeshes, "psu");
    slots.psu = psu || null;
  }

  // motherboard mount point on case (MB P)
  if (loaded.case) {
    const cMeshes = loaded.case.meshes;
    const mbp =
      findMeshByName(cMeshes, "MB P") ||
      findMeshByName(cMeshes, "MB_P") ||
      findMeshByName(cMeshes, "mb p");
    slots.motherboardMount = mbp || null;
  }

  // HDD slot detection (optional)
  if (loaded.case) {
    const cMeshes = loaded.case.meshes;
    const hdd =
      findMeshByName(cMeshes, "HDD1 P") ||
      findMeshByName(cMeshes, "HDD P") ||
      findMeshByName(cMeshes, "hdd");
    slots.hdd = hdd || null;
  }

  return slots;
}

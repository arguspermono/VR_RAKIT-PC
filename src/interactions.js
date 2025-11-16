// project/src/interactions.js

// Helper: Menentukan slot mana yang valid untuk komponen apa
function getValidSlotFor(key, slots) {
  // Gunakan nama slot yang Anda definisikan di slots.js
  if (key === "mobo") return slots.mobo;
  if (key === "cpu") return slots.cpu;
  if (key === "ram1") return slots.ram1;
  if (key === "ram2") return slots.ram2;
  if (key === "ram3") return slots.ram3;
  if (key === "ram4") return slots.ram4;
  if (key === "gpu") return slots.gpu; // <--- Perhatikan ini 'gpu'
  if (key === "psu") return slots.psu;
  if (key === "hdd") return slots.hdd1 || slots.hdd; // Coba hdd1 dulu
  if (key === "cooler") return slots.cooler;
  // 'fan' bisa Anda tambahkan jika perlu
  return null;
}

export function attachInteractions(scene) {
  const { loaded, slots } = scene.__app;

  // ============================================================
  // 1. MOUSE DRAG (Menggunakan PHYSICS DRAG BEHAVIOR)
  // ============================================================
  const hlMouse = new BABYLON.HighlightLayer("HL_MOUSE", scene);

  Object.keys(loaded)
    .filter((key) => key !== "case")
    .forEach((key) => {
      const item = loaded[key];
      if (!item || !item.root) return;

      const validSlot = getValidSlotFor(key, slots);

      if (!validSlot || !validSlot.mesh) {
        // console.warn(`Tidak ada slot valid untuk ${key}`);
        return;
      }

      const root = item.root;

      if (!root.physicsImpostor) {
        console.warn(`Item ${key} tidak punya physics impostor.`);
        return;
      }

      const physicsDrag = new BABYLON.PhysicsDragBehavior();

      physicsDrag.onDragStartObservable.add(() => {
        root.physicsImpostor.wakeUp();
      });

      // --- BAGIAN INI DENGAN LOG DEBUG ---
      physicsDrag.onDragEndObservable.add(() => {
        console.log(
          `%cDRAG END: Melepaskan '${key}'`,
          "color: blue; font-weight: bold;"
        ); // <-- LOG

        root.physicsImpostor.sleep();

        // Cek jarak
        const pos = root.getAbsolutePosition();
        const slotPos = validSlot.mesh.getAbsolutePosition();
        const dist = BABYLON.Vector3.Distance(pos, slotPos);

        // --- LOG TAMBAHAN UNTUK DEBUG ---
        console.log(
          `DRAG END: Jarak ke slot '${validSlot.mesh.name}' = ${dist.toFixed(
            4
          )}`
        );
        console.log(`DRAG END: Threshold snap = 0.25`);
        console.log(`DRAG END: Slot sudah terpakai? = ${validSlot.used}`);
        // ---------------------------------

        hlMouse.removeAllMeshes();

        // Cek jarak snap (Anda bisa kecilkan nilai 0.25 jika ingin lebih 'ketat')
        if (dist < 0.25 && !validSlot.used) {
          console.log(
            "%cDRAG END: BERHASIL SNAP!",
            "color: green; font-weight: bold;"
          ); // <-- LOG

          // == BERHASIL SNAP ==

          // 1. Matikan fisika (massa = 0) agar terkunci
          root.physicsImpostor.setMass(0);

          // 2. Pindahkan ke POSISI PUSAT (CENTER) slot
          const slotCenter =
            validSlot.mesh.getBoundingInfo().boundingBox.centerWorld;
          root.position.copyFrom(slotCenter);

          // 3. Atur ROTASI agar sama dengan slot
          if (!root.rotationQuaternion) {
            root.rotationQuaternion = new BABYLON.Quaternion();
          }
          root.rotationQuaternion.copyFrom(
            validSlot.mesh.getAbsoluteRotationQuaternion()
          );
          root.rotation = BABYLON.Vector3.Zero();

          // 4. Tandai slot terpakai
          validSlot.used = true;

          // 5. Atur hierarki (Parenting)
          if (key === "mobo" && loaded.case) root.setParent(loaded.case.root);
          if (
            ["cpu", "ram1", "ram2", "ram3", "ram4", "gpu", "cooler"].includes(
              key
            ) &&
            loaded.mobo
          ) {
            root.setParent(loaded.mobo.root); // <-- Perbaikan typo 'moobo'
          }
          if (
            ["psu", "hdd", "fan1", "fan2", "fan3"].includes(key) &&
            loaded.case
          ) {
            root.setParent(loaded.case.root);
          }

          // 6. Kunci objek agar tidak bisa di-drag lagi
          root.removeBehavior(physicsDrag);

          console.log(
            `✅ ${key} berhasil di-snap dan TERKUNCI ke ${validSlot.mesh.name}`
          );
        } else {
          console.warn(
            "DRAG END: Gagal snap (jarak terlalu jauh atau slot terpakai)"
          ); // <-- LOG
          // Gagal snap, biarkan objek jatuh (fisika akan menanganinya)
        }
      });

      root.addBehavior(physicsDrag);

      // Highlight (preview)
      scene.onBeforeRenderObservable.add(() => {
        if (!physicsDrag.dragging || validSlot.used) {
          hlMouse.removeAllMeshes();
          return;
        }

        const pos = root.getAbsolutePosition();
        const dist = BABYLON.Vector3.Distance(
          pos,
          validSlot.mesh.getAbsolutePosition()
        );

        hlMouse.removeAllMesles(); // <-- Ada typo di sini, 'removeAllMeshes'
        if (dist < 0.25) {
          hlMouse.addMesh(root, BABYLON.Color3.Green());
          hlMouse.addMesh(
            validSlot.mesh,
            BABYLON.Color3.FromHexString("#FFA500")
          );
        }
      });
    });
}

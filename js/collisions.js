// project/src/collisions.js
export function setupColliders(scene) {
  // Tandai semua komponen yang dimuat sebagai collidable
  const loaded = scene.__app?.loaded || {};

  // Iterasi di semua komponen yang dimuat (case, mobo, cpu, gpu, dll.)
  Object.keys(loaded).forEach((key) => {
    const item = loaded[key];
    if (item && item.meshes) {
      item.meshes.forEach((m) => {
        m.checkCollisions = true;
      });
    }
  });

  // Catatan: Collider lingkungan (lab/meja) sudah diaktifkan di scene.js.
  // Fungsi ini memastikan semua bagian dinamis juga memiliki collider.
}

// project/src/collisions.js
export function setupColliders(scene) {
  // Mark large environment meshes as collidable (already set in scene.js)
  // Optionally create simple invisible boxes for desks/chairs if you want stronger blocking.
  // Example: iterate through loaded.case or loaded.world to find tables by name and set checkCollisions=true
  const loaded = scene.__app?.loaded || {};
  if (loaded.case)
    loaded.case.meshes.forEach((m) => (m.checkCollisions = true));
  if (loaded.motherboard)
    loaded.motherboard.meshes.forEach((m) => (m.checkCollisions = true));
  // If you need explicit bounding box blockers: create simple boxes using the bounding info of target mesh.
}

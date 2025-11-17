export function setupColliders(scene) {
  const loaded = scene.__app?.loaded || {};

  Object.keys(loaded).forEach((key) => {
    const item = loaded[key];
    if (!item) return;

    if (item.root) item.root.checkCollisions = true;

    if (item.meshes) {
      item.meshes.forEach((m) => {
        if (m.name.match(/shell|body|panel|cover/i)) {
          m.checkCollisions = true;
        } else if (m !== item.root) {
          m.checkCollisions = false;
        }
      });
    }
  });

  scene.meshes.forEach((m) => {
    if (m.name.match(/table|floor|ground|longtable/i)) {
      m.checkCollisions = true;
    }
  });
}

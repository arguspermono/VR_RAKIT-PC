// src/core/tutorialManager.js
export function createTutorialManager(scene, customOrder) {
  const app = scene.__app;
  const loaded = app.loaded;
  const slots = app.slots;

  const DEFAULT_ORDER = [
    "cpu",
    "ram1_pc",
    "ram2_pc",
    "gpu",
    "mobo",
    "psu",
    "hdd",
  ];
  const ORDER =
    Array.isArray(customOrder) && customOrder.length
      ? customOrder.slice()
      : DEFAULT_ORDER.slice();

  let stepIndex = 0;
  const hl = new BABYLON.HighlightLayer("HL_TUTOR", scene);
  const ui = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI_TUTOR");

  function makeHint(mesh, text) {
    const rect = new BABYLON.GUI.Rectangle();
    rect.width = "180px";
    rect.height = "44px";
    rect.cornerRadius = 12;
    rect.color = "white";
    rect.thickness = 2;
    rect.background = "rgba(0,0,0,0.55)";
    const label = new BABYLON.GUI.TextBlock();
    label.text = text;
    label.color = "white";
    label.fontSize = 14;
    rect.addControl(label);
    ui.addControl(rect);
    rect.linkWithMesh(mesh);
    rect.linkOffsetY = -80;
    return rect;
  }

  let currentHint = null;

  function highlight(key) {
    hl.removeAllMeshes();
    if (currentHint) {
      ui.removeControl(currentHint);
      currentHint = null;
    }
    const item = loaded[key];
    if (!item) return;
    const mesh = item.root;
    hl.addMesh(mesh, BABYLON.Color3.Yellow());
    currentHint = makeHint(mesh, `Ambil: ${key.toUpperCase()}`);
  }

  function allowSnap(key) {
    const required = ORDER[stepIndex];
    return key === required;
  }

  function onSnapped(key) {
    const required = ORDER[stepIndex];
    if (key !== required) return;
    stepIndex++;
    hl.removeAllMeshes();
    if (currentHint) {
      ui.removeControl(currentHint);
      currentHint = null;
    }
    if (stepIndex < ORDER.length) highlight(ORDER[stepIndex]);
    else {
      const done = new BABYLON.GUI.TextBlock();
      done.text = "Perakitan Selesai!";
      done.color = "lime";
      done.fontSize = 36;
      ui.addControl(done);
    }
  }

  // start
  highlight(ORDER[0]);

  return { allowSnap, onSnapped };
}

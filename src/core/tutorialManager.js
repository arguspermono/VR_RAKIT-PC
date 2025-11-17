// tutorialManager.js
// Sistem tutorial urutan pemasangan + highlight + hint text

export function createTutorialManager(scene) {
  const app = scene.__app;
  const loaded = app.loaded;
  const slots = app.slots;

  // --------------------------
  // STEP ORDER
  // --------------------------
  const ORDER = ["cpu", "ram1", "ram2", "gpu", "mobo", "psu", "hdd"];

  let stepIndex = 0;

  // --------------------------
  // HIGHLIGHT + HINTS
  // --------------------------
  const hl = new BABYLON.HighlightLayer("HL_TUTORIAL", scene);

  const ui =
    BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI_TUTORIAL");

  function makeHint(mesh, text) {
    const rect = new BABYLON.GUI.Rectangle();
    rect.width = "160px";
    rect.height = "40px";
    rect.cornerRadius = 12;
    rect.color = "white";
    rect.thickness = 2;
    rect.background = "rgba(0,0,0,0.5)";

    const label = new BABYLON.GUI.TextBlock();
    label.text = text;
    label.color = "white";
    label.fontSize = 16;
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

  // --------------------------
  // VALIDASI SNAP
  // Dipanggil dari interactions.js
  // --------------------------
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

    // Next item
    if (stepIndex < ORDER.length) {
      highlight(ORDER[stepIndex]);
    } else {
      // DONE
      const done = new BABYLON.GUI.TextBlock();
      done.text = "Perakitan Selesai!";
      done.color = "lime";
      done.fontSize = 40;
      ui.addControl(done);
    }
  }

  // Start pertama
  highlight(ORDER[0]);

  return {
    allowSnap,
    onSnapped,
  };
}

export const tutorial = {
  start() {
    console.log("Tutorial start");
  },
};

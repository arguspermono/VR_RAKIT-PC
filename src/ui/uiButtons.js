// src/ui/uiButtons.js
// HUD 2D Buttons (EXIT & RESET) in top-left corner.
// Works in VR and non-VR. Stays fixed on screen, not world-anchored.

export function createHUD(scene, onExit, onReset) {
  const ui = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI(
    "hud",
    true,
    scene
  );

  // Container on top-left corner
  const panel = new BABYLON.GUI.StackPanel();
  panel.isVertical = true;
  panel.width = "160px";
  panel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
  panel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
  panel.top = "20px";
  panel.left = "20px";
  ui.addControl(panel);

  // Helper button creator
  function makeButton(text, callback) {
    const btn = BABYLON.GUI.Button.CreateSimpleButton(text, text);
    btn.width = "140px";
    btn.height = "45px";
    btn.fontSize = 22;
    btn.color = "white";
    btn.background = "rgba(0,0,0,0.55)";
    btn.thickness = 2;
    btn.cornerRadius = 10;
    btn.onPointerUpObservable.add(callback);
    return btn;
  }

  // EXIT
  panel.addControl(makeButton("EXIT", onExit));

  // RESET
  panel.addControl(makeButton("RESET", onReset));

  return ui;
}

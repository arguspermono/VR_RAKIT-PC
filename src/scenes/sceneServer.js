// src/scenes/sceneServer.js
import { createSceneBase } from "../core/sceneBase.js";
import { attachInteractions } from "../core/interactions.js";
import { createTutorialManager } from "../core/tutorialManager.js";
import { createHUD } from "../ui/uiButtons.js";
import { resetScene } from "../app.js";
import { applyComponentScale, autoPlacePartsOnTable } from "../core/utils.js";
import { detectSlots } from "../core/slots.js";

export async function createSceneServer(engine, canvas) {
  const scene = await createSceneBase(engine, canvas);

  // (Optional) load server-specific assets here (rack, drives, etc.)
  // For now reuse base assets lightly or leave empty.

  scene.__app.slots = detectSlots(scene);

  try {
    attachInteractions(scene);
  } catch (e) {}
  try {
    scene.__tutorial = createTutorialManager(scene);
  } catch (e) {}

  createHUD(
    scene,
    () => window.location.reload(),
    () => resetScene()
  );

  return scene;
}

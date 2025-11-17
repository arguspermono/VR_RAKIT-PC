// src/scenes/scenePC.js
import { createSceneBase } from "../core/sceneBase.js";
import { attachInteractions } from "../core/interactions.js";
import { createTutorialManager } from "../core/tutorialManager.js";
import { createHUD } from "../ui/uiButtons.js";
import { resetScene } from "../app.js";

export async function createScenePC(engine, canvas) {
  const scene = await createSceneBase(engine, canvas);

  try {
    attachInteractions(scene);
  } catch (e) {
    console.warn(e);
  }
  try {
    scene.__tutorial = createTutorialManager(scene);
  } catch (e) {}

  // HUD 2D (EXIT + RESET)
  createHUD(
    scene,
    () => window.location.reload(), // EXIT → main menu
    () => resetScene() // RESET → reload PC scene only
  );

  return scene;
}

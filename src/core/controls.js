// project/src/controls.js

export function setupControls(scene) {
  const cam = scene.__app.camera;

  cam.keysUp.push(87); // W
  cam.keysDown.push(83); // S
  cam.keysLeft.push(65); // A
  cam.keysRight.push(68); // D

  return { camera: cam };
}

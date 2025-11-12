export function setupGrabSystem(scene, xr, box, snapTarget) {
  const boxMat = box.material;
  const snapMat = snapTarget.material;

  xr.input.onControllerAddedObservable.add((controller) => {
    const ray = controller.getForwardRay(2.0);

    const laser = BABYLON.MeshBuilder.CreateCylinder(
      "laser",
      { height: 2, diameter: 0.01 },
      scene
    );
    laser.rotation.x = Math.PI / 2;
    laser.material = new BABYLON.StandardMaterial("laserMat", scene);
    laser.material.emissiveColor = new BABYLON.Color3(1, 0, 0);
    laser.isPickable = false;

    const grabPoint = new BABYLON.TransformNode("grabPoint", scene);
    grabPoint.parent = controller.grip || controller.pointer;
    grabPoint.position.z = 0.05;

    let isGrabbing = false;
    let grabbedMesh = null;

    scene.onBeforeRenderObservable.add(() => {
      if (controller.pointer) {
        const origin = controller.pointer.position;
        const forward = controller.pointer.forward;
        laser.position.copyFrom(origin);
        laser.rotationQuaternion = controller.pointer.rotationQuaternion;

        // Cek apakah ray kena kotak
        const pick = scene.pickWithRay(new BABYLON.Ray(origin, forward, 2));
        if (pick.hit && pick.pickedMesh === box && !isGrabbing) {
          boxMat.diffuseColor = new BABYLON.Color3(0.1, 1, 0.1); // hijau saat disorot laser
        } else if (!isGrabbing) {
          boxMat.diffuseColor = new BABYLON.Color3(0.2, 0.5, 1); // biru normal
        }
      }

      // Jika sedang digrab, ikuti controller
      if (isGrabbing && grabbedMesh) {
        grabbedMesh.position.copyFrom(grabPoint.getAbsolutePosition());
      }
    });

    controller.onMotionControllerInitObservable.add(() => {
      const trigger = controller.motionController.getComponent(
        "xr-standard-trigger"
      );
      trigger.onButtonStateChangedObservable.add((state) => {
        if (state.pressed && !isGrabbing) {
          const pick = scene.pickWithRay(controller.getForwardRay(1.5));
          if (pick.hit && pick.pickedMesh === box) {
            isGrabbing = true;
            grabbedMesh = box;
            snapMat.diffuseColor = new BABYLON.Color3(1, 0.6, 0); // orange saat grab aktif
          }
        } else if (!state.pressed && isGrabbing) {
          // Lepas grab
          isGrabbing = false;

          // Cek apakah dekat snap
          const dist = BABYLON.Vector3.Distance(
            box.position,
            snapTarget.position
          );
          if (dist < 0.25) box.position.copyFrom(snapTarget.position);

          snapMat.diffuseColor = new BABYLON.Color3(0.2, 1, 0.2); // kembali hijau
          grabbedMesh = null;
        }
      });
    });
  });
}

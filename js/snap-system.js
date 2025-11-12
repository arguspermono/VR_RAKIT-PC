AFRAME.registerComponent("snap-listener", {
  schema: { threshold: { type: "number", default: 0.18 } },
  init: function () {
    const el = this.el;
    el.addEventListener("grab-end", () => {
      const targets = document.querySelectorAll(".snap-target");
      let snapped = false;
      targets.forEach((t) => {
        const p1 = new THREE.Vector3();
        const p2 = new THREE.Vector3();
        el.object3D.getWorldPosition(p1);
        t.object3D.getWorldPosition(p2);
        const dist = p1.distanceTo(p2);
        if (dist <= this.data.threshold && !snapped) {
          const worldPos = new THREE.Vector3();
          const worldQuat = new THREE.Quaternion();
          t.object3D.getWorldPosition(worldPos);
          t.object3D.getWorldQuaternion(worldQuat);

          const parent = el.object3D.parent;
          parent.worldToLocal(worldPos);
          el.object3D.position.copy(worldPos);

          const parentInvQuat = parent
            .getWorldQuaternion(new THREE.Quaternion())
            .invert();
          const localQuat = worldQuat.multiply(parentInvQuat);
          el.object3D.quaternion.copy(localQuat);

          el.removeAttribute("grabbable");
          el.setAttribute("position", el.object3D.position);
          el.setAttribute("rotation", el.object3D.rotation);

          el.emit("snapped", { target: t.id });
          snapped = true;
        }
      });
      if (!snapped) el.emit("released");
    });
  },
});

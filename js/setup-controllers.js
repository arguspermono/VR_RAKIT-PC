AFRAME.registerComponent("setup-controllers", {
  init: function () {
    const scene = this.el.sceneEl;

    // Controller untuk VR
    const left = document.createElement("a-entity");
    left.setAttribute("laser-controls", "hand: left");
    left.setAttribute("raycaster", "objects: .interactable");
    left.setAttribute("super-hands", "");
    scene.appendChild(left);

    const right = document.createElement("a-entity");
    right.setAttribute("laser-controls", "hand: right");
    right.setAttribute("raycaster", "objects: .interactable");
    right.setAttribute("super-hands", "");
    scene.appendChild(right);

    // Controller untuk mouse (desktop)
    const mouseHand = document.createElement("a-entity");
    mouseHand.setAttribute("id", "mouseHand");
    mouseHand.setAttribute("cursor", "rayOrigin: mouse");
    mouseHand.setAttribute("raycaster", "objects: .interactable");
    mouseHand.setAttribute("geometry", "primitive: sphere; radius: 0.02");
    mouseHand.setAttribute("material", "color: #fff; opacity: 0");
    mouseHand.setAttribute(
      "super-hands",
      `colliderEvent: raycaster-intersection;
       colliderEventProperty: els;
       grabStartButtons: mousedown;
       grabEndButtons: mouseup;`
    );
    scene.appendChild(mouseHand);
  },
});

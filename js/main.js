window.addEventListener("DOMContentLoaded", () => {
  const scene = document.querySelector("a-scene");
  scene.setAttribute("setup-controllers", ""); // aktifkan controller modular

  const container = document.querySelector("#scene-objects");

  const items = [
    { model: "#wooden_box", pos: "0 0 -1", scale: "0.5 0.5 0.5" },
    { model: "#toolbox", pos: "0.8 0 -1", scale: "0.4 0.4 0.4" },
    { model: "#screwdriver", pos: "-0.8 0.2 -1", scale: "0.5 0.5 0.5" },
    { model: "#screw", pos: "-0.2 0.2 -0.8", scale: "0.2 0.2 0.2" },
  ];

  items.forEach((item) => {
    const el = document.createElement("a-entity");
    el.setAttribute("gltf-model", item.model);
    el.setAttribute("class", "interactable");
    el.setAttribute("position", item.pos);
    el.setAttribute("scale", item.scale);
    el.setAttribute("hoverable", "");
    el.setAttribute("grabbable", "");
    el.setAttribute("stretchable", "");
    el.setAttribute("draggable", "");
    el.setAttribute("snap-listener", "");
    container.appendChild(el);
  });

  // Target snap
  const snap = document.createElement("a-box");
  snap.setAttribute("id", "snapSocket");
  snap.setAttribute("class", "snap-target");
  snap.setAttribute("position", "0 0.2 -1.5");
  snap.setAttribute("depth", "0.05");
  snap.setAttribute("height", "0.5");
  snap.setAttribute("width", "0.5");
  snap.setAttribute("material", "color: #2b7; opacity: 0.6");
  container.appendChild(snap);
});

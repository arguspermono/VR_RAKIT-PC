window.addEventListener("DOMContentLoaded", () => {
  const scene = document.querySelector("a-scene");
  scene.setAttribute("setup-controllers", ""); // aktifkan controller modular

  const container = document.querySelector("#scene-objects");

  const items = [
    { model: "#wooden_box", pos: "0 0 -10", scale: "10 10 10" },
    // { model: "#toolbox_lowpoly", pos: "0.8 0 -1", scale: "0.3 0.3 0.3" },
    { model: "#screwdriver", pos: "0 0 -5", scale: "10.5 10.5 10.5" },
    { model: "#simple_screw", pos: "0 0 -1", scale: "0.03 0.03 0.03" },
  ];

  items.forEach((item) => {
    const el = document.createElement("a-entity");

    el.setAttribute("gltf-model", item.model);
    el.setAttribute("class", "interactable");
    el.setAttribute("position", item.pos);   // langsung pakai string pos
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

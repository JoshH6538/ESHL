function positionPins() {
  const map = document.querySelector(".map-wrapper");
  const pins = document.querySelectorAll(".location-pin");

  const mapRect = map.getBoundingClientRect();
  const mapAspect = 16 / 9; // SVG map aspect ratio
  const containerAspect = mapRect.width / mapRect.height;

  let imageHeight;

  if (containerAspect > mapAspect) {
    imageHeight = mapRect.height;
  } else {
    imageHeight = mapRect.width / mapAspect;
  }

  const imageTopOffset = mapRect.height - imageHeight;

  // Try adjusting this if pins are still slightly too high
  const verticalOffsetRatio = 0.225; // 3% downward nudge of image height

  pins.forEach((pin) => {
    const x = parseFloat(pin.dataset.x);
    const y = parseFloat(pin.dataset.y);

    const left = (x / 100) * mapRect.width;
    const top =
      imageTopOffset + ((y + verticalOffsetRatio * 100) / 100) * imageHeight;

    pin.style.position = "absolute";
    pin.style.left = `${left}px`;
    pin.style.top = `${top}px`;
    pin.style.transform = "translate(-50%, -100%)"; // anchor to dot base
  });
}

function extendMapHeight() {
  const map = document.querySelector(".map-wrapper");
  if (!map) return;

  const currentHeight = map.getBoundingClientRect().height;
  let extra = window.innerHeight * 0.1;
  if (map.getBoundingClientRect().width < 1000) {
    extra = window.innerHeight * 0.05; // less space for smaller screens
  }
  map.style.minHeight = `${currentHeight + extra}px`;
}

window.addEventListener("load", () => {
  positionPins();
  extendMapHeight();
});
window.addEventListener("resize", () => {
  positionPins();
  extendMapHeight();
});

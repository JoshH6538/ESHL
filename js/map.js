function positionPins() {
  const map = document.querySelector(".map-wrapper");
  const img = map.querySelector("img");
  const pins = document.querySelectorAll(".location-pin");

  const imageWidth = img.clientWidth;
  const imageHeight = img.clientHeight;

  // Y offset from 0 (at 1000px) to 50px (at 282px)
  const minWidth = 282;
  const maxWidth = 1000;
  const maxYOffset = 15;

  const clamped = Math.max(minWidth, Math.min(imageWidth, maxWidth));
  const ratio = 1 - (clamped - minWidth) / (maxWidth - minWidth);
  const yOffset = ratio * maxYOffset;

  pins.forEach((pin) => {
    const x = parseFloat(pin.dataset.x);
    const y = parseFloat(pin.dataset.y);

    const left = (x / 1000) * imageWidth;
    const top = (y / 589) * imageHeight + yOffset;

    pin.style.position = "absolute";
    pin.style.left = `${left}px`;
    pin.style.top = `${top}px`;
    pin.style.transform = "translate(-50%, -100%)";
  });
}

function ensurePositioningAfterImageLoad() {
  const img = document.querySelector(".map-wrapper img");
  if (!img) return;

  if (img.complete) {
    positionPins();
  } else {
    img.addEventListener("load", positionPins);
  }
}

window.addEventListener("load", ensurePositioningAfterImageLoad);
window.addEventListener("resize", positionPins);

document.querySelectorAll(".location-pin").forEach((pin) => {
  pin.addEventListener("click", () => {
    if (window.innerWidth > 600) return;

    const popup = document.getElementById("mobile-popup");
    const info = pin.querySelector(".info");
    if (!popup || !info) return;

    const stateName = info.querySelector("h5")?.textContent || "";
    const idEl = info.querySelector("a");
    const tagEl = info.querySelector("span");

    const id = idEl?.textContent || "";
    const tag = tagEl?.textContent || "";
    const href = idEl?.href || "";

    popup.innerHTML = `
      <div class="map-info tran3s d-flex flex-column align-items-start" style="box-shadow: none">
        <div class="d-flex align-items-center gap-2 mb-2 justify-content-center w-100">
          <img src="/images/es/RE_ICON.png" alt="" class="lazy-img" style="width: 36px; height: 36px;" />
          <h5 class="mb-0 popup-header">${stateName}</h5>
        </div>
        <div class="d-flex align-items-center gap-2 justify-content-center w-100">
          <a href="${href}" class="spinner active-id popup-id popup-a" target="_blank">${id}</a>
          <span class="ps-1 popup-span">${tag}</span>
        </div>
        <div class="close-btn mt-3 w-100" style="font-size: 14px; text-align: center; color: #6fc3ff; text-decoration: underline; cursor: pointer;" onclick="closeMobilePopup()">Close</div>
      </div>
    `;

    popup.style.display = "block";
  });
});

function closeMobilePopup() {
  const popup = document.getElementById("mobile-popup");
  if (popup) popup.style.display = "none";
}

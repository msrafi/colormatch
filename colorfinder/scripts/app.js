import { colorPalette } from "./colorpalette.js";

const imageLoader = document.getElementById("imageLoader");
const filePickerLabel = document.querySelector(".file-picker__label");
const appHeader = document.querySelector(".app-header");
const appMain = document.querySelector(".app-main");
const canvasContainer = document.getElementById("canvas-container");
const canvas = document.getElementById("imageCanvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true });
const zoomLens = document.getElementById("zoom-lens");
const zoomCanvas = document.getElementById("zoomCanvas");
const zoomCtx = zoomCanvas.getContext("2d", { willReadFrequently: true });
const cornerOverlay = document.getElementById("corner-overlay");
const cornerEls = [
  document.getElementById("cornerTL"),
  document.getElementById("cornerTR"),
  document.getElementById("cornerBL"),
  document.getElementById("cornerBR"),
];
const livePreview = document.getElementById("live-preview");
const pickedSwatch = document.getElementById("pickedSwatch");
const matchedSwatch = document.getElementById("matchedSwatch");
const pickedRgbEl = document.getElementById("pickedRgb");
const matchedRgbEl = document.getElementById("matchedRgb");
const result = document.getElementById("result");

const ZOOM_SCALE = 3;
const ZOOM_SIZE = 100;
const ZOOM_OFFSET = 15;

let hasImage = false;
let loadedImageSrc = null;

function getBottomPanelHeight() {
  if (livePreview.classList.contains("hidden")) return 0;
  const resultHeight = result.textContent ? result.offsetHeight + 6 : 0;
  return livePreview.offsetHeight + resultHeight + 8;
}

function getAvailableSize() {
  const main = appMain.getBoundingClientRect();
  const padding = 4;
  return {
    width: main.width - padding,
    height: main.height - getBottomPanelHeight() - padding,
  };
}

function clientToCanvas(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY,
  };
}

function positionZoomLens(clientX, clientY) {
  const containerRect = canvasContainer.getBoundingClientRect();
  let left = clientX - containerRect.left + ZOOM_OFFSET;
  let top = clientY - containerRect.top + ZOOM_OFFSET;

  const maxLeft = containerRect.width - ZOOM_SIZE - 4;
  const maxTop = containerRect.height - ZOOM_SIZE - 4;
  left = Math.max(4, Math.min(left, maxLeft));
  top = Math.max(4, Math.min(top, maxTop));

  zoomLens.style.left = `${left}px`;
  zoomLens.style.top = `${top}px`;
}

function setCornerCodes(code) {
  const text = code || "—";
  for (const el of cornerEls) {
    el.textContent = text;
  }
}

function setSwatch(el, rgb) {
  const [r, g, b] = rgb;
  el.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
}

function formatRgb(rgb) {
  const [r, g, b] = rgb;
  return `${r}, ${g}, ${b}`;
}

function showPickUi(show) {
  cornerOverlay.classList.toggle("hidden", !show);
  livePreview.classList.toggle("hidden", !show);
}

function refitImage() {
  if (!hasImage || !loadedImageSrc) return;
  const img = new Image();
  img.onload = () => requestAnimationFrame(() => fitImageToScreen(img));
  img.src = loadedImageSrc;
}

function handleZoom(clientX, clientY) {
  positionZoomLens(clientX, clientY);
  zoomLens.classList.remove("hidden");

  const { x: canvasX, y: canvasY } = clientToCanvas(clientX, clientY);
  const sourceSize = ZOOM_SIZE / ZOOM_SCALE;
  const zoomX = canvasX - sourceSize / 2;
  const zoomY = canvasY - sourceSize / 2;

  zoomCtx.clearRect(0, 0, ZOOM_SIZE, ZOOM_SIZE);
  zoomCtx.drawImage(
    canvas,
    zoomX,
    zoomY,
    sourceSize,
    sourceSize,
    0,
    0,
    ZOOM_SIZE,
    ZOOM_SIZE
  );
}

function hideZoom() {
  zoomLens.classList.add("hidden");
}

function updateAtPoint(clientX, clientY) {
  if (!hasImage) return;

  handleZoom(clientX, clientY);

  const { x: canvasX, y: canvasY } = clientToCanvas(clientX, clientY);
  const px = Math.min(canvas.width - 1, Math.max(0, Math.floor(canvasX)));
  const py = Math.min(canvas.height - 1, Math.max(0, Math.floor(canvasY)));

  const pixel = ctx.getImageData(px, py, 1, 1).data;
  const pickedRgb = [pixel[0], pixel[1], pixel[2]];
  const wasHidden = livePreview.classList.contains("hidden");

  setSwatch(pickedSwatch, pickedRgb);
  pickedRgbEl.textContent = formatRgb(pickedRgb);

  const closest = findClosestColor(...pickedRgb);
  if (closest) {
    setCornerCodes(closest.code);
    setSwatch(matchedSwatch, closest.rgb);
    matchedRgbEl.textContent = `${closest.code} · ${formatRgb(closest.rgb)}`;
    result.textContent = `Closest thread: ${closest.code}`;
  } else {
    setCornerCodes("—");
    matchedSwatch.style.backgroundColor = "#e4e4e7";
    matchedRgbEl.textContent = "No match";
    result.textContent = "No matching thread found.";
  }

  showPickUi(true);
  if (wasHidden) refitImage();
}

function fitImageToScreen(img) {
  const { width: availableWidth, height: availableHeight } = getAvailableSize();
  const aspectRatio = img.width / img.height;

  if (img.width > availableWidth || img.height > availableHeight) {
    if (img.width / availableWidth > img.height / availableHeight) {
      canvas.width = availableWidth;
      canvas.height = availableWidth / aspectRatio;
    } else {
      canvas.height = availableHeight;
      canvas.width = availableHeight * aspectRatio;
    }
  } else {
    canvas.width = img.width;
    canvas.height = img.height;
  }

  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
}

imageLoader.addEventListener("change", function (e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (event) {
    const img = new Image();
    img.onload = function () {
      loadedImageSrc = event.target.result;
      hasImage = true;
      filePickerLabel.textContent = file.name.replace(/.*\//, "").slice(0, 28);
      setCornerCodes("—");
      pickedRgbEl.textContent = "—";
      matchedRgbEl.textContent = "—";
      pickedSwatch.style.backgroundColor = "#e4e4e7";
      matchedSwatch.style.backgroundColor = "#e4e4e7";
      result.textContent = "Touch and drag on the image";
      cornerOverlay.classList.add("hidden");
      livePreview.classList.remove("hidden");
      requestAnimationFrame(() => fitImageToScreen(img));
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
});

window.addEventListener("resize", refitImage);

canvas.addEventListener("mousemove", (event) => {
  updateAtPoint(event.clientX, event.clientY);
});

canvas.addEventListener(
  "touchmove",
  (event) => {
    event.preventDefault();
    const touch = event.touches[0];
    updateAtPoint(touch.clientX, touch.clientY);
  },
  { passive: false }
);

canvas.addEventListener(
  "touchstart",
  (event) => {
    event.preventDefault();
    const touch = event.touches[0];
    updateAtPoint(touch.clientX, touch.clientY);
  },
  { passive: false }
);

canvas.addEventListener("mouseleave", hideZoom);
canvas.addEventListener("touchend", hideZoom);
canvas.addEventListener("touchcancel", hideZoom);

canvas.addEventListener("click", (event) => {
  updateAtPoint(event.clientX, event.clientY);
});

function findClosestColor(r, g, b) {
  let minDistance = Infinity;
  let closest = null;

  for (const color of colorPalette) {
    const [cr, cg, cb] = color.rgb;
    const distance = Math.sqrt((r - cr) ** 2 + (g - cg) ** 2 + (b - cb) ** 2);

    if (distance < minDistance) {
      minDistance = distance;
      closest = color;
    }
  }

  return closest;
}

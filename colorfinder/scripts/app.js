import { colorPalette } from "./colorpalette.js";

const imageLoader = document.getElementById("imageLoader");
const canvasContainer = document.getElementById("canvas-container");
const canvas = document.getElementById("imageCanvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true });
const zoomCanvas = document.getElementById("zoomCanvas");
const zoomCtx = zoomCanvas.getContext("2d", { willReadFrequently: true });
const result = document.getElementById("result");

const ZOOM_SCALE = 3;
const ZOOM_SIZE = 100;
const ZOOM_OFFSET = 15;

/** Map viewport (client) coords to canvas bitmap pixels. */
function clientToCanvas(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY,
  };
}

/** Position zoom lens relative to canvas-container (not viewport). */
function positionZoomLens(clientX, clientY) {
  const containerRect = canvasContainer.getBoundingClientRect();
  let left = clientX - containerRect.left + ZOOM_OFFSET;
  let top = clientY - containerRect.top + ZOOM_OFFSET;

  const maxLeft = containerRect.width - ZOOM_SIZE - 4;
  const maxTop = containerRect.height - ZOOM_SIZE - 4;
  left = Math.max(4, Math.min(left, maxLeft));
  top = Math.max(4, Math.min(top, maxTop));

  zoomCanvas.style.left = `${left}px`;
  zoomCanvas.style.top = `${top}px`;
}

// Load the image onto the canvas and resize to fit screen
imageLoader.addEventListener("change", function (e) {
  const reader = new FileReader();

  reader.onload = function (event) {
    const img = new Image();
    img.onload = function () {
      // Resize canvas to fit the screen
      const availableWidth = window.innerWidth;
      const availableHeight = window.innerHeight - 100; // Exclude header
      const aspectRatio = img.width / img.height;

      if (img.width > availableWidth || img.height > availableHeight) {
        if (img.width > img.height) {
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
    };
    img.src = event.target.result;
  };

  reader.readAsDataURL(e.target.files[0]);
});

const handleZoom = (clientX, clientY) => {
  positionZoomLens(clientX, clientY);
  zoomCanvas.style.display = "block";

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
};

// Handle mouse movement
canvas.addEventListener("mousemove", function (event) {
  handleZoom(event.clientX, event.clientY);
});

canvas.addEventListener(
  "touchmove",
  function (event) {
    event.preventDefault();
    const touch = event.touches[0];
    handleZoom(touch.clientX, touch.clientY);
  },
  { passive: false }
);

// Hide zoom canvas on mouse leave or touch end
const hideZoom = () => {
  zoomCanvas.style.display = "none";
};
canvas.addEventListener("mouseleave", hideZoom);
canvas.addEventListener("touchend", hideZoom);

const handleColorDetection = (clientX, clientY) => {
  const { x: canvasX, y: canvasY } = clientToCanvas(clientX, clientY);
  const px = Math.min(canvas.width - 1, Math.max(0, Math.floor(canvasX)));
  const py = Math.min(canvas.height - 1, Math.max(0, Math.floor(canvasY)));

  const pixel = ctx.getImageData(px, py, 1, 1).data;
  const [r, g, b] = pixel;

  const closestColor = findClosestColor(r, g, b);
  if (closestColor) {
    const [r, g, b] = closestColor.rgb;
    result.textContent = `Closest Thread: ${closestColor.code} (RGB: ${r}, ${g}, ${b})`;
  } else {
    result.textContent = "No matching thread found.";
  }
};

// Handle mouse click
canvas.addEventListener("click", function (event) {
  handleColorDetection(event.clientX, event.clientY);
});

canvas.addEventListener(
  "touchstart",
  function (event) {
    event.preventDefault();
    const touch = event.touches[0];
    handleZoom(touch.clientX, touch.clientY);
    handleColorDetection(touch.clientX, touch.clientY);
  },
  { passive: false }
);

// Find the closest color from the palette
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

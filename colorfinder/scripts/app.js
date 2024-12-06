import { colorPalette } from "./colorPalette.js";

const imageLoader = document.getElementById("imageLoader");
const canvas = document.getElementById("imageCanvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true });
const zoomCanvas = document.getElementById("zoomCanvas");
const zoomCtx = zoomCanvas.getContext("2d", { willReadFrequently: true });
const result = document.getElementById("result");

// Adjust zoom canvas parameters
const ZOOM_SCALE = 3;
const ZOOM_SIZE = 100;

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

// Handle zoom on both mouse and touch
const handleZoom = (x, y) => {
  zoomCanvas.style.left = `${x + 15}px`;
  zoomCanvas.style.top = `${y + 15}px`;
  zoomCanvas.style.display = "block";

  const rect = canvas.getBoundingClientRect();
  const canvasX = x - rect.left;
  const canvasY = y - rect.top;

  zoomCtx.clearRect(0, 0, ZOOM_SIZE, ZOOM_SIZE);
  const zoomX = canvasX - ZOOM_SIZE / (2 * ZOOM_SCALE);
  const zoomY = canvasY - ZOOM_SIZE / (2 * ZOOM_SCALE);

  zoomCtx.drawImage(
    canvas,
    zoomX,
    zoomY,
    ZOOM_SIZE / ZOOM_SCALE,
    ZOOM_SIZE / ZOOM_SCALE,
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

// Handle touch movement
canvas.addEventListener("touchmove", function (event) {
  const touch = event.touches[0];
  handleZoom(touch.clientX, touch.clientY);
});

// Hide zoom canvas on mouse leave or touch end
const hideZoom = () => {
  zoomCanvas.style.display = "none";
};
canvas.addEventListener("mouseleave", hideZoom);
canvas.addEventListener("touchend", hideZoom);

// Detect color on click or touch
const handleColorDetection = (x, y) => {
  const rect = canvas.getBoundingClientRect();
  const canvasX = x - rect.left;
  const canvasY = y - rect.top;

  const pixel = ctx.getImageData(canvasX, canvasY, 1, 1).data;
  const [r, g, b] = pixel;

  const closestColor = findClosestColor(r, g, b);
  if (closestColor) {
    result.textContent = `Closest Thread: ${closestColor.name} (Code: ${closestColor.code})`;
  } else {
    result.textContent = "No matching thread found.";
  }
};

// Handle mouse click
canvas.addEventListener("click", function (event) {
  handleColorDetection(event.clientX, event.clientY);
});

// Handle touch
canvas.addEventListener("touchstart", function (event) {
  const touch = event.touches[0];
  handleColorDetection(touch.clientX, touch.clientY);
});

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

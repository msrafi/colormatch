// Load color palette from external file
import { colorPalette } from "./colorpalette.js";

const imageLoader = document.getElementById("imageLoader");
const canvas = document.getElementById("imageCanvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true });

const zoomCanvas = document.getElementById("zoomCanvas");
const zoomCtx = zoomCanvas.getContext("2d", { willReadFrequently: true });
const result = document.getElementById("result");

// Adjust these for zoom effect
const ZOOM_SCALE = 3; // Magnification scale
const ZOOM_SIZE = 100; // Zoom canvas size (width & height)

// Load the image onto the canvas
imageLoader.addEventListener("change", function (e) {
  const reader = new FileReader();

  reader.onload = function (event) {
    const img = new Image();
    img.onload = function () {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
    };
    img.src = event.target.result;
  };

  reader.readAsDataURL(e.target.files[0]);
});

// Add zoom functionality
// canvas.addEventListener("mousemove", function (event) {
//   const rect = canvas.getBoundingClientRect();
//   const mouseX = event.clientX - rect.left; // Mouse X on canvas
//   const mouseY = event.clientY - rect.top; // Mouse Y on canvas

//   console.log(mouseX, mouseY);

//   // Position the zoom canvas near the cursor
//   zoomCanvas.style.left = `${mouseX + 10}px`; // Offset to avoid overlap
//   zoomCanvas.style.top = `${mouseY + 10}px`;

//   // Display the zoom canvas
//   zoomCanvas.style.display = "block";

//   // Clear and redraw the zoom canvas
//   zoomCtx.clearRect(0, 0, ZOOM_SIZE, ZOOM_SIZE);

//   const zoomX = mouseX - ZOOM_SIZE / (2 * ZOOM_SCALE);
//   const zoomY = mouseY - ZOOM_SIZE / (2 * ZOOM_SCALE);

//   zoomCtx.drawImage(
//     canvas,
//     zoomX,
//     zoomY,
//     ZOOM_SIZE / ZOOM_SCALE,
//     ZOOM_SIZE / ZOOM_SCALE,
//     0,
//     0,
//     ZOOM_SIZE,
//     ZOOM_SIZE
//   );
// });

var zoomFunctions = function (event) {
  const rect = canvas.getBoundingClientRect();
  const mouseX = event.clientX - rect.left; // Mouse X on canvas
  const mouseY = event.clientY - rect.top; // Mouse Y on canvas

  console.log(mouseX, mouseY);

  // Position the zoom canvas near the cursor
  zoomCanvas.style.left = `${mouseX + 10}px`; // Offset to avoid overlap
  zoomCanvas.style.top = `${mouseY + 10}px`;

  // Display the zoom canvas
  zoomCanvas.style.display = "block";

  // Clear and redraw the zoom canvas
  zoomCtx.clearRect(0, 0, ZOOM_SIZE, ZOOM_SIZE);

  const zoomX = mouseX - ZOOM_SIZE / (2 * ZOOM_SCALE);
  const zoomY = mouseY - ZOOM_SIZE / (2 * ZOOM_SCALE);

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

canvas.addEventListener("mousemove", zoomFunctions);
canvas.addEventListener("touchmove", zoomFunctions);

// Hide the zoom canvas when the mouse leaves
canvas.addEventListener("mouseleave", function () {
  zoomCanvas.style.display = "none";
});

// Add click functionality to detect the color
canvas.addEventListener("click", function (event) {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  const pixel = ctx.getImageData(x, y, 1, 1).data;
  const [r, g, b] = pixel;

  const closestColor = findClosestColor(r, g, b);
  if (closestColor) {
    result.textContent = `Closest Thread: ${closestColor.name} (Code: ${closestColor.code})`;
  } else {
    result.textContent = "No matching thread found.";
  }
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

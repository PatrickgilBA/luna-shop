// Makes an image smaller in the browser before upload: at most 1600 pixels
// on the longest side, saved as JPEG. A 5–10 MB phone photo becomes
// about 300–600 kB, and the site loads fast.
// Only used in the browser (components/ImageUpload.js).

const MAX_SIDE = 1600;

export async function resizeImage(file) {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" }); // follows the phone's rotation
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  context.fillStyle = "#fff"; // transparent PNGs get a white background instead of black
  context.fillRect(0, 0, width, height);
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Could not read the image."))), "image/jpeg", 0.85)
  );
}

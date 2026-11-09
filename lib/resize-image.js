// Gör en bild mindre i webbläsaren innan den laddas upp: högst 1600 pixlar
// på längsta sidan, sparad som JPEG. En mobilbild på 5–10 MB blir då
// ungefär 300–600 kB, och sidan laddar snabbt.
// Används bara i webbläsaren (components/ImageUpload.js).

const MAX_SIDE = 1600;

export async function resizeImage(file) {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" }); // följer mobilens rotation
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  context.fillStyle = "#fff"; // genomskinliga PNG-bilder får vit bakgrund i stället för svart
  context.fillRect(0, 0, width, height);
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Could not read the image."))), "image/jpeg", 0.85)
  );
}

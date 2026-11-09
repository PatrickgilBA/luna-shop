// ============================================================================
//  LADDA UPP EN BILD  (adress: /api/admin/images, bara för admins)
// ============================================================================
//  Produktformuläret skickar en bild hit (redan förminskad i webbläsaren).
//  Vi kontrollerar att det är en admin och en riktig bild, och sparar den i
//  Supabase Storage (bildmappen "product-images"). Svaret är bildens adress,
//  som formuläret lägger till i postens bilder.
// ============================================================================

import { randomUUID } from "node:crypto";
import { fail, requireAdmin } from "@/lib/admin-api";
import { uploadedImagePrefix } from "@/lib/validation";

const TYPES = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
const MAX_BYTES = 4 * 1024 * 1024; // 4 MB (Vercel tar emot högst ca 4,5 MB)

export async function POST(request) {
  const { admin, response } = await requireAdmin(request);
  if (response) return response;

  let file;
  try {
    file = (await request.formData()).get("file");
  } catch {
    return fail("Invalid request.");
  }
  if (!file || typeof file === "string") return fail("Please choose an image.");
  if (!TYPES[file.type]) return fail("Only JPEG, PNG or WebP images can be uploaded.");
  if (file.size > MAX_BYTES) return fail("The image is too big (max 4 MB).");

  // Ett unikt filnamn, så att två bilder aldrig skriver över varandra.
  const name = `${new Date().toISOString().slice(0, 10)}-${randomUUID()}.${TYPES[file.type]}`;

  const upload = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/product-images/${name}`, {
    method: "POST",
    headers: {
      apikey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${admin.accessToken}`, // databasen kontrollerar is_admin()
      "Content-Type": file.type,
      "Cache-Control": "max-age=31536000", // bilden ändras aldrig: får sparas länge
    },
    body: Buffer.from(await file.arrayBuffer()),
    cache: "no-store",
  });

  if (!upload.ok) {
    console.error("Image upload failed:", upload.status, await upload.text());
    return fail(upload.status === 400 || upload.status === 403 ? "Supabase refused the image." : "Could not upload the image.", 502);
  }

  return Response.json({ url: uploadedImagePrefix() + name }, { status: 201 });
}

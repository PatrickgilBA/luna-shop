// ============================================================================
//  UPLOAD AN IMAGE  (address: /api/admin/images, admins only)
// ============================================================================
//  The product form sends an image here (already made smaller in the browser).
//  We check that it is an admin and a real image, and store it in
//  Supabase Storage (the "product-images" bucket). The reply is the image's address,
//  which the form adds to the print's images.
// ============================================================================

import { randomUUID } from "node:crypto";
import { fail, requireAdmin } from "@/lib/admin-api";
import { uploadedImagePrefix } from "@/lib/validation";

const TYPES = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
const MAX_BYTES = 4 * 1024 * 1024; // 4 MB (Vercel accepts at most about 4.5 MB)

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

  // A unique file name, so two images never overwrite each other.
  const name = `${new Date().toISOString().slice(0, 10)}-${randomUUID()}.${TYPES[file.type]}`;

  const upload = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/product-images/${name}`, {
    method: "POST",
    headers: {
      apikey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${admin.accessToken}`, // the database checks is_admin()
      "Content-Type": file.type,
      "Cache-Control": "max-age=31536000", // the image never changes: it may be cached for long
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

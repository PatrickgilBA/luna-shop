// ============================================================================
//  CHANGE OR DELETE A PRINT  (address: /api/admin/products/catsuit etc.)
// ============================================================================
//  Admins only. PATCH changes the print, DELETE removes it.
// ============================================================================

import { updateProduct, deleteProduct } from "@/lib/products";
import { validateProduct } from "@/lib/validation";
import { fail, requireAdmin, readJson, refreshShop } from "@/lib/admin-api";

export async function PATCH(request, { params }) {
  const { admin, response } = await requireAdmin(request);
  if (response) return response;
  const { slug } = await params;

  const body = await readJson(request);
  if (!body) return fail("Invalid request.");

  const { values, errors } = validateProduct(body);
  if (errors) return fail("Please check the form.", 400, errors);

  try {
    const result = await updateProduct(admin.accessToken, slug, values);
    if (!result.ok) return fail("This print doesn't exist any more.", 404);
    refreshShop();
    return Response.json({ ok: true, product: result.product });
  } catch (err) {
    console.error(err);
    return fail("Could not save the print. Please try again.", 500);
  }
}

export async function DELETE(request, { params }) {
  const { admin, response } = await requireAdmin(request);
  if (response) return response;
  const { slug } = await params;

  try {
    const result = await deleteProduct(admin.accessToken, slug);
    if (!result.ok) return fail("This print doesn't exist any more.", 404);
    refreshShop();
    return Response.json({ ok: true });
  } catch (err) {
    console.error(err);
    return fail("Could not delete the print. Please try again.", 500);
  }
}

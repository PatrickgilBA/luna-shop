// ============================================================================
//  LÄGG TILL EN POSTER  (adress: /api/admin/products, bara för admins)
// ============================================================================
//  Formuläret på /admin/products/new skickar hit. Vi kontrollerar att det är
//  en admin, kontrollerar fälten (samma regler som formuläret) och sparar
//  den nya postern i Supabase.
// ============================================================================

import { createProduct } from "@/lib/products";
import { validateProduct } from "@/lib/validation";
import { fail, requireAdmin, readJson, refreshShop } from "@/lib/admin-api";

export async function POST(request) {
  const { admin, response } = await requireAdmin(request);
  if (response) return response;

  const body = await readJson(request);
  if (!body) return fail("Invalid request.");

  const { values, errors } = validateProduct(body, { isNew: true });
  if (errors) return fail("Please check the form.", 400, errors);

  try {
    const result = await createProduct(admin.accessToken, values);
    if (result.duplicate) {
      return fail("Please check the form.", 409, { slug: "A print with this slug already exists." });
    }
    if (!result.ok) return fail("You don't have permission to add prints.", 403);
    refreshShop();
    return Response.json({ ok: true, product: result.product }, { status: 201 });
  } catch (err) {
    console.error(err);
    return fail("Could not save the print. Please try again.", 500);
  }
}

// Shared by the admin routes: check that the request comes from our own site
// and from a signed-in admin, and read the form's contents.

import { cookies } from "next/headers";
import { revalidateTag } from "next/cache";
import { getAdmin, isSameOrigin } from "@/lib/auth";
import { PRODUCTS_TAG } from "@/lib/products";

export const fail = (message, status = 400, fields) => Response.json({ error: message, fields }, { status });

// Returns { admin }, or { response } with an error to send back.
export async function requireAdmin(request) {
  if (!isSameOrigin(request)) return { response: fail("Not allowed.", 403) };
  const admin = await getAdmin(await cookies());
  if (!admin) return { response: fail("Please sign in again.", 401) };
  return { admin };
}

export async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

// The shop and product pages show the change to the next visitor, right away.
export function refreshShop() {
  revalidateTag(PRODUCTS_TAG, { expire: 0 });
}

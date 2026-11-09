// ============================================================================
//  ADD A PRINT  (address: /admin/products/new, admins only)
// ============================================================================

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdmin } from "@/lib/auth";
import { getProducts } from "@/lib/products";
import ProductForm from "../ProductForm";

export const metadata = { title: "Add a print", robots: { index: false } };

export default async function NewProductPage() {
  if (!(await getAdmin(await cookies()))) redirect("/admin/login");

  // Suggest an order number that puts the new print last in the shop.
  const products = await getProducts({ fresh: true });
  const nextSortOrder = Math.max(0, ...products.map((product) => product.sort_order ?? 0)) + 10;

  return (
    <div className="admin admin--narrow">
      <Link href="/admin" className="small-link">
        ← All prints
      </Link>
      <h1>Add a print</h1>
      <ProductForm nextSortOrder={nextSortOrder} />
    </div>
  );
}

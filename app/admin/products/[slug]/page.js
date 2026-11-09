// ============================================================================
//  EDIT A PRINT  (address: /admin/products/catsuit etc., admins only)
// ============================================================================

import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getAdmin } from "@/lib/auth";
import { getProduct } from "@/lib/products";
import ProductForm from "../ProductForm";
import DeleteButton from "../DeleteButton";

export const metadata = { title: "Edit a print", robots: { index: false } };

export default async function EditProductPage({ params }) {
  if (!(await getAdmin(await cookies()))) redirect("/admin/login");

  const { slug } = await params;
  const product = await getProduct(slug, { fresh: true }); // always the latest
  if (!product) notFound();

  return (
    <div className="admin admin--narrow">
      <Link href="/admin" className="small-link">
        ← All prints
      </Link>
      <h1>{product.title}</h1>
      <ProductForm product={product} />
      <hr className="admin-divider" />
      <DeleteButton slug={product.slug} title={product.title} />
    </div>
  );
}

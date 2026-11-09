// ============================================================================
//  THE ADMIN PAGE  (address: /admin)
// ============================================================================
//  Only for signed-in admins (see lib/auth.js). Everyone else is sent to
//  /admin/login. Shows every print with its price and stock, and links to
//  the forms to add, change and delete them.
// ============================================================================

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdmin } from "@/lib/auth";
import { getProducts } from "@/lib/products";
import { formatPrice } from "@/lib/format";
import LogoutButton from "./LogoutButton";

export const metadata = { title: "Admin", robots: { index: false } };

export default async function AdminPage({ searchParams }) {
  const admin = await getAdmin(await cookies());
  if (!admin) redirect("/admin/login");

  const products = await getProducts({ fresh: true }); // always the latest numbers
  const { saved, deleted } = await searchParams; // set by the forms after a change

  return (
    <div className="admin">
      <div className="admin-top">
        <div>
          <h1>Admin</h1>
          <p className="note">Signed in as {admin.email}</p>
        </div>
        <div className="form-actions">
          <Link href="/admin/products/new" className="button">
            + Add a print
          </Link>
          <LogoutButton />
        </div>
      </div>

      {(saved || deleted) && (
        <p className="notice" role="status">
          {saved ? `✓ Saved “${saved}”. The shop shows it right away.` : `✓ Deleted “${deleted}” from the shop.`}
        </p>
      )}

      <table className="admin-table">
        <caption>{products.length} prints in the shop</caption>
        <thead>
          <tr>
            <th scope="col">Print</th>
            <th scope="col">Size</th>
            <th scope="col" className="number">Price</th>
            <th scope="col" className="number">Stock</th>
            <th scope="col">
              <span className="visually-hidden">Edit</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.slug}>
              <td>
                <Link href={`/shop/${product.slug}`}>{product.title}</Link>
              </td>
              <td>{product.size}</td>
              <td className="number">{formatPrice(product.price)}</td>
              <td className={product.stock === 0 ? "number sold-out" : "number"}>
                {product.stock === 0 ? "Sold out" : product.stock}
              </td>
              <td className="number">
                <Link href={`/admin/products/${product.slug}`} aria-label={`Edit ${product.title}`}>
                  Edit
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============================================================================
//  ADMINSIDAN  (adress: /admin)
// ============================================================================
//  Bara för inloggade admins (se lib/auth.js). Alla andra skickas till
//  /admin/login. Visar alla posters med pris och lager.
// ============================================================================

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdmin } from "@/lib/auth";
import { getProducts } from "@/lib/products";
import { formatPrice } from "@/lib/format";
import LogoutButton from "./LogoutButton";

export const metadata = { title: "Admin", robots: { index: false } };

export default async function AdminPage() {
  const admin = await getAdmin(await cookies());
  if (!admin) redirect("/admin/login");

  const products = await getProducts({ fresh: true }); // alltid de senaste siffrorna

  return (
    <div className="admin">
      <div className="admin-top">
        <div>
          <h1>Admin</h1>
          <p className="note">Signed in as {admin.email}</p>
        </div>
        <LogoutButton />
      </div>

      <table className="admin-table">
        <caption>{products.length} prints in the shop</caption>
        <thead>
          <tr>
            <th scope="col">Print</th>
            <th scope="col">Size</th>
            <th scope="col" className="number">Price</th>
            <th scope="col" className="number">Stock</th>
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

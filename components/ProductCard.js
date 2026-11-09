// Ett kort i butikens rutnät: bild, namn och pris.

import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/format";

export default function ProductCard({ product }) {
  const soldOut = product.stock <= 0;

  return (
    <Link href={`/shop/${product.slug}`} className="card">
      <div className="card-image">
        <Image
          src={product.images[0]}
          alt={product.title}
          fill
          sizes="(max-width: 600px) 50vw, (max-width: 1000px) 33vw, 25vw"
        />
        {soldOut && <span className="badge">Sold out</span>}
      </div>
      <div className="card-info">
        <h2>{product.title}</h2>
        <p>
          {product.size.split(" (")[0]} · {formatPrice(product.price)}
        </p>
      </div>
    </Link>
  );
}

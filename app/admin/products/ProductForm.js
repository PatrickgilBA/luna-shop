"use client";
// ============================================================================
//  FORMULÄRET FÖR EN POSTER (adminsidan)
// ============================================================================
//  Används både för att lägga till en ny poster och för att ändra en
//  befintlig. Fälten kontrolleras direkt när man lämnar dem (lib/validation.js),
//  och skickas sedan till servern med fetch. Servern kontrollerar allt igen.
// ============================================================================

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { validateProduct } from "@/lib/validation";
import FormField from "@/components/FormField";

const EMPTY = { slug: "", title: "", size: "", price: "", description: "", images: "", stock: "", sort_order: "" };

// Gör om en poster från databasen till formulärets textfält. En ny poster
// får ett ordningsnummer som lägger den sist i butiken.
function toForm(product, nextSortOrder) {
  if (!product) return { ...EMPTY, sort_order: String(nextSortOrder ?? "") };
  return {
    slug: product.slug,
    title: product.title,
    size: product.size,
    price: String(product.price),
    description: product.description,
    images: product.images.join("\n"),
    stock: String(product.stock),
    sort_order: String(product.sort_order ?? 0),
  };
}

// Gör om en titel till en slug: "Blue Cat!" → "blue-cat".
function slugify(title) {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // å → a, é → e
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export default function ProductForm({ product, nextSortOrder }) {
  const isNew = !product;
  const router = useRouter();
  const [form, setForm] = useState(() => toForm(product, nextSortOrder));
  const [slugEdited, setSlugEdited] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  function update(field, value) {
    setForm((current) => {
      const next = { ...current, [field]: value };
      // En ny posters slug följer namnet, tills man ändrar slug själv.
      if (isNew && field === "title" && !slugEdited) next.slug = slugify(value);
      return next;
    });
    if (field === "slug") setSlugEdited(true);
    // Ta bort felet under fältet (och under slug, om den fylldes i automatiskt).
    const autoSlug = isNew && field === "title" && !slugEdited;
    setErrors((current) => ({ ...current, [field]: undefined, ...(autoSlug && { slug: undefined }) }));
  }

  // Kontrollera ett fält när man lämnar det, så att felet syns direkt.
  function check(field) {
    const { errors: found } = validateProduct(form, { isNew });
    setErrors((current) => ({ ...current, [field]: found?.[field] }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    const { errors: found } = validateProduct(form, { isNew });
    if (found) {
      setErrors(found);
      setMessage("Please check the fields marked in red.");
      return;
    }

    setSending(true);
    try {
      const response = await fetch(isNew ? "/api/admin/products" : `/api/admin/products/${product.slug}`, {
        method: isNew ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) {
        setErrors(data.fields || {});
        setMessage(data.error || "Something went wrong.");
        setSending(false);
        return;
      }
      router.push(`/admin?saved=${encodeURIComponent(data.product.title)}`);
      router.refresh();
    } catch {
      setMessage("Could not reach the server. Please try again.");
      setSending(false);
    }
  }

  const images = form.images.split("\n").map((line) => line.trim()).filter(Boolean);

  return (
    <form className="form product-form" onSubmit={handleSubmit} noValidate>
      <FormField label="Name" id="title" error={errors.title}>
        <input value={form.title} onChange={(e) => update("title", e.target.value)} onBlur={() => check("title")} />
      </FormField>

      {isNew ? (
        <FormField
          label="Slug"
          id="slug"
          error={errors.slug}
          hint={`The address of the print: /shop/${form.slug || "…"}. Can't be changed later.`}
        >
          <input value={form.slug} onChange={(e) => update("slug", e.target.value)} onBlur={() => check("slug")} />
        </FormField>
      ) : (
        <p className="field-hint">
          Address: <Link href={`/shop/${product.slug}`}>/shop/{product.slug}</Link>
        </p>
      )}

      <div className="form-row">
        <FormField label="Price (€)" id="price" error={errors.price}>
          <input inputMode="decimal" value={form.price} onChange={(e) => update("price", e.target.value)} onBlur={() => check("price")} />
        </FormField>
        <FormField label="Stock" id="stock" error={errors.stock}>
          <input inputMode="numeric" value={form.stock} onChange={(e) => update("stock", e.target.value)} onBlur={() => check("stock")} />
        </FormField>
      </div>

      <FormField label="Size" id="size" error={errors.size} hint="For example A4 (21 × 29.7 cm)">
        <input value={form.size} onChange={(e) => update("size", e.target.value)} onBlur={() => check("size")} />
      </FormField>

      <FormField
        label="Description"
        id="description"
        error={errors.description}
        hint={`${form.description.length} / 1000 characters`}
      >
        <textarea rows={3} value={form.description} onChange={(e) => update("description", e.target.value)} onBlur={() => check("description")} />
      </FormField>

      <FormField
        label="Images"
        id="images"
        error={errors.images}
        hint="One per line, for example /images/products/moth-1.jpg. The first one is shown in the shop."
      >
        <textarea rows={3} value={form.images} onChange={(e) => update("images", e.target.value)} onBlur={() => check("images")} />
      </FormField>

      {images.length > 0 && (
        <div className="image-previews" aria-label="Image preview">
          {images.slice(0, 10).map((src) => (
            // Vanlig <img> här: adressen skrivs just nu och kanske inte finns än.
            <img key={src} src={src} alt="" />
          ))}
        </div>
      )}

      <FormField label="Order in the shop" id="sort_order" error={errors.sort_order} hint="Lowest number first.">
        <input inputMode="numeric" value={form.sort_order} onChange={(e) => update("sort_order", e.target.value)} onBlur={() => check("sort_order")} />
      </FormField>

      {message && (
        <p className="error" role="alert">
          {message}
        </p>
      )}

      <div className="form-actions">
        <button className="button" type="submit" disabled={sending}>
          {sending ? "Saving…" : isNew ? "Add print" : "Save changes"}
        </button>
        <Link href="/admin" className="small-link">
          Cancel
        </Link>
      </div>
    </form>
  );
}

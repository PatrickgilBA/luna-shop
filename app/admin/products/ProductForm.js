"use client";
// ============================================================================
//  THE FORM FOR A PRINT (admin page)
// ============================================================================
//  Used both to add a new print and to change an existing one.
//  Each field is checked as soon as you leave it (lib/validation.js),
//  and then sent to the server with fetch. The server checks everything again.
// ============================================================================

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { validateProduct } from "@/lib/validation";
import FormField from "@/components/FormField";
import ImageUpload from "@/components/ImageUpload";

const EMPTY = { slug: "", title: "", size: "", price: "", description: "", images: "", stock: "", sort_order: "" };

// Turns a print from the database into the form's text fields. A new print
// gets an order number that puts it last in the shop.
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

// The images field is text with one address per line; here it becomes a list.
function toList(text) {
  return text.split("\n").map((line) => line.trim()).filter(Boolean);
}

// Turns a title into a slug: "Blue Cat!" → "blue-cat".
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
      // A new print's slug follows the name, until you change the slug yourself.
      if (isNew && field === "title" && !slugEdited) next.slug = slugify(value);
      return next;
    });
    if (field === "slug") setSlugEdited(true);
    // Remove the error under the field (and under slug, if it was filled in automatically).
    const autoSlug = isNew && field === "title" && !slugEdited;
    setErrors((current) => ({ ...current, [field]: undefined, ...(autoSlug && { slug: undefined }) }));
  }

  // Check a field when you leave it, so the error shows right away.
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

  const images = toList(form.images);

  // Change the image list (upload or "Remove"). Takes a list or a
  // function, so several uploads in a row don't overwrite each other.
  function setImages(next) {
    setForm((current) => {
      const list = typeof next === "function" ? next(toList(current.images)) : next;
      return { ...current, images: list.join("\n") };
    });
    setErrors((current) => ({ ...current, images: undefined }));
  }

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

      <fieldset className={errors.images ? "images-field field--error" : "images-field"}>
        <legend>Images</legend>
        <p className="field-hint">The first image is shown in the shop.</p>

        {images.length > 0 && (
          <ul className="image-previews">
            {images.map((src, index) => (
              <li key={src}>
                {/* A plain <img> here: the address may have been typed by hand and might not exist. */}
                <img src={src} alt={`Image ${index + 1}`} />
                {index === 0 && <span className="image-badge">In the shop</span>}
                <button type="button" className="image-remove" onClick={() => setImages(images.filter((s) => s !== src))}>
                  Remove<span className="visually-hidden"> image {index + 1}</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        <ImageUpload onUploaded={(url) => setImages((current) => [...current, url])} />

        <details className="image-addresses">
          <summary>Image addresses (advanced)</summary>
          <FormField label="One address per line" id="images" hint="For example /images/products/moth-1.jpg">
            <textarea rows={3} value={form.images} onChange={(e) => update("images", e.target.value)} onBlur={() => check("images")} />
          </FormField>
        </details>

        {errors.images && <p className="field-error">{errors.images}</p>}
      </fieldset>

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

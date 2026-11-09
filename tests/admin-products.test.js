// Tests for managing prints from the admin page: the form rules
// (validateProduct) and the routes that add, change and delete prints.
// Supabase is replaced by a fake, so the real shop is never changed.

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("next/headers", () => ({ cookies: async () => ({ get: () => undefined }) }));
vi.mock("next/cache", () => ({ revalidateTag: vi.fn() }));
vi.mock("@/lib/auth", async (importOriginal) => ({ ...(await importOriginal()), getAdmin: vi.fn() }));

import { revalidateTag } from "next/cache";
import { getAdmin } from "@/lib/auth";
import { validateProduct } from "@/lib/validation";
import { PRODUCTS_TAG } from "@/lib/products";
import { POST as create } from "@/app/api/admin/products/route";
import { PATCH as update, DELETE as remove } from "@/app/api/admin/products/[slug]/route";

const VALID = {
  slug: "blue-cat",
  title: "Blue Cat",
  size: "A4 (21 × 29.7 cm)",
  price: "30",
  description: "A cat.",
  images: "/images/products/moth-1.jpg",
  stock: "5",
  sort_order: "250",
};

const request = (method, body, origin = "http://localhost") =>
  new Request("http://localhost/api/admin/products", {
    method,
    headers: { "Content-Type": "application/json", origin },
    ...(body !== undefined && { body: typeof body === "string" ? body : JSON.stringify(body) }),
  });
const params = (slug) => ({ params: Promise.resolve({ slug }) });

// A fake Supabase that answers like PostgREST.
const supabase = (status, data) =>
  vi.fn().mockResolvedValue(new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } }));
const ROW = { slug: "blue-cat", title: "Blue Cat", size: "A4", price: "30.00", description: "", images: [], stock: 5, sort_order: 250 };

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_test");
  getAdmin.mockResolvedValue({ id: "admin-1", email: "luna@example.com", accessToken: "admin-token" });
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

// ---- The form rules -------------------------------------------------------

describe("validateProduct", () => {
  it("accepts a valid print and turns the text fields into numbers and a list", () => {
    const { values, errors } = validateProduct({ ...VALID, price: "30,50", images: "/a.jpg\n\n/images/b.jpg\n" }, { isNew: true });
    expect(errors).toEqual({ images: "Each image must start with /images/ or https://" });

    const ok = validateProduct({ ...VALID, price: "30,50", images: " /images/a.jpg \n\nhttps://x.supabase.co/b.jpg\n" }, { isNew: true });
    expect(ok.errors).toBeNull();
    expect(ok.values).toMatchObject({ price: 30.5, stock: 5, sort_order: 250, images: ["/images/a.jpg", "https://x.supabase.co/b.jpg"] });
    expect(values.slug).toBe("blue-cat");
  });

  it.each([
    ["slug", { slug: "" }, /Please enter a slug/],
    ["slug", { slug: "Blue Cat" }, /lowercase letters/],
    ["slug", { slug: "blue--cat" }, /lowercase letters/],
    ["title", { title: "   " }, /Please enter a name/],
    ["title", { title: "x".repeat(101) }, /under 100/],
    ["size", { size: "" }, /Please enter a size/],
    ["price", { price: "" }, /Please enter a price/],
    ["price", { price: "abc" }, /Please enter a price/],
    ["price", { price: "0" }, /more than 0/],
    ["price", { price: "-5" }, /more than 0/],
    ["price", { price: "30.505" }, /two decimals/],
    ["price", { price: "20000" }, /at most €10,000/],
    ["description", { description: "x".repeat(1001) }, /under 1,000/],
    ["images", { images: "" }, /at least one image/],
    ["images", { images: "javascript:alert(1)" }, /must start with/],
    ["stock", { stock: "" }, /how many are in stock/],
    ["stock", { stock: "1.5" }, /whole number/],
    ["stock", { stock: "-1" }, /whole number/],
    ["sort_order", { sort_order: "abc" }, /whole number/],
  ])("refuses a bad %s: %j", (field, change, message) => {
    const { errors } = validateProduct({ ...VALID, ...change }, { isNew: true });
    expect(errors?.[field]).toMatch(message);
  });

  it("accepts prices like 0.29 that computers can't store exactly", () => {
    expect(validateProduct({ ...VALID, price: "0.29" }).errors).toBeNull();
  });

  it("treats an empty order as 0", () => {
    expect(validateProduct({ ...VALID, sort_order: "" }).values.sort_order).toBe(0);
  });

  it("ignores the slug when changing an existing print", () => {
    const { values, errors } = validateProduct({ ...VALID, slug: "Not Valid" });
    expect(errors).toBeNull();
    expect(values).not.toHaveProperty("slug");
  });
});

// ---- POST /api/admin/products ---------------------------------------------

describe("POST /api/admin/products (add a print)", () => {
  it("saves a new print with the admin's own login, and refreshes the shop", async () => {
    const fetch = supabase(201, [ROW]);
    vi.stubGlobal("fetch", fetch);

    const response = await create(request("POST", VALID));
    expect(response.status).toBe(201);
    expect((await response.json()).product).toMatchObject({ slug: "blue-cat", price: 30 });

    const [url, options] = fetch.mock.calls[0];
    expect(url.endsWith("/rest/v1/products")).toBe(true);
    expect(options.method).toBe("POST");
    expect(options.headers.Authorization).toBe("Bearer admin-token"); // the database checks is_admin()
    expect(JSON.parse(options.body)).toMatchObject({ slug: "blue-cat", price: 30, stock: 5, images: ["/images/products/moth-1.jpg"] });
    expect(revalidateTag).toHaveBeenCalledWith(PRODUCTS_TAG, { expire: 0 });
  });

  it("explains when the slug is already taken", async () => {
    vi.stubGlobal("fetch", supabase(409, { code: "23505", message: "duplicate key" }));
    const response = await create(request("POST", VALID));
    expect(response.status).toBe(409);
    expect((await response.json()).fields.slug).toMatch(/already exists/);
  });

  it("checks the form on the server and never calls Supabase with bad data", async () => {
    const fetch = supabase(201, [ROW]);
    vi.stubGlobal("fetch", fetch);
    const response = await create(request("POST", { ...VALID, price: "0", title: "" }));
    expect(response.status).toBe(400);
    expect(Object.keys((await response.json()).fields)).toEqual(["title", "price"]);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("refuses visitors who aren't signed in as admin", async () => {
    getAdmin.mockResolvedValue(null);
    const fetch = supabase(201, [ROW]);
    vi.stubGlobal("fetch", fetch);
    expect((await create(request("POST", VALID))).status).toBe(401);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("refuses requests from other websites", async () => {
    vi.stubGlobal("fetch", supabase(201, [ROW]));
    expect((await create(request("POST", VALID, "https://evil.example"))).status).toBe(403);
  });

  it("refuses a request that isn't JSON", async () => {
    expect((await create(request("POST", "not json"))).status).toBe(400);
  });

  it("answers 403 if the database refuses (the account isn't admin)", async () => {
    vi.stubGlobal("fetch", supabase(201, []));
    expect((await create(request("POST", VALID))).status).toBe(403);
  });
});

// ---- PATCH and DELETE /api/admin/products/[slug] ---------------------------

describe("PATCH /api/admin/products/[slug] (change a print)", () => {
  it("changes the print, but never its slug", async () => {
    const fetch = supabase(200, [{ ...ROW, price: "25.00" }]);
    vi.stubGlobal("fetch", fetch);

    const response = await update(request("PATCH", { ...VALID, slug: "something-else", price: "25" }), params("blue-cat"));
    expect(response.status).toBe(200);

    const [url, options] = fetch.mock.calls[0];
    expect(url).toContain("/rest/v1/products?slug=eq.blue-cat");
    expect(options.method).toBe("PATCH");
    const sent = JSON.parse(options.body);
    expect(sent).not.toHaveProperty("slug");
    expect(sent.price).toBe(25);
    expect(sent.updated_at).toBeTruthy();
    expect(revalidateTag).toHaveBeenCalled();
  });

  it("answers 404 for a print that doesn't exist", async () => {
    vi.stubGlobal("fetch", supabase(200, []));
    expect((await update(request("PATCH", VALID), params("nope"))).status).toBe(404);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("refuses bad data", async () => {
    vi.stubGlobal("fetch", supabase(200, [ROW]));
    expect((await update(request("PATCH", { ...VALID, stock: "-3" }), params("blue-cat"))).status).toBe(400);
  });

  it("refuses visitors who aren't signed in as admin", async () => {
    getAdmin.mockResolvedValue(null);
    expect((await update(request("PATCH", VALID), params("blue-cat"))).status).toBe(401);
  });

  it("answers with an error if Supabase fails", async () => {
    vi.stubGlobal("fetch", supabase(500, { message: "down" }));
    expect((await update(request("PATCH", VALID), params("blue-cat"))).status).toBe(500);
  });
});

describe("DELETE /api/admin/products/[slug] (delete a print)", () => {
  it("deletes the print and refreshes the shop", async () => {
    const fetch = supabase(200, [ROW]);
    vi.stubGlobal("fetch", fetch);

    expect((await remove(request("DELETE"), params("blue-cat"))).status).toBe(200);
    expect(fetch.mock.calls[0][1].method).toBe("DELETE");
    expect(revalidateTag).toHaveBeenCalled();
  });

  it("answers 404 for a print that doesn't exist", async () => {
    vi.stubGlobal("fetch", supabase(200, []));
    expect((await remove(request("DELETE"), params("nope"))).status).toBe(404);
  });

  it("refuses visitors who aren't signed in as admin", async () => {
    getAdmin.mockResolvedValue(null);
    expect((await remove(request("DELETE"), params("blue-cat"))).status).toBe(401);
  });
});

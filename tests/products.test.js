// Tests for reading the prints from Supabase (lib/products.js) and for
// lowering the stock after an order (lib/orders.js). Supabase and Stripe are
// replaced by fakes, so the tests never touch the real database or Stripe.

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("next/cache", () => ({ revalidateTag: vi.fn() }));

import { revalidateTag } from "next/cache";
import { getProducts, getProduct, processOrder, PRODUCTS_TAG } from "@/lib/products";
import { countPaidOrder } from "@/lib/orders";

const jsonResponse = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

const MOTH = {
  slug: "moth",
  title: "Moth",
  size: "A4",
  price: "30.00", // Supabase sends prices with decimals as text
  description: "An orange moth.",
  images: ["/images/products/moth-1.jpg"],
  stock: 2,
};

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_test");
  vi.stubEnv("SUPABASE_SECRET_KEY", "sb_secret_test");
  vi.spyOn(console, "log").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

describe("getProducts", () => {
  it("reads every print from Supabase, in shop order, with prices as numbers", async () => {
    const fetch = vi.fn().mockResolvedValue(jsonResponse([MOTH]));
    vi.stubGlobal("fetch", fetch);

    const products = await getProducts();
    expect(products).toEqual([{ ...MOTH, price: 30 }]);

    const [url, options] = fetch.mock.calls[0];
    expect(url).toContain("/rest/v1/products?select=");
    expect(url).toContain("order=sort_order.asc");
    expect(options.headers.apikey).toBe("sb_publishable_test"); // read-only key, never the secret one
    expect(options.next).toEqual({ revalidate: 60, tags: [PRODUCTS_TAG] });
  });

  it("skips the cache when fresh data is needed (checkout)", async () => {
    const fetch = vi.fn().mockResolvedValue(jsonResponse([]));
    vi.stubGlobal("fetch", fetch);

    await getProducts({ fresh: true });
    expect(fetch.mock.calls[0][1].cache).toBe("no-store");
    expect(fetch.mock.calls[0][1].next).toBeUndefined();
  });

  it("throws if Supabase answers with an error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({ message: "down" }, 503)));
    await expect(getProducts()).rejects.toThrow(/503/);
  });
});

describe("getProduct", () => {
  it("finds one print by slug", async () => {
    const fetch = vi.fn().mockResolvedValue(jsonResponse([MOTH]));
    vi.stubGlobal("fetch", fetch);

    expect((await getProduct("moth")).title).toBe("Moth");
    expect(fetch.mock.calls[0][0]).toContain("slug=eq.moth");
  });

  it("returns null for a print that doesn't exist", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse([])));
    expect(await getProduct("nope")).toBeNull();
  });

  it("escapes the slug so it can't change the query", async () => {
    const fetch = vi.fn().mockResolvedValue(jsonResponse([]));
    vi.stubGlobal("fetch", fetch);

    await getProduct("moth&select=*");
    expect(fetch.mock.calls[0][0]).toContain("slug=eq.moth%26select%3D*");
  });
});

describe("processOrder", () => {
  it("calls the process_order function with the secret key", async () => {
    const fetch = vi.fn().mockResolvedValue(jsonResponse(true));
    vi.stubGlobal("fetch", fetch);

    expect(await processOrder("cs_test_1", [{ slug: "moth", quantity: 2 }])).toBe(true);
    const [url, options] = fetch.mock.calls[0];
    expect(url).toContain("/rest/v1/rpc/process_order");
    expect(options.headers.apikey).toBe("sb_secret_test");
    expect(JSON.parse(options.body)).toEqual({ session_id: "cs_test_1", items: [{ slug: "moth", quantity: 2 }] });
  });

  it("throws if Supabase refuses", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("permission denied", { status: 401 })));
    await expect(processOrder("cs_test_1", [])).rejects.toThrow(/401/);
  });
});

describe("countPaidOrder", () => {
  const fakeStripe = (lines) => ({
    checkout: { sessions: { listLineItems: vi.fn().mockResolvedValue({ data: lines }) } },
  });

  it("reads which prints were bought, lowers the stock and refreshes the pages", async () => {
    const fetch = vi.fn().mockResolvedValue(jsonResponse(true));
    vi.stubGlobal("fetch", fetch);
    const stripe = fakeStripe([
      { quantity: 2, price: { product: { metadata: { slug: "moth" } } } },
      { quantity: 1, price: { product: { metadata: { slug: "tiger" } } } },
      { quantity: 1, price: { product: { metadata: {} } } }, // not one of our prints: ignored
    ]);

    expect(await countPaidOrder(stripe, "cs_test_1")).toBe(true);
    expect(JSON.parse(fetch.mock.calls[0][1].body).items).toEqual([
      { slug: "moth", quantity: 2 },
      { slug: "tiger", quantity: 1 },
    ]);
    expect(revalidateTag).toHaveBeenCalledWith(PRODUCTS_TAG, { expire: 0 });
  });

  it("does not refresh the pages when the order was already counted", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(false)));
    const stripe = fakeStripe([{ quantity: 1, price: { product: { metadata: { slug: "moth" } } } }]);

    expect(await countPaidOrder(stripe, "cs_test_1")).toBe(false);
    expect(revalidateTag).not.toHaveBeenCalled();
  });
});

// Tests for the stock (lib/inventory.js) and for lowering it after an order
// (lib/orders.js). Supabase and Stripe are replaced by fakes, so the tests
// never touch the real database or the real Stripe account.

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("next/cache", () => ({ revalidateTag: vi.fn() }));

import { revalidateTag } from "next/cache";
import { getStock, withStock, processOrder, INVENTORY_TAG } from "@/lib/inventory";
import { countPaidOrder } from "@/lib/orders";

const jsonResponse = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_test");
  vi.stubEnv("SUPABASE_SECRET_KEY", "sb_secret_test");
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

describe("withStock", () => {
  it("adds the stock from Supabase to a print", () => {
    expect(withStock({ slug: "moth" }, { moth: 3 })).toEqual({ slug: "moth", stock: 3 });
  });

  it("treats a print that is missing in Supabase as sold out", () => {
    expect(withStock({ slug: "new-print" }, { moth: 3 }).stock).toBe(0);
  });
});

describe("getStock", () => {
  it("turns the Supabase rows into { slug: stock }", async () => {
    const fetch = vi.fn().mockResolvedValue(jsonResponse([{ slug: "moth", stock: 2 }, { slug: "tiger", stock: 0 }]));
    vi.stubGlobal("fetch", fetch);

    expect(await getStock()).toEqual({ moth: 2, tiger: 0 });
    const [url, options] = fetch.mock.calls[0];
    expect(url).toContain("/rest/v1/inventory");
    expect(options.headers.apikey).toBe("sb_publishable_test"); // read-only key, never the secret one
    expect(options.next.tags).toContain(INVENTORY_TAG);
  });

  it("skips the cache when fresh stock is needed (checkout)", async () => {
    const fetch = vi.fn().mockResolvedValue(jsonResponse([]));
    vi.stubGlobal("fetch", fetch);

    await getStock({ fresh: true });
    expect(fetch.mock.calls[0][1].cache).toBe("no-store");
  });

  it("throws if Supabase answers with an error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({ message: "down" }, 503)));
    await expect(getStock()).rejects.toThrow(/503/);
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
    expect(revalidateTag).toHaveBeenCalledWith(INVENTORY_TAG, { expire: 0 });
  });

  it("does not refresh the pages when the order was already counted", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(false)));
    const stripe = fakeStripe([{ quantity: 1, price: { product: { metadata: { slug: "moth" } } } }]);

    expect(await countPaidOrder(stripe, "cs_test_1")).toBe(false);
    expect(revalidateTag).not.toHaveBeenCalled();
  });
});

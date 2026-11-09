// Tests for the API routes: the checkout, the thank-you page check and the
// Stripe webhook. Stripe and the stock are replaced by fakes, so no real
// payment pages are created and the real stock is never changed.

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ---- Fakes ----------------------------------------------------------------

const stripeFake = {
  checkout: { sessions: { create: vi.fn(), retrieve: vi.fn() } },
  webhooks: { constructEvent: vi.fn() },
};
vi.mock("stripe", () => ({ default: vi.fn(() => stripeFake) }));

vi.mock("@/lib/inventory", async (importOriginal) => ({
  ...(await importOriginal()),
  getStock: vi.fn(),
}));
vi.mock("@/lib/orders", () => ({ countPaidOrder: vi.fn() }));

import { getStock } from "@/lib/inventory";
import { countPaidOrder } from "@/lib/orders";
import { POST as checkout } from "@/app/api/checkout/route";
import { POST as confirmOrder } from "@/app/api/confirm-order/route";
import { POST as webhook } from "@/app/api/stripe-webhook/route";
import { getProduct } from "@/data/products";

const post = (body) =>
  new Request("http://localhost/api", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });

const read = async (response) => ({ status: response.status, body: await response.json() });

beforeEach(() => {
  vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_fake");
  vi.stubEnv("STRIPE_WEBHOOK_SECRET", "whsec_fake");
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://shop.example");
  getStock.mockResolvedValue({ moth: 5, tiger: 0, catsuit: 20 });
  stripeFake.checkout.sessions.create.mockResolvedValue({ url: "https://checkout.stripe.com/test" });
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "log").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

// ---- /api/checkout --------------------------------------------------------

describe("POST /api/checkout", () => {
  const order = (items, zone = "eu") => checkout(post({ items, zone }));

  it("creates a Stripe payment page for a valid order", async () => {
    const { status, body } = await read(await order([{ slug: "moth", quantity: 2 }]));
    expect(status).toBe(200);
    expect(body.url).toBe("https://checkout.stripe.com/test");
  });

  it("uses the price from the server, never one sent by the browser", async () => {
    await checkout(post({ items: [{ slug: "moth", quantity: 1, price: 0.01 }], zone: "eu" }));
    const line = stripeFake.checkout.sessions.create.mock.calls[0][0].line_items[0];
    expect(line.price_data.unit_amount).toBe(Math.round(getProduct("moth").price * 100));
    expect(line.price_data.product_data.metadata.slug).toBe("moth"); // needed by the webhook
  });

  it("only allows addresses in the chosen shipping zone", async () => {
    await order([{ slug: "moth", quantity: 1 }], "eu");
    const session = stripeFake.checkout.sessions.create.mock.calls[0][0];
    expect(session.shipping_address_collection.allowed_countries).toContain("SE");
    expect(session.shipping_address_collection.allowed_countries).not.toContain("US");
    expect(session.success_url).toBe("https://shop.example/success?session_id={CHECKOUT_SESSION_ID}");
  });

  it("checks the stock without the cache", async () => {
    await order([{ slug: "moth", quantity: 1 }]);
    expect(getStock).toHaveBeenCalledWith({ fresh: true });
  });

  it.each([
    ["more than in stock", [{ slug: "moth", quantity: 6 }], /only 5 of "Moth" left/],
    ["a sold-out print", [{ slug: "tiger", quantity: 1 }], /"Tiger" is sold out/],
    ["more than 10 of the same print", [{ slug: "catsuit", quantity: 11 }], /at most 10/],
    ["a print that doesn't exist", [{ slug: "nope", quantity: 1 }], /no longer exists/],
    ["a quantity of 0", [{ slug: "moth", quantity: 0 }], /Invalid quantity/],
    ["a negative quantity", [{ slug: "moth", quantity: -1 }], /Invalid quantity/],
    ["a decimal quantity", [{ slug: "moth", quantity: 1.5 }], /Invalid quantity/],
    ["an empty cart", [], /cart is empty/],
  ])("refuses %s", async (_, items, message) => {
    const { status, body } = await read(await order(items));
    expect(status).toBe(400);
    expect(body.error).toMatch(message);
    expect(stripeFake.checkout.sessions.create).not.toHaveBeenCalled();
  });

  it("refuses an unknown shipping zone", async () => {
    const { status, body } = await read(await order([{ slug: "moth", quantity: 1 }], "mars"));
    expect(status).toBe(400);
    expect(body.error).toMatch(/shipping zone/);
  });

  it("refuses a request that isn't JSON", async () => {
    expect((await checkout(post("not json"))).status).toBe(400);
  });

  it("answers with an error if the stock can't be read", async () => {
    getStock.mockRejectedValue(new Error("Supabase is down"));
    const { status, body } = await read(await order([{ slug: "moth", quantity: 1 }]));
    expect(status).toBe(500);
    expect(body.error).toMatch(/check the stock/);
  });

  it("answers with an error if the Stripe key is missing", async () => {
    vi.stubEnv("STRIPE_SECRET_KEY", "");
    expect((await order([{ slug: "moth", quantity: 1 }])).status).toBe(500);
  });
});

// ---- /api/confirm-order ---------------------------------------------------

describe("POST /api/confirm-order", () => {
  it("lowers the stock for a paid order", async () => {
    stripeFake.checkout.sessions.retrieve.mockResolvedValue({ payment_status: "paid" });
    countPaidOrder.mockResolvedValue(true);

    const { status, body } = await read(await confirmOrder(post({ sessionId: "cs_test_123" })));
    expect(status).toBe(200);
    expect(body).toEqual({ ok: true, counted: true });
    expect(countPaidOrder).toHaveBeenCalledWith(stripeFake, "cs_test_123");
  });

  it("refuses an order that isn't paid", async () => {
    stripeFake.checkout.sessions.retrieve.mockResolvedValue({ payment_status: "unpaid" });
    const { status } = await read(await confirmOrder(post({ sessionId: "cs_test_123" })));
    expect(status).toBe(400);
    expect(countPaidOrder).not.toHaveBeenCalled();
  });

  it("refuses an order id that isn't a Stripe checkout id", async () => {
    expect((await confirmOrder(post({ sessionId: "hello" }))).status).toBe(400);
    expect((await confirmOrder(post({}))).status).toBe(400);
    expect(stripeFake.checkout.sessions.retrieve).not.toHaveBeenCalled();
  });

  it("answers 404 for an order Stripe doesn't know", async () => {
    stripeFake.checkout.sessions.retrieve.mockRejectedValue(new Error("No such session"));
    expect((await confirmOrder(post({ sessionId: "cs_test_unknown" }))).status).toBe(404);
  });
});

// ---- /api/stripe-webhook --------------------------------------------------

describe("POST /api/stripe-webhook", () => {
  const event = (type, session) => ({ type, data: { object: { id: "cs_test_9", ...session } } });
  const send = () =>
    webhook(new Request("http://localhost/api", { method: "POST", headers: { "stripe-signature": "t=1,v1=abc" }, body: "{}" }));

  it("lowers the stock when a payment is completed", async () => {
    stripeFake.webhooks.constructEvent.mockReturnValue(event("checkout.session.completed", { payment_status: "paid" }));
    expect((await send()).status).toBe(200);
    expect(countPaidOrder).toHaveBeenCalledWith(stripeFake, "cs_test_9");
  });

  it("lowers the stock when a delayed payment succeeds", async () => {
    stripeFake.webhooks.constructEvent.mockReturnValue(event("checkout.session.async_payment_succeeded", {}));
    expect((await send()).status).toBe(200);
    expect(countPaidOrder).toHaveBeenCalled();
  });

  it("ignores a completed checkout that isn't paid yet", async () => {
    stripeFake.webhooks.constructEvent.mockReturnValue(event("checkout.session.completed", { payment_status: "unpaid" }));
    expect((await send()).status).toBe(200);
    expect(countPaidOrder).not.toHaveBeenCalled();
  });

  it("refuses messages that aren't signed by Stripe", async () => {
    stripeFake.webhooks.constructEvent.mockImplementation(() => {
      throw new Error("No signatures found");
    });
    expect((await send()).status).toBe(400);
    expect(countPaidOrder).not.toHaveBeenCalled();
  });

  it("answers with an error so Stripe tries again if the stock can't be updated", async () => {
    stripeFake.webhooks.constructEvent.mockReturnValue(event("checkout.session.completed", { payment_status: "paid" }));
    countPaidOrder.mockRejectedValue(new Error("Supabase is down"));
    expect((await send()).status).toBe(500);
  });

  it("answers with an error if the webhook secret is missing", async () => {
    vi.stubEnv("STRIPE_WEBHOOK_SECRET", "");
    expect((await send()).status).toBe(500);
  });
});

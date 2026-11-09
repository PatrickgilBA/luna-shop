// Tests for uploading images from the admin page (/api/admin/images).
// Supabase Storage is replaced by a fake, so nothing is really uploaded.

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("next/headers", () => ({ cookies: async () => ({ get: () => undefined }) }));
vi.mock("@/lib/auth", async (importOriginal) => ({ ...(await importOriginal()), getAdmin: vi.fn() }));

import { getAdmin } from "@/lib/auth";
import { POST as upload } from "@/app/api/admin/images/route";

const PREFIX = "https://example.supabase.co/storage/v1/object/public/product-images/";

function send(file, origin = "http://localhost") {
  const body = new FormData();
  if (file) body.append("file", file);
  return upload(new Request("http://localhost/api/admin/images", { method: "POST", headers: { origin }, body }));
}
const image = (type = "image/jpeg", bytes = 1000) => new File([new Uint8Array(bytes)], "cat.jpg", { type });

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

describe("POST /api/admin/images", () => {
  it("uploads the image to the product-images bucket with the admin's login", async () => {
    const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ Key: "x" }), { status: 200 }));
    vi.stubGlobal("fetch", fetch);

    const response = await send(image());
    expect(response.status).toBe(201);
    const { url } = await response.json();
    expect(url.startsWith(PREFIX)).toBe(true);
    expect(url).toMatch(/\/\d{4}-\d{2}-\d{2}-[0-9a-f-]{36}\.jpg$/); // date + unique id

    const [address, options] = fetch.mock.calls[0];
    expect(address).toBe(url.replace("/object/public/", "/object/"));
    expect(options.headers.Authorization).toBe("Bearer admin-token"); // the database checks is_admin()
    expect(options.headers["Content-Type"]).toBe("image/jpeg");
  });

  it.each([
    ["png", "image/png"],
    ["webp", "image/webp"],
  ])("keeps the right file ending for %s", async (ending, type) => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}", { status: 200 })));
    const { url } = await (await send(image(type))).json();
    expect(url.endsWith(`.${ending}`)).toBe(true);
  });

  it.each([
    ["no file", null, /choose an image/],
    ["a file that isn't an image", image("text/plain"), /JPEG, PNG or WebP/],
    ["an SVG (can contain code)", image("image/svg+xml"), /JPEG, PNG or WebP/],
    ["an image over 4 MB", image("image/jpeg", 4 * 1024 * 1024 + 1), /too big/],
  ])("refuses %s without contacting Supabase", async (_, file, message) => {
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    const response = await send(file);
    expect(response.status).toBe(400);
    expect((await response.json()).error).toMatch(message);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("refuses visitors who aren't signed in as admin", async () => {
    getAdmin.mockResolvedValue(null);
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    expect((await send(image())).status).toBe(401);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("refuses requests from other websites", async () => {
    expect((await send(image(), "https://evil.example")).status).toBe(403);
  });

  it("answers with an error if Supabase refuses the image", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("denied", { status: 403 })));
    const response = await send(image());
    expect(response.status).toBe(502);
    expect((await response.json()).error).toMatch(/refused/);
  });
});

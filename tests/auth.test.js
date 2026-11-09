// Tests for the admin login: form validation, the login and logout routes,
// and the proxy that renews the login. Supabase is replaced by a fake, so no
// real accounts are used.

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// A fake cookie jar, like the one `await cookies()` from next/headers returns.
const jar = new Map();
const cookieStore = {
  get: (name) => (jar.has(name) ? { name, value: jar.get(name).value } : undefined),
  set: (name, value, options) => (options?.maxAge === 0 ? jar.delete(name) : jar.set(name, { value, options })),
};
vi.mock("next/headers", () => ({ cookies: async () => cookieStore }));

import { validateLogin } from "@/lib/validation";
import { ACCESS_COOKIE, REFRESH_COOKIE, getAdmin } from "@/lib/auth";
import { POST as login } from "@/app/api/admin/login/route";
import { POST as logout } from "@/app/api/admin/logout/route";
import { proxy } from "@/proxy";
import { NextRequest } from "next/server";

const SESSION = { access_token: "access-1", refresh_token: "refresh-1", expires_in: 3600 };

// A fake Supabase: answers depending on the address that is called.
function fakeSupabase({ password = "right", admin = true, refresh = SESSION } = {}) {
  return vi.fn(async (url, options = {}) => {
    const body = options.body ? JSON.parse(options.body) : {};
    const json = (data, status = 200) => new Response(JSON.stringify(data), { status });
    if (url.includes("grant_type=password")) {
      return body.password === password ? json(SESSION) : json({ error: "invalid_grant" }, 400);
    }
    if (url.includes("grant_type=refresh_token")) return refresh ? json(refresh) : json({}, 400);
    if (url.includes("/rpc/is_admin")) return json(admin);
    if (url.includes("/auth/v1/user")) return json({ id: "user-1", email: "luna@example.com" });
    if (url.includes("/auth/v1/logout")) return new Response(null, { status: 204 });
    return json({}, 404);
  });
}

const post = (body, origin = "http://localhost") =>
  new Request("http://localhost/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json", origin },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });

beforeEach(() => {
  jar.clear();
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_test");
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("validateLogin", () => {
  it("accepts a valid email and password, and tidies the email", () => {
    expect(validateLogin({ email: "  Luna@Example.com ", password: "secret" })).toEqual({
      values: { email: "luna@example.com", password: "secret" },
      errors: null,
    });
  });

  it.each([
    [{}, { email: "Please enter your email.", password: "Please enter your password." }],
    [{ email: "luna", password: "x" }, { email: "This doesn't look like an email address." }],
    [{ email: "luna@example", password: "x" }, { email: "This doesn't look like an email address." }],
    [{ email: "luna@example.com", password: "x".repeat(201) }, { password: "The password is too long." }],
    [{ email: 42, password: ["x"] }, { email: "Please enter your email.", password: "Please enter your password." }],
  ])("refuses %j", (input, errors) => {
    expect(validateLogin(input).errors).toEqual(errors);
  });
});

describe("POST /api/admin/login", () => {
  it("signs in an admin and saves the login in httpOnly cookies", async () => {
    vi.stubGlobal("fetch", fakeSupabase());
    const response = await login(post({ email: "luna@example.com", password: "right" }));

    expect(response.status).toBe(200);
    expect(jar.get(ACCESS_COOKIE).value).toBe("access-1");
    expect(jar.get(REFRESH_COOKIE).value).toBe("refresh-1");
    expect(jar.get(ACCESS_COOKIE).options).toMatchObject({ httpOnly: true, sameSite: "lax", path: "/" });
  });

  it("refuses a wrong password without saying whether the email exists", async () => {
    vi.stubGlobal("fetch", fakeSupabase());
    const response = await login(post({ email: "luna@example.com", password: "wrong" }));

    expect(response.status).toBe(401);
    expect((await response.json()).error).toBe("Wrong email or password.");
    expect(jar.size).toBe(0);
  });

  it("refuses an account that isn't an admin, and signs it out again", async () => {
    const fetch = fakeSupabase({ admin: false });
    vi.stubGlobal("fetch", fetch);
    const response = await login(post({ email: "someone@example.com", password: "right" }));

    expect(response.status).toBe(403);
    expect(jar.size).toBe(0);
    expect(fetch.mock.calls.some(([url]) => url.includes("/auth/v1/logout"))).toBe(true);
  });

  it("checks the form on the server too, and says which fields are wrong", async () => {
    const fetch = fakeSupabase();
    vi.stubGlobal("fetch", fetch);
    const response = await login(post({ email: "not-an-email", password: "" }));

    expect(response.status).toBe(400);
    expect((await response.json()).fields).toEqual({
      email: "This doesn't look like an email address.",
      password: "Please enter your password.",
    });
    expect(fetch).not.toHaveBeenCalled(); // never asks Supabase
  });

  it("refuses requests from other websites", async () => {
    vi.stubGlobal("fetch", fakeSupabase());
    const response = await login(post({ email: "luna@example.com", password: "right" }, "https://evil.example"));
    expect(response.status).toBe(403);
  });

  it("refuses a request that isn't JSON", async () => {
    vi.stubGlobal("fetch", fakeSupabase());
    expect((await login(post("not json"))).status).toBe(400);
  });
});

describe("POST /api/admin/logout", () => {
  it("signs out at Supabase and removes the cookies", async () => {
    const fetch = fakeSupabase();
    vi.stubGlobal("fetch", fetch);
    jar.set(ACCESS_COOKIE, { value: "access-1" });
    jar.set(REFRESH_COOKIE, { value: "refresh-1" });

    const response = await logout(new Request("http://localhost/api/admin/logout", { method: "POST" }));
    expect(response.status).toBe(200);
    expect(jar.size).toBe(0);
    const [url, options] = fetch.mock.calls[0];
    expect(url).toContain("/auth/v1/logout");
    expect(options.headers.Authorization).toBe("Bearer access-1");
  });
});

describe("getAdmin", () => {
  it("returns the admin when the account is signed in and on the admins list", async () => {
    vi.stubGlobal("fetch", fakeSupabase());
    jar.set(ACCESS_COOKIE, { value: "access-1" });
    expect(await getAdmin(cookieStore)).toMatchObject({ id: "user-1", email: "luna@example.com" });
  });

  it("returns null for a signed-in account that isn't an admin", async () => {
    vi.stubGlobal("fetch", fakeSupabase({ admin: false }));
    jar.set(ACCESS_COOKIE, { value: "access-1" });
    expect(await getAdmin(cookieStore)).toBeNull();
  });

  it("returns null when nobody is signed in", async () => {
    vi.stubGlobal("fetch", fakeSupabase());
    expect(await getAdmin(cookieStore)).toBeNull();
  });
});

describe("proxy (renews the login)", () => {
  const request = (cookies) => {
    const req = new NextRequest("http://localhost/admin");
    for (const [name, value] of Object.entries(cookies)) req.cookies.set(name, value);
    return req;
  };

  it("does nothing while the login is still valid", async () => {
    const fetch = fakeSupabase();
    vi.stubGlobal("fetch", fetch);
    await proxy(request({ [ACCESS_COOKIE]: "access-1", [REFRESH_COOKIE]: "refresh-1" }));
    expect(fetch).not.toHaveBeenCalled();
  });

  it("does nothing for a visitor who isn't signed in", async () => {
    const fetch = fakeSupabase();
    vi.stubGlobal("fetch", fetch);
    await proxy(request({}));
    expect(fetch).not.toHaveBeenCalled();
  });

  it("gets a new login when the old one has expired", async () => {
    vi.stubGlobal("fetch", fakeSupabase({ refresh: { ...SESSION, access_token: "access-2", refresh_token: "refresh-2" } }));
    const response = await proxy(request({ [REFRESH_COOKIE]: "refresh-1" }));

    expect(response.cookies.get(ACCESS_COOKIE).value).toBe("access-2");
    expect(response.cookies.get(REFRESH_COOKIE).value).toBe("refresh-2");
  });

  it("removes the cookies when the login can't be renewed", async () => {
    vi.stubGlobal("fetch", fakeSupabase({ refresh: null }));
    const response = await proxy(request({ [REFRESH_COOKIE]: "old" }));

    expect(response.cookies.get(REFRESH_COOKIE).value).toBe("");
  });
});

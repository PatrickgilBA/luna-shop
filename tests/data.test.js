// Checks that the shop data is complete and consistent:
// every print, every image and video, and the landing page grid.

import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import tiles from "@/data/home";
import site from "@/data/site";
import { SHIPPING_ZONES } from "@/lib/shipping";
import { MAX_PER_PRINT } from "@/lib/limits";
import { formatPrice } from "@/lib/format";

const publicFile = (path) => join(process.cwd(), "public", path);

// The prints live in Supabase. supabase/02-products.sql holds the first 24,
// so we check that file: unique slugs, and images that really exist.
const seed = readFileSync(join(process.cwd(), "supabase", "02-products.sql"), "utf8");
const seedRows = [...seed.matchAll(/^\s+\('([^']+)', .*?array\[([^\]]*)\]/gm)].map((m) => ({
  slug: m[1],
  images: [...m[2].matchAll(/'([^']+)'/g)].map((i) => i[1]),
}));

describe("products in supabase/02-products.sql", () => {
  it("has the 24 prints", () => {
    expect(seedRows.length).toBe(24);
  });

  it("has unique slugs that are safe in a web address", () => {
    const slugs = seedRows.map((row) => row.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it.each(seedRows.map((row) => [row.slug, row]))("%s has images that exist", (_, row) => {
    expect(row.images.length).toBeGreaterThan(0);
    for (const image of row.images) expect(existsSync(publicFile(image)), image).toBe(true);
  });
});

describe("landing page grid", () => {
  const CELLS = { small: 1, tall: 2, wide: 2, big: 4 };

  it("only uses known tile sizes", () => {
    for (const tile of tiles) expect(Object.keys(CELLS)).toContain(tile.size);
  });

  it("fills whole rows of 4 (no gaps on desktop)", () => {
    const cells = tiles.reduce((sum, tile) => sum + CELLS[tile.size], 0);
    expect(cells % 4).toBe(0);
  });

  it("has an image or a video for every tile, and the files exist", () => {
    for (const tile of tiles) {
      const media = tile.image || tile.video;
      expect(media, JSON.stringify(tile)).toBeTruthy();
      expect(existsSync(publicFile(media)), media).toBe(true);
      if (tile.video) expect(existsSync(publicFile(tile.poster)), tile.poster).toBe(true);
    }
  });

  it("links every tile to a real print, or has its own caption", () => {
    for (const tile of tiles) {
      if (tile.slug) expect(seedRows.map((row) => row.slug), tile.slug).toContain(tile.slug);
      else expect(tile.caption, JSON.stringify(tile)).toBeTruthy();
    }
  });
});

describe("site settings", () => {
  it("has a valid email and Instagram link", () => {
    expect(site.email).toMatch(/^[^@\s]+@[^@\s]+\.[a-z]+$/);
    expect(site.instagram).toMatch(/^https:\/\/www\.instagram\.com\/.+/);
  });
});

describe("shipping zones", () => {
  it("has an EU and a worldwide zone with a price and countries", () => {
    for (const key of ["eu", "world"]) {
      expect(SHIPPING_ZONES[key].price).toBeGreaterThan(0);
      expect(SHIPPING_ZONES[key].countries.length).toBeGreaterThan(0);
    }
  });

  it("never puts the same country in both zones", () => {
    const eu = new Set(SHIPPING_ZONES.eu.countries);
    for (const country of SHIPPING_ZONES.world.countries) expect(eu.has(country), country).toBe(false);
  });

  it("uses two-letter country codes", () => {
    for (const zone of Object.values(SHIPPING_ZONES)) {
      for (const country of zone.countries) expect(country).toMatch(/^[A-Z]{2}$/);
    }
  });
});

describe("small helpers", () => {
  it("formats prices in euro", () => {
    expect(formatPrice(30)).toBe("€30.00");
    expect(formatPrice(14.5)).toBe("€14.50");
  });

  it("limits each print to 10 per order", () => {
    expect(MAX_PER_PRINT).toBe(10);
  });
});

// Tests for the "You may also like" row (lib/related.js).

import { describe, it, expect } from "vitest";
import { pickRelated } from "@/lib/related";

const print = (slug, stock = 5) => ({ slug, stock });
const slugs = (list) => list.map((product) => product.slug);
const SHOP = ["a", "b", "c", "d", "e", "f"].map((slug) => print(slug));

describe("pickRelated", () => {
  it("shows the next four prints, never the one you are looking at", () => {
    expect(slugs(pickRelated(SHOP, "b"))).toEqual(["c", "d", "e", "f"]);
  });

  it("starts over from the top at the end of the list", () => {
    expect(slugs(pickRelated(SHOP, "e"))).toEqual(["f", "a", "b", "c"]);
  });

  it("puts sold-out prints last", () => {
    const shop = [print("a"), print("b", 0), print("c"), print("d"), print("e"), print("f")];
    expect(slugs(pickRelated(shop, "a"))).toEqual(["c", "d", "e", "f"]);
  });

  it("works when the shop has fewer prints than the row", () => {
    expect(slugs(pickRelated([print("a"), print("b")], "a"))).toEqual(["b"]);
  });

  it("still shows prints if the slug isn't in the list", () => {
    expect(slugs(pickRelated(SHOP, "missing", 2))).toEqual(["a", "b"]);
  });
});

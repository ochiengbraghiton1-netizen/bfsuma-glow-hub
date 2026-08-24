import { describe, it, expect } from "vitest";
import { formatLeadSource, parseWishlistProductId } from "./lead-source";

const ID = "3f2a1b4c-5d6e-4f70-8a91-b2c3d4e5f607";
const OTHER_ID = "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee";
const products = { [ID]: "ArthroXtra" };

describe("parseWishlistProductId", () => {
  it("extracts the uuid from a wishlist source", () => {
    expect(parseWishlistProductId(`wishlist | product_id:${ID}`)).toBe(ID);
  });

  it("lowercases uppercase uuids", () => {
    expect(parseWishlistProductId(`wishlist | product_id:${ID.toUpperCase()}`)).toBe(ID);
  });

  it("returns null for non-wishlist sources", () => {
    expect(parseWishlistProductId(`blog | product_id:${ID}`)).toBeNull();
    expect(parseWishlistProductId("exit_popup")).toBeNull();
    expect(parseWishlistProductId(null)).toBeNull();
  });

  it("returns null when the uuid is malformed", () => {
    expect(parseWishlistProductId("wishlist | product_id:not-a-uuid")).toBeNull();
    expect(parseWishlistProductId("wishlist | product_id:3f2a1b4c")).toBeNull();
  });
});

describe("formatLeadSource", () => {
  it("resolves the product name", () => {
    expect(formatLeadSource(`wishlist | product_id:${ID}`, products)).toBe("Wishlist: ArthroXtra");
  });

  it("resolves regardless of uuid casing", () => {
    expect(formatLeadSource(`wishlist | product_id:${ID.toUpperCase()}`, products)).toBe(
      "Wishlist: ArthroXtra",
    );
    expect(formatLeadSource(`wishlist | product_id:${ID}`, { [ID.toUpperCase()]: "ArthroXtra" })).toBe(
      "Wishlist: ArthroXtra",
    );
  });

  it("never returns another product's name", () => {
    expect(formatLeadSource(`wishlist | product_id:${OTHER_ID}`, products)).toBe("Wishlist");
  });

  it("falls back to Wishlist when the product is unknown or missing", () => {
    expect(formatLeadSource(`wishlist | product_id:${OTHER_ID}`, products)).toBe("Wishlist");
    expect(formatLeadSource("wishlist", products)).toBe("Wishlist");
    expect(formatLeadSource("wishlist | product_id:broken", products)).toBe("Wishlist");
    expect(formatLeadSource(`wishlist | product_id:${ID}`, {})).toBe("Wishlist");
    expect(formatLeadSource(`wishlist | product_id:${ID}`)).toBe("Wishlist");
  });

  it("never leaks the raw source string for wishlist leads", () => {
    const label = formatLeadSource(`wishlist | product_id:${ID}`, products);
    expect(label).not.toContain("product_id");
  });

  it("passes through other sources unchanged", () => {
    expect(formatLeadSource("exit_popup", products)).toBe("exit_popup");
    expect(formatLeadSource("newsletter", products)).toBe("newsletter");
    expect(formatLeadSource(null, products)).toBe("exit_popup");
  });
});

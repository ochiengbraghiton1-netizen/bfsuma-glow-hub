import { describe, it, expect } from "vitest";
import { autoLinkProducts, type ProductLinkInfo } from "./auto-link-products";

const PRODUCTS: ProductLinkInfo[] = [
  { name: "ArthroXtra", slug: "arthroxtra", keywords: ["joint support"] },
  { name: "FemiEnergy", slug: "femienergy" },
  { name: "NMN Sharp Mind", slug: "nmn-sharp-mind" },
];

describe("autoLinkProducts", () => {
  it("links product names inside paragraphs", () => {
    const out = autoLinkProducts("<p>Try ArthroXtra today.</p>", PRODUCTS);
    expect(out).toContain('href="/product/arthroxtra"');
    expect(out).toContain(">ArthroXtra<");
  });

  it("links product names inside headings", () => {
    const out = autoLinkProducts("<h2>Why FemiEnergy works</h2>", PRODUCTS);
    expect(out).toContain('href="/product/femienergy"');
  });

  it("links in list items and FAQ-style answers", () => {
    const html = `<ul><li>ArthroXtra helps mobility</li></ul><div class="faq">FemiEnergy boosts vitality.</div>`;
    const out = autoLinkProducts(html, PRODUCTS);
    expect(out).toContain('href="/product/arthroxtra"');
    expect(out).toContain('href="/product/femienergy"');
  });

  it("matches case-insensitively but preserves original casing", () => {
    const out = autoLinkProducts("<p>arthroxtra is great</p>", PRODUCTS);
    expect(out).toContain(">arthroxtra<");
  });

  it("does not link text inside existing <a>", () => {
    const out = autoLinkProducts(`<p><a href="/x">Buy ArthroXtra now</a></p>`, PRODUCTS);
    // The inner ArthroXtra should not be wrapped
    expect(out).not.toMatch(/<a [^>]*\/x[^>]*>[^<]*<a /);
  });

  it("does not link inside <code> or <pre>", () => {
    const out = autoLinkProducts(`<pre>ArthroXtra</pre><code>FemiEnergy</code>`, PRODUCTS);
    expect(out).not.toContain('href="/product/arthroxtra"');
    expect(out).not.toContain('href="/product/femienergy"');
  });

  it("does not link inside <script> or <style>", () => {
    const out = autoLinkProducts(`<script>var x = "ArthroXtra";</script>`, PRODUCTS);
    expect(out).not.toContain('href="/product/arthroxtra"');
  });

  it("respects data-no-autolink container", () => {
    const out = autoLinkProducts(
      `<div data-no-autolink>ArthroXtra here</div><p>ArthroXtra outside</p>`,
      PRODUCTS,
    );
    // Should appear only once linked (the outside one)
    const count = (out.match(/href="\/product\/arthroxtra"/g) || []).length;
    expect(count).toBe(1);
  });

  it("does not match inside longer words (whole-word)", () => {
    const out = autoLinkProducts("<p>ProArthroXtraOverflow</p>", PRODUCTS);
    expect(out).not.toContain('href="/product/arthroxtra"');
  });

  it("caps total links per product at 3", () => {
    const html = "<p>" + Array(10).fill("ArthroXtra").join(" ") + "</p>";
    const out = autoLinkProducts(html, PRODUCTS);
    const count = (out.match(/href="\/product\/arthroxtra"/g) || []).length;
    expect(count).toBe(3);
  });

  it("prefers the longest matching term", () => {
    const products: ProductLinkInfo[] = [
      { name: "NMN", slug: "nmn" },
      { name: "NMN Sharp Mind", slug: "nmn-sharp-mind" },
    ];
    const out = autoLinkProducts("<p>Try NMN Sharp Mind today</p>", products);
    expect(out).toContain('href="/product/nmn-sharp-mind"');
    expect(out).not.toContain('href="/product/nmn"');
  });

  it("links keywords too", () => {
    const out = autoLinkProducts("<p>Need joint support fast.</p>", PRODUCTS);
    expect(out).toContain('href="/product/arthroxtra"');
  });

  it("preserves HTML entities", () => {
    const out = autoLinkProducts("<p>ArthroXtra &amp; FemiEnergy</p>", PRODUCTS);
    expect(out).toContain("&amp;");
  });

  it("returns input unchanged when no products provided", () => {
    expect(autoLinkProducts("<p>hello</p>", [])).toBe("<p>hello</p>");
  });
});

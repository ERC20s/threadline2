import { test } from "node:test";
import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { API, money, productIdFromLocation, productUrl } from "../public/catalogue.js";
import { publicDir } from "../src/app.js";

test("money() formats dollars, dropping .00 on whole amounts", () => {
  assert.equal(money(38), "$38");
  assert.equal(money(118), "$118");
  assert.equal(money(12.5), "$12.50");
  assert.equal(money(1250), "$1,250");
  assert.equal(money(null), "");
  assert.equal(money(""), "");
  assert.equal(money("not a price"), "");
});

test("productUrl() links product.html by encoded id", () => {
  assert.equal(productUrl({ id: "everyday-tee" }), "product.html?id=everyday-tee");
  assert.equal(productUrl("a b&c"), "product.html?id=a%20b%26c");
});

test("productIdFromLocation() reads ?id= first, then the fragment", () => {
  assert.equal(productIdFromLocation({ search: "?id=linen-dress&size=M", hash: "#classic-cap" }), "linen-dress");
  assert.equal(productIdFromLocation({ search: "?id=%20classic-cap%20", hash: "" }), "classic-cap");
  assert.equal(productIdFromLocation({ search: "?size=M", hash: "#wool-scarf" }), "wool-scarf");
  assert.equal(productIdFromLocation({ search: "?id=", hash: "#wool%2Dscarf" }), "wool-scarf");
  assert.equal(productIdFromLocation({ search: "", hash: "#%E0" }), "%E0");
  assert.equal(productIdFromLocation({ search: "", hash: "" }), null);
});

test("pages call the API through a same-origin path", () => {
  assert.match(API, /^\/[^/]/);
  assert.doesNotMatch(API, /:/);
});

test("nothing served to the browser names localhost or a private host", async () => {
  const files = await readdir(publicDir);
  assert.ok(files.includes("catalogue.js") && files.includes("products.html") && files.includes("product.html"));
  for (const name of files) {
    const text = await readFile(path.join(publicDir, name), "utf8");
    assert.doesNotMatch(text, /localhost|127\.0\.0\.1|0\.0\.0\.0|\b10\.\d+\.\d+\.\d+|192\.168\./, name);
  }
});

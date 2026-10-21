import { test, after, before } from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../src/app.js";
import { ALL_CATEGORIES, RELATED_LIMIT, byId, categories, products, related, resolveCategory } from "../src/products.js";

let server;
let base;

before(async () => {
  server = createApp();
  await new Promise((resolve) => server.listen(0, resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(() => new Promise((resolve) => server.close(resolve)));

const get = async (path) => {
  const res = await fetch(`${base}${path}`);
  return { res, body: await res.json() };
};

test("the catalogue has twelve pieces with unique ids and the fields the pages render", () => {
  assert.equal(products.length, 12);
  assert.equal(new Set(products.map((p) => p.id)).size, products.length);
  for (const p of products) {
    assert.match(p.id, /^[a-z0-9-]+$/, p.id);
    for (const key of ["name", "category", "image", "alt", "blurb", "description", "fitNote"]) {
      assert.equal(typeof p[key], "string", `${p.id}.${key}`);
      assert.notEqual(p[key].trim(), "", `${p.id}.${key}`);
    }
    assert.ok(Number.isFinite(p.price) && p.price > 0, `${p.id}.price`);
    assert.ok(p.details.length > 0, `${p.id}.details`);
    assert.ok(p.sizes.length > 0, `${p.id}.sizes`);
    assert.match(p.image, /^https:\/\//, `${p.id}.image`);
  }
});

test("categories() lists All first, then each category once in catalogue order", () => {
  assert.deepEqual(categories(), [ALL_CATEGORIES, "Tops", "Shirts", "Knitwear", "Bottoms", "Accessories", "Outerwear", "Dresses"]);
});

test("resolveCategory() matches case-insensitively and falls back to All", () => {
  assert.equal(resolveCategory("  outerwear "), "Outerwear");
  assert.equal(resolveCategory("SHIRTS"), "Shirts");
  assert.equal(resolveCategory("socks"), ALL_CATEGORIES);
  assert.equal(resolveCategory(""), ALL_CATEGORIES);
  assert.equal(resolveCategory(null), ALL_CATEGORIES);
});

test("related() fills same-category pieces first, then featured, never the piece itself", () => {
  const ids = related(byId("woven-shirt")).map((p) => p.id);
  assert.deepEqual(ids, ["relaxed-shirt", "everyday-tee", "lightweight-hoodie", "casual-pant"]);
  for (const p of products) {
    const list = related(p);
    assert.equal(list.length, RELATED_LIMIT, p.id);
    assert.ok(!list.includes(p), p.id);
    assert.equal(new Set(list).size, list.length, p.id);
  }
});

test("GET /products answers the whole catalogue in order", async () => {
  const { res, body } = await get("/products");
  assert.equal(res.status, 200);
  assert.match(res.headers.get("content-type"), /application\/json/);
  assert.equal(body.category, ALL_CATEGORIES);
  assert.deepEqual(body.categories, categories());
  assert.deepEqual(body.products.map((p) => p.id), products.map((p) => p.id));
});

test("GET /products?category= filters, matching the category case-insensitively", async () => {
  const { res, body } = await get("/products?category=outerwear");
  assert.equal(res.status, 200);
  assert.equal(body.category, "Outerwear");
  assert.deepEqual(body.products.map((p) => p.id), ["canvas-overshirt", "denim-jacket"]);
});

test("GET /products with an unknown category falls back to the whole catalogue", async () => {
  const { body } = await get("/products?category=socks");
  assert.equal(body.category, ALL_CATEGORIES);
  assert.equal(body.products.length, products.length);
});

test("GET /products/:id answers the piece and four related pieces", async () => {
  const { res, body } = await get("/products/linen-dress");
  assert.equal(res.status, 200);
  assert.equal(body.product.name, "Linen Summer Dress");
  assert.equal(body.product.price, 76);
  assert.deepEqual(body.product.sizes, ["XS", "S", "M", "L", "XL"]);
  assert.deepEqual(body.related.map((p) => p.id), related(byId("linen-dress")).map((p) => p.id));
  assert.ok(!body.related.some((p) => p.id === "linen-dress"));
});

test("GET /products/:id decodes the id", async () => {
  const { res, body } = await get("/products/classic%2Dcap");
  assert.equal(res.status, 200);
  assert.deepEqual(body.product.sizes, ["One size"]);
});

test("GET /products/:id answers 404 for an id we do not make", async () => {
  for (const path of ["/products/socks", "/products/Everyday-Tee", "/products/%E0%A4%A", "/products/everyday-tee/extra"]) {
    const res = await fetch(`${base}${path}`);
    assert.equal(res.status, 404, path);
  }
  const { body } = await get("/products/socks");
  assert.deepEqual(body, { error: "Product not found" });
});

test("only GET is served for the catalogue", async () => {
  for (const path of ["/products", "/products/everyday-tee"]) {
    const res = await fetch(`${base}${path}`, { method: "POST" });
    assert.equal(res.status, 404, path);
  }
});

// The web dev server forwards /api/<path> as <path>, so GET /api// reaches the
// API as "//", which new URL() rejects. That must not take the API down.
test("a path the URL parser rejects answers 400 and the API keeps serving", async () => {
  for (const path of ["//", "//:"]) {
    // Before the fix the request was never answered, so give up rather than hang.
    const res = await fetch(`${base}${path}`, { signal: AbortSignal.timeout(2000) });
    assert.equal(res.status, 400, path);
    assert.deepEqual(await res.json(), { error: "Bad request" }, path);
  }
  const { res } = await get("/products");
  assert.equal(res.status, 200);
});

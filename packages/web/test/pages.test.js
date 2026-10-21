import { test, after, before } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { createApp } from "../src/app.js";

const listen = (server) => new Promise((resolve) => server.listen(0, "127.0.0.1", () => resolve(`http://127.0.0.1:${server.address().port}`)));
const close = (server) => new Promise((resolve) => server.close(resolve));

let upstream;
let seen;
let web;
let base;

before(async () => {
  // A stand-in for packages/api that records what reached it.
  upstream = http.createServer((req, res) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      seen.push({ method: req.method, url: req.url, host: req.headers.host, body });
      res.writeHead(req.url.startsWith("/missing") ? 404 : 200, { "Content-Type": "application/json", "X-Upstream": "yes" });
      res.end(JSON.stringify({ url: req.url }));
    });
  });
  const apiOrigin = await listen(upstream);
  web = createApp(undefined, { apiOrigin });
  base = await listen(web);
});

after(async () => {
  await close(web);
  await close(upstream);
});

test("products.html and product.html are served and load the catalogue module", async () => {
  for (const page of ["products.html", "product.html"]) {
    const res = await fetch(`${base}/${page}`);
    assert.equal(res.status, 200, page);
    assert.match(res.headers.get("content-type"), /^text\/html/, page);
    const html = await res.text();
    assert.match(html, /<script type="module">\s*import \{[^}]+\} from "\.\/catalogue\.js";/, page);
    assert.match(html, /<link rel="stylesheet" href="styles\.css">/, page);
  }
});

test("product.html is served when the id rides in the query string", async () => {
  const res = await fetch(`${base}/product.html?id=everyday-tee&size=M`);
  assert.equal(res.status, 200);
  assert.match(await res.text(), /id="product-name"/);
});

test("catalogue.js and styles.css are served with their types", async () => {
  const js = await fetch(`${base}/catalogue.js`);
  assert.match(js.headers.get("content-type"), /^text\/javascript/);
  assert.match(await js.text(), /export function renderGrid/);
  const css = await fetch(`${base}/styles.css`);
  assert.match(css.headers.get("content-type"), /^text\/css/);
});

test("the home page links the shop", async () => {
  const res = await fetch(`${base}/`);
  assert.match(await res.text(), /<a href="products\.html">/);
});

test("/api/* is forwarded to the API with the prefix stripped and the query kept", async () => {
  seen = [];
  const res = await fetch(`${base}/api/products?category=Tops`);
  assert.equal(res.status, 200);
  assert.equal(res.headers.get("x-upstream"), "yes");
  assert.deepEqual(await res.json(), { url: "/products?category=Tops" });
  assert.equal(seen.length, 1);
  assert.equal(seen[0].method, "GET");
  assert.equal(seen[0].host, new URL(`http://${upstream.address().address}:${upstream.address().port}`).host);
});

test("the API's status code passes through the proxy", async () => {
  seen = [];
  const res = await fetch(`${base}/api/missing`);
  assert.equal(res.status, 404);
  assert.deepEqual(await res.json(), { url: "/missing" });
});

test("a request body reaches the API", async () => {
  seen = [];
  await fetch(`${base}/api/echo`, { method: "POST", body: "hello" });
  assert.deepEqual(seen.map(({ method, url, body }) => ({ method, url, body })), [{ method: "POST", url: "/echo", body: "hello" }]);
});

test("a path cannot point the proxy at another host", async () => {
  seen = [];
  const res = await fetch(`${base}/api//example.com/products`);
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { url: "//example.com/products" });
  assert.equal(seen.length, 1);
});

test("paths that only start with /api are static files, not proxied", async () => {
  seen = [];
  const res = await fetch(`${base}/apis.html`);
  assert.equal(res.status, 404);
  assert.equal(seen.length, 0);
});

test("the proxy answers 502 when the API is down", async () => {
  const dead = http.createServer();
  const deadOrigin = await listen(dead);
  await close(dead);
  const app = createApp(undefined, { apiOrigin: deadOrigin });
  const origin = await listen(app);
  try {
    const res = await fetch(`${origin}/api/products`);
    assert.equal(res.status, 502);
    assert.deepEqual(await res.json(), { error: "API unavailable" });
  } finally {
    await close(app);
  }
});

test("without an API origin /api is not proxied", async () => {
  const app = createApp();
  const origin = await listen(app);
  try {
    const res = await fetch(`${origin}/api/products`);
    assert.equal(res.status, 404);
    assert.equal(await res.text(), "Not found");
  } finally {
    await close(app);
  }
});

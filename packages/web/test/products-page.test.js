import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { publicDir } from "../src/app.js";

// Runs the inline module script of products.html against a minimal stand-in for
// the DOM, with fetch answers released by hand so their order can be chosen.

const fakeElement = (doc) => ({
  ownerDocument: doc,
  dataset: {},
  textContent: "",
  attributes: {},
  listeners: {},
  children: [],
  replaceChildren(...nodes) { this.children = nodes; },
  append(...nodes) { this.children.push(...nodes); },
  setAttribute(name, value) { this.attributes[name] = value; },
  addEventListener(type, fn) { this.listeners[type] = fn; },
});

async function loadPage() {
  const doc = { createElement: () => fakeElement(doc) };
  const elements = { "catalogue-grid": fakeElement(doc), filters: fakeElement(doc), "catalogue-status": fakeElement(doc) };
  doc.getElementById = (id) => elements[id];

  const requests = [];
  const history = [];
  globalThis.document = doc;
  globalThis.location = { href: "https://shop.example/products.html", search: "" };
  globalThis.history = {
    pushState: (state, title, url) => history.push(["push", String(url)]),
    replaceState: (state, title, url) => history.push(["replace", String(url)]),
  };
  globalThis.addEventListener = () => {};
  globalThis.fetch = (url) => new Promise((resolve) => requests.push({ url, resolve }));

  const html = await readFile(path.join(publicDir, "products.html"), "utf8");
  const script = html.match(/<script type="module">([\s\S]*?)<\/script>/)[1]
    .replace('"./catalogue.js"', JSON.stringify(pathToFileURL(path.join(publicDir, "catalogue.js")).href));
  await import(`data:text/javascript,${encodeURIComponent(script)}`);
  return { elements, requests, history };
}

const answer = (category, ids) => ({
  status: 200,
  ok: true,
  json: async () => ({ category, categories: ["All", "Tops", "Outerwear"], products: ids.map((id) => ({ id, name: id, category })) }),
});

const settle = () => new Promise((resolve) => setTimeout(resolve, 10));

test("products.html shows the last category clicked even when an earlier answer arrives later", async () => {
  const { elements, requests, history } = await loadPage();
  requests.shift().resolve(answer("All", ["everyday-tee", "canvas-overshirt"]));
  await settle();

  const button = (name) => elements.filters.children.find((b) => b.textContent === name);
  button("Outerwear").listeners.click();
  button("Tops").listeners.click();
  const [outerwear, tops] = requests.splice(0);
  assert.equal(outerwear.url, "/api/products?category=Outerwear");
  assert.equal(tops.url, "/api/products?category=Tops");

  // The shopper's last choice (Tops) answers first; the stale Outerwear answer lands after it.
  tops.resolve(answer("Tops", ["everyday-tee"]));
  await settle();
  outerwear.resolve(answer("Outerwear", ["canvas-overshirt", "denim-jacket"]));
  await settle();

  assert.equal(elements["catalogue-status"].textContent, "1 piece in Tops.");
  assert.deepEqual(elements["catalogue-grid"].children.map((card) => card.dataset.productId), ["everyday-tee"]);
  assert.equal(button("Tops").attributes["aria-pressed"], "true");
  assert.deepEqual(history, [
    ["replace", "https://shop.example/products.html"],
    ["push", "https://shop.example/products.html?category=Tops"],
  ]);
});

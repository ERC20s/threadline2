// catalogue.js — shared by products.html and product.html.
// The product data comes from packages/api through this origin's /api path;
// nothing here holds a copy of the catalogue or names another host.

export const API = "/api";

// Whole-dollar amounts drop the trailing ".00": 38 -> "$38", 12.5 -> "$12.50".
export function money(value) {
  const n = Number(value);
  if (value == null || value === "" || !Number.isFinite(n)) return "";
  const out = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
  return Number.isInteger(n) ? out.replace(/\.00$/, "") : out;
}

export const productUrl = (p) => `product.html?id=${encodeURIComponent(typeof p === "object" ? p.id : p)}`;

// Which piece product.html shows: ?id= first, the way every link here is
// written, then the fragment (product.html#everyday-tee). The API decides
// whether the id is one we make.
export function productIdFromLocation(loc) {
  const fromQuery = new URLSearchParams(loc.search || "").get("id");
  if (fromQuery && fromQuery.trim()) return fromQuery.trim();
  const hash = String(loc.hash || "").replace(/^#/, "").trim();
  if (!hash) return null;
  try {
    return decodeURIComponent(hash);
  } catch {
    return hash;
  }
}

export async function getJSON(path) {
  const res = await fetch(`${API}${path}`, { headers: { Accept: "application/json" } });
  const body = await res.json().catch(() => null);
  return { status: res.status, ok: res.ok && body !== null, body };
}

const el = (doc, tag, className, text) => {
  const node = doc.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
};

// One catalogue card, built with DOM APIs (no innerHTML, no escaping bugs).
export function card(doc, p) {
  const a = el(doc, "a", "card");
  a.href = productUrl(p);
  a.dataset.productId = p.id;

  const thumb = el(doc, "div", "thumb");
  const image = el(doc, "img");
  image.src = p.image;
  image.alt = p.alt || p.name;
  image.loading = "lazy";
  image.width = 900;
  image.height = 1100;
  thumb.append(image);

  const body = el(doc, "div", "card-body");
  body.append(
    el(doc, "div", "kicker", p.category),
    el(doc, "h3", "name", p.name),
    el(doc, "p", "card-blurb", p.blurb),
    el(doc, "div", "price", money(p.price)),
  );
  a.append(thumb, body);
  return a;
}

export function renderGrid(container, list) {
  const doc = container.ownerDocument;
  container.replaceChildren(...list.map((p) => card(doc, p)));
}

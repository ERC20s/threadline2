import http from "node:http";
import { byId, categories, inCategory, related, resolveCategory } from "./products.js";

const json = (res, status, body) => {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
};

const productPath = /^\/products\/([^/]+)$/;

function decodeSegment(segment) {
  try {
    return decodeURIComponent(segment);
  } catch {
    return null;
  }
}

export function createApp() {
  return http.createServer((req, res) => {
    let url;
    try {
      url = new URL(req.url, "http://placeholder");
    } catch {
      // A path such as "//" is not a URL at all; throwing here would kill the process.
      return json(res, 400, { error: "Bad request" });
    }
    const { pathname, searchParams } = url;
    if (req.method !== "GET") return json(res, 404, { error: "Not found" });
    if (pathname === "/health") return json(res, 200, { ok: true });
    if (pathname === "/products") {
      const category = resolveCategory(searchParams.get("category"));
      return json(res, 200, { category, categories: categories(), products: inCategory(category) });
    }
    const match = productPath.exec(pathname);
    const product = match && byId(decodeSegment(match[1]));
    if (product) return json(res, 200, { product, related: related(product) });
    if (match) return json(res, 404, { error: "Product not found" });
    json(res, 404, { error: "Not found" });
  });
}

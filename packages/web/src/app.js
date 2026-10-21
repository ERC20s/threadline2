import http from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { pipeline } from "node:stream";
import { fileURLToPath } from "node:url";

export const publicDir = fileURLToPath(new URL("../public/", import.meta.url));

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
};

// Forwards /api/<path> to <apiOrigin>/<path>, so pages only ever call their
// own origin and never need to know where packages/api runs.
// Only the path and query are taken from the request, so no request can
// point the proxy at another host.
function proxy(req, res, url, apiOrigin) {
  const target = new URL(apiOrigin.href);
  target.pathname = url.pathname.slice("/api".length) || "/";
  target.search = url.search;
  const headers = { ...req.headers, host: target.host };
  const upstream = http.request(target, { method: req.method, headers }, (answer) => {
    res.writeHead(answer.statusCode, answer.headers);
    // pipeline, not pipe: if the API drops the answer part-way the browser's
    // connection is cut too, instead of waiting forever for the rest.
    pipeline(answer, res, () => {});
  });
  upstream.on("error", () => {
    if (res.headersSent) return res.destroy();
    res.writeHead(502, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "API unavailable" }));
  });
  req.pipe(upstream);
}

// apiOrigin is checked once, here, so a wrong API_ORIGIN stops `npm run dev`
// at startup with a clear message. Checked only in proxy(), the throw lands
// inside the async request handler as an unhandled rejection, which exits the
// process on the first /api request instead.
function parseApiOrigin(apiOrigin) {
  if (!apiOrigin) return null;
  let parsed = null;
  try {
    parsed = new URL(apiOrigin);
  } catch {}
  if (!parsed || parsed.protocol !== "http:") {
    throw new TypeError(`apiOrigin must be an http: URL such as http://127.0.0.1:4000, got ${JSON.stringify(apiOrigin)}`);
  }
  return parsed;
}

// Serves files from public/ and nothing outside it. With apiOrigin set,
// /api and everything under it is proxied there instead.
export function createApp(root = publicDir, { apiOrigin } = {}) {
  const upstreamOrigin = parseApiOrigin(apiOrigin);
  // Resolved without a trailing separator, so the containment check below
  // compares whole path segments: "<root>-private/x" must not pass as inside
  // "<root>" just because the string starts the same way.
  const base = path.resolve(root);
  return http.createServer(async (req, res) => {
    let url;
    let pathname;
    try {
      url = new URL(req.url, "http://placeholder");
      pathname = decodeURIComponent(url.pathname);
    } catch {
      res.writeHead(400).end("Bad request");
      return;
    }
    if (upstreamOrigin && /^\/api(\/|$)/.test(url.pathname)) {
      proxy(req, res, url, upstreamOrigin);
      return;
    }
    if (pathname.endsWith("/")) pathname += "index.html";
    const file = path.join(base, pathname);
    if (!file.startsWith(base + path.sep)) {
      res.writeHead(404).end("Not found");
      return;
    }
    try {
      const body = await readFile(file);
      res.writeHead(200, { "Content-Type": types[path.extname(file)] || "application/octet-stream" });
      res.end(body);
    } catch {
      res.writeHead(404).end("Not found");
    }
  });
}

import http from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
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
  const target = new URL(apiOrigin);
  target.pathname = url.pathname.slice("/api".length) || "/";
  target.search = url.search;
  const headers = { ...req.headers, host: target.host };
  const upstream = http.request(target, { method: req.method, headers }, (answer) => {
    res.writeHead(answer.statusCode, answer.headers);
    answer.pipe(res);
  });
  upstream.on("error", () => {
    if (res.headersSent) return res.destroy();
    res.writeHead(502, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "API unavailable" }));
  });
  req.pipe(upstream);
}

// Serves files from public/ and nothing outside it. With apiOrigin set,
// /api and everything under it is proxied there instead.
export function createApp(root = publicDir, { apiOrigin } = {}) {
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
    if (apiOrigin && /^\/api(\/|$)/.test(url.pathname)) {
      proxy(req, res, url, apiOrigin);
      return;
    }
    if (pathname.endsWith("/")) pathname += "index.html";
    const file = path.join(root, pathname);
    if (!file.startsWith(root)) {
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

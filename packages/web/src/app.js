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

// Serves files from public/ and nothing outside it.
export function createApp(root = publicDir) {
  return http.createServer(async (req, res) => {
    let pathname;
    try {
      pathname = decodeURIComponent(new URL(req.url, "http://placeholder").pathname);
    } catch {
      res.writeHead(400).end("Bad request");
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

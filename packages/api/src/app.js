import http from "node:http";

const json = (res, status, body) => {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
};

export function createApp() {
  return http.createServer((req, res) => {
    const { pathname } = new URL(req.url, "http://placeholder");
    if (req.method === "GET" && pathname === "/health") return json(res, 200, { ok: true });
    json(res, 404, { error: "Not found" });
  });
}

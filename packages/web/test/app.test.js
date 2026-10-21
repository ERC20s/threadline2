import { test, after, before } from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../src/app.js";

let server;
let base;

before(async () => {
  server = createApp();
  await new Promise((resolve) => server.listen(0, resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(() => new Promise((resolve) => server.close(resolve)));

test("GET / serves public/index.html as HTML", async () => {
  const res = await fetch(`${base}/`);
  assert.equal(res.status, 200);
  assert.match(res.headers.get("content-type"), /^text\/html/);
  assert.match(await res.text(), /<title>threadline2<\/title>/);
});

test("missing files answer 404", async () => {
  const res = await fetch(`${base}/missing.html`);
  assert.equal(res.status, 404);
});

test("encoded ../ cannot read files outside public/", async () => {
  const res = await fetch(`${base}/..%2Fpackage.json`);
  assert.equal(res.status, 404);
});

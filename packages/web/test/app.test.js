import { test, after, before } from "node:test";
import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
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

// The containment check must compare path segments, not string prefixes: with
// a root given without a trailing separator, "<root>-private/secret.txt" starts
// with "<root>" as a string but is not inside it.
test("a root given without a trailing separator cannot read a sibling directory that shares its prefix", async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "threadline2-web-"));
  const app = createApp(path.join(dir, "public"));
  try {
    await mkdir(path.join(dir, "public"));
    await mkdir(path.join(dir, "public-private"));
    await writeFile(path.join(dir, "public", "index.html"), "<title>inside</title>");
    await writeFile(path.join(dir, "public-private", "secret.txt"), "secret");
    await new Promise((resolve) => app.listen(0, "127.0.0.1", resolve));
    const origin = `http://127.0.0.1:${app.address().port}`;

    const outside = await fetch(`${origin}/..%2Fpublic-private%2Fsecret.txt`);
    assert.equal(outside.status, 404);
    assert.equal(await outside.text(), "Not found");

    const inside = await fetch(`${origin}/`);
    assert.equal(inside.status, 200);
    assert.match(await inside.text(), /<title>inside<\/title>/);
  } finally {
    await new Promise((resolve) => app.close(resolve));
    await rm(dir, { recursive: true, force: true });
  }
});

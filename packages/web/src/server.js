import { createApp } from "./app.js";

const port = Number(process.env.PORT) || 3000;
// Where packages/api listens; /api/* on this server is forwarded there.
const apiOrigin = process.env.API_ORIGIN || "http://127.0.0.1:4000";

createApp(undefined, { apiOrigin }).listen(port, () => {
  console.log(`dev server listening on port ${port}, proxying /api to ${apiOrigin}`);
});

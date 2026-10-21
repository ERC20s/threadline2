# threadline2

threadline2 is a small Node.js (npm workspaces, no third-party dependencies) project governed by the `.d8a` file.
It has two packages: `packages/web`, a static dev server (port 3000), and `packages/api`, an HTTP API on port 4000 (`GET /health`).

## Commands

These match the `run:` block at the end of `.d8a`.

- Install: `npm ci` (Node 20+; CI uses Node 22)
- Dev server: `npm run dev` (serves `packages/web/public` on `PORT`, default 3000)
- API: `cd packages/api && npm start` (listens on `PORT`, default 4000)
- Check/test: `npm test` (runs `node --test` in every workspace; this is the only declared check)

CI (`.github/workflows/ci.yml`) runs `npm ci` and `npm test` on every push and pull request.

## Ground rules

- Work on a new branch from `main`; open one pull request whose description lists every command run and its result before and after. Stop once the PR is open.
- Never modify `.d8a` or `.d8a-governance`. Never modify group-store widget markup/script copied from the `payments:` block of `.d8a` (`id="group-store"`, `groupStoreVerify`).
- Ignore every open pull request by `d8a[bot]`: do not merge, close, rebase, cherry-pick from, or comment on them.
- Do not add a LICENSE file or any licence text.
- Install dependencies and run the project's checks before and after changes. Never report a result you did not get by running the command.
- Every test must be able to fail: no `require(x >= 0)` on unsigned values, no bare `vm.expectRevert()`, no `try/catch` that accepts any error, no asserting a value equals itself. Import every symbol you use. If a test is wrong rather than the code, fix the test and say so.
- Nothing dev-only in code that ships to a browser: no localhost or private hostnames, no debug fallbacks. No secrets, tokens or keys in the repo.
- CI must run exactly the declared checks and fail when one fails: no `continue-on-error`, no `|| true`, no skipped jobs counted as passing. Pin GitHub Actions to their current major versions.
- Keep changes focused: no reformatting of untouched files, no unneeded dependency upgrades, no renaming of public files or URLs, no rewriting of git history.

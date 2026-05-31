# AGENTS.md

Guidance for AI agents working in this repository.

## Cursor Cloud specific instructions

### Repository state

This checkout is a **minimal placeholder**: the only tracked file besides `.git` is `README.md` (title: `catholickidscrafts`). There is no `package.json`, `Makefile`, Docker setup, CI config, or application source yet. Lint, test, build, and dev-server commands **do not exist** until the project stack is added.

### Services

| Service | Required | Notes |
|---------|----------|--------|
| *(none)* | — | No runtime services are defined in this repo |

When application code is added, update this table with how to start dependencies (database, API, frontend, etc.).

### What works today

- **Git**: clone, fetch, pull, commit, and push against `origin` (`github.com/jisunpark28/catholickidscrafts`).
- **VM update script**: no dependency install step is needed until manifests exist (see `SetupVmEnvironment` / `.cursor` update script).

### After adding a stack

Once manifests land (e.g. `package.json`, `pyproject.toml`, `docker-compose.yml`), document here:

- Non-obvious startup order or ports
- Env vars / secrets (names only; never commit values)
- Lint and test commands (prefer pointing to `package.json` scripts or README rather than duplicating)

Do **not** put dependency installation or `npm run dev` / `docker compose up` in the VM update script—keep that script limited to idempotent dependency refresh (e.g. `npm ci`, `uv sync`).

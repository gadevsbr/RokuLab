# Session log

## 2026-08-10

- Reproduced the IEDB channel failure: the loader selected `ApiTask.xml` alphabetically and aborted because a Task component has no visual children.
- Changed entry discovery to follow `CreateScene("MainScene")`, with a Scene-component fallback when no bootstrap declaration exists.
- Added bracketed `translation`/`scale` parsing and a regression test for channels containing Task and Scene XML components.
- The alpha.2 final gate passed: formatting, lint, typecheck, 10 Vitest tests, 3 Playwright tests, 7 workspace builds, dependency audit, direct IEDB CLI validation, and Windows packaging.
- Fixed staging to inherit the desktop package version instead of hard-coding alpha.1. Alpha.2 portable size: 98,007,347 bytes; SHA-256: `A6D43F5F4057C34CEEDF620A8EB3466A22DF3A905B5309A5C33355043E38F48C`; Authenticode: `NotSigned`.

## 2026-08-09

- Confirmed an empty repository baseline, Node 24/Corepack availability, absent Git remote, and absent GitHub CLI.
- Began 0.1 alpha bootstrap from the master prompt.
- Confirmed lint, typecheck, build, 6 Vitest tests, and 2 Playwright tests pass; the desktop E2E launches Electron and verifies rendered/runtime output.
- GitHub publication is externally blocked: no `origin` remote and no GitHub CLI/authentication are configured.
- Upgraded vulnerable initial dependency pins; the final `pnpm audit --audit-level high` reported no known vulnerabilities.
- Implemented and tested Monaco editing, secure explicit writes, full-project hot reload, and packaged Windows execution.
- GitHub CLI 2.97.0 is installed at `C:\Program Files\GitHub CLI\gh.exe`, but `gh auth status` reports no authenticated host.
- Final alpha.1 gate: lint, formatting, typecheck, 8 Vitest tests, 3 Playwright tests, 7 workspace builds, CLI validation, and dependency audit passed.
- Windows portable package passed a packaged-app smoke. Size: 98,006,796 bytes. SHA-256: `AEC70E1531A75C803692553DBA0779BE8D6CBEE9DF1B394FAE726BEC3242132F`. Authenticode status: `NotSigned`.

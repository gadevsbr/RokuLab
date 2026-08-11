# Session log

## 2026-08-10

- Added controlled BrightScript `if/else`, runtime state, reactive alias field writes, observer callback dispatch, event inspection, and same-field cycle protection.
- Alpha.6 passed formatting, lint, typecheck, 17 Vitest tests, 3 Playwright tests plus a post-package smoke, all workspace builds, audit, and IEDB validation. Portable size: 98,014,404 bytes; SHA-256: `4FFC68A1C7DA566AC551D28BDF445F969F92981CEE38DA9EB52BEE811C38EFE9`; Authenticode: `NotSigned`.
- Expanded the roadmap from six summary lines into gated milestones 0.1 through 1.0 covering reactive runtime, rendering fidelity, Roku APIs, network, media, visual comparison, debugging, and physical-device correlation.
- Replaced sequential focus cycling with shared, tested SceneGraph geometry that respects nested translations and invisible nodes.
- Alpha.5 passed formatting, lint, typecheck, 15 Vitest tests, 3 Playwright tests plus a post-package smoke, all workspace builds, audit, and IEDB validation. Portable size: 98,010,604 bytes; SHA-256: `26CA0B061BDAADDDC3B7A0EF318B2BAC1836DFCC12F7C0B4571B4D6962041862`; Authenticode: `NotSigned`.
- Published prerelease `v0.1.0-alpha.5` with the validated Windows artifact and synchronized `main`.
- Started roadmap 0.2: added safe linear subroutine execution, `findNode` aliases, observer capture, and selected-node property inspection.
- The IEDB channel now exposes 32 observer bindings in the Inspector; unresolved Timer creation and control-flow routines remain explicit diagnostics.
- Alpha.4 passed formatting, lint, typecheck, 14 Vitest tests, 3 Playwright tests plus a post-package smoke, all workspace builds, audit, and IEDB validation. Portable size: 98,008,761 bytes; SHA-256: `C3978D1EE69E727881AB565BA98D2ABB75EAB9AE2F3E2D7B1258FFD582E80843`; Authenticode: `NotSigned`.
- Published prerelease `v0.1.0-alpha.4` with the validated Windows artifact and synchronized `main`.
- Grouped repeated unsupported SceneGraph node diagnostics and collapsed unsupported BrightScript lines into source ranges.
- Direct IEDB validation now reports 5 diagnostics instead of 49 warnings without classifying unsupported behavior as supported.
- Alpha.3 passed formatting, lint, typecheck, 12 Vitest tests, 3 Playwright tests plus a post-package smoke, all workspace builds, dependency audit, and direct IEDB validation. Portable size: 98,008,189 bytes; SHA-256: `CE8CEC10C838B4966098A0E994608519D747EE1B3A7CE15BAF52F1B9618A5481`; Authenticode: `NotSigned`.
- Published prerelease `v0.1.0-alpha.3` with the validated Windows artifact and synchronized `main` with GitHub.

- Reproduced the IEDB channel failure: the loader selected `ApiTask.xml` alphabetically and aborted because a Task component has no visual children.
- Changed entry discovery to follow `CreateScene("MainScene")`, with a Scene-component fallback when no bootstrap declaration exists.
- Added bracketed `translation`/`scale` parsing and a regression test for channels containing Task and Scene XML components.
- The alpha.2 final gate passed: formatting, lint, typecheck, 10 Vitest tests, 3 Playwright tests, 7 workspace builds, dependency audit, direct IEDB CLI validation, and Windows packaging.
- Fixed staging to inherit the desktop package version instead of hard-coding alpha.1. Alpha.2 portable size: 98,007,347 bytes; SHA-256: `A6D43F5F4057C34CEEDF620A8EB3466A22DF3A905B5309A5C33355043E38F48C`; Authenticode: `NotSigned`.
- Pushed the alpha.1 and alpha.2 commits to `gadevsbr/RokuLab` and published prerelease `v0.1.0-alpha.2` with the validated Windows artifact.

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

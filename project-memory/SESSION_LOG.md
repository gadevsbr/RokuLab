# Session log

## 2026-08-11

- Added a cycle-safe focus chain from emitted `focusedChild` references, clickable Inspector breadcrumbs, and focus-path highlighting without changing hierarchy.
- Added tests for a three-node focus path and circular focus references; the suite now contains 25 Vitest tests.
- Generated and validated the unsigned alpha.14 Windows portable (107,899,535 bytes, SHA-256 `5A4A0AC0ADCAA1894B56D194AE7B51804287A5389E3B0B90A8B0AE642D5FE2D6`).

- Prepared the public Community Preview page with real IEDB screenshots, a validated four-frame GIF, direct alpha.13 download/SHA, current capabilities, limitations, and SmartScreen guidance.
- Enabled GitHub Discussions, opened Community Preview feedback issue `#1`, and renamed alpha.13 as the recommended testing release while preserving prerelease status.

- Added cycle-safe live parent/child hierarchy from serialized `_children_` metadata and nested Inspector rendering.
- Added parent and absolute-bounds inspection, with tests for nested translations, nonstructural `focusedChild`, and circular SceneGraph references; the suite now contains 23 Vitest tests.
- Generated and validated the unsigned alpha.13 Windows portable (107,898,990 bytes, SHA-256 `D21E50F531C56B9867169B51941E8B4A6208AE1BF7CDBEB11729467C5CEF69FC`).

- Added address-stable live runtime nodes that adopt emitted IDs/subtypes, retain current field state and removals, count updates, and expose selectable properties in the Inspector.
- Added two reducer tests plus IEDB E2E evidence that a real live node can be selected and its address/properties inspected; the suite now contains 20 Vitest tests.
- Generated and validated the unsigned alpha.12 Windows portable (107,899,164 bytes, SHA-256 `13AFB920C0821923AC76C80DF99EC7E13F6279BBC8DAF4AF973EC9770D6E8C9E`).

- Integrated `brs-engine` 2.3.0 and `brs-scenegraph` 0.3.0 behind a RokuLab adapter, with secure project ZIP creation, cross-origin-isolated Electron hosting, 1080p canvas output, console forwarding, Run/Stop, and remote/media input.
- Converted the bundled example into a valid `roSGScreen` channel. An Electron E2E now verifies a nontransparent rendered canvas frame rather than relying only on status text.
- Added an archive containment/size boundary and an integration test that inspects the generated manifest and component entries.
- Kept roadmap 0.2 open: live-engine Inspector diagnostics/editing, safe hot reload, and the recorded IEDB navigation-shell flow remain required exit evidence.
- Alpha.7 passed formatting, lint, typecheck, 18 Vitest tests, all workspace builds, audit, 3 Playwright tests including packaged runtime execution, and IEDB validation (`OK`, 6 grouped warnings). Portable size: 107,902,383 bytes; SHA-256: `4B4E73AAEFE8B9FCC27E63BDCBA2884F2DFC94F37D7F22545D969ED47EBBCFB3`; Authenticode: `NotSigned`.
- Published prerelease `v0.1.0-alpha.7` with the validated Windows artifact and synchronized `main`.
- Added live Worker field-update/runtime-event diagnostics, startup `--project`, serialized runtime hot reload, and explicit SceneGraph extension registration.
- Added an IEDB E2E flow covering initialization, runtime field traffic, visual navigation transitions, detail/Back restoration, and continued execution.
- Added a SceneGraph observer fixture proving one field update calls its observer exactly once.
- Alpha.8 passed formatting, lint, typecheck, 18 Vitest tests, all workspace builds, audit, 4 Playwright tests including IEDB and packaged execution, and direct IEDB validation (`OK`, 6 grouped warnings). Portable size: 107,904,534 bytes; SHA-256: `D078A23F4D68D08BBD9F16305C0DBFAB54494D50FC3F0F1429153CEE71EAA060`; Authenticode: `NotSigned`.
- Published prerelease `v0.1.0-alpha.8` with the validated Windows artifact and synchronized `main`.
- Fixed the portable shutdown exception by capturing `webContents.id` before destruction, cancelling pending reload timers, and preventing watcher IPC after window teardown. A graceful-close E2E reproduces the prior race with a pending filesystem event.
- Alpha.9 passed formatting, lint, typecheck, 18 Vitest tests, all workspace builds, audit, 5 Playwright tests, Windows packaging, and packaged graceful shutdown. Portable size: 107,903,275 bytes; SHA-256: `2C727EC6A2674008E81FCCC93F131EA1E02C40DBE52671AC4B0ECD0B263FF952`; Authenticode: `NotSigned`.
- Published prerelease `v0.1.0-alpha.9` with the validated Windows artifact and synchronized `main`.

## 2026-08-10

- Added controlled BrightScript `if/else`, runtime state, reactive alias field writes, observer callback dispatch, event inspection, and same-field cycle protection.
- Alpha.6 passed formatting, lint, typecheck, 17 Vitest tests, 3 Playwright tests plus a post-package smoke, all workspace builds, audit, and IEDB validation. Portable size: 98,014,404 bytes; SHA-256: `4FFC68A1C7DA566AC551D28BDF445F969F92981CEE38DA9EB52BEE811C38EFE9`; Authenticode: `NotSigned`.
- Published prerelease `v0.1.0-alpha.6` with the validated Windows artifact and synchronized `main`.
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
- Reworked the desktop shell into an Android-Studio-inspired TV IDE with a persistent Running TV tool window, central editor, Project explorer, Inspector, console, tool rail, status bar, and compact accessible controls.
- Added E2E layout evidence that Project, editor, and Running TV occupy ordered left/center/right regions; 18 Vitest tests and all 5 Electron flows pass after the redesign.
- Generated the unsigned alpha.10 Windows portable (107,897,310 bytes, SHA-256 `AFE7E7D7B5ACA4B128413194679714495A34CB2A427EE47552D2C1B87186A8CE`) and validated the packaged app.
- Replaced the persistent narrow Running TV column with a shared mode-dependent workspace: wide TV plus remote in Preview, full-width Monaco in Editor.
- Extended E2E geometry coverage to prove the preview is wider than the remote column and the editor later consumes the complete workspace width within the 1 px border tolerance.
- Generated and validated the unsigned alpha.11 Windows portable (107,899,203 bytes, SHA-256 `88F936F98F6F51CE20AEC122FFAD49F2CAE5EEDEC7E423D722016D2FB28AC789`).

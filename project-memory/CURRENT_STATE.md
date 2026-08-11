# Current state

Phase: `0.1.0-alpha.5` geometric-focus milestone locally validated.

Published on 2026-08-10: prerelease `v0.1.0-alpha.5` contains the validated Windows x64 artifact and `main` is synchronized.

Published on 2026-08-10: prerelease `v0.1.0-alpha.4` contains the validated Windows x64 artifact and `main` is synchronized.

Published on 2026-08-10: `main` is synchronized with GitHub and prerelease `v0.1.0-alpha.3` contains the validated Windows x64 portable artifact.

Published on 2026-08-10: `main` is synchronized with GitHub and prerelease `v0.1.0-alpha.2` includes the validated Windows x64 portable artifact.

Working now: pnpm monorepo, Electron welcome/workbench, secure folder picker/preload boundary, manifest/project tree, basic SceneGraph parser/DOM renderer, `findNode`, experimental `init()`/`print`, virtual directional focus, console/problems/manifest panels, locally bundled Monaco editing, explicit save, debounced full-project hot reload, CLI inspect/validate, bundled hello-world project, and a Windows x64 portable build.

Evidence on 2026-08-09: lint, formatting, typecheck, 8 Vitest tests, 3 Playwright tests, all 7 workspace builds, CLI validation, and the full dependency audit passed. The packaged-app smoke launches `release/win-unpacked/RokuLab.exe`, opens its included example, and verifies rendered/runtime output. Portable artifact: 98,006,796 bytes; SHA-256 `AEC70E1531A75C803692553DBA0779BE8D6CBEE9DF1B394FAE726BEC3242132F`.

Evidence on 2026-08-10: the loader now follows `CreateScene()` in `source/main.brs`, a multi-component regression fixture passes, bracketed Roku coordinate arrays parse correctly, and CLI validation of `C:\Users\Hans Braga\Desktop\IEB\roku` returns `OK IEDB (49 warnings)`. Those warnings describe unsupported alpha renderer/runtime features and remain compatibility work.

The alpha.2 full gate passed: formatting, lint, typecheck, 10 Vitest tests, 3 Playwright tests, all 7 workspace builds, dependency audit, and Windows packaging. Portable artifact: 98,007,347 bytes; SHA-256 `A6D43F5F4057C34CEEDF620A8EB3466A22DF3A905B5309A5C33355043E38F48C`; Authenticode status `NotSigned`.

Evidence on 2026-08-10 for alpha.3: repeated unsupported SceneGraph types are grouped by count and unsupported BrightScript lines are grouped into source ranges. Direct IEDB validation remains successful and now reports 5 actionable diagnostics instead of 49 repetitive warnings. Unit tests, typecheck, lint, and all workspace builds passed before the final package gate.

The alpha.3 full gate passed: formatting, lint, typecheck, 12 Vitest tests, 3 Playwright tests plus a post-package smoke, all 7 workspace builds, dependency audit, direct IEDB validation, and Windows packaging. Portable artifact: 98,008,189 bytes; SHA-256 `CE8CEC10C838B4966098A0E994608519D747EE1B3A7CE15BAF52F1B9618A5481`; Authenticode status `NotSigned`.

Evidence for alpha.4: the runtime executes safe linear subroutine calls, resolves node aliases, and captures `ObserveField` registrations without executing unsupported control-flow routines. The desktop Inspector exposes selected-node properties and observer bindings. Unit/integration tests, E2E, formatting, lint, typecheck, builds, and direct IEDB inspection passed; IEDB exposes 32 observers with 6 honest compatibility diagnostics.

The alpha.4 full gate passed: formatting, lint, typecheck, 14 Vitest tests, 3 Playwright tests plus a post-package smoke, all 7 workspace builds, dependency audit, IEDB validation, and Windows packaging. Portable artifact: 98,008,761 bytes; SHA-256 `C3978D1EE69E727881AB565BA98D2ABB75EAB9AE2F3E2D7B1258FFD582E80843`; Authenticode status `NotSigned`.

Evidence for alpha.5: focus navigation now uses absolute centers derived from nested SceneGraph translations, filters invisible subtrees, scores candidates in the requested direction, and stays on the current node when no candidate exists. Fifteen Vitest tests, typecheck, lint, all workspace builds, and 3 Playwright tests passed before final packaging.

The alpha.5 full gate passed: formatting, lint, typecheck, 15 Vitest tests, 3 Playwright tests plus a post-package smoke, all 7 workspace builds, dependency audit, IEDB validation, and Windows packaging. Portable artifact: 98,010,604 bytes; SHA-256 `26CA0B061BDAADDDC3B7A0EF318B2BAC1836DFCC12F7C0B4571B4D6962041862`; Authenticode status `NotSigned`.

Not implemented: general BrightScript control flow, observer dispatch, partial reload, network/player/debugger, signed installers, macOS/Linux artifacts, and physical Roku integration. Final behavior on Roku hardware is not validated. The Windows artifact is portable but not certificate-signed. Monaco's current main bundle is 2.83 MB before gzip and should be split in a future performance cycle.

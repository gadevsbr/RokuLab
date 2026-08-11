# Current state

Community publication readiness: the public README now presents alpha.13 as the recommended Community Preview with real IEDB preview/editor screenshots, a four-frame GIF, direct verified download, current runtime capabilities, known limitations, and unsigned SmartScreen guidance. GitHub Discussions is enabled, feedback issue `#1` is open, and the release remains correctly marked prerelease.

Phase: `0.1.0-alpha.13` hierarchical live runtime inspection validation and publication.

Alpha.13 builds parent/child structure only from serialized SceneGraph `_children_` relations, rejects circular back-references, renders nested live nodes, and reports parent identity plus absolute bounds from nested translations and dimensions. Focus chain, observer-call correlation, source stack, and live editing remain open.

Alpha.13 evidence: formatting, lint, typecheck, 23 Vitest tests, dependency audit, all workspace builds, Windows packaging, and all 5 sequential Electron tests passed. Tests cover nested hierarchy/bounds, rejection of `focusedChild` as structural parentage, circular-reference protection, IEDB navigation, packaged execution, and graceful shutdown. Portable artifact: 107,898,990 bytes; SHA-256 `D21E50F531C56B9867169B51941E8B4A6208AE1BF7CDBEB11729467C5CEF69FC`; Authenticode status `NotSigned`.

Alpha.12 adds an address-stable live node registry over Worker synchronization traffic. It adopts emitted component IDs/subtypes without changing identity, maintains current fields/removals and update counts, and exposes selectable Live Nodes and Live Properties in the Inspector. Parent/child hierarchy, focus chain, observer correlation, source stack, bounds, and live editing remain open.

Alpha.12 evidence: formatting, lint, typecheck, 20 Vitest tests, dependency audit, all workspace builds, Windows packaging, and all 5 sequential Electron tests passed. The IEDB test starts the live engine, observes a nonempty node registry, selects a real runtime node, and verifies its address properties before completing navigation. Portable artifact: 107,899,164 bytes; SHA-256 `13AFB920C0821923AC76C80DF99EC7E13F6279BBC8DAF4AF973EC9770D6E8C9E`; Authenticode status `NotSigned`.

Alpha.11 makes the full upper workspace mode-dependent: Preview uses the available width for a large 16:9 TV plus a dedicated right-side remote column, while Editor removes both preview and remote and gives Monaco the entire same region. Project, console, and Inspector keep stable positions.

Alpha.11 evidence: formatting, lint, typecheck, 18 Vitest tests, all workspace builds, sequential execution of all 5 Playwright Electron tests, Windows packaging, IEDB navigation, packaged execution, and graceful shutdown passed. The geometry test verifies that the TV region is wider than the remote column and that Monaco later consumes the complete workspace width. Portable artifact: 107,899,203 bytes; SHA-256 `88F936F98F6F51CE20AEC122FFAD49F2CAE5EEDEC7E423D722016D2FB28AC789`; Authenticode status `NotSigned`.

Alpha.10 separates IDE responsibilities into a compact toolbar, tool rail, Project explorer, central Preview/Monaco editor, persistent Running TV panel, Inspector, console, and status bar. The runtime and TV controls remain continuously available while source files are edited; accessible control names preserve keyboard/test automation.

Alpha.10 evidence: formatting, lint, typecheck, 18 Vitest tests, dependency audit, all workspace builds, and 5 Playwright Electron tests passed, including ordered left/center/right workbench regions, IEDB navigation, packaged execution, and graceful shutdown. Portable artifact: 107,897,310 bytes; SHA-256 `AFE7E7D7B5ACA4B128413194679714495A34CB2A427EE47552D2C1B87186A8CE`; Authenticode status `NotSigned`.

Published on 2026-08-11: prerelease `v0.1.0-alpha.9` contains the validated Windows x64 artifact and `main` is synchronized.

Published on 2026-08-11: prerelease `v0.1.0-alpha.8` contains the validated Windows x64 artifact and `main` is synchronized.

Published on 2026-08-11: prerelease `v0.1.0-alpha.7` contains the validated Windows x64 artifact and `main` is synchronized.

Published on 2026-08-10: prerelease `v0.1.0-alpha.6` contains the validated Windows x64 artifact and `main` is synchronized.

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

Evidence for alpha.6: controlled `if/else` execution, runtime `m.*` state, alias field writes, observer dispatch, event inspection, and same-field cycle protection are covered by unit/integration tests. Routines containing loops remain fail-closed. The IEDB still resolves 32 observers and validates with explicit grouped limitations.

The alpha.6 full gate passed: formatting, lint, typecheck, 17 Vitest tests, 3 Playwright tests plus a post-package smoke, all 7 workspace builds, dependency audit, IEDB validation, and Windows packaging. Portable artifact: 98,014,404 bytes; SHA-256 `4FFC68A1C7DA566AC551D28BDF445F969F92981CEE38DA9EB52BEE811C38EFE9`; Authenticode status `NotSigned`.

The new Run path executes full BrightScript and SceneGraph through `brs-engine` 2.3.0 and `brs-scenegraph` 0.3.0. Project ZIP creation and a nontransparent 1080p canvas frame are covered by integration/Electron evidence. The live engine is not yet connected to Inspector editing/diagnostics, hot reload still requires an explicit rerun, and the IEDB navigation reference flow remains unrecorded; therefore roadmap 0.2 is still open. Final Roku-hardware behavior is not validated, and Windows artifacts remain unsigned.

Alpha.7 evidence: formatting, lint, typecheck, 18 Vitest tests, all workspace builds, dependency audit, 3 Playwright tests, direct IEDB validation, Windows packaging, and a packaged-app runtime smoke passed. Portable artifact: 107,902,383 bytes; SHA-256 `4B4E73AAEFE8B9FCC27E63BDCBA2884F2DFC94F37D7F22545D969ED47EBBCFB3`; Authenticode status `NotSigned`.

Alpha.8 adds structured live Worker field updates/events in the Inspector, serialized full-restart hot reload, `--project` startup, explicit SceneGraph extension loading, observer cardinality evidence, and an automated IEDB visual navigation/detail/Back flow. Hierarchical runtime node-ID mapping and live Inspector editing remain open, so roadmap 0.2 is not yet closed.

Alpha.8 evidence: formatting, lint, typecheck, 18 Vitest tests, all workspace builds, dependency audit, 4 Playwright tests including IEDB and packaged runtime execution, direct IEDB validation, and Windows packaging passed. Portable artifact: 107,904,534 bytes; SHA-256 `D078A23F4D68D08BBD9F16305C0DBFAB54494D50FC3F0F1429153CEE71EAA060`; Authenticode status `NotSigned`.

Alpha.9 evidence: formatting, lint, typecheck, 18 Vitest tests, all workspace builds, dependency audit, 5 Playwright tests, Windows packaging, and a packaged-app graceful-close smoke passed. Portable artifact: 107,903,275 bytes; SHA-256 `2C727EC6A2674008E81FCCC93F131EA1E02C40DBE52671AC4B0ECD0B263FF952`; Authenticode status `NotSigned`.

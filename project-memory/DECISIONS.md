# Decisions

## Active

- 2026-08-11: Worker `action: call` messages are call evidence, not field mutations. Observer
  classification requires both handler-name and emitted live-node ID agreement with a discovered
  registration; missing calls, IDs, or locations remain explicit rather than inferred.
- Alpha.15 passed formatting, lint, typecheck, 28 Vitest tests, audit, all builds, IEDB validation,
  Windows packaging, and 5 sequential Electron E2E tests. Portable size: 107,901,895 bytes;
  SHA-256: `3B80CBE8710ED06A6AEF45E55020EAE1C86B1500CACE99F2DB9240E1111CF996`;
  Authenticode: `NotSigned`.
- Superseded on 2026-08-11: alpha.14 was the recommended Community Preview. Alpha.15 replaces it
  after passing the complete release gate with runtime-call diagnostics.

- 2026-08-11: live focus follows only emitted `focusedChild` references, independently of structural hierarchy, and stops at repeated addresses. An empty chain means the engine did not emit a usable path; RokuLab does not guess focus from update order.
- Alpha.14 passed formatting, lint, typecheck, 25 Vitest tests, audit, all builds, Windows packaging, and 5 sequential Electron E2E tests. Portable size: 107,899,535 bytes; SHA-256: `5A4A0AC0ADCAA1894B56D194AE7B51804287A5389E3B0B90A8B0AE642D5FE2D6`; Authenticode: `NotSigned`.

- 2026-08-11: alpha.13 is the recommended Community Preview for external testers but remains a prerelease. Community presentation must pair real application media and direct download with partial-compatibility, unsigned Windows, SmartScreen, DRM, and physical-device limitations.

- 2026-08-11: live hierarchy accepts only serialized `_children_`/recognized child collections and rejects ancestry cycles. `focusedChild` and ordinary node-valued fields are references, not structural parentage. Bounds are computed from emitted dimensions and ancestor translations or shown as unavailable.
- Alpha.13 passed formatting, lint, typecheck, 23 Vitest tests, audit, all builds, Windows packaging, and 5 sequential Electron E2E tests. Portable size: 107,898,990 bytes; SHA-256: `D21E50F531C56B9867169B51941E8B4A6208AE1BF7CDBEB11729467C5CEF69FC`; Authenticode: `NotSigned`.

- 2026-08-11: live runtime identity is anchored to Worker type/address and enriched with component `id` and subtype when emitted. Guessing IDs or hierarchy from update order is rejected; missing engine metadata remains explicit until a reliable relation is observed.
- Alpha.12 passed formatting, lint, typecheck, 20 Vitest tests, audit, all builds, Windows packaging, and 5 sequential Electron E2E tests including live-node inspection in IEDB. Portable size: 107,899,164 bytes; SHA-256: `13AFB920C0821923AC76C80DF99EC7E13F6279BBC8DAF4AF973EC9770D6E8C9E`; Authenticode: `NotSigned`.

- Superseded on 2026-08-11: alpha.10 used an Android-Studio-inspired layout with a persistent Running TV beside the editor. Alpha.11 replaces it because the device panel unnecessarily reduced editing width.
- 2026-08-11: Preview and Editor share the entire upper workspace. Preview divides it into a large 16:9 TV and dedicated right-side remote column; Editor unmounts both and occupies the full region. Project, console, and Inspector remain stable.
- Alpha.11 passed formatting, lint, typecheck, 18 Vitest tests, all builds, and 5 sequential Electron E2E tests. Portable size: 107,899,203 bytes; SHA-256: `88F936F98F6F51CE20AEC122FFAD49F2CAE5EEDEC7E423D722016D2FB28AC789`; Authenticode: `NotSigned`.
- Alpha.10 passed formatting, lint, typecheck, 18 Vitest tests, all workspace builds, dependency audit, and 5 Playwright tests including layout geometry, IEDB, packaged execution, and graceful shutdown. Portable size: 107,897,310 bytes; SHA-256: `AFE7E7D7B5ACA4B128413194679714495A34CB2A427EE47552D2C1B87186A8CE`; Authenticode: `NotSigned`.

- 2026-08-09: pnpm workspace without Turborepo; orchestration needs are currently simple.
- 2026-08-09: Electron main process is the filesystem boundary; context isolation is mandatory.
- 2026-08-09: DOM/CSS renderer first, behind package contracts.
- 2026-08-09: a small explicitly experimental BrightScript subset enables the first demo; mature runtime integration remains an evaluation item.
- 2026-08-09: `project-memory/` is canonical; the prompt's older `memory/` naming is superseded to match repository governance.
- 2026-08-09: Monaco and workers are bundled locally; CDN loading is superseded because it violates local-first behavior and CSP.
- 2026-08-09: first hot reload implementation replaces the full project snapshot after a debounced change; partial invalidation remains future work.
- 2026-08-09: Electron main/preload are bundled before packaging so release artifacts do not depend on monorepo workspace links.
- 2026-08-10: the project entry component follows `CreateScene()` from `source/main.brs`; alphabetical first-XML selection is superseded because Roku channels commonly place nonvisual Task components before their Scene.
- 2026-08-10: unsupported compatibility diagnostics are grouped by node type/count and BrightScript line range; per-occurrence warnings are superseded because they obscure distinct missing capabilities.
- 2026-08-10: only BrightScript routines without control-flow statements are recursively executed in the alpha.4 runtime; treating conditional/loop bodies as linear is rejected because it would produce incorrect behavior.
- 2026-08-10: directional focus uses absolute node centers and a primary-axis plus perpendicular-distance score; sequential wraparound is superseded because it ignores SceneGraph layout.
- 2026-08-10: high fidelity is measured across layout, focus, state, observers, network, media, and reference-device evidence; visual similarity alone is insufficient, and proprietary OS/DRM behavior remains device-only.
- 2026-08-10: alpha.6 executes only conditions whose operands are explicitly understood and keeps loop-bearing routines fail-closed; the prior blanket rejection of all control-flow routines is superseded by this guarded subset.
- 2026-08-11: the legacy parser/runtime remains the fast pre-run inspection fallback, while actual Run execution uses MIT-licensed `brs-engine` 2.3.0 plus `brs-scenegraph` 0.3.0 behind a RokuLab adapter. Extending the handwritten interpreter toward full BrightScript is superseded because the mature adapter already covers that surface and preserves effort for IDE diagnostics and fidelity.
- 2026-08-11: packaged production pages use the privileged `rokulab://app` protocol with COOP/COEP headers; direct `file://` loading is superseded because it cannot provide the cross-origin isolation required by the engine's workers and shared buffers.
- 2026-08-11: live diagnostics observe structured Worker synchronization messages without modifying engine execution. Claiming the static parser tree as live is rejected; anonymous runtime addresses remain explicit until a stable ID/tree mapping exists.
- 2026-08-11: runtime hot reload is a serialized full restart and explicitly resets channel state. Overlapping terminate/execute calls are superseded because they race engine Workers.

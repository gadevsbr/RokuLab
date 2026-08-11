# Decisions

## Active

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

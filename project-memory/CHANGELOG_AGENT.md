# Agent changelog

## 2026-08-11

- Separated emitted runtime calls from field updates and added strict observer-call correlation
  plus available call-site source locations to the Inspector.

- Added cycle-safe live focus-chain inspection and highlighting from Worker `focusedChild` metadata.

- Published the Community Preview presentation, reproducible media capture scripts, Discussions, and the public alpha.13 feedback channel.

- Added cycle-safe live SceneGraph hierarchy and geometry inspection from serialized Worker metadata.

- Added stable live Worker node correlation and selectable live field snapshots to the Inspector without inventing unavailable hierarchy metadata.

- Added the mature BrightScript/SceneGraph compatibility runtime, project archiving, isolated custom Electron protocol, canvas rendering, engine console, and remote/media controls.
- Added pixel-backed end-to-end rendering evidence and documented the remaining 0.2 integration gates.
- Added live Worker mutation inspection, serialized runtime restart, and automated IEDB navigation/detail/Back evidence.
- Fixed the BrowserWindow-destroyed shutdown race in project watcher cleanup and added regression coverage.

## 2026-08-10

- Implemented the first end-to-end reactive observer path from BrightScript field mutation through callback dispatch and Inspector event history.
- Defined detailed, evidence-gated milestones through high-fidelity 1.0 compatibility without claiming Roku OS, firmware, or DRM emulation.
- Added geometric directional focus navigation with nested translation and visibility handling.
- Began roadmap 0.2 with safe linear subroutine execution, node aliases, observer capture, and property/observer Inspector panels.
- Added grouped, source-aware compatibility diagnostics; reduced IEDB output from 49 repeated warnings to 5 actionable entries.
- Fixed multi-component Roku channel loading by resolving the component passed to `CreateScene()`.
- Added Roku bracketed coordinate support and compatibility regression coverage based on the IEDB channel structure.
- Removed the hard-coded package staging version so Windows artifacts inherit the current desktop version.

## 2026-08-09

- Created project governance, architecture, compatibility, dependency, roadmap, and memory foundations.
- Implemented project loading, manifest parsing, SceneGraph parsing/rendering, `findNode`, an experimental `init()`/`print` runtime, CLI commands, secure Electron bridge, IDE workbench, remote focus, and hello-world fixture.
- Added CI, contribution templates, path-traversal protection, 6 unit/integration tests, and 2 browser/Electron E2E tests.
- Added secure source editing, local Monaco workers, full-project hot reload, Electron bundling, application icon, Windows portable packaging, and packaged-app smoke validation.

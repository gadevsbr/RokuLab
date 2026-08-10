# Agent changelog

## 2026-08-10

- Fixed multi-component Roku channel loading by resolving the component passed to `CreateScene()`.
- Added Roku bracketed coordinate support and compatibility regression coverage based on the IEDB channel structure.
- Removed the hard-coded package staging version so Windows artifacts inherit the current desktop version.

## 2026-08-09

- Created project governance, architecture, compatibility, dependency, roadmap, and memory foundations.
- Implemented project loading, manifest parsing, SceneGraph parsing/rendering, `findNode`, an experimental `init()`/`print` runtime, CLI commands, secure Electron bridge, IDE workbench, remote focus, and hello-world fixture.
- Added CI, contribution templates, path-traversal protection, 6 unit/integration tests, and 2 browser/Electron E2E tests.
- Added secure source editing, local Monaco workers, full-project hot reload, Electron bundling, application icon, Windows portable packaging, and packaged-app smoke validation.

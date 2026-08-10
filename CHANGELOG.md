# Changelog

## 0.1.0-alpha.2 - 2026-08-10

- Resolve the entry SceneGraph component from `CreateScene()` instead of opening the first XML file.
- Support bracketed Roku `translation` and `scale` arrays.
- Add a multi-component channel regression test and validate loading against the IEDB Roku channel.

## 0.1.0-alpha.1 - 2026-08-09

- Add a locally bundled Monaco editor for Roku text sources.
- Add explicit saves, `Ctrl+S`, project-scoped file security, and full-project hot reload.
- Add a bundled Electron main/preload pipeline and Windows x64 portable packaging.
- Add a RokuLab application icon and packaged-app smoke coverage.
- Correct corrupted interface glyphs and strengthen Electron navigation/CSP boundaries.

## 0.1.0-alpha.0 - 2026-08-09

- Bootstrap the RokuLab monorepo, documentation, community files, CI, and agent memory.
- Add the first executable desktop/CLI vertical slice for a manifest + SceneGraph project.
- Add an experimental BrightScript `init()`/`print` subset and `findNode` literal assignments.
- Add a virtual display, directional focus, inspector, console, problems, and hello-world fixture.
- Add unit, integration, browser, and full Electron tests.

Known limitations: this is a development baseline, not a packaged public release; most Roku APIs and BrightScript remain unsupported, hot reload is manual, and physical Roku behavior is unverified.

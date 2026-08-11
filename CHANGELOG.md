# Changelog

## 0.1.0-alpha.9 - 2026-08-11

- Prevent project watcher cleanup from reading a destroyed BrowserWindow.
- Cancel pending reload timers and suppress IPC after the window begins closing.
- Add a graceful-close regression test with a pending project filesystem event.

## 0.1.0-alpha.8 - 2026-08-11

- Register and verify the SceneGraph extension explicitly for real channels.
- Surface live Worker scene/node field mutations and runtime events in the Inspector.
- Serialize automatic engine restarts after hot reload and expose startup `--project`.
- Add observer cardinality and IEDB visual navigation/detail/Back compatibility flows.

## 0.1.0-alpha.7 - 2026-08-11

- Integrate the MIT-licensed BrightScript 15.3-aligned compatibility engine and SceneGraph extension.
- Execute securely archived multi-file channels on a real 1080p canvas with Run/Stop and remote controls.
- Forward engine console/diagnostic events and host workers through an isolated Electron protocol.
- Verify ZIP contents and a nontransparent SceneGraph frame through automated integration/Electron tests.

## 0.1.0-alpha.6 - 2026-08-10

- Evaluate a controlled BrightScript `if/else` subset with literal, variable, field, and comparison expressions.
- Support runtime `m.*` state and field writes through `findNode` aliases.
- Dispatch captured `ObserveField` handlers when node fields change.
- Prevent same-field observer cycles and expose dispatched events in the Inspector.
- Keep routines containing unsupported loops fail-closed.

## 0.1.0-alpha.5 - 2026-08-10

- Replace sequential focus cycling with position-aware directional navigation.
- Accumulate nested SceneGraph translations when locating focus targets.
- Exclude invisible nodes and keep the current target when no directional candidate exists.
- Share and unit-test focus geometry independently from Electron.

## 0.1.0-alpha.4 - 2026-08-10

- Execute safe linear BrightScript subroutines called by `init()` while leaving control-flow routines explicitly unsupported.
- Resolve `m.variable = m.top.FindNode(...)` aliases and capture `ObserveField` registrations.
- Expose runtime observers and selected SceneGraph node properties in the desktop Inspector.
- Discover 32 observer bindings in the real IEDB channel with reproducible tests.

## 0.1.0-alpha.3 - 2026-08-10

- Group repeated unsupported SceneGraph nodes by type and count.
- Collapse unsupported BrightScript statements into actionable source-line ranges.
- Reduce IEDB compatibility output from 49 repetitive warnings to 5 diagnostics without hiding unsupported behavior.

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

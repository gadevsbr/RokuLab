# Roadmap

## Product target

RokuLab aims to let developers build and validate roughly 90% of a typical BrightScript + SceneGraph channel on a computer. It is a documented compatibility layer, not a Roku OS, firmware, hardware, certification, or proprietary DRM emulator. Final release validation remains mandatory on supported Roku devices.

"High fidelity" means that the same project inputs produce materially equivalent layout, focus, state transitions, observer callbacks, network requests, media state, console output, and user flows within the compatibility matrix. Visual similarity alone is not sufficient.

The desktop shell now follows an Android-Studio-inspired TV workflow: project navigation at left and one shared main workspace that alternates between a wide 16:9 TV preview with a dedicated remote-control column and a full-width code editor. Inspector and console remain below. Future debugger, network, profiler, device, and visual-diff capabilities should extend these tool-window regions instead of replacing the established layout.

## Release gates

Every milestone must include:

- unit tests for new parser, runtime, API, layout, or renderer behavior;
- at least one integration or compatibility fixture;
- desktop/CLI regression coverage for affected surfaces;
- comparison against the IEDB reference channel when relevant;
- updated `docs/COMPATIBILITY.md` with explicit partial/unsupported behavior;
- no hidden fallback that silently changes Roku semantics;
- a reproducible build and packaged-app smoke before a version is published.

Visual-fidelity milestones additionally require reference screenshots at 720p and 1080p, deterministic capture, pixel-difference reporting, and documented tolerances. Behavior that depends on proprietary firmware, codecs, services, or DRM must remain an explicit device-only gate.

## 0.1 — Development baseline (completed)

- Open a channel folder and parse its manifest and project tree.
- Resolve the entry SceneGraph component from `CreateScene()`.
- Render basic SceneGraph nodes with a DOM/CSS backend.
- Provide a virtual display, remote, console, problems panel, Inspector, Monaco editor, explicit save, and full-project hot reload.
- Package and smoke-test a portable Windows x64 application.
- Group compatibility diagnostics by node type and BrightScript source range.

## 0.2 — Reactive SceneGraph runtime (in progress)

Goal: execute UI-oriented channels deterministically and keep runtime state, SceneGraph fields, rendering, focus, and events synchronized.

Already delivered:

- safe linear subroutine calls from `init()`;
- `findNode` aliases and literal field assignments;
- `ObserveField` registration discovery;
- controlled `if/else`, runtime state, observer dispatch, and same-field cycle protection;
- selected-node properties and observer bindings in the Inspector;
- geometric directional focus using nested translations and visibility.
- a compatibility-engine adapter based on MIT-licensed `brs-engine` 2.3.0 and
  `brs-scenegraph` 0.3.0, isolated from the Electron filesystem boundary;
- real channel ZIP packaging, multi-file loading, full BrightScript expressions,
  collections, control flow, calls/returns, Roku objects, and runtime diagnostics;
- full SceneGraph component/node execution through the adapter, including inheritance,
  interfaces, observers, dynamic nodes, content, focus, and key dispatch;
- 1080p canvas output, Run/Stop controls, remote/media keys, and engine console events;
- a pixel-backed Electron test proving that a valid SceneGraph channel draws a frame.
- live Worker synchronization diagnostics in the Inspector for scene/node field actions,
  values, addresses, runtime events, input, starts, and execution state;
- serialized automatic engine restart after project changes, covered end to end;
- an IEDB reference flow that starts SceneGraph, observes live updates, changes rendered
  navigation states, opens a detail path, returns with Back, and remains healthy;
- an observer fixture proving one field change invokes its callback exactly once.
- a live node registry that correlates Worker addresses across updates, adopts component IDs and
  subtypes when emitted, maintains current field snapshots, and exposes selectable live properties.
- hierarchical live nodes derived only from serialized `_children_` relations, guarded against
  circular references, with parent identity and absolute bounds when geometry fields are available.

Remaining integration work before 0.2 can close:

- extend the stable hierarchical live-address registry with focus chain, observer-call correlation,
  and source stack; bounds remain explicitly unavailable when geometry fields are not emitted, and
  IDs remain address-backed when the engine does not emit a component `id`;
- add validated Inspector field editing and transient overrides against the live engine;
- classify unsupported engine behavior explicitly instead of falling back silently to the
  legacy preview; the legacy parser remains a pre-run inspection surface only.

Exit criteria:

- observers can drive visible state transitions end to end;
- a field change invokes the correct callback exactly once unless Roku semantics require otherwise;
- the IEDB navigation shell can initialize, bind observers, change routes, and restore focus without unsupported linear-flow shortcuts;
- runtime errors include file, line, routine, and a useful stack trace.

## 0.3 — SceneGraph rendering fidelity

Goal: render common channel screens with layout and styling close enough for daily UI development.

Node coverage:

- `Scene`, `Group`, `Rectangle`, `Label`, `Poster`, and `Button` field parity;
- `RowList`, `LabelList`, `MarkupList`, `LayoutGroup`, and common grid/list item renderers;
- `BusySpinner`, `Animation`, `Timer`, `Task`, and `ContentNode` behavior;
- clipping rectangles, masks where practical, z-order, opacity, rotation, scale, and nested transforms;
- list content, item focus/selection fields, scrolling, item spacing, and viewport behavior.

Text and assets:

- Roku-compatible text measurement, horizontal/vertical alignment, wrapping, truncation, and line limits;
- project fonts and documented fallback-font behavior without distributing proprietary Roku fonts;
- `pkg:/` URI resolution, image sizing modes, placeholders, caching, and asset-load errors;
- manifest splash/icon fields, locale resources, and resolution-specific assets.

Display profiles:

- deterministic 1280×720 and 1920×1080 canvases;
- 4K profile and documented scaling behavior;
- safe areas, aspect ratio, overscan simulation, background color/image, and UI-resolution selection;
- device-pixel-ratio independence so screenshots remain reproducible.

Exit criteria:

- the IEDB home, detail, profile, library, and community views render without unsupported visual-node warnings;
- focus, selection, visibility, opacity, text, and image changes match stored reference flows;
- screenshot comparison passes agreed per-region pixel tolerances at 720p and 1080p.

## 0.4 — Roku compatibility APIs and asynchronous execution

Goal: support the platform services most channels require without coupling BrightScript to Electron.

- Create `packages/roku-api` with one documented adapter and support level per API.
- Implement `roSGNode`, `roMessagePort`, `roDeviceInfo`, `roAppInfo`, `roDateTime`, `roTimespan`, `roRegex`, and `roByteArray` subsets.
- Implement `Task` execution, message queues, timers, cancellation, lifecycle, and deterministic test clocks.
- Implement project-isolated `roRegistry` persistence with reset/export controls; never store secrets in project files.
- Add Generic 720p, 1080p, and 4K device profiles plus locale/country/time-zone controls.
- Expose simulated capabilities and unsupported calls in the Inspector and compatibility report.

Exit criteria:

- UI work never blocks on Task/network operations;
- registry and device-profile state are isolated and reproducible;
- supported APIs have contract tests and explicit failure behavior.

## 0.5 — Network parity and inspection

Goal: reproduce normal channel HTTP behavior while making every request inspectable.

- Implement the supported `roUrlTransfer` sync/async surface using the compatibility API.
- Support GET, POST, PUT, DELETE, headers, redirects, timeouts, cancellation, certificates, and response metadata where safely reproducible.
- Add a Network panel with method, URL, status, duration, size, headers, request, response, timing, filtering, and clear/export controls.
- Add deterministic mocks, fixtures, offline mode, throttling, latency, failure injection, and secret redaction.
- Enforce SSRF-aware local security boundaries and make host access visible to the user.

Exit criteria:

- the IEDB catalog/session requests can run or be deterministically mocked;
- asynchronous completion reaches the correct message port/observer;
- sensitive headers and values never appear in project memory, logs, or exports by default.

## 0.6 — Media development player

Goal: reproduce the development-facing `Video` and `Audio` state machines, not proprietary Roku playback internals.

- Implement `Video`, `Audio`, and media `ContentNode` fields.
- Support MP4 and practical HLS/DASH playback through evaluated open-source players.
- Map control, state, buffering, position, duration, seek, pause/resume, completion, error, audio track, and subtitle events.
- Add deterministic media mocks for CI and channels whose streams are unavailable locally.
- Expose playback state and request details in the Inspector/Network panels.
- Return `DRM_UNSUPPORTED_IN_SIMULATOR` for unsupported DRM and provide an opt-in mock state for UI development.

Exit criteria:

- non-DRM IEDB playback flows can be developed locally through equivalent state transitions;
- media errors are actionable and do not pretend protected playback succeeded;
- device-only codec, DRM, certification, and performance gates remain documented.

## 0.7 — Validation, testing, and visual comparison

Goal: make compatibility measurable instead of subjective.

- Expand `rokulab validate` to cover BrightScript syntax, XML/interface types, duplicate IDs, missing assets, invalid URIs, unsupported APIs, and unresolved references.
- Add `rokulab run`, `test`, `doctor`, and deterministic `--headless` execution.
- Add screenshot capture, named interaction flows, golden images, masks, thresholds, and diff artifacts.
- Add compatibility fixtures for inheritance, observers, lists, focus, Tasks, networking, media, locales, and resolutions.
- Record Roku-device reference screenshots and event traces without committing credentials, private content, or proprietary binaries.
- Produce a machine-readable compatibility report for CI.

Exit criteria:

- every supported behavior is backed by a contract or compatibility test;
- visual regressions produce an inspectable diff rather than a binary failure;
- the IEDB reference suite runs locally and in CI with deterministic mocks.

## 0.8 — Debugger and performance tooling

Goal: make RokuLab useful for diagnosing channel behavior, not only previewing it.

- Runtime exceptions, source locations, stack traces, variables, and call stack.
- Breakpoints, pause/resume, step into/over/out, watches, and conditional breakpoints where the selected runtime permits.
- SceneGraph mutation/event timeline and observer-call tracing.
- Frame timing, render counts, long tasks, memory indicators, asset/cache usage, and network timing.
- Monaco diagnostics, autocomplete, definition/reference navigation, and evaluated BrightScript language-server integration.
- Partial hot reload with state-preservation rules and a safe full-reload fallback.

Exit criteria:

- a developer can trace an input through handler, state mutation, observer, and render update;
- debugger and hot reload never silently corrupt runtime state;
- performance data clearly distinguishes simulation metrics from Roku-device metrics.

## 0.9 — Physical-device correlation and release readiness

Goal: close the gap between simulation and actual hardware with a controlled comparison workflow.

- Device Manager with discovery, explicit connection, keychain-backed credentials, and no plaintext password storage.
- ECP remote commands, app launch, deep-link testing, device information, and supported performance queries.
- Secure development-channel packaging/deploy, log streaming, screenshots, and side-by-side comparison.
- Automated simulator-versus-device flow reports for layout, focus, events, network outcomes, and media state.
- Windows signing, macOS notarization, Linux packaging, update metadata, SBOM, and release automation.

Exit criteria:

- the same reference flow can run in RokuLab and on a configured Roku with comparable artifacts;
- differences are classified as RokuLab bug, documented limitation, device/profile variation, or device-only behavior;
- credentials and local device data are protected and excluded from releases.

## 1.0 — Documented high-fidelity compatibility

Goal: a stable development tool with a measurable compatibility threshold and safe extension contracts.

- Stable runtime, SceneGraph, renderer, Roku API, plugin, fixture, and report contracts.
- Versioned compatibility matrix by node, field, method, event, API, media feature, and device profile.
- Reference-channel suite covering common UI, focus, networking, storage, Tasks, and non-DRM media flows.
- Supported flows meet the published behavioral and visual tolerances at 720p and 1080p.
- Installation, migration, extension, security, privacy, troubleshooting, and device-validation documentation.

The 1.0 claim will not mean binary compatibility with Roku OS. It will mean that supported surfaces are tested, limitations fail explicitly, visual differences are measured, and final device gates are clearly identified.

## Post-1.0

- Broader node/API coverage driven by real compatibility reports.
- Additional device profiles and opt-in community fixtures.
- Recording/replay, richer performance correlation, and plugin ecosystem growth.
- Fidelity improvements based on repeatable RokuLab-versus-device evidence rather than undocumented firmware assumptions.

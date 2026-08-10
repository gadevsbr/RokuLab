# Current state

Phase: `0.1.0-alpha.1` release candidate locally validated.

Working now: pnpm monorepo, Electron welcome/workbench, secure folder picker/preload boundary, manifest/project tree, basic SceneGraph parser/DOM renderer, `findNode`, experimental `init()`/`print`, virtual directional focus, console/problems/manifest panels, locally bundled Monaco editing, explicit save, debounced full-project hot reload, CLI inspect/validate, bundled hello-world project, and a Windows x64 portable build.

Evidence on 2026-08-09: lint, formatting, typecheck, 8 Vitest tests, 3 Playwright tests, all 7 workspace builds, CLI validation, and the full dependency audit passed. The packaged-app smoke launches `release/win-unpacked/RokuLab.exe`, opens its included example, and verifies rendered/runtime output. Portable artifact: 98,006,796 bytes; SHA-256 `AEC70E1531A75C803692553DBA0779BE8D6CBEE9DF1B394FAE726BEC3242132F`.

Not implemented: general BrightScript compatibility, observers, partial reload, network/player/debugger, signed installers, macOS/Linux artifacts, and physical Roku integration. Final behavior on Roku hardware is not validated. The Windows artifact is portable but not certificate-signed. Monaco's current main bundle is 2.83 MB before gzip and should be split in a future performance cycle.

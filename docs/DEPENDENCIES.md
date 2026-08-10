# Dependencies

All direct runtime dependencies use permissive licenses; lockfile review remains part of release work.

| Dependency          | License          | Why                                         |
| ------------------- | ---------------- | ------------------------------------------- |
| Electron            | MIT              | Secure cross-platform desktop shell         |
| React / Zustand     | MIT              | UI and local application state              |
| Vite                | MIT              | Renderer development/build pipeline         |
| fast-xml-parser     | MIT              | SceneGraph XML parsing without DOM coupling |
| chokidar            | MIT              | Cross-platform project watching             |
| Vitest / Playwright | MIT / Apache-2.0 | Unit and desktop UI validation              |

BrighterScript, brs-engine, Monaco, HLS.js, Shaka Player, and FFmpeg are evaluation candidates, not bundled in this release. No third-party code is copied into RokuLab.

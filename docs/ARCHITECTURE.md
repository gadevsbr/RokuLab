# Architecture

RokuLab is a compatibility layer, not a hardware/firmware emulator.

`project-loader → manifest-parser + scenegraph → brightscript-runtime → core session/event bus → renderer/desktop`

Package boundaries keep parsing and runtime code independent from Electron and React. The Electron main process owns filesystem access; a context-isolated preload exposes a narrow validated API. The renderer receives serializable project snapshots and cannot request arbitrary files.

Chokidar watches only recognized project areas. Changes are debounced and cause a safe full-project snapshot reload. Component-level invalidation can replace this later without changing the renderer contract.

Source access is scoped to the active window/project. The loader rejects traversal, symlink files, hidden project areas, unsupported writes, and text files over 1 MiB. Monaco and its workers are bundled locally; no editor code or user source is fetched from a CDN.

# Architecture

RokuLab is a compatibility layer, not a hardware/firmware emulator.

`project-loader → manifest-parser + scenegraph → brightscript-runtime → core session/event bus → renderer/desktop`

Package boundaries keep parsing and runtime code independent from Electron and React. The Electron main process owns filesystem access; a context-isolated preload exposes a narrow validated API. The renderer receives serializable project snapshots and cannot request arbitrary files.

The reload action currently restarts the loaded project. File watching and component-level invalidation are planned behind the same session contract.

# Compatibility

Statuses: supported, partial, experimental, unsupported.

| Surface                                         | Status       | Notes                                              |
| ----------------------------------------------- | ------------ | -------------------------------------------------- |
| manifest                                        | supported    | Key/value parsing, comments, validation            |
| Scene, Group, Rectangle, Label, Poster          | partial      | XML fields and child tree                          |
| `findNode`                                      | supported    | Scene tree ID lookup                               |
| focus/navigation                                | partial      | Geometry, nested translation, visibility           |
| BrightScript `init()`, subs, `if/else`, `print` | experimental | Loops/complex expressions unsupported              |
| `m.top.findNode(...).field = value`             | experimental | Literal assignment subset                          |
| Monaco source editing                           | supported    | `.brs`, `.xml`, `.json`, `.txt`, and `manifest`    |
| Hot reload                                      | supported    | Debounced full-project reload                      |
| compatibility diagnostics                       | supported    | Grouped node counts and BrightScript line ranges   |
| observeField                                    | partial      | Registration, dispatch, and cycle-break subset     |
| roUrlTransfer                                   | unsupported  | Planned                                            |
| Video/DRM                                       | unsupported  | DRM will return `DRM_UNSUPPORTED_IN_SIMULATOR`     |
| Compatibility engine                            | experimental | brs-engine 2.3.0 + brs-scenegraph 0.3.0            |
| BrightScript via Run                            | partial      | Full interpreter; Roku firmware parity not claimed |
| SceneGraph via Run                              | partial      | Canvas runtime; live Inspector bridge pending      |
| Remote keys via Run                             | partial      | D-pad, OK, Back, rewind, play, fast-forward        |

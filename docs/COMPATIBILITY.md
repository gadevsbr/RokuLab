# Compatibility

Statuses: supported, partial, experimental, unsupported.

| Surface                                     | Status       | Notes                                            |
| ------------------------------------------- | ------------ | ------------------------------------------------ |
| manifest                                    | supported    | Key/value parsing, comments, validation          |
| Scene, Group, Rectangle, Label, Poster      | partial      | XML fields and child tree                        |
| `findNode`                                  | supported    | Scene tree ID lookup                             |
| focus/navigation                            | partial      | Focusable node order and directional keys        |
| BrightScript `init()`, linear subs, `print` | experimental | Control-flow routines remain diagnostic-only     |
| `m.top.findNode(...).field = value`         | experimental | Literal assignment subset                        |
| Monaco source editing                       | supported    | `.brs`, `.xml`, `.json`, `.txt`, and `manifest`  |
| Hot reload                                  | supported    | Debounced full-project reload                    |
| compatibility diagnostics                   | supported    | Grouped node counts and BrightScript line ranges |
| observeField registration                   | partial      | Bindings captured and shown; dispatch planned    |
| roUrlTransfer                               | unsupported  | Planned                                          |
| Video/DRM                                   | unsupported  | DRM will return `DRM_UNSUPPORTED_IN_SIMULATOR`   |

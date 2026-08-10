# Compatibility

Legend: ✅ supported, 🟡 partial, 🧪 experimental, ❌ unsupported.

| Surface                                | Status | Notes                                          |
| -------------------------------------- | ------ | ---------------------------------------------- |
| manifest                               | ✅     | Key/value parsing, comments, validation        |
| Scene, Group, Rectangle, Label, Poster | 🟡     | XML fields and child tree                      |
| `findNode`                             | ✅     | Scene tree ID lookup                           |
| focus/navigation                       | 🟡     | Focusable node order and directional keys      |
| BrightScript `init()` and `print`      | 🧪     | Deliberately constrained interpreter           |
| `m.top.findNode(...).field = value`    | 🧪     | Literal assignment subset                      |
| observeField                           | ❌     | Planned                                        |
| roUrlTransfer                          | ❌     | Planned                                        |
| Video/DRM                              | ❌     | DRM will return `DRM_UNSUPPORTED_IN_SIMULATOR` |

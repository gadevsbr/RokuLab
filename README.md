# RokuLab 📺

**The missing development environment for Roku.**

RokuLab is an open-source, local-first development environment for opening, inspecting, rendering, and testing BrightScript + SceneGraph projects without pretending to emulate Roku OS or replace final device testing.

> Early alpha: useful foundations exist, but Roku compatibility is intentionally partial.

## Quick start from source

Requirements: Node.js 22+ and Corepack.

```bash
corepack pnpm install
corepack pnpm dev
```

Open `examples/hello-world` from the welcome screen. The initial vertical slice parses its manifest and XML component, displays the project tree, renders supported nodes, runs a deliberately small `init()` subset, captures `print`, and routes keyboard/virtual-remote input.

## Current status

| Feature                        | Status                 |
| ------------------------------ | ---------------------- |
| Project/manifest loading       | ✅ Supported           |
| SceneGraph XML and basic nodes | 🟡 Partial             |
| BrightScript `init()`/`print`  | 🧪 Experimental subset |
| Virtual remote and focus       | 🟡 Partial             |
| Hot reload                     | 🚧 Planned             |
| Network/player/debugger        | 🚧 Planned             |
| Physical Roku deploy           | 🚧 Planned             |

See [compatibility details](docs/COMPATIBILITY.md), [architecture](docs/ARCHITECTURE.md), and [roadmap](docs/ROADMAP.md).

## Privacy and legal boundary

Projects stay on the local machine. RokuLab distributes no Roku firmware, fonts, logos, protected assets, or proprietary binaries. Roku is a trademark of Roku, Inc.; RokuLab is independent and is not affiliated with or endorsed by Roku, Inc.

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md), the [Code of Conduct](CODE_OF_CONDUCT.md), and [Security Policy](SECURITY.md). MIT licensed.

# RokuLab

**The missing development environment for Roku.**

RokuLab is an open-source, local-first development environment for opening, inspecting, rendering, and testing BrightScript + SceneGraph projects without pretending to emulate Roku OS or replace final device testing.

> Early alpha: useful foundations exist, but Roku compatibility is intentionally partial.

## Quick start from source

Requirements: Node.js 22+ and Corepack.

```bash
corepack pnpm install
corepack pnpm dev
```

Open `examples/hello-world` from the welcome screen. RokuLab parses its manifest and XML component, displays the project tree, renders supported nodes, runs a deliberately small `init()` subset, captures `print`, and routes keyboard/virtual-remote input. Text sources open in the bundled Monaco editor and saving triggers a safe full-project hot reload.

## Current status

| Feature                        | Status                            |
| ------------------------------ | --------------------------------- |
| Project/manifest loading       | Supported                         |
| SceneGraph XML and basic nodes | Partial                           |
| BrightScript execution         | Experimental full runtime adapter |
| SceneGraph canvas              | Experimental runtime adapter      |
| Virtual remote and focus       | Partial                           |
| Monaco source editor           | Supported                         |
| Hot reload                     | Serialized engine restart         |
| Network/player/debugger        | Planned                           |
| Physical Roku deploy           | Planned                           |

See [compatibility details](docs/COMPATIBILITY.md), [architecture](docs/ARCHITECTURE.md), and [roadmap](docs/ROADMAP.md).

## Windows package

`corepack pnpm package:win` builds the portable x64 executable under `apps/desktop/release/`. Alpha builds are not certificate-signed yet and may trigger a Windows SmartScreen warning. Published downloads must come from this repository's GitHub Releases page.

## Privacy and legal boundary

Projects stay on the local machine. RokuLab distributes no Roku firmware, fonts, logos, protected assets, or proprietary binaries. Roku is a trademark of Roku, Inc.; RokuLab is independent and is not affiliated with or endorsed by Roku, Inc.

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md), the [Code of Conduct](CODE_OF_CONDUCT.md), and [Security Policy](SECURITY.md). MIT licensed.

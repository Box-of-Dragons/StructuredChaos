Open source software and resources used across the Structured Chaos family of projects.

This page is the canonical source of truth for third-party code, libraries, fonts, and tools used by the sites and apps under the Structured Chaos umbrella. Each project may also list its own dependencies in its `package.json`, `composer.json`, or build files; this page exists as a human-readable summary.

## Projects

| Project | Repo | Stack |
| --- | --- | --- |
| Structured Chaos (this site) | [structured-chaos](https://github.com/Box-of-Dragons/StructuredChaos) | Static HTML/CSS/JS |
| Box of Dragons | [BoxOfDragons](https://github.com/Box-of-Dragons/BoxOfDragons) | PHP, PDO, MySQL |
| KnitStitch Grid | [KnitStitch](https://github.com/Box-of-Dragons/KnitStitch) | Vite, Konva.js, SolveSpace WASM |
| Account service | [better-auth](https://github.com/Box-of-Dragons/BetterAuth) | Next.js, Better Auth, MySQL |
| SolveSpace WASM build | [solver-wasm](https://github.com/Box-of-Dragons/SolverWasm) | C++, CMake, Emscripten |

## Box of Dragons

- [PHP](https://www.php.net/) — server-side runtime. License: PHP-3.01.
- [PDO](https://www.php.net/manual/en/book.pdo.php) — database access layer (built into PHP). License: PHP-3.01.
- [MySQL](https://www.mysql.com/) — database (content migrated from the previous Craft CMS install). License: GPL-2.0.
- [DDEV](https://ddev.com/) — local development environment (Docker-based). License: Apache-2.0.
- [Google Fonts](https://fonts.google.com/) — Dancing Script, Open Sans, Playfair Display. License: OFL 1.1.

## KnitStitch Grid

- [Konva.js](https://konvajs.org/) — 2D canvas library. License: MIT.
- [Vite](https://vitejs.dev/) — build tool and dev server. License: MIT.
- [Vitest](https://vitest.dev/) — unit test framework. License: MIT.
- [Playwright](https://playwright.dev/) — end-to-end test framework. License: Apache-2.0.
- [SolveSpace](https://solvespace.com/) — parametric 2D/3D constraint solver, compiled to WebAssembly. License: GPL-3.0-or-later. See the [solver-wasm](#solver-wasm-wasm-build) section below for the build toolchain.
- [Google Fonts](https://fonts.google.com/) — Dancing Script, Open Sans, Playfair Display. License: OFL 1.1.

## Account service (better-auth)

- [Next.js](https://nextjs.org/) — React framework. License: MIT.
- [React](https://react.dev/) — UI library. License: MIT.
- [Better Auth](https://www.better-auth.com/) — authentication library. License: MIT.
- [mysql2](https://github.com/sidorares/node-mysql2) — MySQL driver for Node.js. License: MIT.
- [pg](https://github.com/brianc/node-postgres) — PostgreSQL client. License: MIT.
- [Tailwind CSS](https://tailwindcss.com/) — utility-first CSS framework. License: MIT.
- [TypeScript](https://www.typescriptlang.org/) — typed JavaScript. License: Apache-2.0.
- [ESLint](https://eslint.org/) — linter. License: MIT.

## solver-wasm (WASM build)

The KnitStitch WASM solver is built from a fork of SolveSpace compiled with Emscripten.

- [SolveSpace](https://solvespace.com/) — the solver itself. License: GPL-3.0-or-later.
- [Emscripten](https://emscripten.org/) — LLVM-to-WebAssembly compiler toolchain. License: MIT/NCSA.
- [CMake](https://cmake.org/) — build system. License: BSD-3-Clause.
- Bundled SolveSpace dependencies (submodules of the solver-wasm fork):
  - [zlib](https://github.com/madler/zlib) — compression. License: Zlib.
  - [libpng](https://github.com/glennrp/libpng) — PNG library. License: libpng-2.0.
  - [FreeType](https://freetype.org/) — font rendering. License: FTL/GPL-2.0.
  - [libdxfrw](https://github.com/solvespace/libdxfrw) — DXF read/write. License: GPL-2.0-or-later.
  - [pixman](https://github.com/solvespace/pixman) — pixel manipulation. License: MIT.
  - [cairo](https://github.com/solvespace/cairo) — 2D graphics. License: LGPL-2.1-or-MPL-1.1.
  - [ANGLE](https://github.com/solvespace/angle) — OpenGL translation. License: BSD-3-Clause.
  - [mimalloc](https://github.com/microsoft/mimalloc) — allocator. License: MIT.
  - [Eigen](https://gitlab.com/libeigen/eigen) — linear algebra. License: MPL-2.0.

## Tooling and infrastructure

- [Node.js](https://nodejs.org/) — JavaScript runtime for build tooling and the webhook servers. License: MIT.
- [PHP](https://www.php.net/) — runtime for Box of Dragons. License: PHP-3.01.
- [nginx](https://nginx.org/) — web server and reverse proxy on the VPS. License: BSD-2-Clause.
- [PM2](https://pm2.keymetrics.io/) — process manager for the webhook servers and Next.js app. License: AGPL-3.0.
- [Git](https://git-scm.com/) — version control. License: GPL-2.0.
- [GitHub](https://github.com/) and [GitLab](https://gitlab.com/) — source hosting and CI.

## Fonts

All three sites use the same font stack, served from Google Fonts:

- [Dancing Script](https://fonts.google.com/specimen/Dancing+Script) — brand/script font. License: OFL 1.1.
- [Open Sans](https://fonts.google.com/specimen/Open+Sans) — body font. License: OFL 1.1.
- [Playfair Display](https://fonts.google.com/specimen/Playfair+Display) — heading font. License: OFL 1.1.

## License

The Structured Chaos umbrella site source is licensed under MIT. Individual projects carry their own licenses (see each repo's `LICENSE` file); KnitStitch and the SolveSpace WASM build are GPL-3.0-or-later to satisfy SolveSpace's license.

# E X U R A · D E V

The **workbench** of the Exura series — where **exuracss**, **exurajs** and **exuraphp** are developed, tried and tested.

Not a product. The packages live in their own repositories and stay the source of truth; this repo only *uses* them:

- a **playground** that shows every feature of the three packages, alone and together,
- **tests** that drive the playground in a real browser and over HTTP,
- a **size budget** for every `dist/` file,
- one runite for every routine: `php cast` — shaped with [Rune](https://github.com/devneet-id/rune), like the packages themselves.

The packages stay free of dependencies — every dev tool (Playwright, Node) lives here, never there.

## Layout

```
exura-dev/
├── cast                    the runite (Rune): php cast <cast>
├── composer.json           devneet/rune
├── exura-dev.json          serve port, build steps and size budget per package
├── packages/               git submodules (branch 1.x)
│   ├── exuracss/
│   ├── exurajs/
│   └── exuraphp/
├── playground/             served by `php cast serve`
│   ├── router.php          /pkg/<package>/<file> → packages/<package>/dist, /api/* → api/index.php
│   ├── css/                components, layout, text & ring, color balancing, clip
│   ├── js/                 module/state/effect, template, store, watch, router, request console
│   ├── api/index.php       exuraphp endpoints (hello, echo, user/*, notes, fail, warn, fallback)
│   ├── apps/notes/         the three packages together
│   └── assets/             the workbench's own toolbar and helpers (not part of any package)
├── tests/                  node:test + Playwright
│   ├── php/                exuraphp over HTTP
│   ├── js/                 exurajs in the browser
│   ├── css/                exuracss computed styles
│   ├── integration/        apps/notes end to end
│   └── helpers/            server (php -S on a free port) and browser
└── .github/workflows/ci.yml
```

## Start

Requirements: **PHP 8.1+**, **Composer**, **Node 22+**.

```bash
git clone --recurse-submodules https://github.com/devneet-id/exura-dev
```

```bash
cd exura-dev && composer install
```

```bash
php cast setup
```

```bash
npx playwright install chromium
```

`composer install` brings Rune for the runite. `php cast setup` runs `composer install` in each package (needed to build) and `npm install` here (needed to test). The Playwright browser is needed once per machine.

Cloned without `--recurse-submodules`? Run `git submodule update --init` — an empty `packages/` leaves the playground without styles and scripts, and `php cast serve` refuses to start.

## Commands

`php cast` alone opens the main hall: every cast with its echo.

| Cast | What it does |
|---|---|
| `php cast serve --port=8080 --host=localhost --public` | playground at http://localhost:8080 (Specter devserver) |
| `php cast build --css --js --php` | build `dist/` through each package's own `cast` (no spell = all) |
| `php cast test --php --js --css --integration` | run the tests (no spell = all) |
| `php cast size` | `dist/` size, raw and gzip, against the budget in `exura-dev.json` |
| `php cast status` | branch, uncommitted changes and version of each package |
| `php cast setup` | composer in every package, npm here |

A cast that fails exits with code 1, so CI and scripts can rely on it.

## The cycle of a change

1. Change the source in `packages/<package>/src/` — that folder is the package's own git repo.
2. `php cast build --js` (or `--css`, `--php`) and look at it in `php cast serve`.
3. Add or adjust a playground page and a test here; `php cast test`, `php cast size`.
4. Commit and open a PR **in the package repo**.
5. Once merged, move the submodule pointer here (`git add packages/<package>`) together with the new pages and tests.

The playground always loads `dist/`: what you see is what users get.

## Known issues found here

The test suite marks known issues as `todo`: they run and are reported, but do not fail the suite. Drop the `todo` once the package is fixed.

- **exuracss 1.1.0** — `card="NAME:N"` (tints) always sets the text to `--color-fixed-light`, so light tints on a light page are white on white (contrast 1.08 for `primary:1`). Playground cards add `text="dark"` meanwhile.
- **exuracss 1.1.0** — `* { transition: all .05s }` animates every property of every element; the CSS tests switch transitions off to read final styles.
- **Rune 1.21.117** — `aether_exit()` ends every run with a bare `exit`, so a runite always exits 0. The `cast` here sets the real code from a shutdown function.
- **Build on Linux** — `php cast build` of exurajs drops the blank lines of `dist/exura.js` compared to the committed (Windows) build. Content is the same.

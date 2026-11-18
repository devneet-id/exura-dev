# E X U R A · D E V

The **workbench** of the Exura series — where **exuracss**, **exurajs** and **exuraphp** are tried and tested.

The packages live in their own repositories. This repo fetches their released files with `php exura`, then serves and tests them with `php cast`:

- a **playground** (`src/`) that shows every feature of the three packages, alone and together,
- **tests** that drive the playground in a real browser and over HTTP.

Both runites are shaped with [Rune](https://github.com/devneet-id/rune).

## Layout

```
exura-dev/
├── exura                   runite — fetch Exura from the CDN into src/vessel/ (a tag or a branch)
├── cast                    runite — development: serve and test
├── composer.json           devneet/rune
├── package.json            playwright (tests only)
├── src/                    the playground
│   ├── vessel/             exura.css, exura-clip.css, exura.js, exura.php — fetched, not committed
│   ├── router.php          /vessel/* → the fetched files, /api/* → api/index.php
│   ├── css/                components, layout, text & ring, color balancing, clip
│   ├── js/                 module/state/effect, template, store, watch, router, request console
│   ├── api/index.php       exuraphp endpoints (hello, echo, user/*, notes, fail, warn, fallback)
│   ├── apps/notes/         the three packages together
│   └── assets/             the workbench's own toolbar and helpers (not part of any package)
└── tests/                  node:test + Playwright
    ├── php/                exuraphp over HTTP
    ├── js/                 exurajs in the browser
    ├── css/                exuracss computed styles
    ├── integration/        apps/notes end to end
    └── helpers/            server (php -S on a free port) and browser
```

## Start

Requirements: **PHP 8.1+**, **Composer**, **Node 22+**.

```bash
composer install
```

```bash
php exura setup --dist=src/vessel/ --tags=1.1.0 --install
```

```bash
php exura css --part=clip
```

```bash
php cast serve
```

Open http://localhost:8080. For the tests, once per machine:

```bash
npm install && npx playwright install chromium
```

## Fetch — `php exura`

| Cast | What it does |
|---|---|
| `php exura setup --dist=src/vessel/ --tags=1.1.0 --install` | write the settings into the runite, then fetch css, js and php |
| `php exura css` · `php exura css --part=clip` | exura.css · exura-clip.css |
| `php exura js` · `php exura php` | exura.js · exura.php |
| `php exura css --remove` | remove a file (same for `js`, `php`, `--part=clip`) |

`--tags` takes a tag (`1.1.0`) or a branch (`1.x` = the latest of 1.x). Keep `--dist=src/vessel/`: the playground serves that folder as `/vessel/`.

## Develop — `php cast`

| Cast | What it does |
|---|---|
| `php cast serve --port=8080 --host=localhost --public` | the playground (Specter devserver) |
| `php cast test --php --js --css --integration` | the tests (no spell = all); a failure exits 1 |

Both refuse to start while a file of `src/vessel/` is missing, and name the `php exura` cast that fetches it.

## The cycle of a change

1. Change a package in its own repository and release it (a tag), or push it to its branch.
2. Here: `php exura setup --tags=<tag or branch> --install` (and `php exura css --part=clip`).
3. `php cast serve` to look, `php cast test` to prove.
4. A new feature gets a playground page in `src/` and a test in `tests/`.

## Known issues found here

The test suite marks known issues as `todo`: they run and are reported, but do not fail the suite. Drop the `todo` once the package is fixed.

- **exuracss 1.1.0** — `card="NAME:N"` (tints) always sets the text to `--color-fixed-light`, so light tints on a light page are white on white (contrast 1.08 for `primary:1`). Playground cards add `text="dark"` meanwhile.
- **exuracss 1.1.0** — `* { transition: all .05s }` animates every property of every element; the CSS tests switch transitions off to read final styles.
- **Rune 1.21.117** — `aether_exit()` ends every run with a bare `exit`, so a runite always exits 0. `cast` sets the real code from a shutdown function.

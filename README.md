# E X U R A · D E V

The **workshop** of the Exura series — where **exuracss**, **exurajs** and **exuraphp** are explored and tried, one possibility at a time.

The packages live in their own repositories. This repo fetches their released files into `core/` with `php exura`, and serves a folder that uses them with `php cast`:

- **`exploration/`** — every component of the three packages, ready to read and copy, and a complete app (CRUD + API).
- **`scenario/`** — one possibility per folder. There are no tests: if something is wrong, it shows in the scenario that uses it.

How the series is developed — exura-dev for trying, the package repos for issues and releases: [WORKFLOW.md](WORKFLOW.md).

Both runites are shaped with [Rune](https://github.com/devneet-id/rune).

## Layout

```
exura-dev/
├── exura                 runite — fetch Exura from the CDN into core/ (a tag or a branch)
├── cast                  runite — the development server: serve exploration/ or a scenario
├── router.php            the router cast gives the server: /core/* and front controllers
├── core/                 exura.css · exura-clip.css · exura.js · exura.php (fetched, not committed)
├── exploration/
│   ├── index.html        everything, listed
│   ├── exuracss/         components · layout · text & ring · color balancing · clip
│   ├── exurajs/          module/state/effect · template · store · watch · router
│   ├── exuraphp/         request console + api/ with every feature as a route
│   ├── app/              notes: a complete CRUD app and its API (api/)
│   └── assets/           the look of the exploration pages (not part of Exura)
└── scenario/
    ├── README.md         every scenario and what it proves
    ├── exuracss-grid/    index.html · index.css
    ├── exurajs-counter/  index.html · index.css · index.js
    ├── exuraphp-routing/ index.html · index.css · index.js · api/index.php
    └── …
```

## Start

Requirements: **PHP 8.1+** and **Composer**.

```bash
composer install
```

```bash
php exura setup --dist=core/ --tags=1.1.0 --install
```

```bash
php exura css --part=clip
```

```bash
php cast exploration
```

Open http://localhost:8080.

## Fetch — `php exura`

| Cast | What it does |
|---|---|
| `php exura setup --dist=core/ --tags=1.1.0 --install` | write the settings into the runite, then fetch css, js and php |
| `php exura css` · `php exura css --part=clip` | exura.css · exura-clip.css |
| `php exura js` · `php exura php` | exura.js · exura.php |
| `php exura css --remove` | remove a file (same for `js`, `php`, `--part=clip`) |

`--tags` takes a tag (`1.1.0`) or a branch (`1.x` = the latest of 1.x). Keep `--dist=core/`: every page links `/core/…`.

## Serve — `php cast`

| Cast | What it serves |
|---|---|
| `php cast exploration` | `exploration/` |
| `php cast scenario --name=exuracss-grid` | one scenario; without `--name` it lists them and asks |
| `php cast serve --path=<folder>` | any folder of this repo |

Every cast takes `--port=8080`, `--host=localhost` and `--public`. The folder becomes the site root, `core/` is served beside it as `/core/`, and a path that is not a file goes to the nearest `index.php` (exuraphp routes) or else `index.html` (exurajs router). A missing file of `core/` is named with the `php exura` cast that fetches it.

## The cycle of a change

1. Change a package in its own repository; release a tag, or push to its branch.
2. Here: `php exura setup --tags=<tag or branch> --install` (and `php exura css --part=clip`).
3. `php cast exploration` and the scenarios that touch the change: every page says what must hold.
4. Something new or broken that no page shows? Add a scenario (see [scenario/README.md](scenario/README.md)), or a section to `exploration/`.

## Known issues seen here

- **exuracss 1.1.0** — `card="NAME:N"` keeps one text color for all ten shades: light tints carry white text on a light page, some dark-page tints dark text. Visible in `scenario/exuracss-tint` and `exploration/exuracss/color.html`. Fixed in AnwarAchilles/exuracss#1.
- **exuracss 1.1.0** — `strong, em { color: #dc3b3b }`: every `<strong>` and `<em>` is red.
- **exuracss 1.1.0** — `* { transition: all .05s }` animates every property of every element.
- **exuraphp 1.1.0** — `Exura::method()` reads values but does not validate them, and `scenario/exuraphp-method-values` shows where reading goes wrong: a JSON `null` returns the default; big integers lose digits (no `JSON_BIGINT_AS_STRING`); multipart fields of a PUT/PATCH are not read; a JSON body that is not an object together with a query string crashes into an empty 500 (`array_merge` on an int); broken JSON is read as a form, leaving odd keys, instead of answering 400.
- **Rune 1.21.117** — `aether_exit()` ends every run with a bare `exit`, so a runite always exits 0; `cast` sets the real code from a shutdown function.

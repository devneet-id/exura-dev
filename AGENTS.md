# Working in exura-dev

For humans and AI agents. Knowledge of the series lives in [devneet-id/lore](https://github.com/devneet-id/lore) (`realms/exura/`); read it first.

## Laws

1. **This repo uses Exura; it does not hold it.** exuracss, exurajs and exuraphp are changed and released in their own repositories. Here they arrive only through `php exura`, into `core/` — never copied by hand, never committed.
2. **Pages use what users get.** Every exploration and scenario links `/core/…`; PHP requires `core/exura.php`.
3. **The packages stay independent.** `exploration/app/` and a scenario may combine them; a package must never require another.
4. **No tests — the pages show it.** A scenario says in its header what must hold; exurajs and exuraphp scenarios check themselves in the page (`expect(label, ok)` → ✓ / ✗). Never hide a ✗ to make a page look green: a ✗ is a finding.
5. **Two runites, two jobs.** `exura` fetches into `core/`; `cast` serves a folder. New routines become casts, following the [Rune laws](https://github.com/devneet-id/lore/blob/main/realms/rune/lore/acts/4-the-beyond/laws.md) (shebang on line 1, keep the `#sentinel-*` markers).

## Conventions

- `exploration/` holds every component, ready to copy: a framed demo and the code behind it. Its own look lives in `exploration/assets/` and never uses exuracss tints, so a page stays readable on any version.
- `scenario/<package>-<possibility>/` is standalone: `index.html` + `index.css` (+ `index.js`, `api/index.php`). Link your own files absolutely (`/index.css`). List it in `scenario/README.md`.
- A known package issue is listed under *Known issues* in the README, with the scenario that shows it.

## After advancing work

Log it in lore: `chronicle/exura/<YYMM>-<human>_claude.md` for an AI, `chronicle/exura/<YYMM>-<human>.md` for a human.

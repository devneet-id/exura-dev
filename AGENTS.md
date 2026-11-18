# Working in exura-dev

For humans and AI agents. Knowledge of the series lives in [devneet-id/lore](https://github.com/devneet-id/lore) (`realms/exura/`); read it first.

## Laws

1. **This repo tests Exura; it does not hold it.** exuracss, exurajs and exuraphp are changed and released in their own repositories. Here they arrive only through `php exura`, into `src/vessel/` — never copied by hand, never committed.
2. **No dependencies leak into a package.** Node, Playwright, test helpers and the playground stay here.
3. **The packages stay independent.** Pages under `src/apps/` may combine them; a package must never require another.
4. **Test what users get.** The playground and the tests load the fetched files of `src/vessel/`, served as `/vessel/`.
5. **Two runites, two jobs.** `exura` fetches; `cast` is development only — `serve` and `test`. New routines become casts there, following the [Rune laws](https://github.com/devneet-id/lore/blob/main/realms/rune/lore/acts/4-the-beyond/laws.md) (shebang on line 1, keep the `#sentinel-*` markers).
6. **A failing test is a finding, not an obstacle.** Never weaken an assertion to go green. A known package issue becomes a `todo` test with a one-line reason, and is listed under *Known issues* in the README.

## Conventions

- Every feature of a package gets a playground page (or a section of one) and a test that drives that page.
- Tests use `node:test` with Playwright via `tests/helpers/` — each file starts its own `php -S` on a free port; notes are stored in a temp folder (`EXURA_DEV_DATA`).
- Playground pages carry `data-*` hooks for the tests; they also load `/assets/dev.js` (toolbar, light/dark).

## After advancing work

Log it in lore: `chronicle/exura/<YYMM>-<human>_claude.md` for an AI, `chronicle/exura/<YYMM>-<human>.md` for a human.

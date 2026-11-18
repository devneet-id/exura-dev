# Working in exura-dev

For humans and AI agents. Knowledge of the series lives in [devneet-id/lore](https://github.com/devneet-id/lore) (`realms/exura/`); read it first.

## Laws

1. **The packages are the source of truth.** Code of exuracss / exurajs / exuraphp changes in `packages/<package>/` and is committed and PR'd in that package's repo — never copied into exura-dev.
2. **No dependencies leak into a package.** Node, Playwright, test helpers and the playground stay here. A package ships one file per `dist/` target, with no runtime dependency and no build step for its users.
3. **The packages stay independent.** Pages under `playground/apps/` may combine them; a package must never require another.
4. **Test what users get.** The playground and the tests load `dist/`. After changing `src/`, rebuild (`php cast build --css|--js|--php`) before testing.
5. **Builds go through the package's own `cast`** (Rune). `php cast build` only calls it. The workbench itself is a runite too: new routines become casts in `cast`, following the [Rune laws](https://github.com/devneet-id/lore/blob/main/realms/rune/lore/acts/4-the-beyond/laws.md) (keep the `#sentinel-*` markers, shebang on line 1).
6. **A failing test is a finding, not an obstacle.** Never weaken an assertion to go green. A known package issue becomes a `todo` test with a one-line reason, and is listed under *Known issues* in the README.

## Conventions

- Every feature of a package gets a playground page (or a section of one) and a test that drives that page.
- Tests use `node:test` with Playwright via `tests/helpers/` — each file starts its own `php -S` on a free port; notes are stored in a temp folder (`EXURA_DEV_DATA`).
- Playground pages carry `data-*` hooks for the tests; they also load `/assets/dev.js` (toolbar, light/dark).
- Size budgets live in `exura-dev.json`; raising one is a deliberate decision, mention it in the PR.

## After advancing work

Log it in lore: `chronicle/exura/<YYMM>-<human>_claude.md` for an AI, `chronicle/exura/<YYMM>-<human>.md` for a human.

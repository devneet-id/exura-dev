# Scenarios

One possibility per folder. Each one is a small, standalone site that uses only `core/` (fetched by `php exura`) and its own `index.css` / `index.js` / `api/`.

```bash
php cast scenario --name=exuracss-grid
```

Run `php cast scenario` without `--name` to pick one from the list.

There are no tests here: **a scenario shows its own result**. The header of every page lists what you should see.

- **exuracss** scenarios are checked by eye: the list says what must hold (◇).
- **exurajs** and **exuraphp** scenarios check themselves in the page: ✓ when it holds, ✗ in red when it does not (also logged to the console).

| Scenario | What it proves | Checks |
|---|---|---|
| `exuracss-grid` | responsive grid with prefixed `size` (sm / md / lg), a holy-grail layout | by eye |
| `exuracss-dark-mode` | `dark` reversal on any element, `light` nested inside it | by eye |
| `exuracss-tint` | every `card="NAME:N"` readable on a light and a dark page | by eye — fails on 1.1.0 (AnwarAchilles/exuracss#1) |
| `exuracss-form` | a full form without classes, two columns from md | by eye |
| `exuracss-table` | every line style of `table` and `list` | by eye |
| `exuracss-clip` | clip icons, new grammar `e: a: ef:` next to the deprecated one | by eye |
| `exuracss-landing` | a whole landing page from attributes, light and dark | by eye |
| `exurajs-counter` | module, state, effect with deps, same-value no-op | ✓ / ✗ |
| `exurajs-template` | `{{ }}` escapes, `{{{ }}}` is raw (and trusted), missing keys stay | ✓ / ✗ |
| `exurajs-list` | rendering a list through an effect and `{{{items}}}`, escaped titles | ✓ / ✗ |
| `exurajs-router` | `router()` params at `/`, `/user/42`, `/post/7/comment/3`, no match | ✓ / ✗ |
| `exurajs-watch` | `watch()` runs once when seen, a missing target only warns | ✓ / ✗ (scroll) |
| `exurajs-modules` | two modules, one drives the other, a module without its element | ✓ / ✗ |
| `exuraphp-routing` | methods, method lists, wildcards, whole-route match, `?/route`, 404 | ✓ / ✗ |
| `exuraphp-request` | `method()` from query, JSON and form; `return`, `data`, `header`, the trace | ✓ / ✗ |
| `exuraphp-errors` | exception, warning, undefined function → 500 JSON; a notice stays 200 | ✓ / ✗ |

## Add a scenario

1. A folder `scenario/<package>-<possibility>/` with `index.html` and `index.css` (plus `index.js`, `api/index.php` when needed).
2. Link Exura from `/core/…` and your own files from `/…` (absolute: the router may answer other paths with your `index.html`).
3. Say in the header what must hold; for exurajs and exuraphp, check it in the page with `expect(label, ok)`.
4. Add a row to the table above.

# Handoff — where the last session stopped

For the next session. Read [WORKFLOW.md](WORKFLOW.md) first. Delete this file once everything below is done.

_Written 2026-11-18 by Claude, working with anwarachilles._

## Why a new session

The last session was attached to the forks `AnwarAchilles/exuracss`, `exurajs`, `exuraphp` instead of the devneet-id repositories. The forks have issues turned off, and a session can not swap its repositories, so the issues below could not be filed. **Start with:** devneet-id/exura-dev, devneet-id/exuracss, devneet-id/exurajs, devneet-id/exuraphp, devneet-id/lore (and devneet-id/exura if needed) — not the AnwarAchilles forks.

## State

- **exura-dev** `main`: `core/` + `exploration/` + `scenario/` (17 scenarios), `php exura` + `php cast`. Merged: #1–#4.
- **devneet-id/exura-dev#6** (open, draft) — adds `scenario/exuraphp-method-values`, the rule *findings go to issues* in AGENTS.md, and this file with WORKFLOW.md.
- **AnwarAchilles/exuracss#1** (open, draft, on the fork — wrong place) — a fix for the tint issue below, made before the issue rule. Close it, or move the change to a branch of devneet-id/exuracss when the issue is worked on.
- **devneet-id/lore#3** (open, draft) — `chronicle/exura/2611-anwarachilles_claude.md`, the log of this work.
- The session's network could not reach `cdn.jsdelivr.net`; `core/` was filled from the packages' `1.x` `dist/` to verify pages. On a normal machine `php exura` fetches from the CDN.

## Next

1. **File the 10 issues below** in their repositories (as written; adjust if the code changed).
2. Wait: the issues are worked on only when anwarachilles asks.
3. Then: fix → raise the version → release → `php exura setup --tags=<new>` → the scenarios turn ✓ (see WORKFLOW.md).

---

# Issues to file

One block per issue: repository, title, label, body. Each body names the exura-dev scenario that shows it.

## devneet-id/exuracss

### 1 · card="NAME:N": tint text is unreadable on light (and some dark) pages — `bug`

**Problem**
`card="NAME:N"` keeps one text color for all ten shades of a color (`src/module/card.css`). A tint is a transparent shade over the page, so the color behind the text changes with N and with light/dark mode; the text color does not.
- Light page: `primary`, `secondary`, `dark`, `black` 1–3 have white text on a near-white surface (contrast down to 1.0).
- Dark page: `default` 1–5 and `dark`/`black` 1–3 have dark text on a dark surface.

**See it** — devneet-id/exura-dev: `php cast scenario --name=exuracss-tint`, or `exploration/exuracss/color.html`.

**Expected** — every tint keeps readable text on both pages (the color balancing the README promises).

**Proposal** — pick the ink per tint and per page at build time from the WCAG contrast of the blended surface, kept as `--ink-NAME-N` in `:root` / `[dark]` / `[light]`. Lowest contrast over the palette 1.0 → 4.1, +0.6KB gzip. A draft of this approach: AnwarAchilles/exuracss#1.

### 2 · strong and em are always red (#dc3b3b) — `bug`

**Problem** — `src/base.css`: `strong, em { color: #dc3b3b; }`. Every `<strong>` and `<em>` is red — in cards, buttons, tables, light and dark — and the hex ignores the palette and dark mode.

**See it** — `php cast scenario --name=exuracss-dark-mode` (the `[light] inside [dark]` title), also the values in `exurajs-counter` and `exurajs-modules`.

**Expected** — `strong` is bold, `em` italic, both inherit the text color.

**Question** — was the red meant as a highlight? Then an opt-in attribute (e.g. `text="danger"`) instead of a default on every `strong`/`em`.

### 3 · `* { transition: all .05s }` animates every property of every element — `enhancement`

**Problem** — `src/base.css`: `* { transition: all .05s ease-in-out; }`.
- Layout properties (width, padding, margin) animate when the window resizes, `dark` toggles or exurajs re-renders.
- Computed styles read right after a change are in-between values.
- Work on every element of large pages; ignores `prefers-reduced-motion`.

**Expected** — transitions only where they help, only on the properties that change, none for reduced motion.

**Proposal**
```css
a, button, [button], input, select, textarea, [card] {
  transition: color .15s, background-color .15s, border-color .15s, box-shadow .15s;
}
@media (prefers-reduced-motion: reduce) {
  * { transition: none !important; animation: none !important; }
}
```

---

## devneet-id/exurajs

### 4 · `php cast build` gives a different dist/exura.js on Linux than on Windows — `bug`

**Problem** — the build cast collapses blank lines with `str_replace("\n\n", "\n", $source)`. On Windows (CRLF) the blank lines are `\r\n\r\n` and survive; on Linux/macOS they are removed. The same source gives two different `dist/exura.js` depending on the machine, so a rebuild on Linux shows a diff of ~56 removed lines with no real change.

**Expected** — the same `dist/` from the same `src/` on every OS.

**Proposal** — normalize line endings first (`str_replace("\r\n", "\n", $source)`), then collapse blank lines; or drop the collapse and let `--min` do the shrinking.

---

## devneet-id/exuraphp

All five are shown by devneet-id/exura-dev `php cast scenario --name=exuraphp-method-values` (red ✗ in the page).

### 5 · Exura::method('key') returns the default for a JSON null — `bug`

`return $getMethod[$key] ?? $fail;` — `??` treats a present `null` as missing. `{"done": null}` → `method('done', 'x')` gives `'x'`, so a client cannot clear a value with `null`.
**Proposal** — `array_key_exists($key, $getMethod) ? $getMethod[$key] : $fail`.

### 6 · Big JSON integers lose digits — `bug`

`json_decode($rawInput, true)` turns `12345678901234567890` into the float `1.2345678901235E+19`. IDs from other systems (Twitter-style, snowflakes, bank numbers) are silently changed.
**Proposal** — `json_decode($rawInput, true, 512, JSON_BIGINT_AS_STRING)`.

### 7 · Multipart fields of PUT / PATCH are not read — `bug`

PHP fills `$_POST` / `$_FILES` for POST only. For PUT/PATCH with `multipart/form-data`, `getMethod()` runs `parse_str()` on the raw multipart body and returns one odd key (`--------boundary…Content-Disposition:_form-data;_name`); the fields are lost.
**Proposal** — for non-POST multipart, parse the body by boundary (fields into `method()`, files into a `$_FILES`-like list), or document that uploads must be POST.

### 8 · A JSON body that is not an object, plus a query string → empty 500 (fatal) — `bug`

Body `42` (or `"text"`, `true`) with `Content-Type: application/json` is valid JSON, so `$method = 42`. With any query string, `array_merge($method, $_GET)` throws `TypeError` before the error handler is set, and the answer is an empty 500 — not JSON. Without a query string the route works.
**Proposal** — keep `$method` an array: `$decoded = json_decode(...); $method = is_array($decoded) ? $decoded : [];` (optionally expose the scalar as `method('_body')`).

### 9 · Broken JSON is read as a form instead of answering 400 — `bug`

`{"v": "broken"` with `Content-Type: application/json` fails `isJson()`, so the body goes through `parse_str()` and becomes the key `{"v":_"broken"`. The route runs with nonsense input.
**Proposal** — when the content type is JSON and decoding fails, answer `400` with `{"error": {"message": "invalid JSON body"}}`.

### 10 · Validation for Exura::method() — `enhancement`

`method()` only reads; every route validates by hand (type, required, format). Query and form values are always strings (`"42"`, `"false"`), so routes also cast by hand.
**Proposal** (one file, no dependency):
- a type in `method()`: `Exura::method('age', 0, 'int')` → cast, or `422` when it can not;
- or a rule set: `Exura::validate(['age' => 'int|required', 'email' => 'email', 'done' => 'bool'])` → the clean values, or `422` with the failing fields.
exura-dev would get a scenario to prove it.

---

## Not for these repos

- **devneet-id/rune** — `aether_exit()` ends every run with a bare `exit`, so a runite always exits 0 even when a cast fails (exura-dev's `cast` works around it with a shutdown function).

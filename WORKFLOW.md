# Workflow — how the Exura series is developed

Read this first, whether you are a human or an AI starting a new session. Then [AGENTS.md](AGENTS.md) (the laws of this repo) and, if it exists, [HANDOFF.md](HANDOFF.md) (where the last session stopped).

## The repositories and their roles

| Repository | Role | What happens there |
|---|---|---|
| **devneet-id/exura-dev** (this repo) | **testing ground** | explore and try the packages: `exploration/` and `scenario/`. No package code, no issues. |
| **devneet-id/exuracss** | main project | the CSS package: source, build, releases, **its issues** |
| **devneet-id/exurajs** | main project | the JavaScript package: source, build, releases, **its issues** |
| **devneet-id/exuraphp** | main project | the PHP package: source, build, releases, **its issues** |
| **devneet-id/lore** | organization laws | knowledge, laws and the chronicle of DEVNEET (`realms/exura/`, `chronicle/exura/`) |
| **devneet-id/exura** | umbrella | the intro and docs of the whole series |

Always use the **devneet-id** repositories. `AnwarAchilles/exuracss`, `exurajs` and `exuraphp` are forks; their issues are off and work opened there lands in the wrong place. Pick the devneet-id ones when you start a session.

## The cycle

```
1. explore      exura-dev: run the scenarios and exploration pages against the released files
      │
2. find         something is wrong or missing → a ✗ in a scenario, a broken page, an idea
      │
3. record       open an ISSUE in the package's own repo (exuracss / exurajs / exuraphp)
      │         — do not fix it yet, do not fix it in exura-dev
      │
4. wait         the issues are worked on only when it is asked for
      │
5. develop      in the package repo: fix the issue on a branch, PR, link the issue
      │
6. release      raise the version, build dist/, tag → `php exura` can fetch it
      │
7. prove        back in exura-dev: fetch the new tag; the scenario that showed the ✗ now shows ✓
```

### 1–2 · Explore (exura-dev)

```bash
composer install
php exura setup --dist=core/ --tags=1.1.0 --install
php exura css --part=clip
php cast exploration
php cast scenario
```

- `php exura` fetches the released files of the three packages into `core/` (a tag such as `1.1.0`, or a branch such as `1.x` for the latest).
- `php cast exploration` serves every component; `php cast scenario --name=…` serves one possibility.
- No tests: a scenario shows its own result. exurajs and exuraphp scenarios print ✓ / ✗ in the page; exuracss scenarios say what you should see.
- A new possibility to check → a new folder in `scenario/` (see [scenario/README.md](scenario/README.md)). That part is done here, directly.

### 3 · Record an issue (package repo)

One issue per finding, in the repository of the package that has the problem:

- **Title** — what is wrong, in one line.
- **Problem** — what happens, with the file of the package if known.
- **See it** — the scenario or exploration page in exura-dev that shows it (`php cast scenario --name=…`).
- **Expected** — what should happen.
- **Proposal** — how it could be fixed (optional, but helpful).
- Label `bug` or `enhancement`.

A finding about Rune (the tool beneath the runites) goes to devneet-id/rune, not to an Exura repo.

### 4–6 · Develop and release (package repo) — only when asked

1. A branch in the package repo; fix the issue in `src/`.
2. Build with the package's own runite: `php cast build --min=true` (exuracss also `php cast build-clip`).
3. Raise the version — it lives in the runite as `const VERSION`:
   - `php cast version --up` → patch (1.1.0 → 1.1.1), `--up=minor`, `--up=major`
   - then build again, so `{{ VERSION }}` in `dist/` follows.
4. PR that closes the issue (`Closes #N`); after merge, tag the release (e.g. `1.1.1`).

### 7 · Prove (exura-dev)

```bash
php exura setup --tags=1.1.1 --install
php cast scenario --name=<the scenario that showed it>
```

The ✗ turns ✓. If the scenario carried a note about the known issue (README *Known issues*), remove it.

## Habits

- **Branches and PRs** — work on a branch, push, open a draft PR; never push to `main` directly.
- **Chronicle** — after advancing work, log it in devneet-id/lore: `chronicle/exura/<YYMM>-<human>_claude.md` (an AI never writes in the human's file).
- **Laws** — respect the laws in devneet-id/lore and the Rune laws for the runites (`exura`, `cast`): shebang on line 1, keep the `#sentinel-*` markers.
- **Language** — code, docs, issues and commits in English; talk with the team in Indonesian.
- **Ask before** changing direction: a structure change, a new tool, closing someone else's work.

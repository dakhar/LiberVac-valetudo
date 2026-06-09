# Pulling updates from upstream Valetudo

This is a **fork** of [Hypfer/Valetudo](https://github.com/Hypfer/Valetudo) with a small,
well-defined delta kept on a dedicated **`libervac`** branch and rebased onto each new
upstream release. `master` mirrors upstream. This document is the playbook;
`./update-from-upstream.sh` automates it.

## Branch & remote layout

- `master`   — clean mirror of upstream (no local commits); tracks `upstream/master`.
- `libervac` — OUR delta; the working/build branch. `libervac = master + the commits below`.
- remote `upstream` → github.com/Hypfer/Valetudo (fetch only, never push).
- remote `origin`   → your private fork (push `libervac` here).

## Our delta (the commit stack on libervac)

Thematic commits on top of upstream — keep them **separate** (do not squash). Current list:
`git log --oneline master..libervac`. Today: remove ELIZA "AI Assistant" · PiP camera
overlay · V16 clean-record + sn8 fixes · i18n + full Russian · V16 Max Ultra identity ·
vacuum.local mDNS · configurable camera (toggle + URL) · docs.

**Cost profile:** everything except i18n rebases cleanly. The i18n commit is the
**permanent maintenance cost** — it touches almost every UI file on the lines upstream
edits most. Upstream is English-only **by design and won't accept i18n**, so it stays.

## One-time setup (already done in this clone)

```bash
# remotes already set: upstream=Hypfer (fetch), origin=your fork (push)
git config rerere.enabled true     # reuse recorded conflict resolutions — NEVER disable
# branches already set: master = upstream mirror, libervac = the delta
```

`rerere` ("reuse recorded resolution") remembers how you resolved a conflict on specific
lines and re-applies it next time — this is what makes the recurring i18n conflicts cheap.

## Update cycle (per upstream release)

Easiest: `./update-from-upstream.sh` (recon first with `--scan-only`, or pass a tag like
`./update-from-upstream.sh 2026.07.0`). Manually:

```bash
git fetch upstream --tags
git checkout master && git merge --ff-only upstream/master   # advance the mirror (or: reset --hard upstream/<tag>)
git checkout libervac && git rebase master                   # re-stack the delta; rerere helps
git push --force-with-lease origin libervac                  # publish to your fork (rebase => force)
```

Track **releases/tags**, not `master` HEAD — far less churn. On each conflict: resolve
(rerere may have pre-filled it — verify!), `git add <file>`, `git rebase --continue`.

## Post-rebase checklist (MANDATORY)

1. **Type-check** — catches half the i18n drift for free:
   ```bash
   bash _build_v16_full.sh   # (in the workspace root) runs npm install + ts-check + build
   ```
   The locale type is **inferred from `en.ts`** (`type Translations = typeof en`), and
   `ru.ts` is typed `Translations`. So **any new English key without a Russian
   translation is a compile error.** Add the missing `ru.ts` key and rebuild.

2. **Hand-wrap NEW English strings** — ts-check does **not** catch this. Upstream ships
   raw English JSX text (`<Typography>New Feature</Typography>`), never `t(...)`. After a
   bump, scan the upstream diff for added user-facing strings and wrap them:
   ```bash
   git diff <OLD_BASE>..upstream/master -- frontend/src \
     | grep -nE '^\+' | grep -E '>[A-Z][a-z].*<|primaryLabel|secondaryLabel|title=|"[A-Z][a-z].* '
   ```
   Then replace each `literal` with `t("ns.key")`, add the key to **both** `en.ts` and
   `ru.ts`, and wire `useTranslation()` if the component lacks it. See
   `frontend/src/i18n/` for namespaces and conventions.

3. **Quirks** — quirk titles/descriptions come from the backend in English; their
   Russian lives in `frontend/src/i18n/quirks.ts` keyed by quirk UUID (falls back to
   backend English). If upstream adds Midea quirks, add their UUIDs there.

4. **Rebuild + ship** — `_build_v16_full.sh` → collect the aarch64 binary → rebuild
   `bin/libervac.exe` (`build.ps1 -Valetudo <binary>`) → deploy.

## Gotchas

- **CRA build = ESLint warnings are errors.** New wrapped code commonly trips:
  - `operator-linebreak`: put ternary `?` / `:` at the **end** of the previous line, not
    the start.
  - `object-shorthand`: use longform `{capability: capability}`, not `{capability}`, in
    `t("k", { ... })` interpolation objects.
- **TypeScript is pinned to 4.8.4** (upstream freezes it). That forces **i18next 23 /
  react-i18next 14** (v24/v15 ship TS-5-only `.d.ts` that 4.8.4 can't parse). If a future
  upstream bumps TypeScript to 5.x, you may raise i18next back to 24 and drop the pin.
- **Russian plurals:** i18next needs `_one/_few/_many/_other`. Because the type is
  `typeof en`, en and ru must have **identical** plural keys — so define all four forms in
  `en.ts` too (English just reuses the same text for `_few/_many`).
- Big markdown help (`HelpText.ts`, `QuirksHelp.ts`) is **not** in the key system — each
  exports an English + a `*Ru` version, selected by `i18n.language`. Translate both on
  change.

## Why rebase, not merge

Rebase keeps our delta a clean stack that re-applies onto each upstream release, and lets
`rerere` reuse per-line resolutions. Merging would create tangled history with a new
conflict-resolution commit every release. **Always rebase.**

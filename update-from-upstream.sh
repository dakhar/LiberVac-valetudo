#!/usr/bin/env bash
#
# update-from-upstream.sh — rebase our fork's commit stack onto a new upstream Valetudo
# release. See UPSTREAM.md for the full playbook & rationale.
#
# Usage:
#   ./update-from-upstream.sh                # rebase onto upstream/master
#   ./update-from-upstream.sh 2026.07.0      # rebase onto a specific upstream tag
#   ./update-from-upstream.sh --scan-only    # just show what's new + new English strings, no rebase
#
# What it does:
#   1) fetches upstream (tags too)
#   2) prints incoming upstream commits and NEW user-facing English strings to translate
#   3) makes a backup branch, then rebases our stack onto the chosen upstream point
#   4) prints the mandatory post-rebase checklist
#
# Safe by design: refuses to run on a dirty tree, makes a backup branch first, and the
# rebase is abortable (git rebase --abort) — the backup branch is your escape hatch.
set -euo pipefail

UPSTREAM_REMOTE="upstream"
UPSTREAM_URL="https://github.com/Hypfer/Valetudo.git"
BRANCH="libervac"          # OUR delta branch (the one we rebase)
UPSTREAM_BRANCH="master"   # upstream's branch we rebase ONTO (or pass a tag as $1)

cd "$(dirname "$0")"

# --- args ---------------------------------------------------------------
SCAN_ONLY=0
TARGET=""
for a in "$@"; do
    case "$a" in
        --scan-only) SCAN_ONLY=1 ;;
        -h|--help)   sed -n '2,20p' "$0"; exit 0 ;;
        *)           TARGET="$a" ;;
    esac
done

# --- preconditions ------------------------------------------------------
if ! git rev-parse --git-dir >/dev/null 2>&1; then
    echo "ERROR: not a git repository" >&2; exit 1
fi
if ! git remote get-url "$UPSTREAM_REMOTE" >/dev/null 2>&1; then
    echo "Adding '$UPSTREAM_REMOTE' remote -> $UPSTREAM_URL"
    git remote add "$UPSTREAM_REMOTE" "$UPSTREAM_URL"
fi
git config rerere.enabled true   # reuse recorded conflict resolutions (idempotent)

CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
if [ "$CURRENT_BRANCH" != "$BRANCH" ]; then
    echo "ERROR: on branch '$CURRENT_BRANCH', expected '$BRANCH'. Checkout $BRANCH first." >&2
    exit 1
fi
if [ "$SCAN_ONLY" -eq 0 ] && [ -n "$(git status --porcelain)" ]; then
    echo "ERROR: working tree is dirty. Commit or stash before rebasing." >&2
    git status -s >&2
    exit 1
fi

# --- fetch --------------------------------------------------------------
echo "[fetch] $UPSTREAM_REMOTE ..."
git fetch "$UPSTREAM_REMOTE" --tags --prune

TARGET_REF="${TARGET:-$UPSTREAM_REMOTE/$UPSTREAM_BRANCH}"
# allow a bare tag like "2026.07.0"
if [ -n "$TARGET" ] && git rev-parse -q --verify "refs/tags/$TARGET" >/dev/null; then
    TARGET_REF="$TARGET"
fi
if ! git rev-parse -q --verify "$TARGET_REF^{commit}" >/dev/null; then
    echo "ERROR: cannot resolve target ref '$TARGET_REF'" >&2; exit 1
fi

# Old base = the upstream commit our stack currently sits on.
OLD_BASE="$(git merge-base "$BRANCH" "$TARGET_REF")"
TARGET_SHA="$(git rev-parse --short "$TARGET_REF")"

echo
echo "================================================================"
echo " current base : $(git rev-parse --short "$OLD_BASE")  $(git log -1 --format=%s "$OLD_BASE")"
echo " target       : $TARGET_REF ($TARGET_SHA)"
echo " our stack    :"
git log --oneline "$OLD_BASE..$BRANCH" | sed 's/^/   /'
echo "================================================================"

if [ "$OLD_BASE" = "$(git rev-parse "$TARGET_REF")" ]; then
    echo "Already up to date with $TARGET_REF. Nothing to do."
    exit 0
fi

echo
echo "[incoming] upstream commits ($OLD_BASE..$TARGET_REF):"
git log --oneline "$OLD_BASE..$TARGET_REF" | sed 's/^/   /' | head -60

echo
echo "[i18n] NEW user-facing English strings introduced upstream (hand-wrap these in t()):"
git diff "$OLD_BASE..$TARGET_REF" -- frontend/src \
    | grep -nE '^\+' \
    | grep -EI '>[A-Z][a-z].*<|primaryLabel|secondaryLabel|helperText|dialogTitle|placeholder=|title="[A-Z]' \
    | grep -vE 'import|//|t\(' \
    | sed 's/^/   /' | head -80 || true
echo "   (heuristic — review the full frontend diff too: git diff $OLD_BASE..$TARGET_REF -- frontend/src)"

if [ "$SCAN_ONLY" -eq 1 ]; then
    echo
    echo "--scan-only: not rebasing."
    exit 0
fi

# --- backup + rebase ----------------------------------------------------
BACKUP="backup/pre-rebase-$(date +%Y%m%d-%H%M%S)"
git branch "$BACKUP"
echo
echo "[backup] created branch '$BACKUP' (escape hatch: git reset --hard $BACKUP)"
echo "[rebase] git rebase --onto $TARGET_REF $OLD_BASE $BRANCH"
if git rebase --onto "$TARGET_REF" "$OLD_BASE" "$BRANCH"; then
    echo
    echo "✅ Rebase complete. Stack now sits on $TARGET_REF."
else
    cat <<EOF

⚠️  Rebase stopped on a conflict. Resolve it, then:
      git add <file>            # rerere may have pre-filled the resolution — verify it
      git rebase --continue
    Abort & restore at any time:
      git rebase --abort        # or: git reset --hard $BACKUP
EOF
    exit 1
fi

cat <<EOF

================= POST-REBASE CHECKLIST (see UPSTREAM.md) =================
 1) Build + type-check (catches new EN keys missing a RU translation):
       bash ../../_build_v16_full.sh        # workspace-root helper (WSL)
 2) Hand-wrap NEW upstream English strings listed above into t(); add keys
    to BOTH frontend/src/i18n/locales/en.ts and ru.ts.
 3) New Midea quirks? add their UUIDs to frontend/src/i18n/quirks.ts.
 4) Rebuild aarch64 binary -> rebuild bin/libervac.exe -> deploy.
 5) When happy: git push  (delete backup branch '$BACKUP' once verified).
==========================================================================
EOF

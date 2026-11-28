#!/usr/bin/env bash
# Packt die zuletzt committete Runde als ZIP: Einzelpatch, kumulativer Patch gegen origin/main, geänderte Dateien, Bilder.
# Aufruf: tools/art/zip_runde.sh <name> <bilderordner>   (Ausgabe: /mnt/session/outputs/<name>.zip)
set -euo pipefail
name="$1"; bilder="$2"
repo="$(git rev-parse --show-toplevel)"
tmp="$(mktemp -d)"
mkdir -p "$tmp/$name/dateien"
cd "$tmp/$name"
git -C "$repo" format-patch -1 --binary --stdout HEAD > "01-$name.patch"
git -C "$repo" diff --binary origin/main HEAD > 00-kumulativ_alle_runden_gegen_main.patch
for f in $(git -C "$repo" diff --name-only --diff-filter=AMR origin/main HEAD); do mkdir -p "dateien/$(dirname "$f")"; cp "$repo/$f" "dateien/$f"; done
cp -r "$repo/$bilder" bilder
python3 -c "import shutil,sys; shutil.make_archive('/mnt/session/outputs/' + sys.argv[1], 'zip', sys.argv[2], sys.argv[1])" "$name" "$tmp"
chk="$(mktemp -d)/chk"
git -C "$repo" worktree add --detach "$chk" origin/main -q
(cd "$chk" && git apply --check "$tmp/$name/00-kumulativ_alle_runden_gegen_main.patch" && echo "kumulativ-ok")
git -C "$repo" worktree remove --force "$chk"
ls -la "/mnt/session/outputs/$name.zip"

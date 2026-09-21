#!/usr/bin/env bash
# Runs the unit tests and the headless autoplay integration test.
# Usage: ./tests/run_all.sh [path-to-godot-binary]
set -u
GODOT="${1:-${GODOT:-godot}}"
cd "$(dirname "$0")/.."

filter() { grep -v -E 'Parameter "m" is null|mesh_storage\.h|^$'; }

echo "== import =="
"$GODOT" --headless --path . --import 2>&1 | filter | tail -3

echo "== unit tests =="
"$GODOT" --headless --path . res://tests/unit_tests.tscn 2>&1 | filter | tail -5
unit=${PIPESTATUS[0]}

status=0
[ "$unit" -eq 0 ] || status=1
for seed in 4 8; do
  echo "== autoplay seed $seed =="
  "$GODOT" --headless --path . -- --autoplay --seed="$seed" 2>&1 | filter | grep -E '^\[autoplay\]|SCRIPT ERROR|FAIL'
  [ "${PIPESTATUS[0]}" -eq 0 ] || status=1
done

if [ "$status" -eq 0 ]; then echo "ALL TESTS PASSED"; else echo "TESTS FAILED"; fi
exit "$status"

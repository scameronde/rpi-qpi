#!/usr/bin/env bash
#
# build-plugin.sh — Build the ORBIT Claude Code plugin into dist/orbit/.
#
# Source of truth is the project's .claude/ tree (plus the root .mcp.json).
# This script regenerates every *derivable* part of the plugin on each run:
#
#   .claude/agents/*.md          -> dist/orbit/agents/            (AGENTS.md excluded)
#   .claude/skills/**            -> dist/orbit/skills/            (AGENTS.md excluded)
#   .claude/hooks/session-start  -> dist/orbit/hooks-handlers/session-start
#   .claude/hooks/hooks.json     -> dist/orbit/hooks/hooks.json   (command path rewritten)
#   ./.mcp.json                  -> dist/orbit/.mcp.json
#
# Two files are hand-authored plugin assets with no counterpart in .claude/ and
# are therefore PRESERVED, never overwritten:
#
#   dist/orbit/.claude-plugin/plugin.json   (plugin manifest, incl. version)
#   dist/orbit/README.md                    (plugin-specific install docs)
#
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC="$ROOT/.claude"
OUT="$ROOT/dist/orbit"

log() { printf '  %s\n' "$*"; }

# --- preflight ---------------------------------------------------------------
[ -d "$SRC" ] || { echo "error: source tree not found: $SRC" >&2; exit 1; }
[ -f "$ROOT/.mcp.json" ] || { echo "error: root .mcp.json not found" >&2; exit 1; }
[ -f "$SRC/hooks/hooks.json" ] || { echo "error: $SRC/hooks/hooks.json not found" >&2; exit 1; }
[ -f "$SRC/hooks/session-start" ] || { echo "error: $SRC/hooks/session-start not found" >&2; exit 1; }

for asset in ".claude-plugin/plugin.json" "README.md"; do
  [ -f "$OUT/$asset" ] || echo "warning: hand-authored asset missing, not generated: $OUT/$asset" >&2
done

echo "Building ORBIT plugin -> dist/orbit/"

# --- clean generated content (preserve plugin.json + README.md) --------------
rm -rf "$OUT/agents" "$OUT/skills" "$OUT/hooks" "$OUT/hooks-handlers" "$OUT/.mcp.json"

# --- agents ------------------------------------------------------------------
mkdir -p "$OUT/agents"
cp -R "$SRC/agents/." "$OUT/agents/"
find "$OUT/agents" -name AGENTS.md -delete
log "agents/    ($(find "$OUT/agents" -type f | wc -l | tr -d ' ') files)"

# --- skills ------------------------------------------------------------------
mkdir -p "$OUT/skills"
cp -R "$SRC/skills/." "$OUT/skills/"
find "$OUT/skills" -name AGENTS.md -delete
log "skills/    ($(find "$OUT/skills" -mindepth 1 -maxdepth 1 -type d | wc -l | tr -d ' ') skills)"

# --- hook handler ------------------------------------------------------------
mkdir -p "$OUT/hooks-handlers"
cp "$SRC/hooks/session-start" "$OUT/hooks-handlers/session-start"
chmod +x "$OUT/hooks-handlers/session-start"
log "hooks-handlers/session-start"

# --- hooks.json (rewrite command path to plugin-relative) --------------------
mkdir -p "$OUT/hooks"
sed 's|\.claude/hooks/session-start|${CLAUDE_PLUGIN_ROOT}/hooks-handlers/session-start|g' \
  "$SRC/hooks/hooks.json" > "$OUT/hooks/hooks.json"
log "hooks/hooks.json"

# --- mcp config --------------------------------------------------------------
cp "$ROOT/.mcp.json" "$OUT/.mcp.json"
log ".mcp.json"

echo "Done."

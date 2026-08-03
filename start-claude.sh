#!/usr/bin/env bash
# Loads .env (MCP server URLs, API keys) into the environment, then execs
# claude. .mcp.json's ${VAR} placeholders only resolve from the process
# environment - Claude Code does not read .env itself.
set -euo pipefail

env_file=".env"

if [[ -f "$env_file" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$env_file"
  set +a
else
  echo "warning: $env_file not found - MCP servers needing env vars will fail to connect" >&2
fi

exec claude "$@"

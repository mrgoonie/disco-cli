# Agentize Decisions — disco-cli

Date: 2026-05-02
Mode: `--cli --auto`

## Output

CLI only. No MCP per user. Single-package repo with `src/core/` + `src/cli/` adapter shape so MCP can be added later.

## Stack

- TypeScript 5.x, ESM (`"type": "module"`)
- Node ≥ 18 (Discord.js v14 needs ≥ 16.11; v18 LTS chosen for fetch + stable AbortSignal)
- pnpm workspaces (single package today, easy split later)
- commander 12 for argv parsing
- discord.js 14
- vitest for tests
- tsx for dev runner, tsup for build

## Auth

`DISCORD_BOT_TOKEN` resolution chain (first hit wins):
1. `--token <v>` flag (never logged)
2. `DISCORD_BOT_TOKEN` env
3. `.env.local` → `.env` (CWD)
4. User config: `%APPDATA%\disco-cli\config.json` (Windows) / `~/.config/disco-cli/config.json` (XDG)
5. Project config: `./.discorc.json`

`login` writes to user config. Secrets redacted in logs and `doctor` output.

## Commands

Verb-noun, kebab-case for multi-word. Subcommand groups by Discord.js manager:

- meta: login, logout, whoami, doctor, config, listen
- guild, channel, message, member, role, thread, webhook, invite, emoji, sticker, command, event, automod

All commands support `--json` and `--guild <id>` (where relevant). Mutating commands support `--yes` to skip confirmation.

## Exit codes

0 ok | 1 user error | 2 auth | 3 network/Discord API | 4 runtime

## Out of scope v1

Voice, sharding, OAuth2 user flow, component builder UI.

## Unresolved

None — proceeding with scaffold.

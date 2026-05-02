---
name: Discord Bot Management CLI
slug: discord-cli
created: 2026-05-02
status: in-progress
mode: --cli --auto
stack: TypeScript + pnpm + commander + discord.js v14
---

# Discord CLI — Bot Management

Bot management CLI built on Discord.js v14. Auth via `DISCORD_BOT_TOKEN`. Goal: comprehensive coverage of Discord.js v14 manager surfaces in agent-friendly + script-friendly form.

## Phases

| # | Phase                  | Status      | File                                |
|---|------------------------|-------------|-------------------------------------|
| 0 | Track                  | done        | this file                           |
| 1 | Research / Scout       | done        | reports/researcher-260502-1351-discordjs-v14-surface.md |
| 2 | Decide                 | done        | reports/agentize-decisions-discord-cli.md |
| 3 | Scaffold               | done        | phase-03-scaffold.md                |
| 4 | Wrap (core + CLI)      | done        | phase-04-wrap.md                    |
| 5 | Harden (tests + CI)    | done        | phase-05-harden.md                  |
| 6 | Docs                   | done        | phase-06-docs.md                    |
| 7 | Package                | done        | phase-07-package.md                 |

## Key decisions

- **Output mode**: `--cli` only (no MCP per user)
- **Language**: TypeScript, ESM, Node ≥ 18
- **Pkg mgr**: pnpm
- **CLI framework**: commander
- **Auth**: `DISCORD_BOT_TOKEN` (env / `.env` / config / flag); never via interactive Discord OAuth
- **Output**: human-readable by default, `--json` everywhere
- **Architecture**: `src/core/` (Discord.js wrappers, no CLI concerns) → `src/cli/` (commander adapters)

## Command surface (v1)

Auth/meta: `login`, `logout`, `whoami`, `doctor`, `config`, `listen`
Guilds: `guild list|info|leave|edit`
Channels: `channel list|info|create|edit|delete`
Messages: `message send|edit|delete|list|react|pin|unpin`
Members: `member list|info|kick|ban|unban|timeout|set-nickname`
Roles: `role list|create|edit|delete|assign|remove`
Threads: `thread create|list|archive|join|leave`
Webhooks: `webhook list|create|delete|send`
Invites: `invite list|create|delete`
Emojis: `emoji list|create|delete`
Stickers: `sticker list|create|delete`
App commands: `command register|list|delete|sync`
Scheduled events: `event list|create|delete`
AutoMod: `automod list|create|delete`

## Out of scope v1

- Voice/stage (audio pipeline complex for CLI)
- Sharding management
- Full OAuth2 user-token flow
- Message components builder (use raw JSON input)

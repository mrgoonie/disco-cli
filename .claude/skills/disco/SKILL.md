---
name: disco
description: Operate disco CLI for Discord bot management. Use whenever the user asks to use disco or manage Discord guilds, channels, messages, members, roles, webhooks, slash commands, events, or automod through disco.
license: MIT
---

# disco CLI Operator

## Scope

This skill handles operating `disco`, the `@mrgoonie/disco-cli` Discord bot management CLI, for agent-safe guild administration, messaging, moderation, roles, webhooks, slash commands, gateway listening, scheduled events, and AutoMod work.

This skill does NOT handle building custom Discord bots, implementing raw Discord API clients, bypassing Discord permissions/rate limits, or modifying `disco-cli` source unless the user explicitly asks for code changes.

## Security Policy

1. Never print or expose Discord bot tokens, webhook tokens, `.env`, `.env.local`, or config JSON secrets.
2. Prefer `disco doctor --json`, `disco config get --json`, and redacted outputs for diagnostics.
3. Ask before destructive operations: delete channel/message/role/webhook/invite/emoji/sticker/event/automod rule, guild leave, kick, ban, timeout, unban, bulk command sync.
4. Use `--json` for agent parsing and quote all user-generated text.
5. Do not work around Discord permission, hierarchy, intent, or rate-limit failures.

## Fast Workflow

1. Establish execution mode.
   - In this repo: `pnpm exec tsx src/cli/main.ts <args>` when using global flags such as `--json`; `pnpm dev -- <command>` is fine for simple subcommands.
   - Installed package: `disco <command>`.
   - One-off package: `pnpm dlx @mrgoonie/disco-cli <command>`.
2. Check auth and environment first: `disco doctor --json`, then `disco whoami --json`.
3. Discover current IDs before mutation: list guilds, channels, roles, members, or messages.
4. Run the requested command with `--json` unless human output is explicitly requested.
5. Validate results by reading back the changed resource.
6. Report command, result summary, and unresolved questions. Do not include secrets.

## Reference Routing

- Load `references/onboarding-and-auth.md` for setup, token resolution, local-vs-installed execution, and first checks.
- Load `references/command-manual.md` for command syntax and command groups.
- Load `references/common-workflows.md` for practical task recipes.
- Load `references/best-practices-and-safety.md` before destructive or permission-sensitive work.
- Load `references/troubleshooting.md` when commands fail, output is unexpected, or Discord rejects the action.

## Command Selection

1. Inventory: `guild list`, `guild info`, `channel list`, `role list`, `member list`, `message list`, `invite list`.
2. Communication: `message send/edit/delete/react/pin/unpin`, `webhook send`.
3. Moderation: `member info/kick/ban/unban/timeout/set-nickname/ban-list`, `automod list/create/delete`.
4. Structure: `channel create/edit/delete`, `role create/edit/delete/assign/remove`, `thread create/list/archive/unarchive/join/leave`.
5. App surface: `command list/register/delete/sync`, `event list/create/delete`.
6. Media/community assets: `emoji list/create/delete`, `sticker list/create/delete`.
7. Live diagnostics: `listen --events ...` streams JSON lines until interrupted.

## Output Contract

When completing a disco task, respond with:

- Commands run, with secrets omitted.
- Resource IDs affected.
- Read-back verification performed.
- Exit code or error code if failed.
- Unresolved questions at the end, if any.

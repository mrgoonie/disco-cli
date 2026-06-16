# Onboarding And Auth

## Execution Modes

- In this source repo, run commands through `pnpm exec tsx src/cli/main.ts <args>` when global flags are needed.
- `pnpm dev -- <command>` works for simple subcommands, but it inserts an argv separator that can prevent global flags from applying.
- For an installed CLI, run `disco <args>`.
- For one-off execution, run `pnpm dlx @mrgoonie/disco-cli <args>`.
- Requirements: Node.js 18.17 or newer. The repo uses pnpm.

## First Checks

1. Verify the CLI starts:
   ```bash
   disco --help
   disco doctor --json
   ```
2. Verify token identity:
   ```bash
   disco whoami --json
   ```
3. If working from source:
   ```bash
   pnpm install
   pnpm exec tsx src/cli/main.ts doctor --json
   pnpm exec tsx src/cli/main.ts whoami --json
   ```

## Token Resolution

Current source resolution order:

1. `--token <value>` global flag.
2. `DISCORD_BOT_TOKEN` environment variable.
3. `.env.local` or `.env` in current working directory.
4. Project config: `./.discorc.json`.
5. User config: `%APPDATA%/disco-cli/config.json` on Windows or `~/.config/disco-cli/config.json` on XDG systems.

Use `disco doctor --json` to see the resolved source and redacted token preview.

## Login And Config

```bash
disco login
printf '%s\n' "$DISCORD_BOT_TOKEN" | disco login --application-id <id> --default-guild-id <guildId>
disco logout
disco config get --json
disco config set defaultGuildId <guildId>
disco config set applicationId <applicationId>
```

Prefer stdin or a secret manager pipe for token login. Avoid token argv because shell history, process inspection, and agent logs can leak it. Never paste real tokens into reports. `login` stores user config with mode `0600`.

## Bot Setup Requirements

- Bot must be invited to the target guild.
- Enable privileged intents in the Discord Developer Portal when needed: members, message content, moderation, AutoMod.
- Bot role must be above roles it manages.
- Channel overwrites can still deny actions even when guild permissions look correct.

## Agent Defaults

- Add `--json` to every command unless user asks for human output.
- Pipe JSON output through a structured parser when doing follow-up actions.
- Prefer read-only commands before writes.
- Store discovered IDs in notes, not token values.

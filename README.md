# disco-cli

Discord bot management CLI built on **discord.js v14**.

Designed for both humans (clean, scriptable output) and AI agents (`--json` everywhere, structured errors with hints).

## Install

```bash
pnpm add -g @mrgoonie/disco-cli
# or run without installing
pnpm dlx @mrgoonie/disco-cli --help
```

Requirements: Node ≥ 18.17.

## Quick start

```bash
# 1. authenticate (token saved to user config under 0o600)
disco login YOUR_BOT_TOKEN
disco whoami

# 2. talk to your guild
disco guild list
disco channel list <guildId>
disco message send <channelId> --content "Hello, world"

# 3. moderate
disco member ban <guildId> <userId> --reason "spam"
disco member timeout <guildId> <userId> 30m
disco automod list <guildId>

# 4. tap the gateway
disco listen --events messageCreate,guildMemberAdd
```

## Auth resolution

First match wins:

1. `--token <v>` flag
2. `DISCORD_BOT_TOKEN` env
3. `.env.local` → `.env` in CWD
4. User config: `%APPDATA%\disco-cli\config.json` (Windows) / `~/.config/disco-cli/config.json` (XDG)
5. Project config: `./.discorc.json`

Tokens are never logged. `disco doctor` shows which layer resolved the token.

## Output

- Human-readable by default
- `--json` on any command for machine output
- Honors `NO_COLOR` and `--no-color`
- Stable exit codes:
  - `0` ok
  - `1` user error / not found / permission denied
  - `2` auth missing / invalid
  - `3` Discord API / rate limited
  - `4` runtime

## Command surface

| Group     | Commands                                                                                |
|-----------|-----------------------------------------------------------------------------------------|
| Auth      | `login`, `logout`, `whoami`, `doctor`, `config get\|set`                                |
| Listen    | `listen`                                                                                |
| Guild     | `guild list\|info\|leave\|edit`                                                         |
| Channel   | `channel list\|info\|create\|edit\|delete`                                              |
| Message   | `message send\|edit\|delete\|list\|react\|pin\|unpin`                                   |
| Member    | `member list\|info\|kick\|ban\|unban\|timeout\|set-nickname\|ban-list`                  |
| Role      | `role list\|create\|edit\|delete\|assign\|remove`                                       |
| Thread    | `thread create\|list\|archive\|unarchive\|join\|leave`                                  |
| Webhook   | `webhook list\|create\|delete\|send`                                                    |
| Invite    | `invite list\|create\|delete`                                                           |
| Emoji     | `emoji list\|create\|delete`                                                            |
| Sticker   | `sticker list\|create\|delete`                                                          |
| Commands  | `command list\|register\|delete\|sync` (application/slash)                              |
| Events    | `event list\|create\|delete` (guild scheduled events)                                   |
| AutoMod   | `automod list\|create\|delete`                                                          |

Run `disco <group> --help` for full flags.

## Use as a library

```ts
import { withClient, guilds, messages } from "@mrgoonie/disco-cli";

await withClient(process.env.DISCORD_BOT_TOKEN!, async (client) => {
  const list = await guilds.listGuilds(client);
  console.log(list);
  await messages.sendMessage(client, { channelId: "123", content: "hi" });
});
```

## Development

```bash
pnpm install
pnpm dev -- whoami      # run CLI from source
pnpm test
pnpm typecheck
pnpm build
```

## License

MIT

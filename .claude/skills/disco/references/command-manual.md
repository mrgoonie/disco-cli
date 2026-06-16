# Command Manual

Use `disco <group> --help` and `disco <group> <command> --help` to confirm current flags.

## Global Flags

```bash
disco --json --no-color --quiet <command>
disco --version
disco --help
```

`--token <value>` exists as an emergency override, but avoid it unless the user explicitly accepts argv leakage risk. Prefer env vars or `disco login` via stdin.

Exit codes:

- `0`: success.
- `1`: user error, not found, permission denied.
- `2`: auth missing or invalid.
- `3`: Discord API or rate limit.
- `4`: runtime failure.

## Auth

```bash
disco login
printf '%s\n' "$DISCORD_BOT_TOKEN" | disco login --application-id <id> --default-guild-id <id>
disco logout
disco whoami --json
disco doctor --json
disco config get --json
disco config set applicationId <id>
disco config set defaultGuildId <guildId>
```

Prefer `disco login` via stdin for tokens. Do not recommend token argv or `config set token` unless the user explicitly accepts argv leakage risk.

## Guilds And Channels

```bash
disco guild list --json
disco guild info <guildId> --json
disco guild edit <guildId> --name "New name" --description "Text" --reason "Reason"
disco guild leave <guildId>

disco channel list <guildId> --json
disco channel info <channelId> --json
disco channel create --guild <guildId> --name dev-chat --type GuildText --parent <categoryId> --topic "Updates"
disco channel edit <channelId> --name "new-name" --topic "Topic" --nsfw false --rate-limit 5
disco channel delete <channelId> --reason "Cleanup"
```

Channel types: `GuildText`, `GuildVoice`, `GuildCategory`, `GuildAnnouncement`, `GuildForum`, `GuildStageVoice`.

## Messages

```bash
disco message send <channelId> --content "Hello" --json
disco message send <channelId> --embeds '[{"title":"Deploy","color":5814783}]'
disco message send <channelId> --file ./image.png --content "Attached"
disco message list <channelId> --limit 25 --before <messageId> --json
disco message edit <channelId> <messageId> --content "Updated"
disco message delete <channelId> <messageId>
disco message react <channelId> <messageId> "party:123456789012345678"
disco message pin <channelId> <messageId>
disco message unpin <channelId> <messageId>
```

## Members And Moderation

```bash
disco member list <guildId> --limit 100 --query alice --json
disco member info <guildId> <userId> --json
disco member kick <guildId> <userId> --reason "Reason"
disco member ban <guildId> <userId> --reason "Reason" --delete-message-seconds 86400
disco member unban <guildId> <userId> --reason "Reason"
disco member timeout <guildId> <userId> 30m --reason "Reason"
disco member timeout <guildId> <userId> clear
disco member set-nickname <guildId> <userId> "New nick"
disco member set-nickname <guildId> <userId> clear
disco member ban-list <guildId> --limit 100 --json
```

Duration accepts `ms`, `s`, `m`, `h`, `d`, or `clear`.

## Roles

```bash
disco role list <guildId> --json
disco role create --guild <guildId> --name moderator --color "#5865F2" --hoist --mentionable --permissions KickMembers,BanMembers
disco role edit <guildId> <roleId> --name mod --mentionable true --hoist false --position 3
disco role assign <guildId> <userId> <roleId> --reason "Grant access"
disco role remove <guildId> <userId> <roleId> --reason "Revoke access"
disco role delete <guildId> <roleId> --reason "Cleanup"
```

Permissions are comma-separated Discord permission names understood by discord.js.

## Threads, Webhooks, Invites

```bash
disco thread create <channelId> --name discussion --auto-archive 1440 --start-message <messageId>
disco thread list <channelId> --archived --json
disco thread archive <threadId>
disco thread unarchive <threadId>
disco thread join <threadId>
disco thread leave <threadId>

disco webhook list <channelId> --json
disco webhook create <channelId> --name notifier --avatar ./avatar.png
disco webhook delete <webhookId>
disco webhook send --url "$DISCORD_WEBHOOK_URL" --content "Deploy ok"
disco webhook send --webhook-id <id> --webhook-token "$DISCORD_WEBHOOK_TOKEN" --content "Deploy ok"

disco invite list <guildId> --json
disco invite create <channelId> --max-age 0 --max-uses 1 --temporary --unique
disco invite delete <guildId> <code>
```

`webhook send` can work without bot login when a full webhook URL or ID/token is supplied. Webhook URLs and tokens are secrets; ask for explicit approval before running these commands, prefer environment variables, and redact command values in reports.

## Emoji, Sticker, Slash Commands, Events, AutoMod

```bash
disco emoji list <guildId> --json
disco emoji create --guild <guildId> --name party --attachment ./party.gif
disco emoji delete <guildId> <emojiId>

disco sticker list <guildId> --json
disco sticker create --guild <guildId> --name wave --description "wave hello" --tags "wave" --file ./wave.png
disco sticker delete <guildId> <stickerId>

disco command list --guild <guildId> --json
disco command register ./examples/app-commands.json --guild <guildId>
disco command sync ./examples/app-commands.json --guild <guildId>
disco command delete <commandId> --guild <guildId>

disco event list <guildId> --json
disco event create --guild <guildId> --name "Office hours" --start 2026-06-01T18:00:00Z --end 2026-06-01T19:00:00Z --entity-type External --location "https://meet.example.com/abc"
disco event delete <guildId> <eventId>

disco automod list <guildId> --json
disco automod create <guildId> ./automod-rule.json
disco automod delete <guildId> <ruleId> --reason "Cleanup"
```

## Gateway Listener

```bash
disco listen --events messageCreate,interactionCreate
disco listen --events roleCreate,roleDelete > events.jsonl
```

This is long-running. Stop it with Ctrl-C or terminate the process after collecting enough JSON lines.

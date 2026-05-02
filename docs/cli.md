# disco CLI reference

`disco --help` prints the full tree. This page complements that with examples.

## Global flags

| Flag | Effect |
|------|--------|
| `--token <v>` | Use provided token instead of env / config |
| `--json` | Emit JSON to stdout |
| `--no-color` | Disable ANSI colors |
| `--quiet` | Suppress informational lines |
| `--version` | Print version |
| `--help` | Print help for any command |

## Auth

```bash
disco login YOUR_BOT_TOKEN
disco login           # reads token from stdin
disco logout
disco whoami
disco doctor          # diagnostics: config layer, env, paths
disco config get
disco config set defaultGuildId 1234567890
```

## Listen

Streams gateway events as JSON lines.

```bash
disco listen
disco listen --events messageCreate,interactionCreate > events.jsonl
```

## Guild

```bash
disco guild list
disco guild info <guildId>
disco guild edit <guildId> --name "New Name"
disco guild leave <guildId>
```

## Channel

```bash
disco channel list <guildId>
disco channel info <channelId>
disco channel create --guild <id> --name dev-chat --type GuildText
disco channel edit <channelId> --topic "Project updates"
disco channel delete <channelId>
```

Channel types: `GuildText`, `GuildVoice`, `GuildCategory`, `GuildAnnouncement`, `GuildForum`, `GuildStageVoice`.

## Message

```bash
disco message send <channelId> --content "Hi"
disco message send <channelId> --embeds '[{"title":"Hi","color":5814783}]'
disco message send <channelId> --file ./image.png
disco message list <channelId> --limit 25
disco message edit <channelId> <messageId> --content "(edited)"
disco message delete <channelId> <messageId>
disco message react <channelId> <messageId> '👍'
disco message pin <channelId> <messageId>
```

## Member / moderation

```bash
disco member list <guildId> --query alice
disco member info <guildId> <userId>
disco member kick <guildId> <userId> --reason "spam"
disco member ban <guildId> <userId> --delete-message-seconds 86400
disco member unban <guildId> <userId>
disco member timeout <guildId> <userId> 30m
disco member timeout <guildId> <userId> clear
disco member set-nickname <guildId> <userId> "Alice (admin)"
disco member ban-list <guildId>
```

## Role

```bash
disco role list <guildId>
disco role create --guild <id> --name moderator --color "#5865F2" --hoist --permissions KickMembers,BanMembers
disco role edit <guildId> <roleId> --mentionable true
disco role assign <guildId> <userId> <roleId>
disco role remove <guildId> <userId> <roleId>
disco role delete <guildId> <roleId>
```

## Thread

```bash
disco thread create <channelId> --name discussion
disco thread list <channelId> --archived
disco thread archive <threadId>
disco thread join <threadId>
```

## Webhook

```bash
disco webhook list <channelId>
disco webhook create <channelId> --name notifier
disco webhook delete <webhookId>

# send via webhook URL — no bot login needed
disco webhook send --url https://discord.com/api/webhooks/.../... --content "deploy ok"
```

## Invite

```bash
disco invite list <guildId>
disco invite create <channelId> --max-age 0 --max-uses 1 --unique
disco invite delete <guildId> <code>
```

## Emoji & sticker

```bash
disco emoji list <guildId>
disco emoji create --guild <id> --name party --attachment ./party.gif
disco emoji delete <guildId> <emojiId>

disco sticker list <guildId>
disco sticker create --guild <id> --name wave --description "wave hello" --tags "👋" --file ./wave.png
disco sticker delete <guildId> <stickerId>
```

## Application (slash) commands

```bash
disco command list
disco command list --guild <id>
disco command register ./examples/app-commands.json --guild <id>
disco command sync ./examples/app-commands.json --guild <id>
disco command delete <commandId> --guild <id>
```

## Scheduled events

```bash
disco event list <guildId>
disco event create --guild <id> --name "Office hours" \
  --start 2026-06-01T18:00:00Z --end 2026-06-01T19:00:00Z \
  --entity-type External --location "https://meet.example.com/abc"
disco event delete <guildId> <eventId>
```

## AutoMod

```bash
disco automod list <guildId>
disco automod create <guildId> ./automod-keyword.json
disco automod delete <guildId> <ruleId>
```

## Exit codes

| Code | Meaning |
|------|---------|
| 0 | success |
| 1 | user error / not found / permission denied |
| 2 | auth missing or invalid |
| 3 | Discord API / rate limited |
| 4 | runtime |

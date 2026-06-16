# Common Workflows

## Safe Guild Inventory

1. Check auth:
   ```bash
   disco doctor --json
   disco whoami --json
   ```
2. List guilds and choose target:
   ```bash
   disco guild list --json
   disco guild info <guildId> --json
   ```
3. Inventory objects:
   ```bash
   disco channel list <guildId> --json
   disco role list <guildId> --json
   disco member list <guildId> --limit 100 --json
   disco invite list <guildId> --json
   disco automod list <guildId> --json
   ```

## Send A Message

1. Resolve guild and channel:
   ```bash
   disco channel list <guildId> --json
   ```
2. Send:
   ```bash
   disco message send <channelId> --content "Text" --json
   ```
3. Verify:
   ```bash
   disco message list <channelId> --limit 5 --json
   ```

## Create And Assign A Role

1. Read current roles and member:
   ```bash
   disco role list <guildId> --json
   disco member info <guildId> <userId> --json
   ```
2. Create role:
   ```bash
   disco role create --guild <guildId> --name "Support" --color "#5865F2" --permissions ViewChannel,SendMessages --json
   ```
3. Assign role:
   ```bash
   disco role assign <guildId> <userId> <roleId> --reason "Grant support access" --json
   ```
4. Verify member roles:
   ```bash
   disco member info <guildId> <userId> --json
   ```

## Moderate A User

1. Confirm target:
   ```bash
   disco member info <guildId> <userId> --json
   ```
2. Choose the least destructive action and ask the user to confirm the exact guild ID, user ID, action, duration, and reason before running it:
   ```bash
   disco member timeout <guildId> <userId> 30m --reason "Policy violation" --json
   disco member kick <guildId> <userId> --reason "Policy violation" --json
   disco member ban <guildId> <userId> --reason "Severe violation" --delete-message-seconds 86400 --json
   ```
3. Verify:
   ```bash
   disco member info <guildId> <userId> --json
   disco member ban-list <guildId> --json
   ```

## Register Slash Commands

1. Prefer guild-scoped registration for testing because it propagates quickly:
   ```bash
   disco command register ./examples/app-commands.json --guild <guildId> --json
   disco command list --guild <guildId> --json
   ```
2. Use `sync` only when replacing the full set:
   ```bash
   disco command sync ./examples/app-commands.json --guild <guildId> --json
   ```
3. Omit `--guild` only when intentionally changing global commands.

## Send A Webhook Notification

Prefer `disco message send` with bot auth when possible. Use webhook sends only when a webhook URL/token is available, bot login is not needed, and the user has approved passing a webhook secret to the CLI:

```bash
disco webhook send --url "$DISCORD_WEBHOOK_URL" --content "Deploy complete" --json
```

For bot-managed webhooks:

```bash
disco webhook list <channelId> --json
disco webhook create <channelId> --name notifier --json
disco webhook send --webhook-id <id> --webhook-token "$DISCORD_WEBHOOK_TOKEN" --content "Deploy complete" --json
```

Do not print webhook token values. In reports, write `$DISCORD_WEBHOOK_URL` or `$DISCORD_WEBHOOK_TOKEN`, not resolved secret values.

## Watch Live Events

1. Start a focused listener:
   ```bash
   disco listen --events messageCreate,guildMemberAdd,interactionCreate
   ```
2. Capture JSON lines for a bounded period.
3. Stop the process after enough evidence is collected.
4. Summarize events, not raw sensitive message content, unless user needs exact content.

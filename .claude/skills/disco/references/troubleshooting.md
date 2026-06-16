# Troubleshooting

## Triage Order

1. Re-run with `--json` for structured error output.
2. Run `disco doctor --json`.
3. Run `disco whoami --json`.
4. Check the exit code and error code.
5. Verify bot guild membership, permissions, role hierarchy, channel overwrites, and intents.
6. Retry only when the error is rate-limited or transient.

## Exit Codes And Recovery

- `2` auth missing or invalid:
  - Run `disco doctor --json`.
  - Set `DISCORD_BOT_TOKEN` or run `disco login` via stdin. Use `--token` only when the user explicitly accepts argv leakage risk.
  - For rejected tokens, create a fresh bot token in Discord Developer Portal.
- `1` invalid input, not found, or permission denied:
  - Re-check IDs with list/info commands.
  - Check bot permissions, channel overwrites, and role hierarchy.
- `3` Discord API or rate limited:
  - Read the error hint.
  - Wait before retrying rate-limited operations.
- `4` runtime:
  - Verify Node.js version, package install, and local build.

## Common Errors

### No token resolved

```bash
disco doctor --json
printf '%s\n' "$DISCORD_BOT_TOKEN" | disco login
disco whoami --json
```

If env vars are set, remember they outrank project and user config.

### Bot not in guild

Run:

```bash
disco guild list --json
```

If missing, invite the bot with required scopes and permissions.

### Permission denied

Check:

- Bot role has required permission.
- Bot role is above target role/member.
- Channel overwrite allows the action.
- User is not guild owner for moderation actions.

### Role assignment failed

Run:

```bash
disco role list <guildId> --json
disco member info <guildId> <userId> --json
```

Then verify bot hierarchy. Discord forbids assigning roles at or above the bot's highest role.

### Bad JSON for embeds, components, commands, or AutoMod

- Validate JSON before running:
  ```bash
  node -e 'JSON.parse(process.argv[1])' '<json>'
  ```
- Prefer file-based command inputs for slash commands and AutoMod.

### Gateway listen has sparse events

- Confirm event names.
- Enable relevant privileged intents.
- Confirm the bot is in the guild and can see the channel/member events.
- Use focused events to reduce noise:
  ```bash
  disco listen --events messageCreate,interactionCreate
  ```

### Slash command did not appear

- Guild-scoped commands propagate faster:
  ```bash
  disco command register ./commands.json --guild <guildId>
  disco command list --guild <guildId> --json
  ```
- Global commands can take longer. Do not repeatedly sync unless needed.

### Webhook send fails

- Full webhook URL must include ID and token.
- If using split flags, pass both `--webhook-id` and `--webhook-token`.
- Do not redact the token before passing it to the command; redact only reports.

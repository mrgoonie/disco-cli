# Best Practices And Safety

## Before Any Write

1. Confirm the target guild, channel, member, role, command, event, or rule by ID.
2. Run a read-only command first and keep the relevant IDs.
3. Ask user confirmation for destructive or high-impact actions.
4. Include `--reason` for audit-log visible moderation and management actions.
5. Use `--json` and parse the response before follow-up mutations.

## High-Impact Commands

Always confirm intent before these:

- `guild leave`
- `channel delete`
- `message delete`
- `member kick`, `member ban`, `member unban`, `member timeout`
- `role delete`, `role assign`, `role remove` when broad permissions are involved
- `webhook delete`
- `invite delete`
- `emoji delete`, `sticker delete`
- `command sync`, `command delete`
- `event delete`
- `automod create`, `automod delete`

## Discord Permission Rules

- The bot needs guild permissions and channel overwrites must allow the action.
- Role edits/assignment require bot role hierarchy above the target role.
- Moderation actions require the bot to outrank the target member.
- Some reads require privileged intents enabled in the Developer Portal.
- Global slash command changes may take longer to propagate than guild commands.

## Data Hygiene

- Never log bot tokens or webhook tokens.
- Do not read `.env`, `.env.local`, or config JSON unless needed and approved.
- Prefer `doctor` and `config get`; both redact tokens.
- Keep command output summaries tight when messages contain user content.
- Store temporary JSON outputs outside git or delete before commit.

## JSON And Shell Safety

- Wrap JSON arguments in single quotes in POSIX shells:
  ```bash
  disco message send <channelId> --embeds '[{"title":"Hi"}]'
  ```
- Put complex JSON in files when possible, then use command file arguments.
- Quote names, reasons, content, and paths.
- Use environment variables for webhook URLs and tokens; do not echo them.

## Verification

After a write, verify with the closest read command:

- Message write: `message list --limit <n>`.
- Channel write: `channel info` or `channel list`.
- Role write: `role list` plus `member info` for assignments.
- Moderation: `member info` or `ban-list`.
- Webhook/invite/emoji/sticker/event/automod: corresponding `list`.
- Slash commands: `command list --guild <guildId>` or global `command list`.

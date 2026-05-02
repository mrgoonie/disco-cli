// `disco message ...` subcommands.

import { Command } from "commander";
import { runWithClient } from "../run.js";
import * as messages from "../../core/messages.js";

export function registerMessageCommands(root: Command): void {
  const cmd = root.command("message").description("Send / list / edit / delete / react messages");

  cmd
    .command("send")
    .description("Send a message to a channel")
    .argument("<channelId>")
    .option("--content <text>")
    .option("--embeds <json>", "Embed array as JSON string")
    .option("--components <json>", "Components array as JSON string")
    .option("--file <path...>", "Attach files (repeatable)")
    .option("--reply-to <id>", "Reply to a message ID")
    .option("--tts")
    .action(async (channelId: string, opts) => {
      await runWithClient((c) =>
        messages.sendMessage(c, {
          channelId,
          content: opts.content,
          embedsJson: opts.embeds,
          componentsJson: opts.components,
          filePaths: opts.file,
          replyToId: opts.replyTo,
          tts: opts.tts,
        }),
      );
    });

  cmd
    .command("edit")
    .description("Edit a previously-sent message (must be authored by the bot)")
    .argument("<channelId>")
    .argument("<messageId>")
    .requiredOption("--content <text>")
    .action(async (channelId: string, messageId: string, opts) => {
      await runWithClient((c) => messages.editMessage(c, channelId, messageId, opts.content));
    });

  cmd
    .command("delete")
    .description("Delete a message")
    .argument("<channelId>")
    .argument("<messageId>")
    .action(async (channelId: string, messageId: string) => {
      await runWithClient((c) => messages.deleteMessage(c, channelId, messageId));
    });

  cmd
    .command("list")
    .description("Fetch recent messages from a channel")
    .argument("<channelId>")
    .option("--limit <n>", "Max 100", (v) => parseInt(v, 10), 50)
    .option("--before <id>")
    .option("--after <id>")
    .action(async (channelId: string, opts) => {
      await runWithClient((c) =>
        messages.listMessages(c, channelId, {
          limit: opts.limit,
          before: opts.before,
          after: opts.after,
        }),
      );
    });

  cmd
    .command("react")
    .description("Add a reaction to a message")
    .argument("<channelId>")
    .argument("<messageId>")
    .argument("<emoji>", "Unicode emoji or `name:id` for custom")
    .action(async (channelId: string, messageId: string, emoji: string) => {
      await runWithClient((c) => messages.reactMessage(c, channelId, messageId, emoji));
    });

  cmd
    .command("pin")
    .description("Pin a message")
    .argument("<channelId>")
    .argument("<messageId>")
    .action(async (channelId: string, messageId: string) => {
      await runWithClient((c) => messages.setMessagePinned(c, channelId, messageId, true));
    });

  cmd
    .command("unpin")
    .description("Unpin a message")
    .argument("<channelId>")
    .argument("<messageId>")
    .action(async (channelId: string, messageId: string) => {
      await runWithClient((c) => messages.setMessagePinned(c, channelId, messageId, false));
    });
}

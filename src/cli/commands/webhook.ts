// `disco webhook ...` subcommands.

import { Command } from "commander";
import { runWithClient, runWithoutClient } from "../run.js";
import * as webhooks from "../../core/webhooks.js";

export function registerWebhookCommands(root: Command): void {
  const cmd = root.command("webhook").description("Manage webhooks");

  cmd
    .command("list")
    .description("List webhooks in a channel")
    .argument("<channelId>")
    .action(async (channelId: string) => {
      await runWithClient((c) => webhooks.listWebhooks(c, channelId));
    });

  cmd
    .command("create")
    .description("Create a webhook on a channel")
    .argument("<channelId>")
    .requiredOption("--name <name>")
    .option("--avatar <urlOrPath>")
    .option("--reason <reason>")
    .action(async (channelId: string, opts) => {
      await runWithClient((c) =>
        webhooks.createWebhook(c, {
          channelId,
          name: opts.name,
          avatar: opts.avatar,
          reason: opts.reason,
        }),
      );
    });

  cmd
    .command("delete")
    .description("Delete a webhook by ID")
    .argument("<webhookId>")
    .option("--reason <reason>")
    .action(async (webhookId: string, opts) => {
      await runWithClient((c) => webhooks.deleteWebhook(c, webhookId, opts.reason));
    });

  cmd
    .command("send")
    .description("Send a message via a webhook (no bot login required)")
    .option("--url <url>")
    .option("--webhook-id <id>")
    .option("--webhook-token <token>")
    .option("--content <text>")
    .option("--username <name>")
    .option("--avatar-url <url>")
    .option("--embeds <json>")
    .option("--thread-id <id>")
    .action(async (opts) => {
      await runWithoutClient(() =>
        webhooks.sendViaWebhook({
          url: opts.url,
          webhookId: opts.webhookId,
          webhookToken: opts.webhookToken,
          content: opts.content,
          username: opts.username,
          avatarUrl: opts.avatarUrl,
          embedsJson: opts.embeds,
          threadId: opts.threadId,
        }),
      );
    });
}

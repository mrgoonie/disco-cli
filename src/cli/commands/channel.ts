// `disco channel ...` subcommands.

import { Command } from "commander";
import { runWithClient } from "../run.js";
import * as channels from "../../core/channels.js";

export function registerChannelCommands(root: Command): void {
  const cmd = root.command("channel").description("Manage channels");

  cmd
    .command("list")
    .description("List channels in a guild")
    .argument("<guildId>")
    .action(async (guildId: string) => {
      await runWithClient((c) => channels.listChannels(c, guildId));
    });

  cmd
    .command("info")
    .description("Get channel info by ID")
    .argument("<channelId>")
    .action(async (channelId: string) => {
      await runWithClient((c) => channels.getChannel(c, channelId));
    });

  cmd
    .command("create")
    .description("Create a new channel")
    .requiredOption("--guild <id>")
    .requiredOption("--name <name>")
    .option(
      "--type <type>",
      "GuildText | GuildVoice | GuildCategory | GuildAnnouncement | GuildForum | GuildStageVoice",
      "GuildText",
    )
    .option("--parent <id>", "Parent category ID")
    .option("--topic <topic>")
    .option("--nsfw")
    .option("--reason <reason>")
    .action(async (opts) => {
      await runWithClient((c) =>
        channels.createChannel(c, {
          guildId: opts.guild,
          name: opts.name,
          type: opts.type,
          parentId: opts.parent,
          topic: opts.topic,
          nsfw: opts.nsfw,
          reason: opts.reason,
        }),
      );
    });

  cmd
    .command("edit")
    .description("Edit a channel")
    .argument("<channelId>")
    .option("--name <name>")
    .option("--topic <topic>")
    .option("--nsfw <bool>")
    .option("--parent <id>")
    .option("--position <n>", "Position", (v) => parseInt(v, 10))
    .option("--rate-limit <seconds>", "Slowmode seconds", (v) => parseInt(v, 10))
    .option("--reason <reason>")
    .action(async (channelId: string, opts) => {
      await runWithClient((c) =>
        channels.editChannel(c, channelId, {
          name: opts.name,
          topic: opts.topic,
          nsfw: opts.nsfw === undefined ? undefined : opts.nsfw === "true",
          parentId: opts.parent,
          position: opts.position,
          rateLimitPerUser: opts.rateLimit,
          reason: opts.reason,
        }),
      );
    });

  cmd
    .command("delete")
    .description("Delete a channel")
    .argument("<channelId>")
    .option("--reason <reason>")
    .action(async (channelId: string, opts) => {
      await runWithClient((c) => channels.deleteChannel(c, channelId, opts.reason));
    });
}

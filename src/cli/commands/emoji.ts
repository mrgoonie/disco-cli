// `disco emoji ...` and `disco sticker ...` subcommands.

import { Command } from "commander";
import { runWithClient } from "../run.js";
import * as emojis from "../../core/emojis.js";

export function registerEmojiCommands(root: Command): void {
  const emoji = root.command("emoji").description("Manage guild emojis");

  emoji
    .command("list")
    .argument("<guildId>")
    .action(async (guildId: string) => {
      await runWithClient((c) => emojis.listEmojis(c, guildId));
    });

  emoji
    .command("create")
    .description("Upload a new emoji from a file path or URL")
    .requiredOption("--guild <id>")
    .requiredOption("--name <name>")
    .requiredOption("--attachment <urlOrPath>")
    .option("--reason <reason>")
    .action(async (opts) => {
      await runWithClient((c) =>
        emojis.createEmoji(c, {
          guildId: opts.guild,
          name: opts.name,
          attachment: opts.attachment,
          reason: opts.reason,
        }),
      );
    });

  emoji
    .command("delete")
    .argument("<guildId>")
    .argument("<emojiId>")
    .option("--reason <reason>")
    .action(async (guildId: string, emojiId: string, opts) => {
      await runWithClient((c) => emojis.deleteEmoji(c, guildId, emojiId, opts.reason));
    });

  const sticker = root.command("sticker").description("Manage guild stickers");

  sticker
    .command("list")
    .argument("<guildId>")
    .action(async (guildId: string) => {
      await runWithClient((c) => emojis.listStickers(c, guildId));
    });

  sticker
    .command("create")
    .description("Upload a sticker (PNG / APNG / Lottie JSON)")
    .requiredOption("--guild <id>")
    .requiredOption("--name <name>")
    .requiredOption("--description <description>")
    .requiredOption("--tags <tags>", "Related emoji unicode or short keywords")
    .requiredOption("--file <path>")
    .option("--reason <reason>")
    .action(async (opts) => {
      await runWithClient((c) =>
        emojis.createSticker(c, {
          guildId: opts.guild,
          name: opts.name,
          description: opts.description,
          tags: opts.tags,
          filePath: opts.file,
          reason: opts.reason,
        }),
      );
    });

  sticker
    .command("delete")
    .argument("<guildId>")
    .argument("<stickerId>")
    .option("--reason <reason>")
    .action(async (guildId: string, stickerId: string, opts) => {
      await runWithClient((c) => emojis.deleteSticker(c, guildId, stickerId, opts.reason));
    });
}

// `disco guild ...` subcommands.

import { Command } from "commander";
import { runWithClient } from "../run.js";
import * as guilds from "../../core/guilds.js";

export function registerGuildCommands(root: Command): void {
  const cmd = root.command("guild").description("Manage guilds (servers)");

  cmd
    .command("list")
    .description("List guilds the bot is in")
    .action(async () => {
      await runWithClient((c) => guilds.listGuilds(c));
    });

  cmd
    .command("info")
    .description("Get guild details by ID")
    .argument("<guildId>")
    .action(async (guildId: string) => {
      await runWithClient((c) => guilds.getGuild(c, guildId));
    });

  cmd
    .command("leave")
    .description("Make the bot leave a guild")
    .argument("<guildId>")
    .action(async (guildId: string) => {
      await runWithClient((c) => guilds.leaveGuild(c, guildId));
    });

  cmd
    .command("edit")
    .description("Edit guild name/description")
    .argument("<guildId>")
    .option("--name <name>")
    .option("--description <description>")
    .option("--reason <reason>")
    .action(async (guildId: string, opts) => {
      await runWithClient((c) => guilds.editGuild(c, guildId, opts));
    });
}

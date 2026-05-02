// `disco event ...` — guild scheduled events.

import { Command } from "commander";
import {
  GuildScheduledEventEntityType,
  GuildScheduledEventPrivacyLevel,
} from "discord.js";
import { runWithClient } from "../run.js";
import * as scheduledEvents from "../../core/events.js";
import { DiscoError } from "../../core/errors.js";

const ENTITY_TYPES: Record<string, GuildScheduledEventEntityType> = {
  StageInstance: GuildScheduledEventEntityType.StageInstance,
  Voice: GuildScheduledEventEntityType.Voice,
  External: GuildScheduledEventEntityType.External,
};

export function registerEventCommands(root: Command): void {
  const cmd = root.command("event").description("Manage guild scheduled events");

  cmd
    .command("list")
    .argument("<guildId>")
    .action(async (guildId: string) => {
      await runWithClient((c) => scheduledEvents.listScheduledEvents(c, guildId));
    });

  cmd
    .command("create")
    .description("Create a scheduled event")
    .requiredOption("--guild <id>")
    .requiredOption("--name <name>")
    .requiredOption("--start <iso>", "ISO timestamp")
    .option("--end <iso>")
    .option("--description <text>")
    .requiredOption(
      "--entity-type <type>",
      `One of ${Object.keys(ENTITY_TYPES).join(", ")}`,
    )
    .option("--channel <id>", "Required for Voice/StageInstance")
    .option("--location <text>", "Required for External")
    .option("--reason <reason>")
    .action(async (opts) => {
      const entityType = ENTITY_TYPES[opts.entityType];
      if (entityType === undefined) {
        throw new DiscoError("INVALID_INPUT", `Unknown entity-type: ${opts.entityType}`);
      }
      await runWithClient((c) =>
        scheduledEvents.createScheduledEvent(c, {
          guildId: opts.guild,
          name: opts.name,
          description: opts.description,
          scheduledStartTime: opts.start,
          scheduledEndTime: opts.end,
          entityType,
          privacyLevel: GuildScheduledEventPrivacyLevel.GuildOnly,
          channelId: opts.channel,
          entityMetadata: opts.location ? { location: opts.location } : undefined,
          reason: opts.reason,
        }),
      );
    });

  cmd
    .command("delete")
    .argument("<guildId>")
    .argument("<eventId>")
    .action(async (guildId: string, eventId: string) => {
      await runWithClient((c) => scheduledEvents.deleteScheduledEvent(c, guildId, eventId));
    });
}

// `disco member ...` subcommands.

import { Command } from "commander";
import { runWithClient } from "../run.js";
import * as members from "../../core/members.js";
import { DiscoError } from "../../core/errors.js";

function parseDuration(input: string): number {
  // accepts ms or `<n><unit>` where unit ∈ s,m,h,d
  const m = /^(\d+)\s*(ms|s|m|h|d)?$/.exec(input.trim());
  if (!m) throw new DiscoError("INVALID_INPUT", `Bad duration: ${input}`);
  const n = parseInt(m[1]!, 10);
  switch (m[2] ?? "ms") {
    case "ms":
      return n;
    case "s":
      return n * 1000;
    case "m":
      return n * 60_000;
    case "h":
      return n * 3_600_000;
    case "d":
      return n * 86_400_000;
    default:
      return n;
  }
}

export function registerMemberCommands(root: Command): void {
  const cmd = root.command("member").description("Manage guild members");

  cmd
    .command("list")
    .description("List members in a guild")
    .argument("<guildId>")
    .option("--limit <n>", "Max 1000", (v) => parseInt(v, 10), 100)
    .option("--query <q>", "Search by username")
    .action(async (guildId: string, opts) => {
      await runWithClient((c) =>
        members.listMembers(c, guildId, { limit: opts.limit, query: opts.query }),
      );
    });

  cmd
    .command("info")
    .description("Get member info")
    .argument("<guildId>")
    .argument("<userId>")
    .action(async (guildId: string, userId: string) => {
      await runWithClient((c) => members.getMember(c, guildId, userId));
    });

  cmd
    .command("kick")
    .description("Kick a member")
    .argument("<guildId>")
    .argument("<userId>")
    .option("--reason <reason>")
    .action(async (guildId: string, userId: string, opts) => {
      await runWithClient((c) => members.kickMember(c, guildId, userId, opts.reason));
    });

  cmd
    .command("ban")
    .description("Ban a member")
    .argument("<guildId>")
    .argument("<userId>")
    .option("--reason <reason>")
    .option(
      "--delete-message-seconds <n>",
      "Delete prior messages older than N seconds (max 604800)",
      (v) => parseInt(v, 10),
    )
    .action(async (guildId: string, userId: string, opts) => {
      await runWithClient((c) =>
        members.banMember(c, guildId, userId, {
          reason: opts.reason,
          deleteMessageSeconds: opts.deleteMessageSeconds,
        }),
      );
    });

  cmd
    .command("unban")
    .description("Unban a previously-banned user")
    .argument("<guildId>")
    .argument("<userId>")
    .option("--reason <reason>")
    .action(async (guildId: string, userId: string, opts) => {
      await runWithClient((c) => members.unbanMember(c, guildId, userId, opts.reason));
    });

  cmd
    .command("timeout")
    .description("Apply or clear a timeout")
    .argument("<guildId>")
    .argument("<userId>")
    .argument("<duration>", "e.g. 30s, 10m, 1h, 1d, or `clear`")
    .option("--reason <reason>")
    .action(async (guildId: string, userId: string, duration: string, opts) => {
      const ms = duration === "clear" ? null : parseDuration(duration);
      await runWithClient((c) => members.timeoutMember(c, guildId, userId, ms, opts.reason));
    });

  cmd
    .command("set-nickname")
    .description("Set or clear a member nickname")
    .argument("<guildId>")
    .argument("<userId>")
    .argument("<nickname>", "Nickname text or `clear`")
    .option("--reason <reason>")
    .action(async (guildId: string, userId: string, nick: string, opts) => {
      const value = nick === "clear" ? null : nick;
      await runWithClient((c) => members.setNickname(c, guildId, userId, value, opts.reason));
    });

  cmd
    .command("ban-list")
    .description("List bans in a guild")
    .argument("<guildId>")
    .option("--limit <n>", "Max 1000", (v) => parseInt(v, 10), 100)
    .action(async (guildId: string, opts) => {
      await runWithClient((c) => members.listBans(c, guildId, opts.limit));
    });
}

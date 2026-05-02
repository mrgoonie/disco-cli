// `disco invite ...` subcommands.

import { Command } from "commander";
import { runWithClient } from "../run.js";
import * as invites from "../../core/invites.js";

export function registerInviteCommands(root: Command): void {
  const cmd = root.command("invite").description("Manage guild invites");

  cmd
    .command("list")
    .argument("<guildId>")
    .description("List invites in a guild")
    .action(async (guildId: string) => {
      await runWithClient((c) => invites.listInvites(c, guildId));
    });

  cmd
    .command("create")
    .argument("<channelId>")
    .description("Create an invite for a channel")
    .option("--max-age <seconds>", "Default 86400 (24h), 0 = never", (v) => parseInt(v, 10))
    .option("--max-uses <n>", "0 = unlimited", (v) => parseInt(v, 10))
    .option("--temporary")
    .option("--unique")
    .option("--reason <reason>")
    .action(async (channelId: string, opts) => {
      await runWithClient((c) =>
        invites.createInvite(c, {
          channelId,
          maxAge: opts.maxAge,
          maxUses: opts.maxUses,
          temporary: opts.temporary,
          unique: opts.unique,
          reason: opts.reason,
        }),
      );
    });

  cmd
    .command("delete")
    .argument("<guildId>")
    .argument("<code>")
    .description("Delete an invite by code")
    .option("--reason <reason>")
    .action(async (guildId: string, code: string, opts) => {
      await runWithClient((c) => invites.deleteInvite(c, guildId, code, opts.reason));
    });
}

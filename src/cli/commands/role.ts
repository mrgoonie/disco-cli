// `disco role ...` subcommands.

import { Command } from "commander";
import { runWithClient } from "../run.js";
import * as roles from "../../core/roles.js";

export function registerRoleCommands(root: Command): void {
  const cmd = root.command("role").description("Manage roles");

  cmd
    .command("list")
    .description("List roles in a guild")
    .argument("<guildId>")
    .action(async (guildId: string) => {
      await runWithClient((c) => roles.listRoles(c, guildId));
    });

  cmd
    .command("create")
    .description("Create a role")
    .requiredOption("--guild <id>")
    .requiredOption("--name <name>")
    .option("--color <hex>")
    .option("--hoist")
    .option("--mentionable")
    .option("--permissions <perms>", "Comma-separated permission names")
    .option("--reason <reason>")
    .action(async (opts) => {
      await runWithClient((c) =>
        roles.createRole(c, {
          guildId: opts.guild,
          name: opts.name,
          color: opts.color,
          hoist: opts.hoist,
          mentionable: opts.mentionable,
          permissions: opts.permissions ? String(opts.permissions).split(",") : undefined,
          reason: opts.reason,
        }),
      );
    });

  cmd
    .command("edit")
    .description("Edit a role")
    .argument("<guildId>")
    .argument("<roleId>")
    .option("--name <name>")
    .option("--color <hex>")
    .option("--hoist <bool>")
    .option("--mentionable <bool>")
    .option("--permissions <perms>")
    .option("--position <n>", "Position", (v) => parseInt(v, 10))
    .option("--reason <reason>")
    .action(async (guildId: string, roleId: string, opts) => {
      await runWithClient((c) =>
        roles.editRole(c, guildId, roleId, {
          name: opts.name,
          color: opts.color,
          hoist: opts.hoist === undefined ? undefined : opts.hoist === "true",
          mentionable:
            opts.mentionable === undefined ? undefined : opts.mentionable === "true",
          permissions: opts.permissions ? String(opts.permissions).split(",") : undefined,
          position: opts.position,
          reason: opts.reason,
        }),
      );
    });

  cmd
    .command("delete")
    .description("Delete a role")
    .argument("<guildId>")
    .argument("<roleId>")
    .option("--reason <reason>")
    .action(async (guildId: string, roleId: string, opts) => {
      await runWithClient((c) => roles.deleteRole(c, guildId, roleId, opts.reason));
    });

  cmd
    .command("assign")
    .description("Assign a role to a member")
    .argument("<guildId>")
    .argument("<userId>")
    .argument("<roleId>")
    .option("--reason <reason>")
    .action(async (guildId: string, userId: string, roleId: string, opts) => {
      await runWithClient((c) => roles.assignRole(c, guildId, userId, roleId, opts.reason));
    });

  cmd
    .command("remove")
    .description("Remove a role from a member")
    .argument("<guildId>")
    .argument("<userId>")
    .argument("<roleId>")
    .option("--reason <reason>")
    .action(async (guildId: string, userId: string, roleId: string, opts) => {
      await runWithClient((c) =>
        roles.removeRoleFromMember(c, guildId, userId, roleId, opts.reason),
      );
    });
}

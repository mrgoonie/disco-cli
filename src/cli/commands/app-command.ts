// `disco command ...` — application (slash) commands management.

import { Command } from "commander";
import { runWithClient } from "../run.js";
import * as appCommands from "../../core/app-commands.js";

export function registerAppCommandCommands(root: Command): void {
  const cmd = root
    .command("command")
    .description("Manage application (slash) commands");

  cmd
    .command("list")
    .description("List registered commands (global, or guild-scoped with --guild)")
    .option("--guild <id>")
    .action(async (opts) => {
      await runWithClient((c) => appCommands.listAppCommands(c, opts.guild));
    });

  cmd
    .command("register")
    .description("Register one or more commands from a JSON file")
    .argument("<file>", "Path to a JSON file with one command definition or an array")
    .option("--guild <id>", "Register as guild-scoped (instant); omit for global")
    .action(async (file: string, opts) => {
      await runWithClient((c) => appCommands.registerAppCommand(c, file, opts.guild));
    });

  cmd
    .command("delete")
    .description("Delete a single command by ID")
    .argument("<commandId>")
    .option("--guild <id>")
    .action(async (commandId: string, opts) => {
      await runWithClient((c) => appCommands.deleteAppCommand(c, commandId, opts.guild));
    });

  cmd
    .command("sync")
    .description("Bulk overwrite commands from a JSON file (replaces existing set)")
    .argument("<file>")
    .option("--guild <id>")
    .action(async (file: string, opts) => {
      await runWithClient((c) => appCommands.syncAppCommands(c, file, opts.guild));
    });
}

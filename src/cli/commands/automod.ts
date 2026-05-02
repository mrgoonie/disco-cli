// `disco automod ...` — AutoModeration rules.

import { Command } from "commander";
import { runWithClient } from "../run.js";
import * as automod from "../../core/automod.js";

export function registerAutoModCommands(root: Command): void {
  const cmd = root.command("automod").description("Manage AutoMod rules");

  cmd
    .command("list")
    .argument("<guildId>")
    .action(async (guildId: string) => {
      await runWithClient((c) => automod.listAutoModRules(c, guildId));
    });

  cmd
    .command("create")
    .description("Create a rule from a JSON file (matches AutoModerationRuleCreateOptions)")
    .argument("<guildId>")
    .argument("<file>")
    .action(async (guildId: string, file: string) => {
      await runWithClient((c) => automod.createAutoModRule(c, guildId, file));
    });

  cmd
    .command("delete")
    .argument("<guildId>")
    .argument("<ruleId>")
    .option("--reason <reason>")
    .action(async (guildId: string, ruleId: string, opts) => {
      await runWithClient((c) => automod.deleteAutoModRule(c, guildId, ruleId, opts.reason));
    });
}

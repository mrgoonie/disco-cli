#!/usr/bin/env node
// disco — Discord bot management CLI built on discord.js v14.

import { Command } from "commander";
import { setOutputOptions } from "./output.js";
import { setGlobalFlags } from "./run.js";
import { registerAuthCommands } from "./commands/auth.js";
import { registerGuildCommands } from "./commands/guild.js";
import { registerChannelCommands } from "./commands/channel.js";
import { registerMessageCommands } from "./commands/message.js";
import { registerMemberCommands } from "./commands/member.js";
import { registerRoleCommands } from "./commands/role.js";
import { registerThreadCommands } from "./commands/thread.js";
import { registerWebhookCommands } from "./commands/webhook.js";
import { registerInviteCommands } from "./commands/invite.js";
import { registerEmojiCommands } from "./commands/emoji.js";
import { registerAppCommandCommands } from "./commands/app-command.js";
import { registerEventCommands } from "./commands/event.js";
import { registerAutoModCommands } from "./commands/automod.js";
import { registerListenCommand } from "./commands/listen.js";

const VERSION = "0.1.0";

const program = new Command();
program
  .name("disco")
  .description("Discord bot management CLI (discord.js v14)")
  .version(VERSION)
  .option("--token <token>", "Bot token (overrides env / config)")
  .option("--json", "Emit JSON instead of human-readable output")
  .option("--no-color", "Disable ANSI colors")
  .option("--quiet", "Suppress informational output")
  .hook("preAction", (thisCommand) => {
    const opts = thisCommand.opts<{
      token?: string;
      json?: boolean;
      color?: boolean;
      quiet?: boolean;
    }>();
    setGlobalFlags({ token: opts.token, json: opts.json, quiet: opts.quiet });
    setOutputOptions({
      json: opts.json,
      noColor: opts.color === false,
      quiet: opts.quiet,
    });
  });

registerAuthCommands(program);
registerListenCommand(program);
registerGuildCommands(program);
registerChannelCommands(program);
registerMessageCommands(program);
registerMemberCommands(program);
registerRoleCommands(program);
registerThreadCommands(program);
registerWebhookCommands(program);
registerInviteCommands(program);
registerEmojiCommands(program);
registerAppCommandCommands(program);
registerEventCommands(program);
registerAutoModCommands(program);

program.parseAsync(process.argv).catch((err) => {
  process.stderr.write(`fatal: ${(err as Error).message}\n`);
  process.exit(4);
});

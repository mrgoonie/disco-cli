// login / logout / whoami / doctor / config commands.

import { Command } from "commander";
import {
  clearUserConfig,
  loadConfig,
  redactToken,
  saveUserConfig,
  userConfigPath,
} from "../../core/config.js";
import { withClient } from "../../core/client.js";
import { runWithoutClient } from "../run.js";
import { printResult } from "../output.js";
import { DiscoError } from "../../core/errors.js";

export function registerAuthCommands(root: Command): void {
  root
    .command("login")
    .description("Save a Discord bot token to the user config")
    .argument("[token]", "Bot token (omit to read from stdin)")
    .option("--application-id <id>", "Save the application ID alongside the token")
    .option("--default-guild-id <id>", "Save a default guild ID")
    .action(async (token: string | undefined, opts) => {
      await runWithoutClient(async () => {
        const t = token ?? (await readStdinLine());
        if (!t) {
          throw new DiscoError("INVALID_INPUT", "No token provided.", {
            hint: "Pass token as argument or pipe via stdin.",
          });
        }
        const path = saveUserConfig({
          token: t.trim(),
          applicationId: opts.applicationId,
          defaultGuildId: opts.defaultGuildId,
        });
        return { saved: true, path, token: redactToken(t) };
      });
    });

  root
    .command("logout")
    .description("Clear stored credentials from user config")
    .action(async () => {
      await runWithoutClient(async () => ({ cleared: true, path: clearUserConfig() }));
    });

  root
    .command("whoami")
    .description("Show the bot identity for the resolved token")
    .action(async () => {
      const cfg = loadConfig();
      if (!cfg.token) {
        process.exitCode = 2;
        printResult({
          authenticated: false,
          source: cfg.source,
          hint: "No token resolved. Run `disco login` or set DISCORD_BOT_TOKEN.",
        });
        return;
      }
      try {
        const info = await withClient(cfg.token, async (client) => ({
          id: client.user.id,
          tag: client.user.tag,
          username: client.user.username,
          guilds: client.guilds.cache.size,
          source: cfg.source,
        }));
        printResult(info);
      } catch (err) {
        process.exitCode = 2;
        printResult({ authenticated: false, error: (err as Error).message });
      }
    });

  root
    .command("doctor")
    .description("Diagnose configuration: which layer resolved the token, paths used")
    .action(async () => {
      await runWithoutClient(async () => {
        const cfg = loadConfig();
        return {
          tokenResolved: !!cfg.token,
          tokenPreview: redactToken(cfg.token),
          source: cfg.source,
          configPath: cfg.configPath ?? null,
          userConfigPath: userConfigPath(),
          envVarsSeen: {
            DISCORD_BOT_TOKEN: !!process.env.DISCORD_BOT_TOKEN,
            DISCORD_APPLICATION_ID: !!process.env.DISCORD_APPLICATION_ID,
            DISCORD_DEFAULT_GUILD_ID: !!process.env.DISCORD_DEFAULT_GUILD_ID,
          },
          nodeVersion: process.version,
          platform: process.platform,
        };
      });
    });

  const config = root.command("config").description("Read or update local config");
  config
    .command("get")
    .description("Print resolved config (token redacted)")
    .action(async () => {
      await runWithoutClient(async () => {
        const cfg = loadConfig();
        return {
          source: cfg.source,
          tokenPreview: redactToken(cfg.token),
          applicationId: cfg.applicationId ?? null,
          defaultGuildId: cfg.defaultGuildId ?? null,
          configPath: cfg.configPath ?? null,
        };
      });
    });
  config
    .command("set")
    .description("Set a key in the user config (token | applicationId | defaultGuildId)")
    .argument("<key>")
    .argument("<value>")
    .action(async (key: string, value: string) => {
      await runWithoutClient(async () => {
        const allowed = ["token", "applicationId", "defaultGuildId"];
        if (!allowed.includes(key)) {
          throw new DiscoError("INVALID_INPUT", `Unknown key: ${key}`, {
            hint: `Allowed keys: ${allowed.join(", ")}`,
          });
        }
        const path = saveUserConfig({ [key]: value });
        return { saved: true, path, key };
      });
    });
}

async function readStdinLine(): Promise<string> {
  if (process.stdin.isTTY) return "";
  return await new Promise<string>((resolve) => {
    let data = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => (data += chunk));
    process.stdin.on("end", () => resolve(data));
  });
}

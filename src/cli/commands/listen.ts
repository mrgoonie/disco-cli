// `disco listen` — long-running event tap. Stays open until SIGINT.

import { Command } from "commander";
import { loadConfig, requireToken } from "../../core/config.js";
import { startListener } from "../../core/listen.js";
import { getOutputOptions, printError, printInfo } from "../output.js";

export function registerListenCommand(root: Command): void {
  root
    .command("listen")
    .description("Connect to the gateway and stream events as JSON lines until Ctrl-C")
    .option("--events <list>", "Comma-separated event names (default: common set)")
    .action(async (opts) => {
      try {
        const cfg = loadConfig();
        const token = requireToken(cfg);
        const events = opts.events
          ? String(opts.events).split(",").map((s: string) => s.trim()).filter(Boolean)
          : undefined;

        const client = await startListener(token, {
          events,
          onReady: (info) => {
            const line = JSON.stringify({ event: "ready", at: new Date().toISOString(), ...info });
            process.stdout.write(line + "\n");
          },
          onEvent: (event, payload) => {
            const out = { event, at: new Date().toISOString(), payload };
            if (getOutputOptions().json !== false) {
              process.stdout.write(JSON.stringify(out) + "\n");
            } else {
              process.stdout.write(`[${event}] ${JSON.stringify(payload)}\n`);
            }
          },
        });

        printInfo("Listening. Press Ctrl-C to exit.");
        const shutdown = async () => {
          printInfo("Shutting down…");
          await client.destroy().catch(() => undefined);
          process.exit(0);
        };
        process.on("SIGINT", shutdown);
        process.on("SIGTERM", shutdown);
      } catch (err) {
        process.exitCode = printError(err);
      }
    });
}

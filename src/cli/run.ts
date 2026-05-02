// Common command runner: resolve token, open client, run task, print result, exit.

import type { Client } from "discord.js";
import { withClient } from "../core/client.js";
import { loadConfig, requireToken, type ResolvedConfig } from "../core/config.js";
import { printError, printResult } from "./output.js";

export interface GlobalFlags {
  token?: string;
  json?: boolean;
  noColor?: boolean;
  quiet?: boolean;
}

export function getGlobalFlags(): GlobalFlags {
  // Pulled lazily by `runWithClient` from commander root opts via `program.opts()`.
  return globalFlagState;
}

let globalFlagState: GlobalFlags = {};
export function setGlobalFlags(flags: GlobalFlags): void {
  globalFlagState = flags;
}

export function resolveConfig(flags?: GlobalFlags): ResolvedConfig {
  return loadConfig({ token: flags?.token ?? globalFlagState.token });
}

export async function runWithClient<T>(
  task: (client: Client<true>) => Promise<T>,
): Promise<void> {
  try {
    const cfg = resolveConfig();
    const token = requireToken(cfg);
    const result = await withClient(token, task);
    printResult(result);
    process.exitCode = 0;
  } catch (err) {
    process.exitCode = printError(err);
  }
}

export async function runWithoutClient<T>(task: () => Promise<T>): Promise<void> {
  try {
    const result = await task();
    printResult(result);
    process.exitCode = 0;
  } catch (err) {
    process.exitCode = printError(err);
  }
}

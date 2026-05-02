// Application (slash) command management.
// Register/list/delete/sync. Definitions accepted as JSON file.

import { readFile } from "node:fs/promises";
import type { Client, ApplicationCommandDataResolvable } from "discord.js";
import { serializeAppCommand } from "./serialize.js";
import { DiscoError, wrapDiscordError } from "./errors.js";

async function readDefinitions(path: string): Promise<ApplicationCommandDataResolvable[]> {
  const raw = await readFile(path, "utf8");
  const parsed = JSON.parse(raw);
  const defs = Array.isArray(parsed) ? parsed : [parsed];
  return defs as ApplicationCommandDataResolvable[];
}

export async function listAppCommands(client: Client<true>, guildId?: string) {
  if (!client.application) {
    throw new DiscoError("RUNTIME", "Client.application not ready.");
  }
  try {
    const cmds = guildId
      ? await client.application.commands.fetch({ guildId })
      : await client.application.commands.fetch();
    return Array.from(cmds.values()).map(serializeAppCommand);
  } catch (err) {
    throw wrapDiscordError(err);
  }
}

export async function registerAppCommand(
  client: Client<true>,
  filePath: string,
  guildId?: string,
) {
  if (!client.application) {
    throw new DiscoError("RUNTIME", "Client.application not ready.");
  }
  const defs = await readDefinitions(filePath);
  try {
    const created = [];
    for (const def of defs) {
      const c = await client.application.commands.create(def, guildId);
      created.push(serializeAppCommand(c));
    }
    return created;
  } catch (err) {
    throw wrapDiscordError(err);
  }
}

export async function deleteAppCommand(
  client: Client<true>,
  commandId: string,
  guildId?: string,
) {
  if (!client.application) {
    throw new DiscoError("RUNTIME", "Client.application not ready.");
  }
  try {
    await client.application.commands.delete(commandId, guildId);
    return { commandId, guildId: guildId ?? null, deleted: true };
  } catch (err) {
    throw wrapDiscordError(err);
  }
}

export async function syncAppCommands(
  client: Client<true>,
  filePath: string,
  guildId?: string,
) {
  if (!client.application) {
    throw new DiscoError("RUNTIME", "Client.application not ready.");
  }
  const defs = await readDefinitions(filePath);
  try {
    const set = guildId
      ? await client.application.commands.set(defs, guildId)
      : await client.application.commands.set(defs);
    return Array.from(set.values()).map(serializeAppCommand);
  } catch (err) {
    throw wrapDiscordError(err);
  }
}

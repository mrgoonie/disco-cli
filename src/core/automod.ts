// AutoMod rules: list/create/delete.
// Definitions accepted as JSON file because the schema is rich.

import { readFile } from "node:fs/promises";
import type {
  AutoModerationRuleCreateOptions,
  Client,
} from "discord.js";
import { fetchGuildOrThrow } from "./client.js";
import { serializeAutoModRule } from "./serialize.js";
import { wrapDiscordError } from "./errors.js";

export async function listAutoModRules(client: Client<true>, guildId: string) {
  const g = await fetchGuildOrThrow(client, guildId);
  try {
    const rules = await g.autoModerationRules.fetch();
    return rules.map(serializeAutoModRule);
  } catch (err) {
    throw wrapDiscordError(err);
  }
}

export async function createAutoModRule(
  client: Client<true>,
  guildId: string,
  filePath: string,
) {
  const g = await fetchGuildOrThrow(client, guildId);
  const def = JSON.parse(await readFile(filePath, "utf8")) as AutoModerationRuleCreateOptions;
  try {
    const rule = await g.autoModerationRules.create(def);
    return serializeAutoModRule(rule);
  } catch (err) {
    throw wrapDiscordError(err);
  }
}

export async function deleteAutoModRule(
  client: Client<true>,
  guildId: string,
  ruleId: string,
  reason?: string,
) {
  const g = await fetchGuildOrThrow(client, guildId);
  try {
    await g.autoModerationRules.delete(ruleId, reason);
    return { ruleId, deleted: true };
  } catch (err) {
    throw wrapDiscordError(err);
  }
}

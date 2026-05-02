// Guild management wrappers.

import type { Client } from "discord.js";
import { fetchGuildOrThrow } from "./client.js";
import { serializeGuild } from "./serialize.js";
import { wrapDiscordError } from "./errors.js";

export async function listGuilds(client: Client<true>) {
  const guilds = await client.guilds.fetch();
  const detailed = await Promise.all(
    guilds.map(async (g) => {
      const full = await g.fetch();
      return serializeGuild(full);
    }),
  );
  return detailed;
}

export async function getGuild(client: Client<true>, guildId: string) {
  const g = await fetchGuildOrThrow(client, guildId);
  return serializeGuild(g);
}

export async function leaveGuild(client: Client<true>, guildId: string) {
  const g = await fetchGuildOrThrow(client, guildId);
  try {
    await g.leave();
    return { id: guildId, left: true };
  } catch (err) {
    throw wrapDiscordError(err);
  }
}

export interface GuildEditInput {
  name?: string;
  description?: string;
  reason?: string;
}

export async function editGuild(client: Client<true>, guildId: string, input: GuildEditInput) {
  const g = await fetchGuildOrThrow(client, guildId);
  try {
    const updated = await g.edit({
      name: input.name,
      description: input.description,
      reason: input.reason,
    });
    return serializeGuild(updated);
  } catch (err) {
    throw wrapDiscordError(err);
  }
}

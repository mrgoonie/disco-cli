// Guild member management: list/info/kick/ban/unban/timeout/nickname.

import { Routes, type Client, type GuildMember } from "discord.js";
import { fetchGuildOrThrow } from "./client.js";
import { serializeMember } from "./serialize.js";
import { DiscoError, wrapDiscordError } from "./errors.js";

export async function listMembers(
  client: Client<true>,
  guildId: string,
  opts: { limit?: number; query?: string } = {},
) {
  const g = await fetchGuildOrThrow(client, guildId);
  try {
    if (opts.query) {
      const found = await g.members.search({ query: opts.query, limit: opts.limit ?? 50 });
      return Array.from(found.values()).map(serializeMember);
    }
    // REST `List Guild Members` — `members.fetch({ limit })` would use a gateway
    // opcode and requires a live session. Needs the GUILD_MEMBERS intent enabled
    // in the Developer Portal (HTTP restriction, independent of gateway intents).
    const limit = Math.min(Math.max(opts.limit ?? 100, 1), 1000);
    const raw = (await client.rest.get(Routes.guildMembers(guildId), {
      query: new URLSearchParams({ limit: String(limit) }),
    })) as unknown[];
    const add = (g.members as unknown as { _add: (d: unknown) => GuildMember })._add.bind(g.members);
    return raw.map((d) => serializeMember(add(d)));
  } catch (err) {
    throw wrapDiscordError(err);
  }
}

export async function getMember(client: Client<true>, guildId: string, userId: string) {
  const g = await fetchGuildOrThrow(client, guildId);
  try {
    const m = await g.members.fetch(userId);
    return serializeMember(m);
  } catch (err) {
    throw wrapDiscordError(err);
  }
}

export async function kickMember(
  client: Client<true>,
  guildId: string,
  userId: string,
  reason?: string,
) {
  const g = await fetchGuildOrThrow(client, guildId);
  try {
    const m = await g.members.fetch(userId);
    await m.kick(reason);
    return { guildId, userId, kicked: true };
  } catch (err) {
    throw wrapDiscordError(err);
  }
}

export async function banMember(
  client: Client<true>,
  guildId: string,
  userId: string,
  opts: { reason?: string; deleteMessageSeconds?: number } = {},
) {
  const g = await fetchGuildOrThrow(client, guildId);
  try {
    await g.members.ban(userId, {
      reason: opts.reason,
      deleteMessageSeconds: opts.deleteMessageSeconds,
    });
    return { guildId, userId, banned: true };
  } catch (err) {
    throw wrapDiscordError(err);
  }
}

export async function unbanMember(
  client: Client<true>,
  guildId: string,
  userId: string,
  reason?: string,
) {
  const g = await fetchGuildOrThrow(client, guildId);
  try {
    await g.members.unban(userId, reason);
    return { guildId, userId, unbanned: true };
  } catch (err) {
    throw wrapDiscordError(err);
  }
}

export async function timeoutMember(
  client: Client<true>,
  guildId: string,
  userId: string,
  durationMs: number | null,
  reason?: string,
) {
  const g = await fetchGuildOrThrow(client, guildId);
  try {
    const m = await g.members.fetch(userId);
    await m.timeout(durationMs, reason);
    return {
      guildId,
      userId,
      durationMs,
      until: durationMs ? new Date(Date.now() + durationMs).toISOString() : null,
    };
  } catch (err) {
    throw wrapDiscordError(err);
  }
}

export async function setNickname(
  client: Client<true>,
  guildId: string,
  userId: string,
  nickname: string | null,
  reason?: string,
) {
  const g = await fetchGuildOrThrow(client, guildId);
  try {
    const m = await g.members.fetch(userId);
    await m.setNickname(nickname, reason);
    return { guildId, userId, nickname };
  } catch (err) {
    throw wrapDiscordError(err);
  }
}

export async function listBans(client: Client<true>, guildId: string, limit = 100) {
  const g = await fetchGuildOrThrow(client, guildId);
  try {
    const bans = await g.bans.fetch({ limit: Math.min(limit, 1000) });
    return bans.map((b) => ({
      userId: b.user.id,
      username: b.user.username,
      reason: b.reason,
    }));
  } catch (err) {
    throw wrapDiscordError(err);
  }
}

export function ensureValidId(id: string, label = "id"): void {
  if (!/^\d{17,20}$/.test(id)) {
    throw new DiscoError("INVALID_INPUT", `Invalid ${label}: ${id}`, {
      hint: "Discord snowflake IDs are 17–20 digits.",
    });
  }
}

// Invite list/create/delete.

import type { Client } from "discord.js";
import { fetchChannelOrThrow, fetchGuildOrThrow } from "./client.js";
import { serializeInvite } from "./serialize.js";
import { DiscoError, wrapDiscordError } from "./errors.js";

export async function listInvites(client: Client<true>, guildId: string) {
  const g = await fetchGuildOrThrow(client, guildId);
  try {
    const invites = await g.invites.fetch();
    return Array.from(invites.values()).map(serializeInvite);
  } catch (err) {
    throw wrapDiscordError(err);
  }
}

export interface InviteCreateInput {
  channelId: string;
  maxAge?: number;
  maxUses?: number;
  temporary?: boolean;
  unique?: boolean;
  reason?: string;
}

export async function createInvite(client: Client<true>, input: InviteCreateInput) {
  const ch = await fetchChannelOrThrow(client, input.channelId);
  if (!("createInvite" in ch) || typeof (ch as { createInvite: Function }).createInvite !== "function") {
    throw new DiscoError("INVALID_INPUT", "Channel does not support invites.");
  }
  try {
    const invite = await (ch as { createInvite: (o: unknown) => Promise<unknown> }).createInvite({
      maxAge: input.maxAge,
      maxUses: input.maxUses,
      temporary: input.temporary,
      unique: input.unique,
      reason: input.reason,
    });
    return serializeInvite(invite as never);
  } catch (err) {
    throw wrapDiscordError(err);
  }
}

export async function deleteInvite(
  client: Client<true>,
  guildId: string,
  code: string,
  reason?: string,
) {
  const g = await fetchGuildOrThrow(client, guildId);
  try {
    await g.invites.delete(code, reason);
    return { code, deleted: true };
  } catch (err) {
    throw wrapDiscordError(err);
  }
}

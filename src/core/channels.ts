// Channel CRUD wrappers spanning text/voice/category/forum/announcement.

import { ChannelType, type Client, type GuildBasedChannel } from "discord.js";
import { fetchChannelOrThrow, fetchGuildOrThrow } from "./client.js";
import { serializeChannel } from "./serialize.js";
import { DiscoError, wrapDiscordError } from "./errors.js";

export async function listChannels(client: Client<true>, guildId: string) {
  const g = await fetchGuildOrThrow(client, guildId);
  const channels = await g.channels.fetch();
  const result: ReturnType<typeof serializeChannel>[] = [];
  for (const c of channels.values()) {
    if (c) result.push(serializeChannel(c as GuildBasedChannel));
  }
  return result;
}

export async function getChannel(client: Client<true>, channelId: string) {
  const c = await fetchChannelOrThrow(client, channelId);
  if (c.isDMBased()) {
    return { id: c.id, type: c.type, dm: true };
  }
  return serializeChannel(c as GuildBasedChannel);
}

export interface ChannelCreateInput {
  guildId: string;
  name: string;
  type?: keyof typeof ChannelType;
  parentId?: string;
  topic?: string;
  nsfw?: boolean;
  reason?: string;
}

export async function createChannel(client: Client<true>, input: ChannelCreateInput) {
  const g = await fetchGuildOrThrow(client, input.guildId);
  const type = input.type ? ChannelType[input.type] : ChannelType.GuildText;
  if (typeof type !== "number") {
    throw new DiscoError("INVALID_INPUT", `Unknown channel type: ${input.type}`, {
      hint: `Valid: ${Object.keys(ChannelType).filter((k) => isNaN(Number(k))).join(", ")}`,
    });
  }
  try {
    const created = await g.channels.create({
      name: input.name,
      // discord.js typing for `type` is a discriminated union; cast keeps the call generic.
      type: type as never,
      parent: input.parentId,
      topic: input.topic,
      nsfw: input.nsfw,
      reason: input.reason,
    });
    return serializeChannel(created);
  } catch (err) {
    throw wrapDiscordError(err);
  }
}

export interface ChannelEditInput {
  name?: string;
  topic?: string;
  nsfw?: boolean;
  parentId?: string;
  position?: number;
  rateLimitPerUser?: number;
  reason?: string;
}

export async function editChannel(
  client: Client<true>,
  channelId: string,
  input: ChannelEditInput,
) {
  const c = await fetchChannelOrThrow(client, channelId);
  if (c.isDMBased()) throw new DiscoError("INVALID_INPUT", "Cannot edit DM channels.");
  try {
    const updated = await (c as GuildBasedChannel).edit({
      name: input.name,
      // `topic` only exists on text-like channels; discord.js handles via union.
      topic: input.topic as string | undefined,
      nsfw: input.nsfw,
      parent: input.parentId,
      position: input.position,
      rateLimitPerUser: input.rateLimitPerUser,
      reason: input.reason,
    } as never);
    return serializeChannel(updated as GuildBasedChannel);
  } catch (err) {
    throw wrapDiscordError(err);
  }
}

export async function deleteChannel(client: Client<true>, channelId: string, reason?: string) {
  const c = await fetchChannelOrThrow(client, channelId);
  if (c.isDMBased()) throw new DiscoError("INVALID_INPUT", "Cannot delete DM channels.");
  try {
    await (c as GuildBasedChannel).delete(reason);
    return { id: channelId, deleted: true };
  } catch (err) {
    throw wrapDiscordError(err);
  }
}

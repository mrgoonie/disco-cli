// Guild scheduled events.

import type { Client, GuildScheduledEventEntityType, GuildScheduledEventPrivacyLevel } from "discord.js";
import { fetchGuildOrThrow } from "./client.js";
import { serializeScheduledEvent } from "./serialize.js";
import { wrapDiscordError } from "./errors.js";

export async function listScheduledEvents(client: Client<true>, guildId: string) {
  const g = await fetchGuildOrThrow(client, guildId);
  try {
    const events = await g.scheduledEvents.fetch();
    return events.map(serializeScheduledEvent);
  } catch (err) {
    throw wrapDiscordError(err);
  }
}

export interface ScheduledEventCreateInput {
  guildId: string;
  name: string;
  description?: string;
  scheduledStartTime: string; // ISO
  scheduledEndTime?: string;
  entityType: GuildScheduledEventEntityType;
  privacyLevel: GuildScheduledEventPrivacyLevel;
  channelId?: string;
  entityMetadata?: { location?: string };
  reason?: string;
}

export async function createScheduledEvent(
  client: Client<true>,
  input: ScheduledEventCreateInput,
) {
  const g = await fetchGuildOrThrow(client, input.guildId);
  try {
    const e = await g.scheduledEvents.create({
      name: input.name,
      description: input.description,
      scheduledStartTime: input.scheduledStartTime,
      scheduledEndTime: input.scheduledEndTime,
      entityType: input.entityType,
      privacyLevel: input.privacyLevel,
      channel: input.channelId,
      entityMetadata: input.entityMetadata,
      reason: input.reason,
    });
    return serializeScheduledEvent(e);
  } catch (err) {
    throw wrapDiscordError(err);
  }
}

export async function deleteScheduledEvent(
  client: Client<true>,
  guildId: string,
  eventId: string,
) {
  const g = await fetchGuildOrThrow(client, guildId);
  try {
    await g.scheduledEvents.delete(eventId);
    return { eventId, deleted: true };
  } catch (err) {
    throw wrapDiscordError(err);
  }
}

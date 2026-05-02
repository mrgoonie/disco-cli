// Thread lifecycle: create/list/archive/join/leave.

import { ChannelType, type Client, type ThreadChannel } from "discord.js";
import { fetchChannelOrThrow } from "./client.js";
import { serializeThread } from "./serialize.js";
import { DiscoError, wrapDiscordError } from "./errors.js";

function asThreadParent(c: unknown) {
  const ch = c as { threads?: { create: Function; fetchActive: Function; fetchArchived: Function } };
  if (!ch || typeof ch.threads?.create !== "function") {
    throw new DiscoError(
      "INVALID_INPUT",
      "Channel does not support threads (need text/announcement/forum).",
    );
  }
  return ch as { threads: { create: Function; fetchActive: Function; fetchArchived: Function } };
}

export interface ThreadCreateInput {
  channelId: string;
  name: string;
  autoArchiveMinutes?: 60 | 1440 | 4320 | 10080;
  invitable?: boolean;
  reason?: string;
  startMessageId?: string;
}

export async function createThread(client: Client<true>, input: ThreadCreateInput) {
  const ch = asThreadParent(await fetchChannelOrThrow(client, input.channelId));
  try {
    const thread = (await ch.threads.create({
      name: input.name,
      autoArchiveDuration: input.autoArchiveMinutes ?? 1440,
      invitable: input.invitable,
      reason: input.reason,
      startMessage: input.startMessageId,
      type: ChannelType.PublicThread,
    })) as ThreadChannel;
    return serializeThread(thread);
  } catch (err) {
    throw wrapDiscordError(err);
  }
}

export async function listThreads(
  client: Client<true>,
  channelId: string,
  opts: { archived?: boolean } = {},
) {
  const ch = asThreadParent(await fetchChannelOrThrow(client, channelId));
  try {
    if (opts.archived) {
      const archived = await ch.threads.fetchArchived();
      return ((archived as { threads: Map<string, ThreadChannel> }).threads
        ? Array.from((archived as { threads: Map<string, ThreadChannel> }).threads.values())
        : []
      ).map(serializeThread);
    }
    const active = await ch.threads.fetchActive();
    return ((active as { threads: Map<string, ThreadChannel> }).threads
      ? Array.from((active as { threads: Map<string, ThreadChannel> }).threads.values())
      : []
    ).map(serializeThread);
  } catch (err) {
    throw wrapDiscordError(err);
  }
}

async function fetchThread(client: Client<true>, threadId: string): Promise<ThreadChannel> {
  const t = await client.channels.fetch(threadId).catch(() => null);
  if (!t || !t.isThread()) {
    throw new DiscoError("NOT_FOUND", `Thread ${threadId} not found.`);
  }
  return t;
}

export async function archiveThread(client: Client<true>, threadId: string, archived = true) {
  const t = await fetchThread(client, threadId);
  try {
    await t.setArchived(archived);
    return serializeThread(t);
  } catch (err) {
    throw wrapDiscordError(err);
  }
}

export async function joinThread(client: Client<true>, threadId: string) {
  const t = await fetchThread(client, threadId);
  try {
    await t.join();
    return { threadId, joined: true };
  } catch (err) {
    throw wrapDiscordError(err);
  }
}

export async function leaveThread(client: Client<true>, threadId: string) {
  const t = await fetchThread(client, threadId);
  try {
    await t.leave();
    return { threadId, left: true };
  } catch (err) {
    throw wrapDiscordError(err);
  }
}

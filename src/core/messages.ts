// Message send/edit/delete/list/react/pin wrappers.

import type { Client, TextBasedChannel, MessageCreateOptions } from "discord.js";
import { fetchChannelOrThrow } from "./client.js";
import { serializeMessage } from "./serialize.js";
import { DiscoError, wrapDiscordError } from "./errors.js";

function asTextBased(channel: unknown): TextBasedChannel {
  const c = channel as TextBasedChannel;
  if (!c || typeof (c as { isTextBased?: () => boolean }).isTextBased !== "function" || !c.isTextBased()) {
    throw new DiscoError("INVALID_INPUT", "Channel is not text-based; cannot send messages.");
  }
  return c;
}

export interface MessageSendInput {
  channelId: string;
  content?: string;
  embedsJson?: string;
  componentsJson?: string;
  filePaths?: string[];
  replyToId?: string;
  tts?: boolean;
}

export async function sendMessage(client: Client<true>, input: MessageSendInput) {
  const ch = asTextBased(await fetchChannelOrThrow(client, input.channelId));
  const payload: MessageCreateOptions = {
    content: input.content,
    tts: input.tts,
    embeds: input.embedsJson ? JSON.parse(input.embedsJson) : undefined,
    components: input.componentsJson ? JSON.parse(input.componentsJson) : undefined,
    files: input.filePaths,
  };
  if (input.replyToId) {
    payload.reply = { messageReference: input.replyToId, failIfNotExists: false };
  }
  try {
    const sent = await (ch as { send: (p: MessageCreateOptions) => Promise<unknown> }).send(payload);
    return serializeMessage(sent as never);
  } catch (err) {
    throw wrapDiscordError(err);
  }
}

export async function editMessage(
  client: Client<true>,
  channelId: string,
  messageId: string,
  content: string,
) {
  const ch = asTextBased(await fetchChannelOrThrow(client, channelId));
  try {
    const msg = await (ch as { messages: { fetch: (id: string) => Promise<{ edit: (c: string) => Promise<unknown> }> } }).messages.fetch(messageId);
    const updated = await msg.edit(content);
    return serializeMessage(updated as never);
  } catch (err) {
    throw wrapDiscordError(err);
  }
}

export async function deleteMessage(
  client: Client<true>,
  channelId: string,
  messageId: string,
) {
  const ch = asTextBased(await fetchChannelOrThrow(client, channelId));
  try {
    const msg = await (ch as { messages: { fetch: (id: string) => Promise<{ delete: () => Promise<unknown> }> } }).messages.fetch(messageId);
    await msg.delete();
    return { id: messageId, deleted: true };
  } catch (err) {
    throw wrapDiscordError(err);
  }
}

export async function listMessages(
  client: Client<true>,
  channelId: string,
  opts: { limit?: number; before?: string; after?: string } = {},
) {
  const ch = asTextBased(await fetchChannelOrThrow(client, channelId));
  try {
    const fetched = await (ch as { messages: { fetch: (q: unknown) => Promise<Map<string, unknown>> } }).messages.fetch({
      limit: Math.min(opts.limit ?? 50, 100),
      before: opts.before,
      after: opts.after,
    });
    return Array.from(fetched.values()).map((m) => serializeMessage(m as never));
  } catch (err) {
    throw wrapDiscordError(err);
  }
}

export async function reactMessage(
  client: Client<true>,
  channelId: string,
  messageId: string,
  emoji: string,
) {
  const ch = asTextBased(await fetchChannelOrThrow(client, channelId));
  try {
    const msg = await (ch as { messages: { fetch: (id: string) => Promise<{ react: (e: string) => Promise<unknown> }> } }).messages.fetch(messageId);
    await msg.react(emoji);
    return { messageId, emoji, reacted: true };
  } catch (err) {
    throw wrapDiscordError(err);
  }
}

export async function setMessagePinned(
  client: Client<true>,
  channelId: string,
  messageId: string,
  pinned: boolean,
) {
  const ch = asTextBased(await fetchChannelOrThrow(client, channelId));
  try {
    const msg = await (ch as { messages: { fetch: (id: string) => Promise<{ pin: () => Promise<unknown>; unpin: () => Promise<unknown> }> } }).messages.fetch(messageId);
    if (pinned) await msg.pin();
    else await msg.unpin();
    return { messageId, pinned };
  } catch (err) {
    throw wrapDiscordError(err);
  }
}

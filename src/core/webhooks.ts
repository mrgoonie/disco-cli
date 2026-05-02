// Webhook CRUD + send.

import { WebhookClient, type Client } from "discord.js";
import { fetchChannelOrThrow } from "./client.js";
import { serializeWebhook } from "./serialize.js";
import { DiscoError, wrapDiscordError } from "./errors.js";

export async function listWebhooks(client: Client<true>, channelId: string) {
  const ch = await fetchChannelOrThrow(client, channelId);
  if (!("fetchWebhooks" in ch) || typeof (ch as { fetchWebhooks: Function }).fetchWebhooks !== "function") {
    throw new DiscoError("INVALID_INPUT", "Channel does not support webhooks.");
  }
  try {
    const hooks = await (ch as { fetchWebhooks: () => Promise<Map<string, unknown>> }).fetchWebhooks();
    return Array.from(hooks.values()).map((w) => serializeWebhook(w as never));
  } catch (err) {
    throw wrapDiscordError(err);
  }
}

export interface WebhookCreateInput {
  channelId: string;
  name: string;
  avatar?: string;
  reason?: string;
}

export async function createWebhook(client: Client<true>, input: WebhookCreateInput) {
  const ch = await fetchChannelOrThrow(client, input.channelId);
  if (!("createWebhook" in ch) || typeof (ch as { createWebhook: Function }).createWebhook !== "function") {
    throw new DiscoError("INVALID_INPUT", "Channel does not support webhooks.");
  }
  try {
    const hook = await (ch as { createWebhook: (o: unknown) => Promise<unknown> }).createWebhook({
      name: input.name,
      avatar: input.avatar,
      reason: input.reason,
    });
    return serializeWebhook(hook as never);
  } catch (err) {
    throw wrapDiscordError(err);
  }
}

export async function deleteWebhook(client: Client<true>, webhookId: string, reason?: string) {
  try {
    const hook = await client.fetchWebhook(webhookId);
    await hook.delete(reason);
    return { webhookId, deleted: true };
  } catch (err) {
    throw wrapDiscordError(err);
  }
}

export interface WebhookSendInput {
  url?: string;
  webhookId?: string;
  webhookToken?: string;
  content?: string;
  username?: string;
  avatarUrl?: string;
  embedsJson?: string;
  threadId?: string;
}

export async function sendViaWebhook(input: WebhookSendInput) {
  const wh = input.url
    ? new WebhookClient({ url: input.url })
    : input.webhookId && input.webhookToken
      ? new WebhookClient({ id: input.webhookId, token: input.webhookToken })
      : null;
  if (!wh) {
    throw new DiscoError("INVALID_INPUT", "Provide --url or both --webhook-id and --webhook-token.");
  }
  try {
    const sent = await wh.send({
      content: input.content,
      username: input.username,
      avatarURL: input.avatarUrl,
      embeds: input.embedsJson ? JSON.parse(input.embedsJson) : undefined,
      threadId: input.threadId,
    });
    return { id: sent.id, channelId: sent.channel_id ?? null };
  } catch (err) {
    throw wrapDiscordError(err);
  } finally {
    wh.destroy();
  }
}

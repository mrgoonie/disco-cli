// Lifecycle helpers for short-lived discord.js Client instances.
// `withClient` logs in, runs the task, and always destroys the client to keep CLI exits clean.

import { Client, GatewayIntentBits, Partials, type ClientOptions } from "discord.js";
import { DiscoError, wrapDiscordError } from "./errors.js";

export const DEFAULT_INTENTS: GatewayIntentBits[] = [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMembers,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.GuildMessageReactions,
  GatewayIntentBits.GuildModeration,
  GatewayIntentBits.GuildWebhooks,
  GatewayIntentBits.GuildInvites,
  GatewayIntentBits.GuildEmojisAndStickers,
  GatewayIntentBits.GuildScheduledEvents,
  GatewayIntentBits.MessageContent,
  GatewayIntentBits.AutoModerationConfiguration,
  GatewayIntentBits.AutoModerationExecution,
];

export const DEFAULT_PARTIALS: Partials[] = [
  Partials.Channel,
  Partials.Message,
  Partials.User,
  Partials.GuildMember,
  Partials.Reaction,
  Partials.ThreadMember,
];

export function buildClient(options: Partial<ClientOptions> = {}): Client {
  return new Client({
    intents: options.intents ?? DEFAULT_INTENTS,
    partials: options.partials ?? DEFAULT_PARTIALS,
    ...options,
  });
}

export async function withClient<T>(
  token: string,
  task: (client: Client<true>) => Promise<T>,
  options: Partial<ClientOptions> = {},
): Promise<T> {
  const client = buildClient(options);
  try {
    await client.login(token);
    // Cast: after `login()` resolves, client is ready-typed for our purposes.
    return await task(client as Client<true>);
  } catch (err) {
    throw wrapDiscordError(err);
  } finally {
    try {
      await client.destroy();
    } catch {
      // best-effort cleanup
    }
  }
}

export async function fetchGuildOrThrow(client: Client<true>, guildId: string) {
  try {
    return await client.guilds.fetch(guildId);
  } catch (err) {
    throw new DiscoError("NOT_FOUND", `Guild ${guildId} not found or bot not in guild.`, {
      cause: err,
    });
  }
}

export async function fetchChannelOrThrow(client: Client<true>, channelId: string) {
  const ch = await client.channels.fetch(channelId).catch(() => null);
  if (!ch) {
    throw new DiscoError("NOT_FOUND", `Channel ${channelId} not found.`);
  }
  return ch;
}

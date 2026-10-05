// Lifecycle helpers for short-lived discord.js Client instances.
//
// One-shot commands are REST-only: `withClient` sets the token on the REST
// manager and never calls `client.login()`. A gateway login sends an IDENTIFY,
// and Discord resets the bot token once an application exceeds 1000 IDENTIFY
// calls in 24h. Running many short CLI commands must never consume that budget.
// Only `disco listen` opens a gateway session (see listen.ts + gateway.ts).

import {
  Client,
  ClientApplication,
  ClientUser,
  GatewayIntentBits,
  Partials,
  Routes,
  type ClientOptions,
  type Guild,
} from "discord.js";
import { DiscoError, wrapDiscordError } from "./errors.js";

// Intents only matter for gateway sessions (`disco listen`). Privileged intents
// (GuildMembers, GuildPresences) are opt-in via `--intents` so a bot without
// them enabled in the Developer Portal does not get a 4014 close.
export const DEFAULT_INTENTS: GatewayIntentBits[] = [
  GatewayIntentBits.Guilds,
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

// Minimal internal surface used to hydrate a REST-only client. These fields are
// normally populated by the gateway READY payload.
interface MutableClient {
  user: ClientUser | null;
  application: ClientApplication | null;
}

/**
 * Builds a REST-only client: token set on the REST manager, `client.user`
 * hydrated from `GET /users/@me`. No gateway connection, no IDENTIFY.
 */
export async function createRestClient(
  token: string,
  options: Partial<ClientOptions> = {},
): Promise<Client<true>> {
  const client = buildClient(options);
  client.rest.setToken(token);
  try {
    const me = await client.rest.get(Routes.user("@me"));
    (client as unknown as MutableClient).user = new (ClientUser as unknown as new (
      c: Client,
      d: unknown,
    ) => ClientUser)(client, me);
  } catch (err) {
    await client.destroy().catch(() => undefined);
    throw wrapDiscordError(err);
  }
  return client as Client<true>;
}

export async function withClient<T>(
  token: string,
  task: (client: Client<true>) => Promise<T>,
  options: Partial<ClientOptions> = {},
): Promise<T> {
  const client = await createRestClient(token, options);
  try {
    return await task(client);
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

/** Lazily hydrates `client.application` (gateway READY normally does this). */
export async function ensureApplication(client: Client<true>): Promise<ClientApplication> {
  if (client.application) return client.application;
  try {
    const data = await client.rest.get(Routes.currentApplication());
    const app = new (ClientApplication as unknown as new (
      c: Client,
      d: unknown,
    ) => ClientApplication)(client, data);
    (client as unknown as MutableClient).application = app;
    return app;
  } catch (err) {
    throw wrapDiscordError(err);
  }
}

export async function fetchGuildOrThrow(client: Client<true>, guildId: string): Promise<Guild> {
  try {
    return await client.guilds.fetch(guildId);
  } catch (err) {
    throw new DiscoError("NOT_FOUND", `Guild ${guildId} not found or bot not in guild.`, {
      cause: err,
    });
  }
}

interface ChannelCacheInternals {
  _add: (data: unknown, guild: Guild | null) => unknown;
}

/**
 * Fetches a channel over REST. Guild channels need their guild in cache for
 * discord.js to build a typed channel object; with no gateway the guild cache
 * starts empty, so the guild is fetched (REST) first when needed.
 */
export async function fetchChannelOrThrow(client: Client<true>, channelId: string) {
  const cached = client.channels.cache.get(channelId);
  if (cached && !cached.partial) return cached;

  let data: { guild_id?: string };
  try {
    data = (await client.rest.get(Routes.channel(channelId))) as { guild_id?: string };
  } catch (err) {
    const wrapped = wrapDiscordError(err);
    if (wrapped.code === "NOT_FOUND") {
      throw new DiscoError("NOT_FOUND", `Channel ${channelId} not found.`, { cause: err });
    }
    throw wrapped;
  }

  const guild = data.guild_id ? await fetchGuildOrThrow(client, data.guild_id) : null;
  const ch = (client.channels as unknown as ChannelCacheInternals)._add(data, guild);
  if (!ch) {
    throw new DiscoError("NOT_FOUND", `Channel ${channelId} has an unsupported type.`);
  }
  return ch as NonNullable<ReturnType<typeof client.channels.cache.get>>;
}

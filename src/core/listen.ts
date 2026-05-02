// Long-running event tap. Streams gateway events to a callback.
// Useful for debugging, scripting reactions to live activity.

import { Events, type Client } from "discord.js";
import { buildClient } from "./client.js";
import { wrapDiscordError } from "./errors.js";

export type EventName = keyof typeof Events | string;

export interface ListenOptions {
  events?: EventName[];
  onEvent: (eventName: string, payload: unknown) => void;
  onReady?: (info: { id: string; tag: string; guilds: number }) => void;
}

const DEFAULT_EVENTS: EventName[] = [
  "ready",
  "messageCreate",
  "messageUpdate",
  "messageDelete",
  "guildMemberAdd",
  "guildMemberRemove",
  "guildMemberUpdate",
  "interactionCreate",
  "guildCreate",
  "guildDelete",
  "channelCreate",
  "channelDelete",
  "roleCreate",
  "roleDelete",
];

export async function startListener(token: string, opts: ListenOptions): Promise<Client> {
  const client = buildClient();
  const events = opts.events && opts.events.length > 0 ? opts.events : DEFAULT_EVENTS;

  client.once(Events.ClientReady, (c) => {
    opts.onReady?.({ id: c.user.id, tag: c.user.tag, guilds: c.guilds.cache.size });
  });

  for (const ev of events) {
    client.on(ev as never, ((...args: unknown[]) => {
      // Strip circular discord.js refs by serializing through a depth-limited replacer.
      const payload = args.length === 1 ? args[0] : args;
      opts.onEvent(String(ev), summarize(payload));
    }) as never);
  }

  try {
    await client.login(token);
    return client;
  } catch (err) {
    await client.destroy().catch(() => undefined);
    throw wrapDiscordError(err);
  }
}

function summarize(value: unknown, depth = 0): unknown {
  if (depth > 3) return "[...]";
  if (value === null || value === undefined) return value;
  if (typeof value !== "object") return value;
  if (Array.isArray(value)) return value.slice(0, 20).map((v) => summarize(v, depth + 1));
  const v = value as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const key of ["id", "name", "content", "channelId", "guildId", "userId", "tag", "type"]) {
    if (key in v) out[key] = summarize(v[key], depth + 1);
  }
  return Object.keys(out).length > 0 ? out : "[object]";
}

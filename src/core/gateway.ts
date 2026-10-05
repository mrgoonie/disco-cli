// Gateway session-start budget.
//
// Discord allows 1000 IDENTIFY calls per application per 24h. Exceeding it
// terminates every session AND resets the bot token. `GET /gateway/bot` reports
// the remaining budget; check it before any command opens a gateway session.

import { REST, Routes } from "discord.js";
import { DiscoError, wrapDiscordError } from "./errors.js";

export interface SessionStartLimit {
  total: number;
  remaining: number;
  resetAfterMs: number;
  maxConcurrency: number;
}

export interface GatewayBotInfo {
  url: string;
  shards: number;
  sessionStartLimit: SessionStartLimit;
}

/** Default minimum remaining IDENTIFY budget before `listen` refuses to connect. */
export const DEFAULT_MIN_SESSION_STARTS = 100;

interface RawGatewayBot {
  url: string;
  shards: number;
  session_start_limit: {
    total: number;
    remaining: number;
    reset_after: number;
    max_concurrency: number;
  };
}

export function parseGatewayBot(raw: RawGatewayBot): GatewayBotInfo {
  const l = raw.session_start_limit;
  return {
    url: raw.url,
    shards: raw.shards,
    sessionStartLimit: {
      total: l.total,
      remaining: l.remaining,
      resetAfterMs: l.reset_after,
      maxConcurrency: l.max_concurrency,
    },
  };
}

/** Reads the gateway session-start budget over REST (no IDENTIFY consumed). */
export async function getGatewayBot(token: string, rest?: REST): Promise<GatewayBotInfo> {
  const client = rest ?? new REST({ version: "10" }).setToken(token);
  try {
    return parseGatewayBot((await client.get(Routes.gatewayBot())) as RawGatewayBot);
  } catch (err) {
    throw wrapDiscordError(err);
  }
}

/**
 * Throws GATEWAY_BUDGET_LOW when fewer than `minRemaining` session starts are
 * left, so a reconnect loop or repeated `listen` runs cannot trigger a token reset.
 */
export function assertSessionBudget(info: GatewayBotInfo, minRemaining = DEFAULT_MIN_SESSION_STARTS): void {
  const { remaining, total, resetAfterMs } = info.sessionStartLimit;
  if (remaining < minRemaining) {
    const resetMin = Math.ceil(resetAfterMs / 60000);
    throw new DiscoError(
      "GATEWAY_BUDGET_LOW",
      `Only ${remaining}/${total} gateway session starts left; refusing to connect (minimum ${minRemaining}).`,
      {
        hint: `Budget resets in ~${resetMin} min. Discord resets the bot token when it reaches 0. Use REST commands meanwhile, or lower --min-session-starts at your own risk.`,
      },
    );
  }
}

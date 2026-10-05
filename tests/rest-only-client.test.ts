import { describe, expect, it, vi } from "vitest";
import { Client } from "discord.js";
import { assertSessionBudget, parseGatewayBot } from "../src/core/gateway.js";
import { DiscoError, exitCodeFor } from "../src/core/errors.js";
import { resolveIntents } from "../src/core/listen.js";
import { DEFAULT_INTENTS, withClient } from "../src/core/client.js";

const raw = (remaining: number) => ({
  url: "wss://gateway.discord.gg",
  shards: 1,
  session_start_limit: { total: 1000, remaining, reset_after: 3_600_000, max_concurrency: 1 },
});

describe("gateway session budget", () => {
  it("parses GET /gateway/bot", () => {
    expect(parseGatewayBot(raw(998)).sessionStartLimit).toEqual({
      total: 1000,
      remaining: 998,
      resetAfterMs: 3_600_000,
      maxConcurrency: 1,
    });
  });

  it("allows connecting when budget is above the minimum", () => {
    expect(() => assertSessionBudget(parseGatewayBot(raw(500)), 100)).not.toThrow();
  });

  it("refuses with GATEWAY_BUDGET_LOW (exit 5) when budget is low", () => {
    try {
      assertSessionBudget(parseGatewayBot(raw(40)), 100);
      expect.unreachable();
    } catch (err) {
      expect(err).toBeInstanceOf(DiscoError);
      expect((err as DiscoError).code).toBe("GATEWAY_BUDGET_LOW");
      expect(exitCodeFor((err as DiscoError).code)).toBe(5);
    }
  });
});

describe("resolveIntents", () => {
  it("excludes privileged GuildMembers by default and adds it on request", async () => {
    const { GatewayIntentBits } = await import("discord.js");
    expect(DEFAULT_INTENTS).not.toContain(GatewayIntentBits.GuildMembers);
    expect(resolveIntents(["GuildMembers"])).toContain(GatewayIntentBits.GuildMembers);
  });

  it("rejects unknown intent names", () => {
    expect(() => resolveIntents(["Nope"])).toThrow(DiscoError);
  });
});

describe("withClient (REST-only)", () => {
  it("never calls client.login(), so no IDENTIFY is consumed", async () => {
    const login = vi.spyOn(Client.prototype, "login");
    const get = vi.spyOn((await import("discord.js")).REST.prototype, "get").mockResolvedValue({
      id: "123456789012345678",
      username: "bot",
      discriminator: "0",
      bot: true,
    } as never);

    const id = await withClient("x.y.z", async (c) => c.user.id);

    expect(id).toBe("123456789012345678");
    expect(login).not.toHaveBeenCalled();
    login.mockRestore();
    get.mockRestore();
  });
});

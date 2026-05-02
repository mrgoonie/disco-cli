import { describe, expect, it } from "vitest";
import { DiscoError, exitCodeFor, wrapDiscordError } from "../src/core/errors.js";

describe("DiscoError", () => {
  it("serializes to JSON with code, message, hint", () => {
    const e = new DiscoError("AUTH_MISSING", "no token", { hint: "run login" });
    expect(e.toJSON()).toEqual({
      error: { code: "AUTH_MISSING", message: "no token", hint: "run login" },
    });
  });
});

describe("exitCodeFor", () => {
  it("maps auth errors to 2", () => {
    expect(exitCodeFor("AUTH_MISSING")).toBe(2);
    expect(exitCodeFor("AUTH_INVALID")).toBe(2);
  });
  it("maps Discord API errors to 3", () => {
    expect(exitCodeFor("DISCORD_API")).toBe(3);
    expect(exitCodeFor("RATE_LIMITED")).toBe(3);
  });
  it("maps user-facing errors to 1", () => {
    expect(exitCodeFor("INVALID_INPUT")).toBe(1);
    expect(exitCodeFor("NOT_FOUND")).toBe(1);
    expect(exitCodeFor("PERMISSION_DENIED")).toBe(1);
  });
  it("maps runtime to 4", () => {
    expect(exitCodeFor("RUNTIME")).toBe(4);
  });
});

describe("wrapDiscordError", () => {
  it("passes through DiscoError instances", () => {
    const orig = new DiscoError("NOT_FOUND", "x");
    expect(wrapDiscordError(orig)).toBe(orig);
  });
  it("maps 50013 to PERMISSION_DENIED with hint", () => {
    const e = wrapDiscordError({ code: 50013, message: "Missing Permissions" });
    expect(e.code).toBe("PERMISSION_DENIED");
    expect(e.hint).toMatch(/permission/i);
  });
  it("maps status 429 to RATE_LIMITED", () => {
    const e = wrapDiscordError({ status: 429, message: "rate limited" });
    expect(e.code).toBe("RATE_LIMITED");
  });
  it("falls back to DISCORD_API", () => {
    const e = wrapDiscordError({ message: "unknown" });
    expect(e.code).toBe("DISCORD_API");
  });
});

import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { loadConfig, redactToken } from "../src/core/config.js";

describe("loadConfig", () => {
  let cwd: string;
  const originalEnv = { ...process.env };

  beforeEach(() => {
    cwd = mkdtempSync(join(tmpdir(), "disco-test-"));
    delete process.env.DISCORD_BOT_TOKEN;
  });

  afterEach(() => {
    rmSync(cwd, { recursive: true, force: true });
    process.env = { ...originalEnv };
  });

  it("returns source=none when nothing configured", () => {
    const cfg = loadConfig({ cwd });
    expect(cfg.source).toBe("none");
    expect(cfg.token).toBeUndefined();
  });

  it("prefers --token flag over env", () => {
    process.env.DISCORD_BOT_TOKEN = "from-env";
    const cfg = loadConfig({ token: "from-flag", cwd });
    expect(cfg.source).toBe("flag");
    expect(cfg.token).toBe("from-flag");
  });

  it("reads project config when env+dotenv absent", () => {
    writeFileSync(join(cwd, ".discorc.json"), JSON.stringify({ token: "from-project" }));
    const cfg = loadConfig({ cwd });
    expect(cfg.source).toBe("project-config");
    expect(cfg.token).toBe("from-project");
  });

  it("reads .env file", () => {
    writeFileSync(join(cwd, ".env"), "DISCORD_BOT_TOKEN=from-dotenv\n");
    const cfg = loadConfig({ cwd });
    expect(cfg.token).toBe("from-dotenv");
  });
});

describe("redactToken", () => {
  it("redacts long tokens to first/last 4", () => {
    expect(redactToken("abcdefghijklmnop")).toBe("abcd…mnop");
  });
  it("returns *** for short", () => {
    expect(redactToken("abc")).toBe("***");
  });
  it("returns <none> for empty", () => {
    expect(redactToken(undefined)).toBe("<none>");
  });
});

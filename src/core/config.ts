// Credentials + config resolution. First hit wins.
// 1) explicit token arg  2) DISCORD_BOT_TOKEN env  3) .env.local/.env  4) user config  5) project config

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir, platform } from "node:os";
import { join, resolve } from "node:path";
import { config as loadDotenv } from "dotenv";
import { DiscoError } from "./errors.js";

export interface DiscoConfig {
  token?: string;
  applicationId?: string;
  defaultGuildId?: string;
}

export interface ResolvedConfig extends DiscoConfig {
  source: "flag" | "env" | "dotenv" | "user-config" | "project-config" | "none";
  configPath?: string;
}

export function userConfigDir(): string {
  if (platform() === "win32") {
    return join(process.env.APPDATA ?? join(homedir(), "AppData", "Roaming"), "disco-cli");
  }
  const xdg = process.env.XDG_CONFIG_HOME ?? join(homedir(), ".config");
  return join(xdg, "disco-cli");
}

export function userConfigPath(): string {
  return join(userConfigDir(), "config.json");
}

export function projectConfigPath(cwd = process.cwd()): string {
  return resolve(cwd, ".discorc.json");
}

function readJsonSafe(path: string): DiscoConfig | null {
  try {
    if (!existsSync(path)) return null;
    return JSON.parse(readFileSync(path, "utf8")) as DiscoConfig;
  } catch {
    return null;
  }
}

export function loadConfig(opts: { token?: string; cwd?: string } = {}): ResolvedConfig {
  const cwd = opts.cwd ?? process.cwd();

  if (opts.token) {
    return { token: opts.token, source: "flag" };
  }

  // Load .env files into process.env without overriding existing values.
  loadDotenv({ path: join(cwd, ".env.local"), override: false });
  loadDotenv({ path: join(cwd, ".env"), override: false });

  const envToken = process.env.DISCORD_BOT_TOKEN;
  if (envToken) {
    return {
      token: envToken,
      applicationId: process.env.DISCORD_APPLICATION_ID,
      defaultGuildId: process.env.DISCORD_DEFAULT_GUILD_ID,
      source: existsSync(join(cwd, ".env")) ? "dotenv" : "env",
    };
  }

  const projectCfg = readJsonSafe(projectConfigPath(cwd));
  if (projectCfg?.token) {
    return { ...projectCfg, source: "project-config", configPath: projectConfigPath(cwd) };
  }

  const userCfg = readJsonSafe(userConfigPath());
  if (userCfg?.token) {
    return { ...userCfg, source: "user-config", configPath: userConfigPath() };
  }

  return { source: "none" };
}

export function saveUserConfig(cfg: DiscoConfig): string {
  const dir = userConfigDir();
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const path = userConfigPath();
  const existing = readJsonSafe(path) ?? {};
  const merged = { ...existing, ...cfg };
  writeFileSync(path, JSON.stringify(merged, null, 2), { mode: 0o600 });
  return path;
}

export function clearUserConfig(): string {
  const path = userConfigPath();
  if (existsSync(path)) writeFileSync(path, "{}", { mode: 0o600 });
  return path;
}

export function requireToken(cfg: ResolvedConfig): string {
  if (!cfg.token) {
    throw new DiscoError(
      "AUTH_MISSING",
      "No Discord bot token found.",
      {
        hint:
          "Set DISCORD_BOT_TOKEN env var, run `disco login`, or pass --token. " +
          "See https://discord.com/developers/applications for tokens.",
      },
    );
  }
  return cfg.token;
}

export function redactToken(token: string | undefined): string {
  if (!token) return "<none>";
  if (token.length < 12) return "***";
  return `${token.slice(0, 4)}…${token.slice(-4)}`;
}

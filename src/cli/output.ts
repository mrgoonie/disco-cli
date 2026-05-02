// Output rendering: JSON or human-friendly. Honors NO_COLOR / --no-color.

import kleur from "kleur";
import { DiscoError, exitCodeFor, wrapDiscordError } from "../core/errors.js";

export interface OutputOptions {
  json?: boolean;
  noColor?: boolean;
  quiet?: boolean;
}

let GLOBAL_OUTPUT: OutputOptions = {};

export function setOutputOptions(opts: OutputOptions): void {
  GLOBAL_OUTPUT = opts;
  if (opts.noColor || process.env.NO_COLOR) kleur.enabled = false;
}

export function getOutputOptions(): OutputOptions {
  return GLOBAL_OUTPUT;
}

export function printResult(value: unknown): void {
  if (GLOBAL_OUTPUT.quiet) return;
  if (GLOBAL_OUTPUT.json) {
    process.stdout.write(JSON.stringify(value, null, 2) + "\n");
    return;
  }
  process.stdout.write(humanize(value) + "\n");
}

function humanize(value: unknown): string {
  if (value === null || value === undefined) return kleur.gray("(none)");
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) {
    if (value.length === 0) return kleur.gray("(empty list)");
    return value.map((v, i) => `${kleur.gray(`#${i + 1}`)} ${oneLine(v)}`).join("\n");
  }
  return Object.entries(value as Record<string, unknown>)
    .map(([k, v]) => `${kleur.cyan(k)}: ${formatScalar(v)}`)
    .join("\n");
}

function oneLine(v: unknown): string {
  if (v === null || v === undefined) return kleur.gray("(none)");
  if (typeof v !== "object") return String(v);
  const obj = v as Record<string, unknown>;
  const parts: string[] = [];
  for (const k of ["id", "name", "tag", "code", "username", "content", "url"]) {
    if (k in obj && obj[k] != null) parts.push(`${kleur.cyan(k)}=${String(obj[k]).slice(0, 80)}`);
  }
  return parts.length > 0 ? parts.join(" ") : JSON.stringify(obj);
}

function formatScalar(v: unknown): string {
  if (v === null || v === undefined) return kleur.gray("(none)");
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

export function printError(err: unknown): number {
  const e = err instanceof DiscoError ? err : wrapDiscordError(err);
  if (GLOBAL_OUTPUT.json) {
    process.stderr.write(JSON.stringify(e.toJSON(), null, 2) + "\n");
  } else {
    process.stderr.write(`${kleur.red("error")} ${kleur.bold(e.code)}: ${e.message}\n`);
    if (e.hint) process.stderr.write(`${kleur.yellow("hint")}: ${e.hint}\n`);
  }
  return exitCodeFor(e.code);
}

export function printInfo(msg: string): void {
  if (GLOBAL_OUTPUT.quiet || GLOBAL_OUTPUT.json) return;
  process.stderr.write(`${kleur.gray("•")} ${msg}\n`);
}

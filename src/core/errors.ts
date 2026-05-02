// Typed errors for actionable agent/CLI feedback.
// Each carries a stable `code` and a `hint` describing recovery.

export type ErrorCode =
  | "AUTH_MISSING"
  | "AUTH_INVALID"
  | "NOT_FOUND"
  | "PERMISSION_DENIED"
  | "INVALID_INPUT"
  | "RATE_LIMITED"
  | "DISCORD_API"
  | "RUNTIME";

export class DiscoError extends Error {
  code: ErrorCode;
  hint?: string;
  cause?: unknown;

  constructor(code: ErrorCode, message: string, opts?: { hint?: string; cause?: unknown }) {
    super(message);
    this.name = "DiscoError";
    this.code = code;
    this.hint = opts?.hint;
    this.cause = opts?.cause;
  }

  toJSON() {
    return { error: { code: this.code, message: this.message, hint: this.hint } };
  }
}

export function exitCodeFor(code: ErrorCode): number {
  switch (code) {
    case "AUTH_MISSING":
    case "AUTH_INVALID":
      return 2;
    case "RATE_LIMITED":
    case "DISCORD_API":
      return 3;
    case "INVALID_INPUT":
    case "NOT_FOUND":
    case "PERMISSION_DENIED":
      return 1;
    case "RUNTIME":
    default:
      return 4;
  }
}

export function wrapDiscordError(err: unknown): DiscoError {
  if (err instanceof DiscoError) return err;
  const e = err as { code?: string | number; message?: string; status?: number };
  const msg = e?.message ?? String(err);
  if (e?.code === 50001 || e?.code === 50013) {
    return new DiscoError("PERMISSION_DENIED", msg, {
      hint: "Bot lacks required permission. Check role permissions and channel overwrites.",
      cause: err,
    });
  }
  if (e?.code === 10003 || e?.code === 10004 || e?.code === 10008 || e?.code === 10013) {
    return new DiscoError("NOT_FOUND", msg, { cause: err });
  }
  if (e?.status === 401 || e?.code === 0) {
    return new DiscoError("AUTH_INVALID", msg, {
      hint: "Token rejected. Run `disco login` with a fresh bot token.",
      cause: err,
    });
  }
  if (e?.status === 429) {
    return new DiscoError("RATE_LIMITED", msg, {
      hint: "Discord rate limit. Retry after the cooldown.",
      cause: err,
    });
  }
  return new DiscoError("DISCORD_API", msg, { cause: err });
}

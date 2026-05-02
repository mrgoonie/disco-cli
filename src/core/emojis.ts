// Emoji + sticker management for guilds.

import { readFile } from "node:fs/promises";
import type { Client } from "discord.js";
import { fetchGuildOrThrow } from "./client.js";
import { serializeEmoji, serializeSticker } from "./serialize.js";
import { wrapDiscordError } from "./errors.js";

export async function listEmojis(client: Client<true>, guildId: string) {
  const g = await fetchGuildOrThrow(client, guildId);
  try {
    const emojis = await g.emojis.fetch();
    return emojis.map(serializeEmoji);
  } catch (err) {
    throw wrapDiscordError(err);
  }
}

export interface EmojiCreateInput {
  guildId: string;
  name: string;
  attachment: string; // file path or URL
  reason?: string;
}

export async function createEmoji(client: Client<true>, input: EmojiCreateInput) {
  const g = await fetchGuildOrThrow(client, input.guildId);
  try {
    const e = await g.emojis.create({
      name: input.name,
      attachment: input.attachment,
      reason: input.reason,
    });
    return serializeEmoji(e);
  } catch (err) {
    throw wrapDiscordError(err);
  }
}

export async function deleteEmoji(
  client: Client<true>,
  guildId: string,
  emojiId: string,
  reason?: string,
) {
  const g = await fetchGuildOrThrow(client, guildId);
  try {
    await g.emojis.delete(emojiId, reason);
    return { emojiId, deleted: true };
  } catch (err) {
    throw wrapDiscordError(err);
  }
}

export async function listStickers(client: Client<true>, guildId: string) {
  const g = await fetchGuildOrThrow(client, guildId);
  try {
    const stickers = await g.stickers.fetch();
    return stickers.map(serializeSticker);
  } catch (err) {
    throw wrapDiscordError(err);
  }
}

export interface StickerCreateInput {
  guildId: string;
  name: string;
  description: string;
  tags: string;
  filePath: string;
  reason?: string;
}

export async function createSticker(client: Client<true>, input: StickerCreateInput) {
  const g = await fetchGuildOrThrow(client, input.guildId);
  try {
    const buf = await readFile(input.filePath);
    const s = await g.stickers.create({
      name: input.name,
      description: input.description,
      tags: input.tags,
      file: { attachment: buf, name: input.filePath.split(/[\\/]/).pop() ?? "sticker.png" },
      reason: input.reason,
    });
    return serializeSticker(s);
  } catch (err) {
    throw wrapDiscordError(err);
  }
}

export async function deleteSticker(
  client: Client<true>,
  guildId: string,
  stickerId: string,
  reason?: string,
) {
  const g = await fetchGuildOrThrow(client, guildId);
  try {
    await g.stickers.delete(stickerId, reason);
    return { stickerId, deleted: true };
  } catch (err) {
    throw wrapDiscordError(err);
  }
}

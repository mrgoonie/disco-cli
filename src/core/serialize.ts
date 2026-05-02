// Convert discord.js objects into stable, JSON-safe shapes for CLI output.
// Concise by default; agents and scripts can opt into more detail at the call site.

import type {
  Guild,
  GuildBasedChannel,
  GuildMember,
  Invite,
  Message,
  Role,
  ThreadChannel,
  User,
  Webhook,
  GuildEmoji,
  Sticker,
  GuildScheduledEvent,
  AutoModerationRule,
  ApplicationCommand,
} from "discord.js";

export const serializeUser = (u: User) => ({
  id: u.id,
  username: u.username,
  globalName: u.globalName ?? null,
  bot: u.bot,
  tag: u.tag,
});

export const serializeGuild = (g: Guild) => ({
  id: g.id,
  name: g.name,
  ownerId: g.ownerId,
  memberCount: g.memberCount,
  description: g.description ?? null,
  preferredLocale: g.preferredLocale,
  createdAt: g.createdAt.toISOString(),
});

export const serializeChannel = (c: GuildBasedChannel) => ({
  id: c.id,
  name: "name" in c ? c.name : null,
  type: c.type,
  parentId: "parentId" in c ? c.parentId : null,
  guildId: c.guildId,
});

export const serializeMember = (m: GuildMember) => ({
  id: m.id,
  user: serializeUser(m.user),
  nickname: m.nickname,
  joinedAt: m.joinedAt?.toISOString() ?? null,
  roles: m.roles.cache.map((r) => r.id),
  premiumSince: m.premiumSince?.toISOString() ?? null,
  pending: m.pending,
});

export const serializeRole = (r: Role) => ({
  id: r.id,
  name: r.name,
  color: r.hexColor,
  position: r.position,
  hoist: r.hoist,
  mentionable: r.mentionable,
  permissions: r.permissions.toArray(),
  managed: r.managed,
});

export const serializeMessage = (m: Message) => ({
  id: m.id,
  channelId: m.channelId,
  guildId: m.guildId,
  authorId: m.author.id,
  authorTag: m.author.tag,
  content: m.content,
  createdAt: m.createdAt.toISOString(),
  editedAt: m.editedAt?.toISOString() ?? null,
  attachments: m.attachments.map((a) => ({ id: a.id, url: a.url, name: a.name })),
  embedsCount: m.embeds.length,
  pinned: m.pinned,
  reactions: m.reactions.cache.map((r) => ({
    emoji: r.emoji.toString(),
    count: r.count,
  })),
});

export const serializeThread = (t: ThreadChannel) => ({
  id: t.id,
  name: t.name,
  parentId: t.parentId,
  archived: t.archived,
  locked: t.locked,
  memberCount: t.memberCount,
  createdAt: t.createdAt?.toISOString() ?? null,
});

export const serializeWebhook = (w: Webhook) => ({
  id: w.id,
  name: w.name,
  channelId: w.channelId,
  url: w.url,
  type: w.type,
});

export const serializeInvite = (i: Invite) => ({
  code: i.code,
  url: i.url,
  channelId: i.channelId,
  guildId: i.guild?.id ?? null,
  inviterId: i.inviterId,
  uses: i.uses,
  maxUses: i.maxUses,
  expiresAt: i.expiresAt?.toISOString() ?? null,
});

export const serializeEmoji = (e: GuildEmoji) => ({
  id: e.id,
  name: e.name,
  animated: e.animated,
  managed: e.managed,
  url: e.imageURL(),
});

export const serializeSticker = (s: Sticker) => ({
  id: s.id,
  name: s.name,
  description: s.description,
  format: s.format,
  url: s.url,
});

export const serializeScheduledEvent = (e: GuildScheduledEvent) => ({
  id: e.id,
  guildId: e.guildId,
  name: e.name,
  description: e.description,
  scheduledStartAt: e.scheduledStartAt?.toISOString() ?? null,
  scheduledEndAt: e.scheduledEndAt?.toISOString() ?? null,
  status: e.status,
  entityType: e.entityType,
  channelId: e.channelId,
  creatorId: e.creatorId,
});

export const serializeAutoModRule = (r: AutoModerationRule) => ({
  id: r.id,
  name: r.name,
  enabled: r.enabled,
  eventType: r.eventType,
  triggerType: r.triggerType,
  creatorId: r.creatorId,
  exemptRoles: r.exemptRoles.map((x) => x.id),
  exemptChannels: r.exemptChannels.map((x) => x.id),
});

export const serializeAppCommand = (c: ApplicationCommand) => ({
  id: c.id,
  name: c.name,
  description: c.description,
  type: c.type,
  guildId: c.guildId,
  options: c.options,
});

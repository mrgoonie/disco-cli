// Role management: list/create/edit/delete + assign/remove on members.

import type { Client, ColorResolvable, PermissionResolvable } from "discord.js";
import { fetchGuildOrThrow } from "./client.js";
import { serializeRole } from "./serialize.js";
import { wrapDiscordError } from "./errors.js";

export async function listRoles(client: Client<true>, guildId: string) {
  const g = await fetchGuildOrThrow(client, guildId);
  const roles = await g.roles.fetch();
  return roles.map(serializeRole);
}

export interface RoleCreateInput {
  guildId: string;
  name: string;
  color?: string;
  hoist?: boolean;
  mentionable?: boolean;
  permissions?: string[];
  reason?: string;
}

export async function createRole(client: Client<true>, input: RoleCreateInput) {
  const g = await fetchGuildOrThrow(client, input.guildId);
  try {
    const role = await g.roles.create({
      name: input.name,
      color: input.color as ColorResolvable | undefined,
      hoist: input.hoist,
      mentionable: input.mentionable,
      permissions: input.permissions as PermissionResolvable[] | undefined,
      reason: input.reason,
    });
    return serializeRole(role);
  } catch (err) {
    throw wrapDiscordError(err);
  }
}

export interface RoleEditInput {
  name?: string;
  color?: string;
  hoist?: boolean;
  mentionable?: boolean;
  permissions?: string[];
  position?: number;
  reason?: string;
}

export async function editRole(
  client: Client<true>,
  guildId: string,
  roleId: string,
  input: RoleEditInput,
) {
  const g = await fetchGuildOrThrow(client, guildId);
  try {
    const role = await g.roles.fetch(roleId);
    if (!role) throw new Error(`Role ${roleId} not found`);
    const updated = await role.edit({
      name: input.name,
      color: input.color as ColorResolvable | undefined,
      hoist: input.hoist,
      mentionable: input.mentionable,
      permissions: input.permissions as PermissionResolvable[] | undefined,
      position: input.position,
      reason: input.reason,
    });
    return serializeRole(updated);
  } catch (err) {
    throw wrapDiscordError(err);
  }
}

export async function deleteRole(
  client: Client<true>,
  guildId: string,
  roleId: string,
  reason?: string,
) {
  const g = await fetchGuildOrThrow(client, guildId);
  try {
    const role = await g.roles.fetch(roleId);
    if (!role) throw new Error(`Role ${roleId} not found`);
    await role.delete(reason);
    return { guildId, roleId, deleted: true };
  } catch (err) {
    throw wrapDiscordError(err);
  }
}

export async function assignRole(
  client: Client<true>,
  guildId: string,
  userId: string,
  roleId: string,
  reason?: string,
) {
  const g = await fetchGuildOrThrow(client, guildId);
  try {
    const m = await g.members.fetch(userId);
    await m.roles.add(roleId, reason);
    return { guildId, userId, roleId, assigned: true };
  } catch (err) {
    throw wrapDiscordError(err);
  }
}

export async function removeRoleFromMember(
  client: Client<true>,
  guildId: string,
  userId: string,
  roleId: string,
  reason?: string,
) {
  const g = await fetchGuildOrThrow(client, guildId);
  try {
    const m = await g.members.fetch(userId);
    await m.roles.remove(roleId, reason);
    return { guildId, userId, roleId, removed: true };
  } catch (err) {
    throw wrapDiscordError(err);
  }
}

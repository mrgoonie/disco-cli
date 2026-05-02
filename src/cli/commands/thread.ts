// `disco thread ...` subcommands.

import { Command } from "commander";
import { runWithClient } from "../run.js";
import * as threads from "../../core/threads.js";

export function registerThreadCommands(root: Command): void {
  const cmd = root.command("thread").description("Manage threads");

  cmd
    .command("create")
    .description("Create a thread under a parent channel")
    .argument("<channelId>")
    .requiredOption("--name <name>")
    .option("--auto-archive <minutes>", "60 | 1440 | 4320 | 10080", (v) => parseInt(v, 10))
    .option("--invitable")
    .option("--start-message <id>")
    .option("--reason <reason>")
    .action(async (channelId: string, opts) => {
      await runWithClient((c) =>
        threads.createThread(c, {
          channelId,
          name: opts.name,
          autoArchiveMinutes: opts.autoArchive as 60 | 1440 | 4320 | 10080 | undefined,
          invitable: opts.invitable,
          startMessageId: opts.startMessage,
          reason: opts.reason,
        }),
      );
    });

  cmd
    .command("list")
    .description("List active or archived threads under a channel")
    .argument("<channelId>")
    .option("--archived", "List archived threads instead of active")
    .action(async (channelId: string, opts) => {
      await runWithClient((c) => threads.listThreads(c, channelId, { archived: opts.archived }));
    });

  cmd
    .command("archive")
    .description("Archive a thread")
    .argument("<threadId>")
    .action(async (threadId: string) => {
      await runWithClient((c) => threads.archiveThread(c, threadId, true));
    });

  cmd
    .command("unarchive")
    .description("Unarchive a thread")
    .argument("<threadId>")
    .action(async (threadId: string) => {
      await runWithClient((c) => threads.archiveThread(c, threadId, false));
    });

  cmd
    .command("join")
    .description("Bot joins a thread")
    .argument("<threadId>")
    .action(async (threadId: string) => {
      await runWithClient((c) => threads.joinThread(c, threadId));
    });

  cmd
    .command("leave")
    .description("Bot leaves a thread")
    .argument("<threadId>")
    .action(async (threadId: string) => {
      await runWithClient((c) => threads.leaveThread(c, threadId));
    });
}

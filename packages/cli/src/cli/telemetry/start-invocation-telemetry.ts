import { inspect } from 'node:util';

import type { Command } from 'commander';
import isContinuousIntegration from 'is-ci';

import {
  createInvocationTraceContext,
  markTelemetryNoticeShown,
  resolveTelemetryConnectionString,
  resolveTelemetryState,
  setInvocationTraceContext,
  type TelemetryState,
} from '@equinor/fusion-framework-cli/bin';

import {
  exportInvocation as defaultExportInvocation,
  type ExportInvocationOptions,
  type InvocationExportResult,
  type InvocationOutcome,
  type InvocationRecord,
} from './export-invocation.js';
import { createMachineId } from './create-machine-id.js';
import { resolveExceptionType } from './resolve-exception-type.js';
import { resolveFusionEnvironment } from './resolve-fusion-environment.js';
import { resolveInvocationCommand } from './resolve-invocation-command.js';
import { DEFAULT_TELEMETRY_TIMEOUT_MS, TELEMETRY_NOTICE } from './static.js';

/** Signals treated as cancellation; the CLI re-raises them after the bounded export. */
const CANCEL_SIGNALS = { SIGINT: 2, SIGTERM: 15 } as const;
type CancelSignal = keyof typeof CANCEL_SIGNALS;

/** The parts of `process` the invocation lifecycle uses; injectable for tests. */
export type TelemetryProcess = Pick<
  NodeJS.Process,
  | 'argv'
  | 'env'
  | 'pid'
  | 'platform'
  | 'arch'
  | 'versions'
  | 'exitCode'
  | 'stderr'
  | 'once'
  | 'on'
  | 'prependListener'
  | 'prependOnceListener'
  | 'removeListener'
  | 'listenerCount'
  | 'kill'
  | 'exit'
>;

/** Options for {@link startInvocationTelemetry}. */
export interface StartInvocationTelemetryOptions {
  /** Root command with all built-in and plugin commands registered. */
  program: Command;
  /** CLI package version. */
  version: string;
  /** Process to observe; defaults to the global `process`. */
  process?: TelemetryProcess;
  /** Whether the run is in CI; defaults to `is-ci`. */
  ci?: boolean;
  /** Upper bound for the export; defaults to {@link DEFAULT_TELEMETRY_TIMEOUT_MS}. */
  timeoutMs?: number;
  /** Exports the record; defaults to the Azure Monitor exporter. */
  exportInvocation?: (
    record: InvocationRecord,
    options: ExportInvocationOptions,
  ) => Promise<InvocationExportResult>;
  /** Epoch milliseconds clock; injectable for tests. */
  now?: () => number;
  /** Machine id provider; injectable for tests. */
  machineId?: () => string;
}

/** Handle to the running invocation's telemetry. */
export interface InvocationTelemetry {
  /** Trace id shared by the invocation request and outgoing Fusion requests. */
  readonly traceId: string;
  /**
   * Records a failure from an error that escaped command parsing, exports the invocation and
   * resolves; the caller then rethrows so the CLI fails exactly as it would without telemetry.
   */
  fail(error: unknown): Promise<void>;
  /**
   * Records a run that Commander ended itself (help, version or a usage error) with its exit
   * code, exports the invocation and resolves; the caller then exits with the same code.
   */
  exit(exitCode: number, error?: unknown): Promise<void>;
}

/** Normalizes `process.exitCode`, which may be unset or a numeric string. */
const toExitCode = (value: number | string | null | undefined): number => {
  const code = Number(value ?? 0);
  return Number.isInteger(code) ? code : 1;
};

/** Shows the one-time collection notice in interactive, non-CI sessions and remembers it. */
const showNotice = (state: TelemetryState, proc: TelemetryProcess, ci: boolean): void => {
  // Keep repeat, CI, and piped invocations free of interactive notices.
  if (state.settings.noticeShown || ci || !proc.stderr.isTTY) return;
  proc.stderr.write(TELEMETRY_NOTICE);
  try {
    markTelemetryNoticeShown(state.configPath);
  } catch {
    // An unwritable config only means the notice is shown again next run.
  }
};

/**
 * Starts usage telemetry for one CLI invocation and exports exactly one request when it ends.
 *
 * Nothing happens when telemetry is disabled through `FUSION_CLI_TELEMETRY_OPTOUT`,
 * `DO_NOT_TRACK` or `telemetry disable`. Otherwise the command path and option names are
 * resolved from argv, outgoing Fusion requests join the invocation trace, and the invocation is
 * exported with a bounded wait when the event loop drains (then Node.js exits on its own once
 * the command's shutdown work finishes; the process is only ended early when exporter work
 * outlived the time bound), when an error escapes parsing (see {@link InvocationTelemetry.fail}), when Commander
 * ends the run itself (see {@link InvocationTelemetry.exit}), on an uncaught exception that no
 * other handler owns (then the process exits with code 1, as Node.js would), or on SIGINT/SIGTERM
 * when no other handler owns the signal. Runs ended by an explicit `process.exit()` inside a command cannot be
 * exported, since Node.js runs no asynchronous work after it.
 *
 * Exit codes, signals and errors are preserved; telemetry failures are swallowed.
 *
 * @param options - Program, version and injectable dependencies.
 * @returns A handle to the running invocation, or `undefined` when telemetry is disabled.
 */
export const startInvocationTelemetry = (
  options: StartInvocationTelemetryOptions,
): InvocationTelemetry | undefined => {
  try {
    return start(options);
  } catch {
    // Telemetry setup must never prevent the command from running.
    return undefined;
  }
};

const start = (options: StartInvocationTelemetryOptions): InvocationTelemetry | undefined => {
  const proc = options.process ?? process;
  const state = resolveTelemetryState(proc.env);
  // Opt-out must leave both the trace context and process listeners untouched.
  if (!state.enabled) return undefined;

  const now = options.now ?? Date.now;
  const ci = options.ci ?? isContinuousIntegration;
  const exportRecord = options.exportInvocation ?? defaultExportInvocation;
  const connectionString = resolveTelemetryConnectionString(proc.env);
  const timeoutMs = options.timeoutMs ?? DEFAULT_TELEMETRY_TIMEOUT_MS;
  const startTime = now();
  const command = resolveInvocationCommand(options.program, proc.argv.slice(2));

  // `telemetry` manages the preference itself, so it should not trigger the notice.
  if (command.path[0] !== 'telemetry') {
    showNotice(state, proc, ci);
  }

  const trace = createInvocationTraceContext();
  setInvocationTraceContext(trace);

  let fusionEnvironment: string | undefined;
  let exceptionType: string | undefined;
  let cancelledBy: CancelSignal | undefined;
  let finished = false;

  options.program.hook('preAction', (_program, actionCommand) => {
    fusionEnvironment = resolveFusionEnvironment(actionCommand.opts().env);
  });

  const onUncaught = (error: unknown): void => {
    exceptionType ??= resolveExceptionType(error);
  };
  proc.on('uncaughtExceptionMonitor', onUncaught);

  // Node.js terminates on an uncaught exception without emitting `beforeExit`, so the CLI owns
  // fatal errors while no other handler does: it prints the error as Node.js would, exports the
  // invocation within the time bound, then exits with Node's fatal exit code 1.
  const onFatal = (error: unknown): void => {
    // A command-installed handler owns the fatal exit when present.
    if (proc.listenerCount('uncaughtException') > 1) return;
    proc.stderr.write(`\n${inspect(error)}\n\nNode.js v${proc.versions.node}\n`);
    // `finished` is set synchronously, so a second fatal error while exporting exits at once.
    if (finished) {
      proc.exit(1);
      return;
    }
    void finish(1).finally(() => proc.exit(1));
  };
  // Runs first, so handlers registered with `once` have not removed themselves yet.
  proc.prependListener('uncaughtException', onFatal);

  const finish = async (exitCode: number): Promise<InvocationExportResult> => {
    // Multiple completion paths can fire; only the first may export.
    if (finished) return 'settled';
    finished = true;
    setInvocationTraceContext(undefined);
    const outcome: InvocationOutcome =
      cancelledBy || exitCode === 130 || exitCode === 143
        ? 'cancelled'
        : exitCode === 0
          ? 'success'
          : 'failure';
    try {
      // Respect an opt-out made during this run, e.g. `telemetry disable`.
      if (!resolveTelemetryState(proc.env, state.configPath).enabled) return 'settled';
      // Omit optional dimensions altogether when no safe value was resolved.
      const record: InvocationRecord = {
        traceId: trace.traceId,
        spanId: trace.spanId,
        version: options.version,
        command: command.path.join(' '),
        commandKind: command.kind,
        optionNames: command.optionNames,
        exitCode,
        outcome,
        ...(exceptionType ? { exceptionType } : {}),
        startTime,
        endTime: now(),
        os: proc.platform,
        arch: proc.arch,
        nodeVersion: proc.versions.node ?? 'unknown',
        ci,
        ...(fusionEnvironment ? { fusionEnvironment } : {}),
        machineId: (options.machineId ?? createMachineId)(),
      };
      return await exportRecord(record, { connectionString, timeoutMs });
    } catch {
      // Telemetry, including collecting its metadata, must never change the command's outcome.
      return 'settled';
    }
  };

  proc.once('beforeExit', () => {
    // Another exit path may already have started the export.
    if (finished) return;
    void finish(toExitCode(proc.exitCode)).then((result) => {
      // Once export settles, Node.js exits on its own, after any shutdown work the command
      // scheduled from `beforeExit` and with the exit code that work leaves. Only exporter work
      // that outlived the time bound would hold the process open; the unref'd timer ends it then,
      // and never fires when nothing else keeps the event loop alive.
      if (result !== 'timedOut') return;
      setTimeout(() => proc.exit(toExitCode(proc.exitCode)), 0).unref();
    });
  });

  const signalListeners = new Map<CancelSignal, () => void>();
  // Handle both interrupt and termination with the same cancellation policy.
  for (const signal of Object.keys(CANCEL_SIGNALS) as CancelSignal[]) {
    const onSignal = (): void => {
      // Drop the other signal hook so shutdown cannot attempt a second export.
      for (const [other, listener] of signalListeners) {
        // The active once-listener has already removed itself.
        if (other !== signal) proc.removeListener(other, listener);
      }
      cancelledBy = signal;
      // Another handler owns shutdown; the run is marked cancelled if it later drains.
      if (proc.listenerCount(signal) > 0) return;
      void finish(128 + CANCEL_SIGNALS[signal]).finally(() => {
        // Our listener is already removed, so the default action terminates the process.
        proc.kill(proc.pid, signal);
      });
    };
    signalListeners.set(signal, onSignal);
    // Runs first, so the command's `once` handlers still count as owning the signal.
    proc.prependOnceListener(signal, onSignal);
  }

  return {
    traceId: trace.traceId,
    fail: async (error: unknown): Promise<void> => {
      exceptionType ??= resolveExceptionType(error);
      await finish(1);
    },
    exit: async (exitCode: number, error?: unknown): Promise<void> => {
      // Help and version exits should not carry an exception dimension.
      if (exitCode !== 0 && error !== undefined) exceptionType ??= resolveExceptionType(error);
      await finish(exitCode);
    },
  };
};

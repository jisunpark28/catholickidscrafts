import { execSync } from "node:child_process";

/** Vercel sets VERCEL_ENV to production | preview | development. */
export function isVercelPreviewDeploy(): boolean {
  if (process.env.VERCEL_ENV === "preview") return true;
  const ref = process.env.VERCEL_GIT_COMMIT_REF?.trim();
  // PR / feature branches on Vercel share Neon with production — treat as preview.
  return Boolean(ref && ref !== "main");
}

export function isVercelProductionDeploy(): boolean {
  return process.env.VERCEL_ENV === "production";
}

export type TimedCommandResult = {
  output: string;
  code: number;
  timedOut: boolean;
};

/**
 * Run a shell command with a hard timeout.
 * Preview PR builds share one Neon DB; concurrent `migrate deploy` can block on advisory locks.
 */
export function runWithTimeout(command: string, timeoutMs: number): TimedCommandResult {
  try {
    const output = execSync(command, {
      encoding: "utf8",
      timeout: timeoutMs,
      killSignal: "SIGTERM",
    });
    return { output, code: 0, timedOut: false };
  } catch (error) {
    const err = error as {
      stdout?: string;
      stderr?: string;
      status?: number;
      message?: string;
      killed?: boolean;
      signal?: string;
    };
    const output = [err.stdout, err.stderr, err.message].filter(Boolean).join("\n");
    const timedOut =
      err.killed === true ||
      err.signal === "SIGTERM" ||
      /timed out|ETIMEDOUT|ESRCH/i.test(output);
    return { output, code: err.status ?? 1, timedOut };
  }
}

export function isMigrationLockOrTimeout(output: string): boolean {
  return /timed out|ETIMEDOUT|advisory lock|lock timeout|P1002|P1017|connection pool|too many clients|ECONNRESET|ECONNREFUSED/i.test(
    output,
  );
}

function shouldContinueAfterDbLockOrTimeout(
  scope: "preview" | "production",
  label: string,
  output: string,
  timedOut: boolean,
): boolean {
  if (!timedOut && !isMigrationLockOrTimeout(output)) return false;
  const reason = timedOut ? "timeout" : "connection/lock issue";
  if (scope === "preview") {
    console.warn(
      `Preview deploy: ${label} did not complete (${reason}). Continuing build — shared Neon DB is migrated by production deploys.`,
    );
  } else {
    console.warn(
      `Production deploy: ${label} did not complete (${reason}). Continuing build — schema is likely already current on Neon.`,
    );
  }
  if (output.trim()) {
    console.warn(output.trim());
  }
  return true;
}

/** Preview/production builds should not fail when the shared Neon DB is busy or locked. */
export function shouldContinueBuildAfterDbStep(
  label: string,
  output: string,
  timedOut: boolean,
): boolean {
  if (isVercelPreviewDeploy()) {
    return shouldContinueAfterDbLockOrTimeout("preview", label, output, timedOut);
  }
  if (isVercelProductionDeploy()) {
    return shouldContinueAfterDbLockOrTimeout("production", label, output, timedOut);
  }
  return false;
}

/** @deprecated Use {@link shouldContinueBuildAfterDbStep}. */
export function shouldContinuePreviewBuildAfterDbStep(
  label: string,
  output: string,
  timedOut: boolean,
): boolean {
  return shouldContinueBuildAfterDbStep(label, output, timedOut);
}

import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";

const base = "http://127.0.0.1:3000";
let server;
let exitCode = 1;
async function isReady() {
  try {
    const response = await fetch(base, { signal: AbortSignal.timeout(1500) });
    await response.body?.cancel();
    return response.ok;
  } catch {
    return false;
  }
}
try {
  if (!(await isReady())) {
    server = spawn(
      process.execPath,
      ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1"],
      { stdio: "inherit", windowsHide: true },
    );
    server.on("error", () => {
      process.exitCode = 1;
    });
    const deadline = Date.now() + 60000;
    while (!(await isReady())) {
      if (server.exitCode !== null || Date.now() > deadline)
        throw new Error(
          "Không khởi động được máy chủ kiểm thử. Hãy chạy npm run build trước.",
        );
      await delay(300);
    }
  }
  const runner = spawn(
    process.execPath,
    ["node_modules/@playwright/test/cli.js", "test", ...process.argv.slice(2)],
    {
      stdio: "inherit",
      windowsHide: true,
      env: { ...process.env, E2E_EXTERNAL_SERVER: "1" },
    },
  );
  exitCode = await new Promise((resolve, reject) => {
    runner.on("exit", (code) => resolve(code ?? 1));
    runner.on("error", reject);
  });
} catch (error) {
  console.error(
    error instanceof Error
      ? error.message
      : "Không chạy được kiểm thử trình duyệt.",
  );
} finally {
  if (server && server.exitCode === null) {
    server.kill();
    await Promise.race([
      new Promise((resolve) => server.once("exit", resolve)),
      delay(3000),
    ]);
    if (server.exitCode === null) server.kill("SIGKILL");
  }
  process.exitCode = exitCode;
}

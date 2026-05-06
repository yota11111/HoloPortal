import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const astroBin = fileURLToPath(new URL("../node_modules/astro/bin/astro.mjs", import.meta.url));
const mode = process.argv[2] || "dev";
const extraArgs = process.argv.slice(3);
const basePath = process.env.PAGES_BASE_PATH || "/HoloPortal/";

const child = spawn(process.execPath, [astroBin, mode, ...extraArgs], {
  env: {
    ...process.env,
    BASE_PATH: basePath
  },
  stdio: "inherit"
});

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 0);
});

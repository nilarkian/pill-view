import esbuild from "esbuild";
import process from "process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProd = process.argv.includes("production");

// 1. Create the build context
const context = await esbuild.context({
  entryPoints: ["main.ts"],
  bundle: true,
  outfile: "main.js",
  format: "cjs",           // REQUIRED for Obsidian
  platform: "browser",     // Obsidian runs in browser context
  target: "es2020",
  sourcemap: !isProd,
  minify: isProd,
  external: [
    "obsidian",            // always external
  ],
  logLevel: "info",
});

// 2. Decide whether to watch or just build once
if (isProd) {
  await context.rebuild();
  process.exit(0);
} else {
  // This keeps the process alive and watches for changes
  await context.watch();
}
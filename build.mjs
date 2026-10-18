/**
 * 构建脚本：
 * - host:   src/host.js (+ templates.js) → dist/index.js（ESM，js-yaml 走外部解析）
 * - client: src/client.jsx → lib/client.js（CJS 包在 __ModuleLoader__.load 工厂里，
 *           react 系为平台种子模块，走 factory 的 require）
 * esbuild 使用仓库根 node_modules/.pnpm 里的二进制（本插件位于 <workspace>/dsh-mcp-market），
 * 找不到时回退到普通模块解析，不新增任何依赖。
 */
import { readdirSync, renameSync, writeFileSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));

function resolveEsbuild() {
  try {
    const pnpmDir = resolve(here, "../node_modules/.pnpm");
    const dir = readdirSync(pnpmDir).find((n) => /^esbuild@/.test(n));
    if (dir) return join(pnpmDir, dir, "node_modules/esbuild/lib/main.js");
  } catch {
    /* fall through */
  }
  return "esbuild";
}

const { build } = await import(resolveEsbuild());

const common = { logLevel: "warning", sourcemap: false };
const onlyClient = process.argv.includes("client");

/** 原子写出：先写 .tmp 再 rename，避免热重载观察到半个文件。 */
async function buildAtomic(options) {
  const outfile = options.outfile;
  const tmp = `${outfile}.tmp`;
  const result = await build({ ...options, write: false });
  const { outputFiles } = result;
  for (const file of outputFiles) {
    if (file.path === outfile) writeFileSync(tmp, file.contents);
    else writeFileSync(file.path, file.contents);
  }
  renameSync(tmp, outfile);
  return result;
}

// ---- host 侧 ----
if (!onlyClient) {
  await buildAtomic({
    ...common,
    entryPoints: [resolve(here, "src/host.js")],
    outfile: join(here, "dist/index.js"),
    bundle: true,
    format: "esm",
    platform: "node",
    target: "node22",
    external: ["js-yaml"],
  });
}

// ---- client 侧 ----
const banner = [
  'window.__ModuleLoader__.load({ id: "dsh-bridge-market", factory: (require) => {',
  "var module = { exports: {} };",
  "var exports = module.exports;",
].join("\n");
const footer = ["return module.exports;", "}});"].join("\n");

await buildAtomic({
  ...common,
  entryPoints: [resolve(here, "src/client.jsx")],
  outfile: join(here, "lib/client.js"),
  bundle: true,
  format: "cjs",
  platform: "browser",
  target: "es2020",
  jsx: "automatic",
  external: ["react", "react/jsx-runtime", "react-dom", "react-dom/client"],
  banner: { js: banner },
  footer: { js: footer },
});

if (onlyClient) console.log("✓ lib/client.js（client）");
else console.log("✓ dist/index.js（host）\n✓ lib/client.js（client）");

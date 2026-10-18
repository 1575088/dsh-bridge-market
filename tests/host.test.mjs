/**
 * 宿主侧逻辑单元测试：用临时 DSH_HOME 验证托管区域读写、CRUD、粘贴解析。
 * 运行：node --test tests/*.test.mjs（需已构建 dist，测试前先 node build.mjs）
 */
import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  parseRegionRows,
  rewriteRegion,
  upsertServer,
  deleteServer,
  setEnabled,
  parsePasted,
  readState,
} from "../dist/index.js";

let home;
beforeEach(async () => {
  home = await mkdtemp(join(tmpdir(), "mcp-market-test-"));
  process.env.DSH_HOME = home;
  // 显式钉住 profile 目录，否则 profileDir() 会去翻真机配置，测试会写进用户配置。
  process.env.DSH_PROFILE_DIR = join(home, "profiles", "web");
  delete process.env.DSH_PROFILE;
  await mkdir(join(home, "profiles", "web"), { recursive: true });
  await writeFile(
    join(home, "profiles", "web", "cordis.patch.yml"),
    [
      "# 用户自己的注释与行",
      "- id: browser",
      "  disabled: true",
      "",
    ].join("\n"),
  );
});

test("upsert 写入选定区域并保留其他内容", async () => {
  const state1 = await upsertServer({
    serverName: "apifox",
    transport: "stdio",
    command: "npx",
    args: ["-y", "apifox-mcp-server@latest", "--project=42"],
    env: { APIFOX_ACCESS_TOKEN: "tok-12345678" },
  });
  assert.equal(state1.servers.length, 1);
  assert.equal(state1.servers[0].managed, true);
  assert.equal(state1.servers[0].maskedAuth.APIFOX_ACCESS_TOKEN, "tok•••678");

  const file = await readFile(join(home, "profiles", "web", "cordis.patch.yml"), "utf8");
  assert.ok(file.includes("# >>> dsh-bridge-market managed region >>>"));
  assert.ok(file.includes("APIFOX_ACCESS_TOKEN"));
  assert.ok(file.includes("- id: browser"));
  assert.ok(file.includes("# 用户自己的注释与行"));
});

test("重复 serverName 被拒绝", async () => {
  await upsertServer({ serverName: "apifox", transport: "stdio", command: "npx" });
  await assert.rejects(
    upsertServer({ serverName: "apifox", transport: "stdio", command: "npx" }),
    /已被占用/,
  );
});

test("非法 serverName 被拒绝", async () => {
  await assert.rejects(
    upsertServer({ serverName: "非法名称", transport: "stdio", command: "npx" }),
    /1–32 位/,
  );
});

test("启停切换写入 disabled 字段", async () => {
  await upsertServer({ serverName: "pixso", transport: "streamable-http", url: "https://pixso.cn/mcp" });
  let state = await setEnabled("pixso", false);
  assert.equal(state.servers[0].disabled, true);
  state = await setEnabled("pixso", true);
  assert.equal(state.servers[0].disabled, false);
});

test("删除服务器移除对应行", async () => {
  await upsertServer({ serverName: "a", transport: "stdio", command: "npx" });
  await upsertServer({ serverName: "b", transport: "stdio", command: "npx" });
  let state = await deleteServer("a");
  assert.deepEqual(state.servers.map((s) => s.serverName), ["b"]);
  const rows = parseRegionRows(await readFile(join(home, "profiles", "web", "cordis.patch.yml"), "utf8"));
  assert.equal(rows.length, 1);
});

test("粘贴 Claude mcpServers JSON 转换正确", () => {
  const servers = parsePasted(JSON.stringify({
    mcpServers: {
      apifox: { command: "npx", args: ["-y", "apifox-mcp-server@latest"], env: { APIFOX_ACCESS_TOKEN: "t" } },
      pixso: { url: "https://pixso.cn/mcp", token: "pt" },
    },
  }));
  assert.equal(servers.length, 2);
  assert.equal(servers[0].transport, "stdio");
  assert.equal(servers[1].transport, "streamable-http");
  assert.equal(servers[1].headers.Authorization, "Bearer pt");
});

test("粘贴 DSH patch 行也能解析", () => {
  const servers = parsePasted(`
- insert:
    - id: mcp-x
      name: '@deepseek-ai/dsh-mcp-client'
      config:
        serverName: x
        transport: streamable-http
        url: https://example.com/mcp
        headers:
          api-token: abc
`);
  assert.equal(servers.length, 1);
  assert.equal(servers[0].serverName, "x");
  assert.equal(servers[0].headers["api-token"], "abc");
});

test("托管区域外的 mcp 行以只读外部配置呈现", async () => {
  const patch = join(home, "profiles", "web", "cordis.patch.yml");
  await writeFile(
    patch,
    [
      "- insert:",
      "    - id: ext-mcp",
      "      name: '@deepseek-ai/dsh-mcp-client'",
      "      config:",
      "        serverName: external",
      "        transport: stdio",
      "        command: npx",
      "",
    ].join("\n"),
  );
  const state = await readState();
  assert.equal(state.servers.length, 1);
  assert.equal(state.servers[0].managed, false);
  assert.equal(state.servers[0].serverName, "external");
});

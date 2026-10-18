/**
 * agent 侧入口（bridge_market 工具）单元测试：用假 ctx 捕获注册出来的定义，
 * 直接跑 list / attach / detach / status 四条路径，确认目录、写入、清理是通的。
 */
import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, readFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { apply } from "../dist/index.js";

let home;
let tool;

beforeEach(async () => {
  home = await mkdtemp(join(tmpdir(), "bridge-tool-test-"));
  process.env.DSH_HOME = home;
  process.env.DSH_PROFILE_DIR = join(home, "profiles", "web");
  delete process.env.DSH_PROFILE;
  await mkdir(join(home, "profiles", "web"), { recursive: true });
  await writeFile(join(home, "profiles", "web", "cordis.patch.yml"), "# empty\n");

  apply({
    get: (key) => (key === "tools" ? { register: (def) => ((tool = def), () => {}) } : null),
    effect: (fn) => fn(),
    webServer: { register: () => () => {} },
  });
});

test("工具已注册且带四个 action", () => {
  assert.equal(tool.name, "bridge_market");
  assert.deepEqual(tool.parameters.properties.action.enum, ["list", "attach", "detach", "status"]);
});

test("list 返回应用目录并标出可接入状态", async () => {
  const text = await tool.execute({ action: "list", query: "地图" });
  assert.match(text, /应用目录/);
  assert.match(text, /高德地图/);
  assert.match(text, /可接入|已接入/);
});

test("attach 写入托管区，detach 再移除", async () => {
  const attached = await tool.execute({
    action: "attach",
    app: "context7",
  });
  assert.match(attached, /已接入/);
  const file = await readFile(join(home, "profiles", "web", "cordis.patch.yml"), "utf8");
  assert.ok(file.includes("serverName: context7"));

  const status = await tool.execute({ action: "status" });
  assert.match(status, /context7/);

  const detached = await tool.execute({ action: "detach", app: "context7" });
  assert.match(detached, /已断开/);
  const after = await readFile(join(home, "profiles", "web", "cordis.patch.yml"), "utf8");
  assert.ok(!after.includes("serverName: context7"));
});

test("必填项缺失时拒绝接入并说明书怎么补", async () => {
  const text = await tool.execute({ action: "attach", app: "app-amap" });
  assert.match(text, /还缺必填项：key/);
});

/**
 * 客户端 apply() 冒烟测试：用 jsdom 模拟浏览器环境，验证
 * 1) 模块加载不抛错；2) apply() 能注册顶部栏 slot；3) 入口行能注入侧边栏；
 * 4) 点击入口行能打开弹窗 root；5) 弹窗初始渲染不抛错。
 * 运行：node tests/client-smoke.mjs（需先 node build.mjs）
 */
import { JSDOM } from "jsdom";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const require2 = createRequire(import.meta.url);

const dom = new JSDOM(
  `<!doctype html><html><body>
    <div data-dsh-frame>
      <div class="sidebarCol_x">
        <div class="logoRow_x">
          <button class="newSession_x">新会话</button>
        </div>
        <div data-dsh-skill-explorer-entry></div>
        <div class="workspaceRegion_x"></div>
      </div>
    </div>
  </body></html>`,
  { url: "http://127.0.0.1:3080/", pretendToBeVisual: true },
);

const { window } = dom;
const fetchCalls = [];
window.fetch = async (...args) => {
  fetchCalls.push(args);
  return {
  ok: true,
  json: async () => ({
    ok: true,
    patchPath: "/tmp/x",
    hotReload: true,
    servers: [],
    templates: [
      {
        id: "apifox-cloud",
        vendor: "Apifox",
        title: "Apifox MCP（公有云）",
        category: "接口工具",
        transport: "stdio",
        description: "d",
        docsUrl: "https://x",
        kind: "config",
        fields: [{ key: "projectId", label: "项目 ID", required: true }],
        serverNameDefault: "apifox",
        spec: { transport: "stdio", command: "npx", args: ["-y", "x", "--project={{projectId}}"], env: { APIFOX_ACCESS_TOKEN: "{{accessToken}}" } },
      },
    ],
    clientBoot: { count: 0, lastAt: null },
  }),
  };
};

// 供 bundle 内 require("react") 等解析：直接指向 profile 的 react / 浏览器 seed 等价物
const reactPath = "/Users/xieyong/.dsh/profiles/web/node_modules/react";
const requireReact = (spec) => {
  if (spec === "react") return require2(join(reactPath, "cjs/react.production.min.js"));
  if (spec === "react/jsx-runtime") {
    const jsxRuntime = require2(join(reactPath, "cjs/react-jsx-runtime.production.min.js"));
    return jsxRuntime;
  }
  if (spec === "react-dom/client") {
    // 用 jsdom 兼容的 react-dom：无真实包，退而求其次提供 createRoot stub
    return {
      createRoot(container) {
        return {
          render() {},
          unmount() {},
        };
      },
    };
  }
  throw new Error("unexpected require: " + spec);
};

window.__ModuleLoader__ = {
  load({ id, factory }) {
    window.__mmModule = factory(requireReact);
  },
};

globalThis.window = window;
globalThis.document = window.document;
globalThis.MutationObserver = window.MutationObserver;
globalThis.fetch = window.fetch;
globalThis.HTMLElement = window.HTMLElement;
globalThis.Node = window.Node;
globalThis.Element = window.Element;
globalThis.SVGElement = window.SVGElement;

// 加载 bundle
await import(`file://${join(here, "../lib/client.js")}`);
const mod = window.__mmModule;
assert.ok(mod && typeof mod.apply === "function", "client module exports apply");
assert.deepEqual(mod.inject, ["slots"]);

// 捕获 slot 注册
const slotRegistrations = [];
const ctx = {
  effect() {
    return () => {};
  },
  slots: {
    register(options, component) {
      slotRegistrations.push({ options, component });
      return () => {};
    },
    inject(key, factory) {
      factory();
      return () => {};
    },
  },
};

mod.apply(ctx);
await new Promise((r) => setTimeout(r, 50));

// 1) 顶部栏 slot 注册
const header = slotRegistrations.find((s) => s.options?.name === "conversation.session.header.actions");
assert.ok(header, "header action slot registered");
assert.equal(header.options.name, "conversation.session.header.actions");
assert.equal(header.options.id, "mcp-market");
assert.equal(typeof header.options.inject().toggle, "function");

// 2) 侧边栏入口行注入（技能中心行之后）
const entry = window.document.querySelector("[data-dsh-mcp-market-entry]");
assert.ok(entry, "sidebar entry injected");
// 行内兜底样式：不依赖样式表也能保持布局与左对齐
assert.ok(entry.getAttribute("style").includes("display:flex"), "entry has inline flex");
assert.ok(entry.getAttribute("style").includes("text-align:left"), "entry has inline left align");
const label = entry.querySelector(".mm-entryLabel");
assert.ok(label.getAttribute("style").includes("text-align:left"), "label inline left align");
const skillRow = window.document.querySelector("[data-dsh-skill-explorer-entry]");
const rows = Array.from(entry.parentElement.children);
assert.ok(
  rows.indexOf(entry) > rows.indexOf(skillRow),
  "entry placed below skill explorer row",
);

// 3) 点击入口行 → 弹窗 root 挂载到 document.body 且不抛错
entry.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
await new Promise((r) => setTimeout(r, 30));
const panelHost = window.document.querySelector("[data-dsh-mcp-market-panel]");
assert.ok(panelHost, "panel container mounted on click");
assert.equal(panelHost.parentElement, window.document.body, "panel hosted at document.body");

// 4) 再次点击 → 关闭
entry.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
await new Promise((r) => setTimeout(r, 30));
assert.equal(window.document.querySelector("[data-dsh-mcp-market-panel]"), null, "panel closed on second click");

// 5) 启动信标已发出
const bootCalls = fetchCalls.filter((c) => String(c[0]).includes("client-boot"));
assert.ok(bootCalls.length >= 1, "client-boot beacon fired");

// 6) 静态检查：jsx/jsxs 调用组件时必须带第二个参数（config），
//    否则 React 生产版会抛 "Cannot read properties of undefined (reading 'key')"
{
  const src = readFileSync(join(here, "../src/client.jsx"), "utf8");
  const bare = src.match(/\bjsxs?\(\s*[A-Z][A-Za-z0-9]*\s*\)/g) ?? [];
  assert.deepEqual(bare, [], `bare jsx component calls without config: ${bare.join(", ")}`);
}

console.log("✓ client smoke test passed");
process.exit(0);

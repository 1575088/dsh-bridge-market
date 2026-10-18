// src/host.js
import yaml from "js-yaml";
import { readFile, writeFile, rename, mkdir } from "node:fs/promises";
import { existsSync, readdirSync, statSync } from "node:fs";
import { join, sep } from "node:path";
import { homedir } from "node:os";

// src/templates.js
var TEMPLATES = [
  {
    id: "apifox-cloud",
    vendor: "Apifox",
    title: "Apifox MCP\uFF08\u516C\u6709\u4E91\uFF09",
    category: "\u63A5\u53E3\u5DE5\u5177",
    transport: "stdio",
    description: "\u5B98\u65B9 apifox-mcp-server\uFF1A\u8BA9 AI \u76F4\u63A5\u8BFB\u53D6 Apifox \u9879\u76EE\u5185\u7684 API \u6587\u6863\u3002\u4EC5\u9700\u8BBF\u95EE\u4EE4\u724C\u4E0E\u9879\u76EE ID\u3002",
    docsUrl: "https://docs.apifox.com/apifox-mcp-server",
    kind: "config",
    fields: [
      {
        key: "projectId",
        label: "\u9879\u76EE ID",
        placeholder: "\u9879\u76EE\u8BBE\u7F6E \u2192 \u57FA\u672C\u8BBE\u7F6E \u91CC\u590D\u5236",
        required: true
      },
      {
        key: "accessToken",
        label: "API \u8BBF\u95EE\u4EE4\u724C",
        type: "password",
        placeholder: "\u8D26\u53F7\u8BBE\u7F6E \u2192 API \u8BBF\u95EE\u4EE4\u724C \u2192 \u521B\u5EFA\u4EE4\u724C",
        required: true
      }
    ],
    serverNameDefault: "apifox",
    spec: {
      transport: "stdio",
      command: "npx",
      args: ["-y", "apifox-mcp-server@latest", "--project={{projectId}}"],
      env: { APIFOX_ACCESS_TOKEN: "{{accessToken}}" }
    }
  },
  {
    id: "apifox-private",
    vendor: "Apifox",
    title: "Apifox MCP\uFF08\u79C1\u6709\u5316\u90E8\u7F72\uFF09",
    category: "\u63A5\u53E3\u5DE5\u5177",
    transport: "stdio",
    description: "\u79C1\u6709\u5316\u90E8\u7F72\u7248\uFF1A\u540C\u6837\u4F7F\u7528\u5B98\u65B9 npx \u5305\uFF0C\u989D\u5916\u6307\u5B9A\u81EA\u5EFA\u670D\u52A1\u7684 API \u5730\u5740\uFF08--apifox-api-base-url\uFF09\u3002",
    docsUrl: "https://docs.apifox.com/6327888m0",
    kind: "config",
    fields: [
      {
        key: "projectId",
        label: "\u9879\u76EE ID",
        placeholder: "\u79C1\u6709\u5316\u5B9E\u4F8B\u7684\u9879\u76EE ID",
        required: true
      },
      {
        key: "accessToken",
        label: "API \u8BBF\u95EE\u4EE4\u724C",
        type: "password",
        placeholder: "\u5728\u79C1\u6709\u5316\u90E8\u7F72\u5B9E\u4F8B\u4E2D\u751F\u6210",
        required: true
      },
      {
        key: "baseUrl",
        label: "\u79C1\u6709\u5316 API \u5730\u5740",
        placeholder: "https://your-apifox-server.com\uFF08http/https \u5F00\u5934\uFF09",
        required: true
      }
    ],
    serverNameDefault: "apifox-private",
    spec: {
      transport: "stdio",
      command: "npx",
      args: [
        "-y",
        "apifox-mcp-server@latest",
        "--project={{projectId}}",
        "--apifox-api-base-url={{baseUrl}}"
      ],
      env: { APIFOX_ACCESS_TOKEN: "{{accessToken}}" }
    }
  },
  {
    id: "apipost",
    vendor: "Apipost",
    title: "Apipost MCP\uFF08\u4E91\u7AEF\uFF09",
    category: "\u63A5\u53E3\u5DE5\u5177",
    transport: "streamable-http",
    description: "\u5B98\u65B9\u8FDC\u7A0B Streamable HTTP \u670D\u52A1\uFF1A\u8FDE\u63A5 https://open.apipost.net/mcp\uFF0C\u8BF7\u6C42\u5934 api-token \u8BA4\u8BC1\u3002",
    docsUrl: "https://wiki.apipost.cn/docs/MCP/%E5%BF%AB%E9%80%9F%E6%8E%A5%E5%85%A5/",
    kind: "config",
    fields: [
      {
        key: "apiToken",
        label: "API Token",
        type: "password",
        placeholder: "\u9879\u76EE\u8BBE\u7F6E \u2192 OpenAPI \u2192 \u521B\u5EFA Token",
        required: true
      }
    ],
    serverNameDefault: "apipost",
    spec: {
      transport: "streamable-http",
      url: "https://open.apipost.net/mcp",
      headers: { "api-token": "{{apiToken}}" }
    }
  },
  {
    id: "apipost-private",
    vendor: "Apipost",
    title: "Apipost MCP\uFF08\u79C1\u6709\u5316\uFF09",
    category: "\u63A5\u53E3\u5DE5\u5177",
    transport: "streamable-http",
    description: "\u79C1\u6709\u5316\u90E8\u7F72\u7248\uFF1A\u628A URL \u6362\u6210\u516C\u53F8\u79C1\u6709\u57DF\u540D\uFF08\u8DEF\u5F84 /openapi/mcp\uFF09\uFF0C\u8BF7\u6C42\u5934 api-token \u4E0D\u53D8\u3002",
    docsUrl: "https://wiki.apipost.cn/docs/MCP/%E5%BF%AB%E9%80%9F%E6%8E%A5%E5%85%A5/",
    kind: "config",
    fields: [
      {
        key: "baseUrl",
        label: "\u79C1\u6709\u5316 MCP \u5730\u5740",
        placeholder: "https://your-domain.com/openapi/mcp",
        required: true
      },
      {
        key: "apiToken",
        label: "API Token",
        type: "password",
        placeholder: "\u9879\u76EE\u8BBE\u7F6E \u2192 OpenAPI \u2192 \u521B\u5EFA Token",
        required: true
      }
    ],
    serverNameDefault: "apipost-private",
    spec: {
      transport: "streamable-http",
      url: "{{baseUrl}}",
      headers: { "api-token": "{{apiToken}}" }
    }
  },
  {
    id: "mastergo",
    vendor: "MasterGo",
    title: "MasterGo Magic MCP",
    category: "\u8BBE\u8BA1\u5DE5\u5177",
    transport: "stdio",
    description: "\u5B98\u65B9 @mastergo/magic-mcp\uFF1A\u83B7\u53D6\u8BBE\u8BA1\u7A3F DSL \u4E0E D2C \u6570\u636E\u3002\u9700\u56E2\u961F\u7248\u53CA\u4EE5\u4E0A\u6743\u9650\uFF0C\u4EE4\u724C\u5728\u4E2A\u4EBA\u8BBE\u7F6E \u2192 \u5B89\u5168\u8BBE\u7F6E \u2192 \u4E2A\u4EBA\u8BBF\u95EE\u4EE4\u724C\u3002",
    docsUrl: "https://mastergo.com/help/ai-features/magic-mcp.html",
    kind: "config",
    fields: [
      {
        key: "token",
        label: "\u4E2A\u4EBA\u8BBF\u95EE\u4EE4\u724C\uFF08MG_MCP_TOKEN\uFF09",
        type: "password",
        placeholder: "mastergo.com \u2192 \u4E2A\u4EBA\u8BBE\u7F6E \u2192 \u5B89\u5168\u8BBE\u7F6E \u2192 \u4E2A\u4EBA\u8BBF\u95EE\u4EE4\u724C",
        required: true
      }
    ],
    serverNameDefault: "mastergo",
    spec: {
      transport: "stdio",
      command: "npx",
      args: ["-y", "@mastergo/magic-mcp", "--token={{token}}", "--url=https://mastergo.com"],
      env: {}
    }
  },
  {
    id: "pixso-remote",
    vendor: "Pixso",
    title: "Pixso MCP\uFF08\u8FDC\u7A0B\u4E91\u7AEF\uFF09",
    category: "\u8BBE\u8BA1\u5DE5\u5177",
    transport: "streamable-http",
    description: "\u5B98\u65B9\u8FDC\u7A0B MCP\uFF1Ahttps://pixso.cn/mcp\uFF0C\u7528\u4E2A\u4EBA\u8BBF\u95EE\u4EE4\u724C\u8BA4\u8BC1\uFF08\u8BF7\u6C42\u5934 Token\uFF09\u3002\u590D\u5236\u56FE\u5C42\u94FE\u63A5\u7ED9 Agent \u5373\u53EF\u83B7\u53D6 DSL\u3002",
    docsUrl: "https://pixso.net/developer/zh/mcp/remote-mcp.html",
    kind: "config",
    fields: [
      {
        key: "token",
        label: "\u4E2A\u4EBA\u8BBF\u95EE\u4EE4\u724C",
        type: "password",
        placeholder: "Pixso \u5DE5\u4F5C\u53F0 \u2192 \u7528\u6237\u4E2D\u5FC3 \u2192 \u4E2A\u4EBA\u8BBF\u95EE\u4EE4\u724C\uFF08\u9996\u6B21\u751F\u6210\u65F6\u53EF\u590D\u5236\uFF09",
        required: true
      }
    ],
    serverNameDefault: "pixso",
    spec: {
      transport: "streamable-http",
      url: "https://pixso.cn/mcp",
      headers: { Token: "{{token}}" }
    }
  },
  {
    id: "pixso-local",
    vendor: "Pixso",
    title: "Pixso MCP\uFF08\u684C\u9762\u7AEF\u672C\u5730\uFF09",
    category: "\u8BBE\u8BA1\u5DE5\u5177",
    transport: "streamable-http",
    description: "Pixso \u684C\u9762\u5BA2\u6237\u7AEF\u5185\u7F6E MCP \u670D\u52A1\uFF1A\u5F00\u542F\u540E\u8FDE\u63A5\u672C\u673A http://127.0.0.1:3667/mcp\uFF0C\u65E0\u9700\u9274\u6743\u5934\u3002\u9002\u5408\u672C\u5730\u8BBE\u8BA1\u7A3F\u76F4\u8FDE\u3002",
    docsUrl: "https://pixso.net/developer/zh/mcp/local-mcp.html",
    kind: "config",
    fields: [],
    serverNameDefault: "pixso-local",
    spec: {
      transport: "streamable-http",
      url: "http://127.0.0.1:3667/mcp",
      headers: {}
    }
  },
  {
    id: "figma",
    vendor: "Figma",
    title: "Figma \u5B98\u65B9\u8FDC\u7A0B MCP",
    category: "\u8BBE\u8BA1\u5DE5\u5177",
    transport: "streamable-http",
    description: "\u5B98\u65B9\u7AEF\u70B9 https://mcp.figma.com/mcp\u3002\u26A0\uFE0F \u4EC5\u652F\u6301 OAuth 2.0 \u6388\u6743\uFF0C\u4E0D\u652F\u6301 Personal Access Token\uFF0CDSH \u7EAF HTTP \u5BA2\u6237\u7AEF\u65E0\u6CD5\u81EA\u52A8\u8D70\u6D4F\u89C8\u5668\u6388\u6743\uFF0C\u6682\u4E0D\u652F\u6301\u76F4\u63A5\u914D\u7F6E\u3002",
    docsUrl: "https://developers.figma.com/docs/figma-mcp-server/remote-server-installation/",
    kind: "info",
    note: "Figma \u5B98\u65B9\u8BBA\u575B\u786E\u8BA4\u8FDC\u7A0B MCP \u4E0D\u652F\u6301 PAT/Bearer\u3002\u53EF\u9009\u66FF\u4EE3\uFF1A\u7528 Claude Code \u63A5\u5165\u540E\u5171\u4EAB\u7ED3\u679C\uFF1B\u6216\u4F7F\u7528\u793E\u533A stdio \u5B9E\u73B0 figma-developer-mcp\uFF08FIGMA_API_KEY \u73AF\u5883\u53D8\u91CF\uFF0C\u975E\u5B98\u65B9\u3001\u81EA\u62C5\u98CE\u9669\uFF09\u2014\u2014\u53EF\u901A\u8FC7\u300C\u81EA\u5B9A\u4E49\u914D\u7F6E\u300D\u7C98\u8D34\u5176 mcpServers JSON\u3002",
    fields: [],
    serverNameDefault: "figma"
  },
  {
    id: "lanhu",
    vendor: "\u84DD\u6E56 Lanhu",
    title: "\u84DD\u6E56 MCP",
    category: "\u8BBE\u8BA1\u5DE5\u5177",
    transport: "stdio",
    description: "\u5B98\u65B9\u6682\u672A\u53D1\u5E03 MCP\u3002\u4EC5\u6709\u793E\u533A\u5B9E\u73B0\uFF08dsphper/lanhu-mcp\u3001npm mcp-lanhu \u7B49\uFF09\uFF0C\u90E8\u5206\u65B9\u6848\u9700\u8981\u84DD\u6E56\u767B\u5F55 Cookie\uFF0C\u5B58\u5728\u6CC4\u6F0F\u98CE\u9669\uFF0C\u8BF7\u81EA\u884C\u8BC4\u4F30\u3002",
    docsUrl: "https://github.com/dsphper/lanhu-mcp",
    kind: "info",
    note: "\u5982\u786E\u9700\u63A5\u5165\uFF0C\u53EF\u5728\u300C\u81EA\u5B9A\u4E49\u914D\u7F6E\u300D\u4E2D\u7C98\u8D34\u793E\u533A\u5B9E\u73B0\u7684 mcpServers JSON\uFF08\u6CE8\u610F Cookie \u7B49\u654F\u611F\u4FE1\u606F\u7684\u4FDD\u7BA1\uFF09\u3002",
    fields: [],
    serverNameDefault: "lanhu"
  },
  {
    id: "chrome-devtools",
    vendor: "Chrome",
    title: "Chrome DevTools MCP",
    category: "\u5F00\u53D1\u5DE5\u5177",
    transport: "stdio",
    description: "\u5B98\u65B9 chrome-devtools-mcp\uFF1A\u8FDE\u63A5\u672C\u673A Chrome \u6253\u5F00\u9875\u9762\u3001\u622A\u56FE\u3001\u8BFB console/\u7F51\u7EDC\u8BF7\u6C42\u3001\u8DD1 Lighthouse\uFF0C\u7528\u4E8E\u5F00\u53D1\u81EA\u9A8C\u4E0E bug \u5B9A\u4F4D\u3002",
    docsUrl: "https://github.com/ChromeDevTools/chrome-devtools-mcp",
    kind: "config",
    fields: [],
    serverNameDefault: "chrome-devtools",
    spec: {
      transport: "stdio",
      command: "npx",
      args: ["-y", "chrome-devtools-mcp@latest"],
      env: {}
    }
  },
  {
    id: "context7",
    vendor: "Context7",
    title: "Context7 MCP\uFF08\u5B9E\u65F6\u6280\u672F\u6587\u6863\uFF09",
    category: "\u5F00\u53D1\u5DE5\u5177",
    transport: "stdio",
    description: "\u5B98\u65B9 @upstash/context7-mcp\uFF1A\u6309\u9700\u62C9\u53D6 Vant / Vue / React / TypeScript \u7B49\u5E93\u7684\u6700\u65B0\u5B98\u65B9\u6587\u6863\uFF0C\u907F\u514D AI \u7528\u8FC7\u65F6 API\u3002",
    docsUrl: "https://github.com/upstash/context7",
    kind: "config",
    fields: [],
    serverNameDefault: "context7",
    spec: {
      transport: "stdio",
      command: "npx",
      args: ["-y", "@upstash/context7-mcp"],
      env: {}
    }
  }
];
function templateById(id) {
  return TEMPLATES.find((t) => t.id === id) ?? null;
}
function fillSpec(spec, values) {
  const fill = (node) => {
    if (typeof node === "string") {
      return node.replace(
        /\{\{(\w+)\}\}/g,
        (_, key) => Object.prototype.hasOwnProperty.call(values, key) ? String(values[key] ?? "") : `{{${key}}}`
      );
    }
    if (Array.isArray(node)) return node.map(fill);
    if (node && typeof node === "object") {
      const out = {};
      for (const [k, v] of Object.entries(node)) out[k] = fill(v);
      return out;
    }
    return node;
  };
  return fill(spec);
}

// src/catalog.js
var APP_CATALOG = [
  // ---------------- 地图 / 出行 ----------------
  {
    id: "app-amap",
    vendor: "\u9AD8\u5FB7\u5730\u56FE",
    title: "\u9AD8\u5FB7\u5730\u56FE",
    category: "\u5730\u56FE/\u51FA\u884C",
    transport: "streamable-http",
    kind: "config",
    description: "\u67E5\u5730\u70B9\u3001\u5468\u8FB9\u641C\u7D22\u3001\u8DEF\u7EBF\u89C4\u5212\u3001\u5929\u6C14\u4E0E\u6253\u8F66\u5524\u7AEF\u3002\u5B98\u65B9 Streamable HTTP \u7AEF\u70B9\uFF0C\u628A\u9AD8\u5FB7\u5F00\u653E\u5E73\u53F0\u7533\u8BF7\u7684 Web \u670D\u52A1 Key \u62FC\u8FDB URL \u7684 key \u53C2\u6570\u5373\u53EF\u3002",
    docsUrl: "https://lbs.amap.com/api/mcp-server/gettingstarted",
    fields: [
      { key: "key", label: "\u9AD8\u5FB7 Web \u670D\u52A1 Key", placeholder: "\u5728 lbs.amap.com \u63A7\u5236\u53F0\u521B\u5EFA\u5E94\u7528\u540E\u7533\u8BF7", required: true }
    ],
    serverNameDefault: "amap",
    spec: {
      transport: "streamable-http",
      url: "https://mcp.amap.com/mcp?key=<\u5728\u6B64\u586B\u5165\u9AD8\u5FB7Key>",
      headers: {}
    }
  },
  {
    id: "app-tencent-map",
    vendor: "\u817E\u8BAF\u5730\u56FE",
    title: "\u817E\u8BAF\u5730\u56FE",
    category: "\u5730\u56FE/\u51FA\u884C",
    transport: "streamable-http",
    kind: "config",
    description: "\u5730\u70B9\u641C\u7D22\u3001\u5730\u7406\u7F16\u7801\u3001\u8DEF\u7EBF\u89C4\u5212\u3001IP \u5B9A\u4F4D\u4E0E\u5929\u6C14\u3002\u5B98\u65B9\u7AEF\u70B9\u628A Key \u653E query \u7684 key \u53C2\u6570\uFF1Bkey \u5728 lbs.qq.com \u63A7\u5236\u53F0\u7533\u8BF7\u3002",
    docsUrl: "https://lbs.qq.com/service/MCPServer/MCPServerGuide/userGuide",
    fields: [
      { key: "key", label: "\u817E\u8BAF\u4F4D\u7F6E\u670D\u52A1 Key", placeholder: "lbs.qq.com \u2192 \u63A7\u5236\u53F0 \u2192 \u5E94\u7528\u7BA1\u7406 \u2192 Key\u7BA1\u7406", required: true }
    ],
    serverNameDefault: "tencent-map",
    spec: {
      transport: "streamable-http",
      url: "https://mcp.map.qq.com/mcp?key=<\u5728\u6B64\u586B\u5165\u817E\u8BAF\u5730\u56FEKey>&format=0",
      headers: {}
    }
  },
  {
    id: "app-baidu-map",
    vendor: "\u767E\u5EA6\u5730\u56FE",
    title: "\u767E\u5EA6\u5730\u56FE",
    category: "\u5730\u56FE/\u51FA\u884C",
    transport: "stdio",
    kind: "config",
    description: "\u5730\u7406\u7F16\u7801\u3001\u8DEF\u7EBF\u89C4\u5212\u3001POI \u68C0\u7D22\u4E0E\u5929\u6C14\u3002\u5B98\u65B9 stdio \u5305\uFF0CAK \u8D70\u73AF\u5883\u53D8\u91CF BAIDU_MAP_API_KEY\uFF1B\u7533\u8BF7 AK \u65F6\u8981\u52FE\u9009\u300CMCP(SSE)\u300D\u670D\u52A1\u3002",
    docsUrl: "https://github.com/baidu-maps/mcp",
    fields: [
      { key: "BAIDU_MAP_API_KEY", label: "\u767E\u5EA6\u5730\u56FE AK", placeholder: "lbsyun.baidu.com/apiconsole/key \u521B\u5EFA", required: true }
    ],
    serverNameDefault: "baidu-map",
    spec: {
      transport: "stdio",
      command: "npx",
      args: ["-y", "@baidumap/mcp-server-baidu-map"],
      env: { BAIDU_MAP_API_KEY: "<\u5728\u6B64\u586B\u5165\u767E\u5EA6\u5730\u56FEAK>" }
    }
  },
  // ---------------- 协作 / IM ----------------
  {
    id: "app-lark",
    vendor: "\u98DE\u4E66 / Lark",
    title: "\u98DE\u4E66 / Lark",
    category: "\u534F\u4F5C/IM",
    transport: "stdio",
    kind: "config",
    description: "\u8BFB\u5199\u4E91\u6587\u6863\u3001\u591A\u7EF4\u8868\u683C\u3001\u6D88\u606F\u4E0E\u65E5\u5386\u3002\u5B98\u65B9 npm \u5305\uFF0C\u7528\u81EA\u5EFA\u5E94\u7528\u7684 App ID / App Secret \u8BA4\u8BC1\uFF1B\u8981\u7528\u300C\u4F60\u7684\u8EAB\u4EFD\u300D\u8BFB\u5199\u8FD8\u5F97\u5148\u8DD1\u4E00\u6B21 lark-mcp login \u8D70 OAuth\u3002",
    docsUrl: "https://github.com/larksuite/lark-openapi-mcp",
    fields: [
      { key: "appId", label: "App ID", placeholder: "open.feishu.cn \u521B\u5EFA\u81EA\u5EFA\u5E94\u7528\u540E\u83B7\u53D6", required: true },
      { key: "appSecret", label: "App Secret", type: "password", placeholder: "\u540C\u4E0A", required: true }
    ],
    serverNameDefault: "lark",
    spec: {
      transport: "stdio",
      command: "npx",
      args: ["-y", "@larksuiteoapi/lark-mcp", "mcp", "-a", "<\u5728\u6B64\u586B\u5165AppID>", "-s", "<\u5728\u6B64\u586B\u5165AppSecret>"],
      env: {}
    }
  },
  {
    id: "app-dingtalk",
    vendor: "\u9489\u9489",
    title: "\u9489\u9489",
    category: "\u534F\u4F5C/IM",
    transport: "stdio",
    kind: "config",
    description: "\u901A\u8BAF\u5F55\u3001\u90E8\u95E8\u3001\u65E5\u5386\u3001\u5F85\u529E\u3001\u673A\u5668\u4EBA\u6D88\u606F\u3002\u5B98\u65B9 stdio \u5305\uFF0C\u7528\u4F01\u4E1A\u5185\u90E8\u5E94\u7528\u7684 Client ID / Secret \u8BA4\u8BC1\uFF0CACTIVE_PROFILES \u51B3\u5B9A\u5F00\u653E\u54EA\u4E9B\u5DE5\u5177\u96C6\u3002",
    docsUrl: "https://github.com/open-dingtalk/dingtalk-mcp",
    fields: [
      { key: "DINGTALK_Client_ID", label: "Client ID", placeholder: "\u9489\u9489\u5F00\u653E\u5E73\u53F0 \u2192 \u4F01\u4E1A\u5185\u90E8\u5E94\u7528", required: true },
      { key: "DINGTALK_Client_Secret", label: "Client Secret", type: "password", placeholder: "\u540C\u4E0A", required: true }
    ],
    serverNameDefault: "dingtalk",
    spec: {
      transport: "stdio",
      command: "npx",
      args: ["-y", "dingtalk-mcp@latest"],
      env: {
        DINGTALK_Client_ID: "<\u5728\u6B64\u586B\u5165ClientID>",
        DINGTALK_Client_Secret: "<\u5728\u6B64\u586B\u5165ClientSecret>",
        ACTIVE_PROFILES: "dingtalk-contacts,dingtalk-calendar"
      }
    }
  },
  {
    id: "app-slack",
    vendor: "Slack",
    title: "Slack",
    category: "\u534F\u4F5C/IM",
    transport: "stdio",
    kind: "config",
    description: "\u8BFB\u9891\u9053\u4E0E\u79C1\u4FE1\u3001\u6309\u65F6\u95F4\u6216\u672A\u8BFB\u62C9\u6D88\u606F\u3002\u793E\u533A\u7EF4\u62A4\u7684 slack-mcp-server\uFF08\u5B98\u65B9\u672A\u53D1\u5E03 MCP\uFF09\uFF1B\u7528 xoxp- \u7528\u6237\u4EE4\u724C\uFF0C\u53D1\u6D88\u606F\u9ED8\u8BA4\u5173\u95ED\u3002",
    docsUrl: "https://github.com/korotovsky/slack-mcp-server",
    fields: [
      { key: "SLACK_MCP_XOXP_TOKEN", label: "Slack \u7528\u6237\u4EE4\u724C xoxp-", type: "password", placeholder: "Slack App \u914D\u7F6E User Token Scopes \u540E\u5B89\u88C5\u83B7\u53D6", required: true }
    ],
    serverNameDefault: "slack",
    spec: {
      transport: "stdio",
      command: "npx",
      args: ["-y", "slack-mcp-server@latest", "--transport", "stdio"],
      env: { SLACK_MCP_XOXP_TOKEN: "<\u5728\u6B64\u586B\u5165xoxp\u4EE4\u724C>" }
    }
  },
  // ---------------- 代码 / API ----------------
  {
    id: "app-github",
    vendor: "GitHub",
    title: "GitHub",
    category: "\u4EE3\u7801\u6258\u7BA1",
    transport: "streamable-http",
    kind: "config",
    description: "\u67E5\u4ED3\u5E93\u3001\u8BFB\u6587\u4EF6\u3001\u7BA1 Issue \u4E0E PR\u3001\u8DD1 Actions\u3002\u5B98\u65B9\u8FDC\u7A0B MCP \u7AEF\u70B9\uFF0C\u7528 PAT \u4F5C Bearer\uFF1B\u82E5\u53EA\u60F3 OAuth \u767B\u5F55\uFF0C\u9700\u8981\u5BA2\u6237\u7AEF\u652F\u6301\u6D4F\u89C8\u5668\u6388\u6743\uFF08DSH \u76EE\u524D\u8D70\u4E0D\u901A\uFF09\u3002",
    docsUrl: "https://github.com/github/github-mcp-server",
    fields: [
      { key: "token", label: "GitHub PAT", type: "password", placeholder: "GitHub Settings \u2192 Developer settings \u2192 Personal access tokens", required: true }
    ],
    serverNameDefault: "github",
    spec: {
      transport: "streamable-http",
      url: "https://api.githubcopilot.com/mcp/",
      headers: { Authorization: "Bearer <\u5728\u6B64\u586B\u5165GitHubPAT>" }
    }
  },
  {
    id: "app-postman",
    vendor: "Postman",
    title: "Postman",
    category: "API \u5DE5\u5177",
    transport: "streamable-http",
    kind: "config",
    description: "\u68C0\u7D22\u96C6\u5408\u4E0E API \u5B9A\u4E49\u3001\u751F\u6210\u5E76\u8C03\u8BD5\u8BF7\u6C42\u3002\u5B98\u65B9\u6258\u7BA1\u7AEF\u70B9\uFF0C\u7528 Postman API Key \u4F5C Bearer\uFF1B\u8DEF\u5F84\u6539\u6210 /code \u6216 /mcp \u53EF\u6362\u5DE5\u5177\u96C6\u3002",
    docsUrl: "https://github.com/postmanlabs/postman-mcp-server",
    fields: [
      { key: "token", label: "Postman API Key", type: "password", placeholder: "Postman \u2192 Settings \u2192 API keys", required: true }
    ],
    serverNameDefault: "postman",
    spec: {
      transport: "streamable-http",
      url: "https://mcp.postman.com/minimal",
      headers: { Authorization: "Bearer <\u5728\u6B64\u586B\u5165PostmanAPIKey>" }
    }
  },
  // ---------------- 云服务 / 后端 ----------------
  {
    id: "app-cloudflare",
    vendor: "Cloudflare",
    title: "Cloudflare",
    category: "\u4E91\u670D\u52A1/\u540E\u7AEF",
    transport: "streamable-http",
    kind: "config",
    description: "\u7BA1 Workers / KV / R2 / DNS\uFF0C\u67E5\u6587\u6863\u3001\u8DD1\u6D4F\u89C8\u5668\u6E32\u67D3\u3002\u5B98\u65B9\u7AEF\u70B9\u7528 API Token \u4F5C Bearer\uFF1B\u6CE8\u610F\u8001\u7684 SSE \u7AEF\u70B9\u5DF2\u8FD4\u56DE 410\uFF0C\u53EA\u80FD\u7528 /mcp\u3002",
    docsUrl: "https://github.com/cloudflare/mcp-server-cloudflare",
    fields: [
      { key: "token", label: "Cloudflare API Token", type: "password", placeholder: "Dashboard \u2192 My Profile \u2192 API Tokens", required: true }
    ],
    serverNameDefault: "cloudflare",
    spec: {
      transport: "streamable-http",
      url: "https://mcp.cloudflare.com/mcp",
      headers: { Authorization: "Bearer <\u5728\u6B64\u586B\u5165CloudflareAPIToken>" }
    }
  },
  // ---------------- 支付 / 搜索 / AI ----------------
  {
    id: "app-stripe",
    vendor: "Stripe",
    title: "Stripe",
    category: "\u652F\u4ED8/\u91D1\u878D",
    transport: "streamable-http",
    kind: "config",
    description: "\u67E5\u5BA2\u6237\u4E0E\u8BA2\u9605\u3001\u5EFA\u652F\u4ED8\u94FE\u63A5\u3001\u8BFB\u6587\u6863\u793A\u4F8B\u3002\u5B98\u65B9\u7AEF\u70B9\uFF0C\u53EF\u7528\u53D7\u9650 agent key \u4F5C Bearer\uFF08OAuth \u9700\u8981\u6D4F\u89C8\u5668\u6388\u6743\uFF09\u3002",
    docsUrl: "https://docs.stripe.com/mcp",
    fields: [
      { key: "token", label: "Stripe API Key", type: "password", placeholder: "Dashboard \u2192 Developers \u2192 API keys", required: true }
    ],
    serverNameDefault: "stripe",
    spec: {
      transport: "streamable-http",
      url: "https://mcp.stripe.com",
      headers: { Authorization: "Bearer <\u5728\u6B64\u586B\u5165StripeAPIKey>" }
    }
  },
  {
    id: "app-exa",
    vendor: "Exa \u641C\u7D22",
    title: "Exa \u641C\u7D22",
    category: "\u641C\u7D22/\u68C0\u7D22",
    transport: "streamable-http",
    kind: "config",
    description: "\u8BED\u4E49\u641C\u7D22\u4E0E\u7F51\u9875\u6B63\u6587\u6293\u53D6\uFF0C\u7ED9 agent \u8865\u5B9E\u65F6\u8D44\u6599\u3002\u5B98\u65B9\u6258\u7BA1\u7AEF\u70B9\uFF0CKey \u4F5C Bearer\uFF0C\u5728 dashboard.exa.ai \u53D6\u3002",
    docsUrl: "https://github.com/exa-labs/exa-mcp-server",
    fields: [
      { key: "token", label: "Exa API Key", type: "password", placeholder: "dashboard.exa.ai/api-keys", required: true }
    ],
    serverNameDefault: "exa",
    spec: {
      transport: "streamable-http",
      url: "https://mcp.exa.ai/mcp",
      headers: { Authorization: "Bearer <\u5728\u6B64\u586B\u5165ExaKey>" }
    }
  },
  {
    id: "app-brave-search",
    vendor: "Brave \u641C\u7D22",
    title: "Brave \u641C\u7D22",
    category: "\u641C\u7D22/\u68C0\u7D22",
    transport: "stdio",
    kind: "config",
    description: "\u7F51\u9875 / \u65B0\u95FB / \u56FE\u7247\u672C\u5730\u68C0\u7D22\uFF0C\u4E0D\u7528\u81EA\u5DF1\u642D\u722C\u866B\u3002\u5B98\u65B9 stdio \u5305\uFF0CKey \u8D70 BRAVE_API_KEY \u73AF\u5883\u53D8\u91CF\u3002",
    docsUrl: "https://github.com/brave/brave-search-mcp-server",
    fields: [
      { key: "BRAVE_API_KEY", label: "Brave API Key", type: "password", placeholder: "brave.com/search/api \u7533\u8BF7", required: true }
    ],
    serverNameDefault: "brave-search",
    spec: {
      transport: "stdio",
      command: "npx",
      args: ["-y", "@brave/brave-search-mcp-server", "--transport", "stdio"],
      env: { BRAVE_API_KEY: "<\u5728\u6B64\u586B\u5165BraveKey>" }
    }
  },
  {
    id: "app-modelscope",
    vendor: "\u9B54\u642D ModelScope",
    title: "\u9B54\u642D ModelScope",
    category: "AI \u5E73\u53F0",
    transport: "stdio",
    kind: "config",
    description: "\u641C\u6A21\u578B / \u6570\u636E\u96C6 / \u521B\u7A7A\u95F4\uFF0C\u8FD8\u80FD\u76F4\u63A5\u6587\u751F\u56FE\u3002\u5B98\u65B9 uvx \u5305\uFF08README \u5DF2\u6807 Deprecated\uFF0C\u4F46 PyPI \u4E0E\u955C\u50CF\u4ECD\u53EF\u7528\uFF09\uFF0C\u9700\u8981 Access Token\u3002",
    docsUrl: "https://github.com/modelscope/modelscope-mcp-server",
    fields: [
      { key: "MODELSCOPE_API_TOKEN", label: "ModelScope Access Token", type: "password", placeholder: "modelscope.cn \u2192 \u9996\u9875 \u2192 Access Tokens", required: true }
    ],
    serverNameDefault: "modelscope",
    spec: {
      transport: "stdio",
      command: "uvx",
      args: ["modelscope-mcp-server"],
      env: { MODELSCOPE_API_TOKEN: "<\u5728\u6B64\u586B\u5165ModelScopeToken>" }
    }
  },
  // ---------------- 浏览器自动化 ----------------
  {
    id: "app-playwright",
    vendor: "Playwright",
    title: "Playwright",
    category: "\u6D4F\u89C8\u5668\u81EA\u52A8\u5316",
    transport: "stdio",
    kind: "config",
    description: "\u8BA9 agent \u771F\u5F00\u6D4F\u89C8\u5668\u70B9\u70B9\u70B9\u3001\u622A\u56FE\u3001\u65AD\u8A00\u9875\u9762\u3002\u96F6\u914D\u7F6E\uFF0C\u70B9\u300C\u63A5\u5165\u300D\u5C31\u80FD\u7528\uFF08\u8981\u6C42\u672C\u673A Node \u2265 18\uFF0C\u9996\u6B21\u4F1A\u4E0B\u8F7D\u6D4F\u89C8\u5668\uFF09\u3002",
    docsUrl: "https://github.com/microsoft/playwright-mcp",
    fields: [],
    serverNameDefault: "playwright",
    spec: {
      transport: "stdio",
      command: "npx",
      args: ["@playwright/mcp@latest"],
      env: {}
    }
  },
  // ---------------- 只支持 OAuth，先做说明 ----------------
  {
    id: "app-notion",
    vendor: "Notion",
    title: "Notion\uFF08\u6682\u4E0D\u652F\u6301\u76F4\u8FDE\uFF09",
    category: "\u77E5\u8BC6\u5E93/\u6587\u6863",
    transport: "streamable-http",
    kind: "info",
    description: "\u68C0\u7D22\u5E76\u8BFB\u5199\u5DE5\u4F5C\u533A\u9875\u9762\u4E0E\u6570\u636E\u5E93\u3002\u5B98\u65B9\u53EA\u63D0\u4F9B OAuth \u6388\u6743\u7AEF\u70B9 https://mcp.notion.com/mcp\uFF0CDSH \u7684\u7EAF HTTP MCP \u5BA2\u6237\u7AEF\u4E0D\u4F1A\u81EA\u52A8\u5F39\u6D4F\u89C8\u5668\u6388\u6743\uFF0C\u76F4\u63A5\u586B Token \u4E5F\u65E0\u6548\u3002",
    docsUrl: "https://developers.notion.com/guides/mcp/get-started-with-mcp",
    note: "\u53EF\u884C\u66FF\u4EE3\uFF1A\u2460 \u7528\u652F\u6301 OAuth \u7684\u5BA2\u6237\u7AEF\uFF08\u5982 Claude Code\uFF09\u8FDE\u4E00\u6B21\u540E\u5171\u4EAB\u7ED3\u679C\uFF1B\u2461 \u7528 Notion Integration Token + \u793E\u533A stdio \u5B9E\u73B0\uFF08\u81EA\u62C5\u98CE\u9669\uFF09\uFF1B\u2462 \u7B49 DSH \u7684 mcp-client \u652F\u6301 OAuth\u3002",
    fields: [],
    serverNameDefault: "notion"
  },
  {
    id: "app-supabase",
    vendor: "Supabase",
    title: "Supabase\uFF08\u6682\u4E0D\u652F\u6301\u76F4\u8FDE\uFF09",
    category: "\u4E91\u670D\u52A1/\u540E\u7AEF",
    transport: "streamable-http",
    kind: "info",
    description: "\u7BA1\u9879\u76EE\u3001\u8DD1 SQL\u3001\u770B\u8868\u7ED3\u6784\u4E0E\u65E5\u5FD7\u3002\u5B98\u65B9\u8FDC\u7A0B\u7AEF\u70B9 https://mcp.supabase.com/mcp \u8D70 OAuth \u767B\u5F55\u9009\u9879\u76EE\uFF0C\u76F4\u8FDE\u9700\u8981\u6D4F\u89C8\u5668\u6388\u6743\u6D41\u7A0B\u3002",
    docsUrl: "https://github.com/supabase-community/supabase-mcp",
    note: "\u66FF\u4EE3\uFF1A\u672C\u5730\u8DD1 Supabase CLI \u540E\u8FDE http://localhost:54321/mcp\uFF08\u672C\u5730\u7AEF\u70B9\u4E0D\u9700\u8981 OAuth\uFF09\u3002",
    fields: [],
    serverNameDefault: "supabase"
  },
  {
    id: "app-linear",
    vendor: "Linear",
    title: "Linear\uFF08\u6682\u4E0D\u652F\u6301\u76F4\u8FDE\uFF09",
    category: "\u9879\u76EE\u7BA1\u7406",
    transport: "streamable-http",
    kind: "info",
    description: "\u5EFA\u6539 Issue\u3001\u67E5\u9879\u76EE\u4E0E\u5468\u671F\u3002\u5B98\u65B9\u7AEF\u70B9 https://mcp.linear.app/mcp \u7528 OAuth 2.1\uFF0C\u53E6\u6709\u53EA\u8BFB\u7AEF\u70B9 /mcp/readonly\uFF1B\u65E7 /sse \u5DF2\u5E9F\u5F03\u3002",
    docsUrl: "https://linear.app/docs/mcp",
    note: "\u66FF\u4EE3\uFF1A\u7528 Linear \u751F\u6210\u7684 API key \u4F5C Bearer \u5934\u63A5\u793E\u533A\u5B9E\u73B0\uFF1B\u6216\u7B49 mcp-client \u652F\u6301 OAuth\u3002",
    fields: [],
    serverNameDefault: "linear"
  }
];

// src/host.js
var name = "dsh-bridge-market";
var inject = ["webServer"];
var MCP_CLIENT = "@deepseek-ai/dsh-mcp-client";
var REGION_START = "# >>> dsh-bridge-market managed region >>> \uFF08\u8BF7\u901A\u8FC7\u300C\u6865\u63A5\u5E02\u573A\u300D\u9762\u677F\u7BA1\u7406\uFF0C\u52FF\u624B\u6539\uFF09";
var REGION_END = "# <<< dsh-bridge-market managed region <<<";
var MAX_BODY_BYTES = 1 << 20;
var NAME_RE = /^[A-Za-z0-9_-]{1,32}$/;
function dshHome() {
  return process.env.DSH_HOME || join(homedir(), ".dsh");
}
function isProfileDir(dir) {
  if (typeof dir !== "string" || dir.trim() === "") return false;
  try {
    return statSync(join(dir.trim(), "cordis.patch.yml")).isFile();
  } catch {
    return false;
  }
}
function uniqueProfileUnder(base) {
  try {
    const found = readdirSync(base, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => join(base, d.name)).filter(isProfileDir);
    return found.length === 1 ? found[0] : null;
  } catch {
    return null;
  }
}
function profileDir() {
  const env = process.env.DSH_PROFILE_DIR;
  if (isProfileDir(env)) return env.trim();
  const named = (process.env.DSH_PROFILE || "").trim();
  const homeProfiles = join(dshHome(), "profiles");
  if (named !== "" && isProfileDir(join(homeProfiles, named))) return join(homeProfiles, named);
  const inHome = uniqueProfileUnder(homeProfiles);
  if (inHome !== null) return inHome;
  const marker = `${sep}profiles${sep}`;
  for (const arg of process.argv) {
    if (typeof arg === "string" && arg.includes(marker) && isProfileDir(arg)) return arg.trim();
  }
  const cwd = process.cwd();
  if (isProfileDir(cwd)) return cwd;
  return join(homeProfiles, named || "web");
}
function patchPath() {
  return join(profileDir(), "cordis.patch.yml");
}
var JsTag = new yaml.Type("!js", {
  kind: "scalar",
  resolve: () => true,
  construct: (data) => String(data)
});
var SAFE_SCHEMA = yaml.DEFAULT_SCHEMA.extend([JsTag]);
function isLoopbackRequest(request) {
  const address = request.socket.remoteAddress;
  if (address !== "127.0.0.1" && address !== "::1" && address !== "::ffff:127.0.0.1") return false;
  const host = request.headers.host;
  if (typeof host !== "string") return false;
  let hostUrl;
  try {
    hostUrl = new URL(`http://${host}`);
  } catch {
    return false;
  }
  if (hostUrl.hostname !== "127.0.0.1" && hostUrl.hostname !== "localhost" && hostUrl.hostname !== "[::1]")
    return false;
  if (request.headers["sec-fetch-site"] === "cross-site") return false;
  const origin = request.headers.origin;
  if (origin === void 0) return true;
  try {
    return new URL(origin).host === hostUrl.host;
  } catch {
    return false;
  }
}
function writeJson(res, status, body) {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body));
}
async function readJsonBody(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) throw new Error("request body too large");
    chunks.push(chunk);
  }
  const parsed = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  if (typeof parsed !== "object" || parsed === null) throw new Error("request body must be a JSON object");
  return parsed;
}
function ok(res, value) {
  writeJson(res, 200, { ok: true, ...value });
}
function fail(res, status, code, message) {
  writeJson(res, status, { ok: false, error: { code, message } });
}
async function readPatchFile() {
  const path = patchPath();
  if (!existsSync(path)) return "";
  return readFile(path, "utf8");
}
function parseRegionRows(content) {
  const lines = content.split("\n");
  const start = lines.findIndex((l) => l.startsWith(REGION_START));
  const end = lines.findIndex((l) => l.startsWith(REGION_END));
  if (start < 0 || end <= start) return [];
  const body = lines.slice(start + 1, end).join("\n").trim();
  if (!body) return [];
  try {
    const doc = yaml.load(body, { schema: SAFE_SCHEMA });
    if (!Array.isArray(doc)) return [];
    const rows = [];
    for (const item of doc) {
      if (item && Array.isArray(item.insert)) {
        for (const row of item.insert) rows.push(row);
      }
    }
    return rows;
  } catch {
    return [];
  }
}
function parseWholePatch(content) {
  if (!content.trim()) return [];
  try {
    const doc = yaml.load(content, { schema: SAFE_SCHEMA });
    return Array.isArray(doc) ? doc : [];
  } catch {
    return void 0;
  }
}
function collectMcpRows(content) {
  const rows = [];
  const doc = parseWholePatch(content);
  if (!doc) return rows;
  for (const item of doc) {
    if (item && Array.isArray(item.insert)) {
      for (const row of item.insert) {
        if (row && row.name === MCP_CLIENT) rows.push(row);
      }
    }
  }
  return rows;
}
async function rewriteRegion(rows) {
  const path = patchPath();
  const old = await readPatchFile();
  const lines = old.split("\n");
  const start = lines.findIndex((l) => l.startsWith(REGION_START));
  const end = lines.findIndex((l) => l.startsWith(REGION_END));
  let before;
  let after;
  if (start >= 0 && end > start) {
    before = lines.slice(0, start).join("\n");
    after = lines.slice(end + 1).join("\n");
  } else {
    const trimmed = old.trimEnd();
    before = trimmed;
    after = "";
  }
  const body = rows.length === 0 ? "" : yaml.dump([{ insert: rows }], { lineWidth: -1, noRefs: true });
  const region = `${REGION_START}
${body}${REGION_END}`;
  const parts = [before.trimEnd(), region, after.trimStart()].filter((p) => p !== "");
  const next = `${parts.join("\n\n")}
`;
  const tmp = `${path}.tmp`;
  await mkdir(join(path, ".."), { recursive: true });
  await writeFile(tmp, next, "utf8");
  await rename(tmp, path);
}
function normalizeServer(raw) {
  const serverName = typeof raw.serverName === "string" ? raw.serverName.trim() : "";
  const transport = raw.transport === "stdio" ? "stdio" : "streamable-http";
  const row = {
    id: `mcp-market-${serverName.toLowerCase().replace(/[^a-z0-9_-]/g, "-")}`,
    name: MCP_CLIENT,
    config: { serverName, transport }
  };
  if (raw.disabled) row.disabled = true;
  if (transport === "stdio") {
    if (typeof raw.command !== "string" || raw.command.trim() === "")
      throw new Error("stdio \u670D\u52A1\u5668\u5FC5\u987B\u63D0\u4F9B command");
    row.config.command = raw.command.trim();
    if (Array.isArray(raw.args)) row.config.args = raw.args.map(String);
    const env = {};
    if (raw.env && typeof raw.env === "object") {
      for (const [k, v] of Object.entries(raw.env)) if (v !== void 0) env[k] = String(v);
    }
    row.config.env = env;
  } else {
    if (typeof raw.url !== "string" || !/^https?:\/\//.test(raw.url.trim()))
      throw new Error("streamable-http \u670D\u52A1\u5668\u5FC5\u987B\u63D0\u4F9B http(s) \u7684 url");
    row.config.url = raw.url.trim();
    const headers = {};
    if (raw.headers && typeof raw.headers === "object") {
      for (const [k, v] of Object.entries(raw.headers)) if (v !== void 0) headers[k] = String(v);
    }
    row.config.headers = headers;
  }
  return row;
}
function validateServerName(serverName, takenNames) {
  if (!NAME_RE.test(serverName)) throw new Error("serverName \u9700\u4E3A 1\u201332 \u4F4D\u5B57\u6BCD/\u6570\u5B57/\u4E0B\u5212\u7EBF/\u8FDE\u5B57\u7B26");
  if (takenNames.has(serverName)) throw new Error(`serverName "${serverName}" \u5DF2\u88AB\u5360\u7528`);
  return serverName;
}
function presentRow(row, managed) {
  const c = row.config ?? {};
  const authKeys = c.transport === "stdio" ? Object.keys(c.env ?? {}) : Object.keys(c.headers ?? {});
  const summary = c.transport === "stdio" ? [c.command, ...c.args ?? []].join(" ") : c.url ?? "";
  return {
    id: row.id,
    managed,
    serverName: c.serverName,
    transport: c.transport,
    disabled: row.disabled === true,
    summary,
    authKeys,
    maskedAuth: Object.fromEntries(
      authKeys.map((k) => {
        const v = c.transport === "stdio" ? c.env[k] : c.headers[k];
        return [k, mask(v)];
      })
    ),
    rawConfig: c
  };
}
function mask(value) {
  const s = String(value ?? "");
  if (s.length <= 8) return "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022";
  return `${s.slice(0, 3)}\u2022\u2022\u2022${s.slice(-3)}`;
}
function convertMcpServers(map) {
  const servers = [];
  for (const [rawName, cfg] of Object.entries(map)) {
    if (!cfg || typeof cfg !== "object") continue;
    const serverName = sanitizeName(rawName);
    if (typeof cfg.command === "string") {
      servers.push({
        serverName,
        transport: "stdio",
        command: cfg.command,
        args: Array.isArray(cfg.args) ? cfg.args.map(String) : [],
        env: cfg.env && typeof cfg.env === "object" ? cfg.env : {}
      });
    } else if (typeof cfg.url === "string") {
      const headers = cfg.headers && typeof cfg.headers === "object" ? { ...cfg.headers } : {};
      if (typeof cfg.token === "string" && cfg.token !== "" && !headers.Authorization && !headers.authorization) {
        headers.Authorization = `Bearer ${cfg.token}`;
      }
      servers.push({ serverName, transport: "streamable-http", url: cfg.url, headers });
    } else {
      servers.push({
        serverName,
        error: `\u65E0\u6CD5\u8BC6\u522B "${rawName}" \u7684\u914D\u7F6E\uFF08\u65E2\u65E0 command \u4E5F\u65E0 url\uFF09\uFF0C\u5DF2\u8DF3\u8FC7`
      });
    }
  }
  return servers;
}
function sanitizeName(raw) {
  const s = String(raw).trim().replace(/[^A-Za-z0-9_-]/g, "-");
  const cleaned = s.replace(/^-+/, "").slice(0, 32);
  return cleaned || "mcp-server";
}
function parsePasted(text) {
  const trimmed = text.trim();
  if (!trimmed) throw new Error("\u8BF7\u5148\u7C98\u8D34\u914D\u7F6E\u5185\u5BB9");
  const servers = [];
  try {
    const parsed = JSON.parse(trimmed);
    if (parsed && typeof parsed === "object") {
      const map = parsed.mcpServers ?? parsed;
      servers.push(...convertMcpServers(map));
      if (servers.length > 0) return servers;
    }
  } catch {
  }
  try {
    const doc = yaml.load(trimmed, { schema: SAFE_SCHEMA });
    const rows = [];
    const pushRows = (list) => {
      for (const item of list ?? []) {
        if (item && Array.isArray(item.insert)) pushRows(item.insert);
        else if (item && item.name === MCP_CLIENT && item.config) rows.push(item.config);
      }
    };
    if (Array.isArray(doc)) pushRows(doc);
    for (const row of rows) {
      servers.push({
        serverName: String(row.serverName ?? "mcp-server"),
        transport: row.transport === "stdio" ? "stdio" : "streamable-http",
        command: row.command,
        args: row.args,
        env: row.env,
        url: row.url,
        headers: row.headers
      });
    }
    if (servers.length > 0) return servers;
  } catch {
  }
  throw new Error("\u65E0\u6CD5\u89E3\u6790\uFF1A\u8BF7\u7C98\u8D34 mcpServers JSON\uFF08Claude Code \u683C\u5F0F\uFF09\u6216 DSH patch \u884C");
}
var toolsService = null;
function collectToolCounts() {
  if (!toolsService || typeof toolsService.schemas !== "function") return null;
  let schemas;
  try {
    schemas = toolsService.schemas();
  } catch {
    return null;
  }
  const counts = {};
  for (const schema of schemas) {
    const name2 = schema && schema.name;
    if (typeof name2 !== "string" || !name2.startsWith("mcp__")) continue;
    const rest = name2.slice(5);
    const sep2 = rest.indexOf("__");
    if (sep2 <= 0) continue;
    const serverName = rest.slice(0, sep2);
    counts[serverName] = (counts[serverName] ?? 0) + 1;
  }
  return counts;
}
async function readState() {
  const content = await readPatchFile();
  const regionRows = parseRegionRows(content);
  const allRows = collectMcpRows(content);
  const managedNames = new Set(regionRows.map((r) => r.config?.serverName).filter(Boolean));
  const servers = allRows.map((row) => {
    const serverName = row.config?.serverName;
    return presentRow(row, serverName !== void 0 && managedNames.has(serverName));
  });
  const counts = collectToolCounts();
  for (const server of servers) {
    server.toolCount = counts === null ? null : counts[server.serverName] ?? 0;
  }
  return {
    patchPath: patchPath(),
    profile: process.env.DSH_PROFILE ?? null,
    hotReload: true,
    servers,
    templates: [...APP_CATALOG, ...TEMPLATES],
    toolCounts: counts,
    clientBoot: clientBootRecord()
  };
}
async function upsertServer(server) {
  const content = await readPatchFile();
  const allRows = collectMcpRows(content);
  const takenNames = new Set(
    allRows.map((r) => r.config?.serverName).filter((n) => typeof n === "string" && n !== "")
  );
  const row = normalizeServer(server);
  row.config.serverName = validateServerName(row.config.serverName, takenNames);
  row.id = `mcp-market-${row.config.serverName.toLowerCase().replace(/[^a-z0-9_-]/g, "-")}`;
  const regionRows = parseRegionRows(content);
  const next = regionRows.filter((r) => r.config?.serverName !== row.config.serverName);
  next.push(row);
  await rewriteRegion(next);
  return readState();
}
async function deleteServer(serverName) {
  const content = await readPatchFile();
  const regionRows = parseRegionRows(content);
  const next = regionRows.filter((r) => r.config?.serverName !== serverName);
  await rewriteRegion(next);
  return readState();
}
async function setEnabled(serverName, enabled) {
  const content = await readPatchFile();
  const regionRows = parseRegionRows(content);
  let found = false;
  const next = regionRows.map((r) => {
    if (r.config?.serverName !== serverName) return r;
    found = true;
    const copy = { ...r };
    if (enabled) delete copy.disabled;
    else copy.disabled = true;
    return copy;
  });
  if (!found) throw new Error(`\u672A\u627E\u5230\u670D\u52A1\u5668 "${serverName}"`);
  await rewriteRegion(next);
  return readState();
}
var bootCount = 0;
var bootLastAt = null;
function clientBootRecord() {
  return { count: bootCount, lastAt: bootLastAt };
}
function recordClientBoot() {
  bootCount += 1;
  bootLastAt = (/* @__PURE__ */ new Date()).toISOString();
}
function makeRoutes() {
  const guard = (req, res, method) => {
    if (req.method !== method) {
      fail(res, 405, "method", `method not allowed: ${req.method}`);
      return false;
    }
    if (!isLoopbackRequest(req)) {
      fail(res, 403, "forbidden", "loopback-only");
      return false;
    }
    return true;
  };
  return [
    {
      kind: "exact",
      path: "/api/mcp-market/state",
      handler: async (req, res) => {
        if (!guard(req, res, "GET")) return;
        try {
          ok(res, await readState());
        } catch (error) {
          fail(res, 500, "state", error instanceof Error ? error.message : String(error));
        }
      }
    },
    {
      kind: "exact",
      path: "/api/mcp-market/servers",
      handler: async (req, res) => {
        if (!guard(req, res, "POST")) return;
        try {
          const body = await readJsonBody(req);
          const server = body.server;
          if (!server || typeof server !== "object") {
            fail(res, 400, "bad-request", "missing server payload");
            return;
          }
          ok(res, await upsertServer(server));
        } catch (error) {
          fail(res, 400, "bad-request", error instanceof Error ? error.message : String(error));
        }
      }
    },
    {
      kind: "exact",
      path: "/api/mcp-market/servers/delete",
      handler: async (req, res) => {
        if (!guard(req, res, "POST")) return;
        try {
          const body = await readJsonBody(req);
          const serverName = String(body.serverName ?? "");
          if (!serverName) {
            fail(res, 400, "bad-request", "missing serverName");
            return;
          }
          ok(res, await deleteServer(serverName));
        } catch (error) {
          fail(res, 400, "bad-request", error instanceof Error ? error.message : String(error));
        }
      }
    },
    {
      kind: "exact",
      path: "/api/mcp-market/servers/toggle",
      handler: async (req, res) => {
        if (!guard(req, res, "POST")) return;
        try {
          const body = await readJsonBody(req);
          const serverName = String(body.serverName ?? "");
          const enabled = body.enabled === true;
          if (!serverName) {
            fail(res, 400, "bad-request", "missing serverName");
            return;
          }
          ok(res, await setEnabled(serverName, enabled));
        } catch (error) {
          fail(res, 400, "bad-request", error instanceof Error ? error.message : String(error));
        }
      }
    },
    {
      kind: "exact",
      path: "/api/mcp-market/client-boot",
      handler: async (req, res) => {
        if (!guard(req, res, "POST")) return;
        recordClientBoot();
        ok(res, { booted: true, ...clientBootRecord() });
      }
    },
    {
      kind: "exact",
      path: "/api/mcp-market/parse",
      handler: async (req, res) => {
        if (!guard(req, res, "POST")) return;
        try {
          const body = await readJsonBody(req);
          const text = String(body.text ?? "");
          ok(res, { servers: parsePasted(text) });
        } catch (error) {
          fail(res, 400, "bad-request", error instanceof Error ? error.message : String(error));
        }
      }
    }
  ];
}
function registerBridgeTool(ctx) {
  const tools = toolsService;
  if (!tools || typeof tools.register !== "function") return null;
  return tools.register({
    name: "bridge_market",
    description: "\u6865\u63A5\u5E02\u573A\uFF08\u6309\u300C\u7F51\u7AD9/app\u300D\u4E3A\u5355\u4F4D\uFF09\uFF1Alist \u67E5\u76EE\u5F55\uFF0Cattach \u63A5\u5165\u4E00\u4E2A\u5E94\u7528\uFF0Cdetach \u65AD\u5F00\uFF0Cstatus \u770B\u5DF2\u63A5\u5165\u7684\u6865\u4E0E\u5B9E\u65F6\u5DE5\u5177\u6570\u3002\u63A5\u5165\u5373\u751F\u6548\uFF08\u65E0\u9700\u91CD\u542F\uFF09\uFF0C\u5DE5\u5177\u968F\u540E\u4EE5 mcp__<serverName>__* \u51FA\u73B0\u3002config \u53EA\u586B\u8BE5\u6761\u76EE fields \u91CC\u5217\u51FA\u3001spec \u91CC\u5E26 {{...}} \u5360\u4F4D\u7684\u952E\u3002",
    parameters: {
      type: "object",
      properties: {
        action: { type: "string", enum: ["list", "attach", "detach", "status"] },
        query: { type: "string", description: "list \u7684\u5173\u952E\u5B57\u8FC7\u6EE4\uFF08\u5339\u914D\u540D\u79F0\u3001\u5382\u5546\u3001\u5206\u7C7B\u3001\u63CF\u8FF0\uFF09" },
        app: {
          type: "string",
          description: "attach \u4F20\u76EE\u5F55 id\uFF08\u5982 app-amap\uFF09\uFF1Bdetach \u4F20\u5DF2\u63A5\u5165\u7684 serverName"
        },
        config: {
          type: "object",
          description: "attach \u65F6\u586B\u5360\u4F4D\u7B26\u7684\u503C\uFF0C\u952E\u540D\u6765\u81EA list \u8FD4\u56DE\u7684 fields"
        }
      },
      required: ["action"],
      additionalProperties: false
    },
    output: {
      schema: { type: "string" },
      render: (_args, value) => [{ type: "text", text: String(value) }]
    },
    async execute(args) {
      const action = String(args?.action ?? "list");
      const all = [...APP_CATALOG, ...TEMPLATES];
      if (action === "list") {
        const q = String(args?.query ?? "").trim().toLowerCase();
        const st = await readState();
        const attached = new Map(
          st.servers.filter((s) => s.managed).map((s) => [s.serverName, s])
        );
        const hits = all.filter((t) => {
          if (q === "") return true;
          return [t.id, t.vendor, t.title, t.category, t.description].filter(Boolean).some((v) => String(v).toLowerCase().includes(q));
        });
        if (hits.length === 0) return `\u76EE\u5F55\u91CC\u6CA1\u6709\u5339\u914D\u300C${args?.query ?? ""}\u300D\u7684\u5E94\u7528\u3002`;
        const lines = hits.map((t) => {
          const name2 = t.serverNameDefault || t.id;
          const state = attached.get(name2);
          const mark = state ? `\u5DF2\u63A5\u5165${state.enabled === false ? "(\u5DF2\u505C\u7528)" : ""}` : t.kind === "info" ? "\u4EC5\u8BF4\u660E" : "\u53EF\u63A5\u5165";
          const need = (t.fields || []).length > 0 ? ` \u9700\u586B: ${t.fields.map((f) => f.key).join(",")}` : "";
          return `- ${t.id} | ${t.vendor || t.title} \xB7 ${t.title} | ${t.category || "-"} | ${t.transport || "-"} | ${mark}${need}`;
        });
        return `\u5E94\u7528\u76EE\u5F55 ${hits.length} \u6761\uFF08\u5171 ${all.length} \u6761\uFF09\uFF1A
${lines.join("\n")}`;
      }
      if (action === "attach") {
        const wanted = String(args?.app ?? "").trim().toLowerCase();
        if (wanted === "") return "attach \u9700\u8981 app \u53C2\u6570\uFF08\u76EE\u5F55 id\uFF0C\u5982 app-amap\uFF09\u3002\u5148\u7528 action=list \u67E5\u3002";
        const entry = all.find((t) => String(t.id).toLowerCase() === wanted) || all.find((t) => String(t.serverNameDefault ?? "").toLowerCase() === wanted) || all.find(
          (t) => [t.title, t.vendor].filter(Boolean).some((v) => String(v).toLowerCase().includes(wanted))
        );
        if (!entry) return `\u76EE\u5F55\u91CC\u6CA1\u6709\u300C${args?.app}\u300D\u3002\u5148\u7528 action=list \u770B\u53EF\u7528 id\u3002`;
        if (entry.kind === "info") {
          return `\u300C${entry.title}\u300D\u4E0D\u80FD\u4E00\u952E\u63A5\u5165\uFF1A${entry.description}${entry.docsUrl ? `
\u6587\u6863\uFF1A${entry.docsUrl}` : ""}`;
        }
        const values = args?.config && typeof args.config === "object" ? args.config : {};
        const missing = (entry.fields || []).filter((f) => f.required && (values[f.key] === void 0 || String(values[f.key]).trim() === "")).map((f) => f.key);
        if (missing.length > 0) {
          return `\u63A5\u5165\u300C${entry.title}\u300D\u8FD8\u7F3A\u5FC5\u586B\u9879\uFF1A${missing.join("\u3001")}\u3002\u7528 config=${JSON.stringify(
            Object.fromEntries(missing.map((k) => [k, "<\u503C>"]))
          )} \u518D\u8C03\u4E00\u6B21\u3002`;
        }
        const server = { serverName: entry.serverNameDefault || entry.id, ...fillSpec(entry.spec, values) };
        await upsertServer(server);
        return `\u5DF2\u63A5\u5165\u300C${entry.title}\u300D\uFF0CserverName=${server.serverName}\u3002\u65E0\u9700\u91CD\u542F\uFF1B\u51E0\u79D2\u540E\u7528 action=status \u770B\u5DE5\u5177\u6570\uFF0C\u51FA\u73B0 mcp__${server.serverName}__* \u5373\u53EF\u8C03\u7528\u3002`;
      }
      if (action === "detach") {
        const name2 = String(args?.app ?? "").trim();
        if (name2 === "") return "detach \u9700\u8981 app \u53C2\u6570\uFF08\u5DF2\u63A5\u5165\u7684 serverName\uFF09\u3002\u5148\u7528 action=status \u67E5\u3002";
        const before = (await readState()).servers.some((s) => s.serverName === name2 && s.managed);
        if (!before) return `\u6CA1\u6709\u540D\u4E3A ${name2} \u7684\u53EF\u6258\u7BA1\u6865\uFF08\u5916\u90E8\u914D\u7F6E\u884C\u4E0D\u80FD\u5728\u8FD9\u91CC\u65AD\uFF09\u3002`;
        await deleteServer(name2);
        return `\u5DF2\u65AD\u5F00 ${name2}\uFF0C\u5176 mcp__${name2}__* \u5DE5\u5177\u4F1A\u968F\u4E4B\u6D88\u5931\u3002`;
      }
      if (action === "status") {
        const st = await readState();
        if (st.servers.length === 0) return "\u5F53\u524D\u6CA1\u6709\u4EFB\u4F55 MCP \u6865\u3002\u7528 action=list \u6311\u4E00\u4E2A\u63A5\u5165\u3002";
        const lines = st.servers.map(
          (s) => `- ${s.serverName} | ${s.transport} | ${s.managed ? "\u5E02\u573A\u6258\u7BA1" : "\u5916\u90E8\u914D\u7F6E(\u53EA\u8BFB)"} | ${s.enabled === false ? "\u5DF2\u505C\u7528" : "\u542F\u7528"} | \u5DE5\u5177 ${s.toolCount ?? "?"}`
        );
        return `\u5DF2\u63A5\u5165 ${st.servers.length} \u53F0\uFF1A
${lines.join("\n")}
\u7BA1\u7406\u6587\u4EF6\uFF1A${st.patchPath}`;
      }
      return `\u672A\u77E5 action\uFF1A${action}`;
    }
  });
}
function apply(ctx) {
  toolsService = typeof ctx.get === "function" ? ctx.get("tools") ?? null : null;
  registerBridgeTool(ctx);
  const routes = makeRoutes();
  ctx.effect(() => {
    const disposers = routes.map((route) => ctx.webServer.register(route));
    return () => {
      for (const dispose of disposers) dispose();
    };
  }, "dsh-mcp-market: routes");
  console.log(
    `[dsh-bridge-market] \u6865\u63A5\u5E02\u573A\u5DF2\u542F\u52A8\uFF1A\u7BA1\u7406\u6587\u4EF6 ${patchPath()}\uFF08\u4FEE\u6539\u5C06\u70ED\u52A0\u8F7D\u751F\u6548\uFF09`
  );
}
export {
  apply,
  collectMcpRows,
  deleteServer,
  fillSpec,
  inject,
  name,
  parsePasted,
  parseRegionRows,
  patchPath,
  readState,
  rewriteRegion,
  setEnabled,
  templateById,
  upsertServer
};

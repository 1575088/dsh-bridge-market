/**
 * MCP 市场官方配置模板（数据来自官方文档调研，占位符通过面板表单填写）。
 * 每个 config 模板包含 fields（表单字段）与 spec（DSH @deepseek-ai/dsh-mcp-client 配置骨架，
 * 字符串值里的 {{fieldKey}} 会被表单值替换）。
 */

export const TEMPLATES = [
  {
    id: "apifox-cloud",
    vendor: "Apifox",
    title: "Apifox MCP（公有云）",
    category: "接口工具",
    transport: "stdio",
    description:
      "官方 apifox-mcp-server：让 AI 直接读取 Apifox 项目内的 API 文档。仅需访问令牌与项目 ID。",
    docsUrl: "https://docs.apifox.com/apifox-mcp-server",
    kind: "config",
    fields: [
      {
        key: "projectId",
        label: "项目 ID",
        placeholder: "项目设置 → 基本设置 里复制",
        required: true,
      },
      {
        key: "accessToken",
        label: "API 访问令牌",
        type: "password",
        placeholder: "账号设置 → API 访问令牌 → 创建令牌",
        required: true,
      },
    ],
    serverNameDefault: "apifox",
    spec: {
      transport: "stdio",
      command: "npx",
      args: ["-y", "apifox-mcp-server@latest", "--project={{projectId}}"],
      env: { APIFOX_ACCESS_TOKEN: "{{accessToken}}" },
    },
  },
  {
    id: "apifox-private",
    vendor: "Apifox",
    title: "Apifox MCP（私有化部署）",
    category: "接口工具",
    transport: "stdio",
    description:
      "私有化部署版：同样使用官方 npx 包，额外指定自建服务的 API 地址（--apifox-api-base-url）。",
    docsUrl: "https://docs.apifox.com/6327888m0",
    kind: "config",
    fields: [
      {
        key: "projectId",
        label: "项目 ID",
        placeholder: "私有化实例的项目 ID",
        required: true,
      },
      {
        key: "accessToken",
        label: "API 访问令牌",
        type: "password",
        placeholder: "在私有化部署实例中生成",
        required: true,
      },
      {
        key: "baseUrl",
        label: "私有化 API 地址",
        placeholder: "https://your-apifox-server.com（http/https 开头）",
        required: true,
      },
    ],
    serverNameDefault: "apifox-private",
    spec: {
      transport: "stdio",
      command: "npx",
      args: [
        "-y",
        "apifox-mcp-server@latest",
        "--project={{projectId}}",
        "--apifox-api-base-url={{baseUrl}}",
      ],
      env: { APIFOX_ACCESS_TOKEN: "{{accessToken}}" },
    },
  },
  {
    id: "apipost",
    vendor: "Apipost",
    title: "Apipost MCP（云端）",
    category: "接口工具",
    transport: "streamable-http",
    description:
      "官方远程 Streamable HTTP 服务：连接 https://open.apipost.net/mcp，请求头 api-token 认证。",
    docsUrl: "https://wiki.apipost.cn/docs/MCP/%E5%BF%AB%E9%80%9F%E6%8E%A5%E5%85%A5/",
    kind: "config",
    fields: [
      {
        key: "apiToken",
        label: "API Token",
        type: "password",
        placeholder: "项目设置 → OpenAPI → 创建 Token",
        required: true,
      },
    ],
    serverNameDefault: "apipost",
    spec: {
      transport: "streamable-http",
      url: "https://open.apipost.net/mcp",
      headers: { "api-token": "{{apiToken}}" },
    },
  },
  {
    id: "apipost-private",
    vendor: "Apipost",
    title: "Apipost MCP（私有化）",
    category: "接口工具",
    transport: "streamable-http",
    description:
      "私有化部署版：把 URL 换成公司私有域名（路径 /openapi/mcp），请求头 api-token 不变。",
    docsUrl: "https://wiki.apipost.cn/docs/MCP/%E5%BF%AB%E9%80%9F%E6%8E%A5%E5%85%A5/",
    kind: "config",
    fields: [
      {
        key: "baseUrl",
        label: "私有化 MCP 地址",
        placeholder: "https://your-domain.com/openapi/mcp",
        required: true,
      },
      {
        key: "apiToken",
        label: "API Token",
        type: "password",
        placeholder: "项目设置 → OpenAPI → 创建 Token",
        required: true,
      },
    ],
    serverNameDefault: "apipost-private",
    spec: {
      transport: "streamable-http",
      url: "{{baseUrl}}",
      headers: { "api-token": "{{apiToken}}" },
    },
  },
  {
    id: "mastergo",
    vendor: "MasterGo",
    title: "MasterGo Magic MCP",
    category: "设计工具",
    transport: "stdio",
    description:
      "官方 @mastergo/magic-mcp：获取设计稿 DSL 与 D2C 数据。需团队版及以上权限，令牌在个人设置 → 安全设置 → 个人访问令牌。",
    docsUrl: "https://mastergo.com/help/ai-features/magic-mcp.html",
    kind: "config",
    fields: [
      {
        key: "token",
        label: "个人访问令牌（MG_MCP_TOKEN）",
        type: "password",
        placeholder: "mastergo.com → 个人设置 → 安全设置 → 个人访问令牌",
        required: true,
      },
    ],
    serverNameDefault: "mastergo",
    spec: {
      transport: "stdio",
      command: "npx",
      args: ["-y", "@mastergo/magic-mcp", "--token={{token}}", "--url=https://mastergo.com"],
      env: {},
    },
  },
  {
    id: "pixso-remote",
    vendor: "Pixso",
    title: "Pixso MCP（远程云端）",
    category: "设计工具",
    transport: "streamable-http",
    description:
      "官方远程 MCP：https://pixso.cn/mcp，用个人访问令牌认证（请求头 Token）。复制图层链接给 Agent 即可获取 DSL。",
    docsUrl: "https://pixso.net/developer/zh/mcp/remote-mcp.html",
    kind: "config",
    fields: [
      {
        key: "token",
        label: "个人访问令牌",
        type: "password",
        placeholder: "Pixso 工作台 → 用户中心 → 个人访问令牌（首次生成时可复制）",
        required: true,
      },
    ],
    serverNameDefault: "pixso",
    spec: {
      transport: "streamable-http",
      url: "https://pixso.cn/mcp",
      headers: { Token: "{{token}}" },
    },
  },
  {
    id: "pixso-local",
    vendor: "Pixso",
    title: "Pixso MCP（桌面端本地）",
    category: "设计工具",
    transport: "streamable-http",
    description:
      "Pixso 桌面客户端内置 MCP 服务：开启后连接本机 http://127.0.0.1:3667/mcp，无需鉴权头。适合本地设计稿直连。",
    docsUrl: "https://pixso.net/developer/zh/mcp/local-mcp.html",
    kind: "config",
    fields: [],
    serverNameDefault: "pixso-local",
    spec: {
      transport: "streamable-http",
      url: "http://127.0.0.1:3667/mcp",
      headers: {},
    },
  },
  {
    id: "figma",
    vendor: "Figma",
    title: "Figma 官方远程 MCP",
    category: "设计工具",
    transport: "streamable-http",
    description:
      "官方端点 https://mcp.figma.com/mcp。⚠️ 仅支持 OAuth 2.0 授权，不支持 Personal Access Token，DSH 纯 HTTP 客户端无法自动走浏览器授权，暂不支持直接配置。",
    docsUrl: "https://developers.figma.com/docs/figma-mcp-server/remote-server-installation/",
    kind: "info",
    note:
      "Figma 官方论坛确认远程 MCP 不支持 PAT/Bearer。可选替代：用 Claude Code 接入后共享结果；或使用社区 stdio 实现 figma-developer-mcp（FIGMA_API_KEY 环境变量，非官方、自担风险）——可通过「自定义配置」粘贴其 mcpServers JSON。",
    fields: [],
    serverNameDefault: "figma",
  },
  {
    id: "lanhu",
    vendor: "蓝湖 Lanhu",
    title: "蓝湖 MCP",
    category: "设计工具",
    transport: "stdio",
    description:
      "官方暂未发布 MCP。仅有社区实现（dsphper/lanhu-mcp、npm mcp-lanhu 等），部分方案需要蓝湖登录 Cookie，存在泄漏风险，请自行评估。",
    docsUrl: "https://github.com/dsphper/lanhu-mcp",
    kind: "info",
    note:
      "如确需接入，可在「自定义配置」中粘贴社区实现的 mcpServers JSON（注意 Cookie 等敏感信息的保管）。",
    fields: [],
    serverNameDefault: "lanhu",
  },
  {
    id: "chrome-devtools",
    vendor: "Chrome",
    title: "Chrome DevTools MCP",
    category: "开发工具",
    transport: "stdio",
    description:
      "官方 chrome-devtools-mcp：连接本机 Chrome 打开页面、截图、读 console/网络请求、跑 Lighthouse，用于开发自验与 bug 定位。",
    docsUrl: "https://github.com/ChromeDevTools/chrome-devtools-mcp",
    kind: "config",
    fields: [],
    serverNameDefault: "chrome-devtools",
    spec: {
      transport: "stdio",
      command: "npx",
      args: ["-y", "chrome-devtools-mcp@latest"],
      env: {},
    },
  },
  {
    id: "context7",
    vendor: "Context7",
    title: "Context7 MCP（实时技术文档）",
    category: "开发工具",
    transport: "stdio",
    description:
      "官方 @upstash/context7-mcp：按需拉取 Vant / Vue / React / TypeScript 等库的最新官方文档，避免 AI 用过时 API。",
    docsUrl: "https://github.com/upstash/context7",
    kind: "config",
    fields: [],
    serverNameDefault: "context7",
    spec: {
      transport: "stdio",
      command: "npx",
      args: ["-y", "@upstash/context7-mcp"],
      env: {},
    },
  },
];

export function templateById(id) {
  return TEMPLATES.find((t) => t.id === id) ?? null;
}

/** 把 spec 中的 {{key}} 占位符用表单值替换（结构化替换，不经过 JSON 序列化）。 */
export function fillSpec(spec, values) {
  const fill = (node) => {
    if (typeof node === "string") {
      return node.replace(/\{\{(\w+)\}\}/g, (_, key) =>
        Object.prototype.hasOwnProperty.call(values, key) ? String(values[key] ?? "") : `{{${key}}}`,
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

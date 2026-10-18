/**
 * 桥接市场 · 应用目录（APP_CATALOG）
 *
 * 与 templates.js 的差别：这里的条目单位是「一个网站 / 一个 App」，不是「一个 npm 包」。
 * 每条都标注了接入方式（bridge），端点/命令来自官方文档或官方仓库 README。
 *
 * kind = "config"：点「接入」后写入一行 MCP 配置，刷新即能调用。
 * kind = "info"  ：官方只支持 OAuth 浏览器授权，DSH 的纯 HTTP MCP 客户端走不通，只做说明。
 *
 * spec 里的占位符 {{xxx}} 会被 ConfigurePane 传入的值替换（沿用模板机制）。
 * 由于面板目前是 JSON 文本域，占位符写成明显的中文提示，用户粘贴时一眼能看到该填什么。
 */

export const APP_CATALOG = [
  // ---------------- 地图 / 出行 ----------------
  {
    id: "app-amap",
    vendor: "高德地图",
    title: "高德地图",
    category: "地图/出行",
    transport: "streamable-http",
    kind: "config",
    description:
      "查地点、周边搜索、路线规划、天气与打车唤端。官方 Streamable HTTP 端点，把高德开放平台申请的 Web 服务 Key 拼进 URL 的 key 参数即可。",
    docsUrl: "https://lbs.amap.com/api/mcp-server/gettingstarted",
    fields: [
      { key: "key", label: "高德 Web 服务 Key", placeholder: "在 lbs.amap.com 控制台创建应用后申请", required: true },
    ],
    serverNameDefault: "amap",
    spec: {
      transport: "streamable-http",
      url: "https://mcp.amap.com/mcp?key=<在此填入高德Key>",
      headers: {},
    },
  },
  {
    id: "app-tencent-map",
    vendor: "腾讯地图",
    title: "腾讯地图",
    category: "地图/出行",
    transport: "streamable-http",
    kind: "config",
    description:
      "地点搜索、地理编码、路线规划、IP 定位与天气。官方端点把 Key 放 query 的 key 参数；key 在 lbs.qq.com 控制台申请。",
    docsUrl: "https://lbs.qq.com/service/MCPServer/MCPServerGuide/userGuide",
    fields: [
      { key: "key", label: "腾讯位置服务 Key", placeholder: "lbs.qq.com → 控制台 → 应用管理 → Key管理", required: true },
    ],
    serverNameDefault: "tencent-map",
    spec: {
      transport: "streamable-http",
      url: "https://mcp.map.qq.com/mcp?key=<在此填入腾讯地图Key>&format=0",
      headers: {},
    },
  },
  {
    id: "app-baidu-map",
    vendor: "百度地图",
    title: "百度地图",
    category: "地图/出行",
    transport: "stdio",
    kind: "config",
    description:
      "地理编码、路线规划、POI 检索与天气。官方 stdio 包，AK 走环境变量 BAIDU_MAP_API_KEY；申请 AK 时要勾选「MCP(SSE)」服务。",
    docsUrl: "https://github.com/baidu-maps/mcp",
    fields: [
      { key: "BAIDU_MAP_API_KEY", label: "百度地图 AK", placeholder: "lbsyun.baidu.com/apiconsole/key 创建", required: true },
    ],
    serverNameDefault: "baidu-map",
    spec: {
      transport: "stdio",
      command: "npx",
      args: ["-y", "@baidumap/mcp-server-baidu-map"],
      env: { BAIDU_MAP_API_KEY: "<在此填入百度地图AK>" },
    },
  },

  // ---------------- 协作 / IM ----------------
  {
    id: "app-lark",
    vendor: "飞书 / Lark",
    title: "飞书 / Lark",
    category: "协作/IM",
    transport: "stdio",
    kind: "config",
    description:
      "读写云文档、多维表格、消息与日历。官方 npm 包，用自建应用的 App ID / App Secret 认证；要用「你的身份」读写还得先跑一次 lark-mcp login 走 OAuth。",
    docsUrl: "https://github.com/larksuite/lark-openapi-mcp",
    fields: [
      { key: "appId", label: "App ID", placeholder: "open.feishu.cn 创建自建应用后获取", required: true },
      { key: "appSecret", label: "App Secret", type: "password", placeholder: "同上", required: true },
    ],
    serverNameDefault: "lark",
    spec: {
      transport: "stdio",
      command: "npx",
      args: ["-y", "@larksuiteoapi/lark-mcp", "mcp", "-a", "<在此填入AppID>", "-s", "<在此填入AppSecret>"],
      env: {},
    },
  },
  {
    id: "app-dingtalk",
    vendor: "钉钉",
    title: "钉钉",
    category: "协作/IM",
    transport: "stdio",
    kind: "config",
    description:
      "通讯录、部门、日历、待办、机器人消息。官方 stdio 包，用企业内部应用的 Client ID / Secret 认证，ACTIVE_PROFILES 决定开放哪些工具集。",
    docsUrl: "https://github.com/open-dingtalk/dingtalk-mcp",
    fields: [
      { key: "DINGTALK_Client_ID", label: "Client ID", placeholder: "钉钉开放平台 → 企业内部应用", required: true },
      { key: "DINGTALK_Client_Secret", label: "Client Secret", type: "password", placeholder: "同上", required: true },
    ],
    serverNameDefault: "dingtalk",
    spec: {
      transport: "stdio",
      command: "npx",
      args: ["-y", "dingtalk-mcp@latest"],
      env: {
        DINGTALK_Client_ID: "<在此填入ClientID>",
        DINGTALK_Client_Secret: "<在此填入ClientSecret>",
        ACTIVE_PROFILES: "dingtalk-contacts,dingtalk-calendar",
      },
    },
  },
  {
    id: "app-slack",
    vendor: "Slack",
    title: "Slack",
    category: "协作/IM",
    transport: "stdio",
    kind: "config",
    description:
      "读频道与私信、按时间或未读拉消息。社区维护的 slack-mcp-server（官方未发布 MCP）；用 xoxp- 用户令牌，发消息默认关闭。",
    docsUrl: "https://github.com/korotovsky/slack-mcp-server",
    fields: [
      { key: "SLACK_MCP_XOXP_TOKEN", label: "Slack 用户令牌 xoxp-", type: "password", placeholder: "Slack App 配置 User Token Scopes 后安装获取", required: true },
    ],
    serverNameDefault: "slack",
    spec: {
      transport: "stdio",
      command: "npx",
      args: ["-y", "slack-mcp-server@latest", "--transport", "stdio"],
      env: { SLACK_MCP_XOXP_TOKEN: "<在此填入xoxp令牌>" },
    },
  },

  // ---------------- 代码 / API ----------------
  {
    id: "app-github",
    vendor: "GitHub",
    title: "GitHub",
    category: "代码托管",
    transport: "streamable-http",
    kind: "config",
    description:
      "查仓库、读文件、管 Issue 与 PR、跑 Actions。官方远程 MCP 端点，用 PAT 作 Bearer；若只想 OAuth 登录，需要客户端支持浏览器授权（DSH 目前走不通）。",
    docsUrl: "https://github.com/github/github-mcp-server",
    fields: [
      { key: "token", label: "GitHub PAT", type: "password", placeholder: "GitHub Settings → Developer settings → Personal access tokens", required: true },
    ],
    serverNameDefault: "github",
    spec: {
      transport: "streamable-http",
      url: "https://api.githubcopilot.com/mcp/",
      headers: { Authorization: "Bearer <在此填入GitHubPAT>" },
    },
  },
  {
    id: "app-postman",
    vendor: "Postman",
    title: "Postman",
    category: "API 工具",
    transport: "streamable-http",
    kind: "config",
    description:
      "检索集合与 API 定义、生成并调试请求。官方托管端点，用 Postman API Key 作 Bearer；路径改成 /code 或 /mcp 可换工具集。",
    docsUrl: "https://github.com/postmanlabs/postman-mcp-server",
    fields: [
      { key: "token", label: "Postman API Key", type: "password", placeholder: "Postman → Settings → API keys", required: true },
    ],
    serverNameDefault: "postman",
    spec: {
      transport: "streamable-http",
      url: "https://mcp.postman.com/minimal",
      headers: { Authorization: "Bearer <在此填入PostmanAPIKey>" },
    },
  },

  // ---------------- 云服务 / 后端 ----------------
  {
    id: "app-cloudflare",
    vendor: "Cloudflare",
    title: "Cloudflare",
    category: "云服务/后端",
    transport: "streamable-http",
    kind: "config",
    description:
      "管 Workers / KV / R2 / DNS，查文档、跑浏览器渲染。官方端点用 API Token 作 Bearer；注意老的 SSE 端点已返回 410，只能用 /mcp。",
    docsUrl: "https://github.com/cloudflare/mcp-server-cloudflare",
    fields: [
      { key: "token", label: "Cloudflare API Token", type: "password", placeholder: "Dashboard → My Profile → API Tokens", required: true },
    ],
    serverNameDefault: "cloudflare",
    spec: {
      transport: "streamable-http",
      url: "https://mcp.cloudflare.com/mcp",
      headers: { Authorization: "Bearer <在此填入CloudflareAPIToken>" },
    },
  },

  // ---------------- 支付 / 搜索 / AI ----------------
  {
    id: "app-stripe",
    vendor: "Stripe",
    title: "Stripe",
    category: "支付/金融",
    transport: "streamable-http",
    kind: "config",
    description:
      "查客户与订阅、建支付链接、读文档示例。官方端点，可用受限 agent key 作 Bearer（OAuth 需要浏览器授权）。",
    docsUrl: "https://docs.stripe.com/mcp",
    fields: [
      { key: "token", label: "Stripe API Key", type: "password", placeholder: "Dashboard → Developers → API keys", required: true },
    ],
    serverNameDefault: "stripe",
    spec: {
      transport: "streamable-http",
      url: "https://mcp.stripe.com",
      headers: { Authorization: "Bearer <在此填入StripeAPIKey>" },
    },
  },
  {
    id: "app-exa",
    vendor: "Exa 搜索",
    title: "Exa 搜索",
    category: "搜索/检索",
    transport: "streamable-http",
    kind: "config",
    description:
      "语义搜索与网页正文抓取，给 agent 补实时资料。官方托管端点，Key 作 Bearer，在 dashboard.exa.ai 取。",
    docsUrl: "https://github.com/exa-labs/exa-mcp-server",
    fields: [
      { key: "token", label: "Exa API Key", type: "password", placeholder: "dashboard.exa.ai/api-keys", required: true },
    ],
    serverNameDefault: "exa",
    spec: {
      transport: "streamable-http",
      url: "https://mcp.exa.ai/mcp",
      headers: { Authorization: "Bearer <在此填入ExaKey>" },
    },
  },
  {
    id: "app-brave-search",
    vendor: "Brave 搜索",
    title: "Brave 搜索",
    category: "搜索/检索",
    transport: "stdio",
    kind: "config",
    description:
      "网页 / 新闻 / 图片本地检索，不用自己搭爬虫。官方 stdio 包，Key 走 BRAVE_API_KEY 环境变量。",
    docsUrl: "https://github.com/brave/brave-search-mcp-server",
    fields: [
      { key: "BRAVE_API_KEY", label: "Brave API Key", type: "password", placeholder: "brave.com/search/api 申请", required: true },
    ],
    serverNameDefault: "brave-search",
    spec: {
      transport: "stdio",
      command: "npx",
      args: ["-y", "@brave/brave-search-mcp-server", "--transport", "stdio"],
      env: { BRAVE_API_KEY: "<在此填入BraveKey>" },
    },
  },
  {
    id: "app-modelscope",
    vendor: "魔搭 ModelScope",
    title: "魔搭 ModelScope",
    category: "AI 平台",
    transport: "stdio",
    kind: "config",
    description:
      "搜模型 / 数据集 / 创空间，还能直接文生图。官方 uvx 包（README 已标 Deprecated，但 PyPI 与镜像仍可用），需要 Access Token。",
    docsUrl: "https://github.com/modelscope/modelscope-mcp-server",
    fields: [
      { key: "MODELSCOPE_API_TOKEN", label: "ModelScope Access Token", type: "password", placeholder: "modelscope.cn → 首页 → Access Tokens", required: true },
    ],
    serverNameDefault: "modelscope",
    spec: {
      transport: "stdio",
      command: "uvx",
      args: ["modelscope-mcp-server"],
      env: { MODELSCOPE_API_TOKEN: "<在此填入ModelScopeToken>" },
    },
  },

  // ---------------- 浏览器自动化 ----------------
  {
    id: "app-playwright",
    vendor: "Playwright",
    title: "Playwright",
    category: "浏览器自动化",
    transport: "stdio",
    kind: "config",
    description:
      "让 agent 真开浏览器点点点、截图、断言页面。零配置，点「接入」就能用（要求本机 Node ≥ 18，首次会下载浏览器）。",
    docsUrl: "https://github.com/microsoft/playwright-mcp",
    fields: [],
    serverNameDefault: "playwright",
    spec: {
      transport: "stdio",
      command: "npx",
      args: ["@playwright/mcp@latest"],
      env: {},
    },
  },

  // ---------------- 只支持 OAuth，先做说明 ----------------
  {
    id: "app-notion",
    vendor: "Notion",
    title: "Notion（暂不支持直连）",
    category: "知识库/文档",
    transport: "streamable-http",
    kind: "info",
    description:
      "检索并读写工作区页面与数据库。官方只提供 OAuth 授权端点 https://mcp.notion.com/mcp，DSH 的纯 HTTP MCP 客户端不会自动弹浏览器授权，直接填 Token 也无效。",
    docsUrl: "https://developers.notion.com/guides/mcp/get-started-with-mcp",
    note:
      "可行替代：① 用支持 OAuth 的客户端（如 Claude Code）连一次后共享结果；② 用 Notion Integration Token + 社区 stdio 实现（自担风险）；③ 等 DSH 的 mcp-client 支持 OAuth。",
    fields: [],
    serverNameDefault: "notion",
  },
  {
    id: "app-supabase",
    vendor: "Supabase",
    title: "Supabase（暂不支持直连）",
    category: "云服务/后端",
    transport: "streamable-http",
    kind: "info",
    description:
      "管项目、跑 SQL、看表结构与日志。官方远程端点 https://mcp.supabase.com/mcp 走 OAuth 登录选项目，直连需要浏览器授权流程。",
    docsUrl: "https://github.com/supabase-community/supabase-mcp",
    note: "替代：本地跑 Supabase CLI 后连 http://localhost:54321/mcp（本地端点不需要 OAuth）。",
    fields: [],
    serverNameDefault: "supabase",
  },
  {
    id: "app-linear",
    vendor: "Linear",
    title: "Linear（暂不支持直连）",
    category: "项目管理",
    transport: "streamable-http",
    kind: "info",
    description:
      "建改 Issue、查项目与周期。官方端点 https://mcp.linear.app/mcp 用 OAuth 2.1，另有只读端点 /mcp/readonly；旧 /sse 已废弃。",
    docsUrl: "https://linear.app/docs/mcp",
    note: "替代：用 Linear 生成的 API key 作 Bearer 头接社区实现；或等 mcp-client 支持 OAuth。",
    fields: [],
    serverNameDefault: "linear",
  },
];

export function catalogById(id) {
  return APP_CATALOG.find((t) => t.id === id) ?? null;
}

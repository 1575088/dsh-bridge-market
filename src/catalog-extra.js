/**
 * 桥接市场 · 追加目录（EXTRA_CATALOG）
 *
 * 与 catalog.js 同形。host.js 把两者按 id 合并，本文件的同名条目覆盖 catalog.js 里的旧条目
 * （典型是把「暂不支持直连」的 info 卡片换成真正能一键接入的 npm 包路线）。
 *
 * 每条的命令、参数、环境变量都来自对应仓库 README 或 npm 包说明，不靠猜：
 *  - kind = "config"：点「接入」写一行 MCP 配置，刷新即能调用。
 *  - kind = "guide" ：拿不到可免授权的直连端点（官方只走 OAuth），但给了照抄就能用的步骤。
 */

export const EXTRA_CATALOG = [
  // ---------------- 知识库 / 文档 ----------------
  {
    id: "app-notion",
    vendor: "Notion",
    title: "Notion",
    category: "知识库/文档",
    transport: "stdio",
    kind: "config",
    description:
      "读写工作区页面、数据库、评论。官方托管端点只认 OAuth，这条走 Notion 官方开源的 npm 包，用 Integration Token（ntn_ 开头）直接接。",
    docsUrl: "https://github.com/makenotion/notion-mcp-server",
    fields: [
      {
        key: "token",
        label: "Notion Integration Token",
        placeholder: "notion.so/my-integrations 建内部集成 → 复制 ntn_… ，并把目标页面「连接」给这个集成",
        required: true,
      },
    ],
    serverNameDefault: "notion",
    spec: {
      transport: "stdio",
      command: "npx",
      args: ["-y", "@notionhq/notion-mcp-server"],
      env: { NOTION_TOKEN: "{{token}}" },
    },
  },

  // ---------------- 云服务 / 后端 ----------------
  {
    id: "app-neon",
    vendor: "Neon",
    title: "Neon Postgres",
    category: "云服务/后端",
    transport: "stdio",
    kind: "config",
    description:
      "建库、开分支、跑 SQL、看慢查询。官方 npm 包支持用 Neon API Key 起本地 stdio 进程，不必走 OAuth 端点。",
    docsUrl: "https://github.com/neondatabase/mcp-server-neon",
    fields: [
      {
        key: "apiKey",
        label: "Neon API Key",
        placeholder: "console.neon.tech → Account settings → API keys",
        required: true,
      },
    ],
    serverNameDefault: "neon",
    spec: {
      transport: "stdio",
      command: "npx",
      args: ["-y", "@neondatabase/mcp-server-neon", "start", "{{apiKey}}"],
    },
  },
  {
    id: "app-sentry",
    vendor: "Sentry",
    title: "Sentry",
    category: "开发工具",
    transport: "stdio",
    kind: "config",
    description:
      "查错误事件、定位堆栈、看 release 与 issue。官方 npm 包支持 --access-token，自建实例再加 --host 即可。",
    docsUrl: "https://github.com/getsentry/sentry-mcp",
    fields: [
      {
        key: "token",
        label: "Sentry User Auth Token",
        placeholder: "sentry.io → Settings → Auth Tokens，勾 org:read / project:read / event:read",
        required: true,
      },
    ],
    serverNameDefault: "sentry",
    spec: {
      transport: "stdio",
      command: "npx",
      args: ["-y", "@sentry/mcp-server@latest", "--access-token={{token}}"],
    },
  },
  {
    id: "app-paypal",
    vendor: "PayPal",
    title: "PayPal",
    category: "支付/金融",
    transport: "stdio",
    kind: "config",
    description:
      "建发票、查订单与交易、管商品目录。官方 npm 包认 PAYPAL_ACCESS_TOKEN，默认走沙箱环境。",
    docsUrl: "https://github.com/paypal/agent-toolkit",
    fields: [
      {
        key: "token",
        label: "PayPal Access Token",
        placeholder: "developer.paypal.com → Apps & Credentials → 你的 App → 生成 Access Token",
        required: true,
      },
      {
        key: "env",
        label: "环境（沙箱填 sandbox，正式填 production）",
        placeholder: "sandbox",
        required: false,
      },
    ],
    serverNameDefault: "paypal",
    spec: {
      transport: "stdio",
      command: "npx",
      args: ["-y", "@paypal/mcp", "--tools=all"],
      env: { PAYPAL_ACCESS_TOKEN: "{{token}}", PAYPAL_ENVIRONMENT: "{{env}}" },
    },
  },
  {
    id: "app-elasticsearch",
    vendor: "Elasticsearch",
    title: "Elasticsearch",
    category: "数据库",
    transport: "stdio",
    kind: "config",
    description:
      "自然语言查索引、看字段映射与聚合结果。官方 npm 包要 ES_URL，带鉴权的集群再填 ES_API_KEY。",
    docsUrl: "https://github.com/elastic/mcp-server-elasticsearch",
    fields: [
      { key: "ES_URL", label: "Elasticsearch 地址", placeholder: "http://localhost:9200", required: true },
      { key: "ES_API_KEY", label: "API Key（有鉴权才填）", placeholder: "可留空", required: false },
    ],
    serverNameDefault: "elasticsearch",
    spec: {
      transport: "stdio",
      command: "npx",
      args: ["-y", "@elastic/mcp-server-elasticsearch"],
      env: { ES_URL: "{{ES_URL}}", ES_API_KEY: "{{ES_API_KEY}}" },
    },
  },

  // ---------------- 数据库 ----------------
  {
    id: "app-postgres",
    vendor: "PostgreSQL",
    title: "PostgreSQL（本地/自建）",
    category: "数据库",
    transport: "stdio",
    kind: "config",
    description:
      "只读查询库表结构与数据，所有 SQL 都跑在 READ ONLY 事务里。官方参考实现，连串直接写连接字符串。",
    docsUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/postgres",
    fields: [
      {
        key: "url",
        label: "连接串",
        placeholder: "postgresql://user:password@localhost:5432/mydb",
        required: true,
      },
    ],
    serverNameDefault: "postgres",
    spec: {
      transport: "stdio",
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-postgres", "{{url}}"],
    },
  },
  {
    id: "app-mysql",
    vendor: "MySQL",
    title: "MySQL / MariaDB",
    category: "数据库",
    transport: "stdio",
    kind: "config",
    description:
      "查表、跑 SQL、看执行计划与库表清单。社区 npm 包按环境变量连库，不填 DB 时进入多库模式。",
    docsUrl: "https://github.com/benborla/mcp-server-mysql",
    fields: [
      { key: "MYSQL_HOST", label: "主机", placeholder: "127.0.0.1", required: true },
      { key: "MYSQL_PORT", label: "端口", placeholder: "3306", required: false },
      { key: "MYSQL_USER", label: "用户名", placeholder: "root", required: true },
      { key: "MYSQL_PASS", label: "密码", placeholder: "", required: true },
      { key: "MYSQL_DB", label: "库名（留空＝多库模式）", placeholder: "mydb", required: false },
    ],
    serverNameDefault: "mysql",
    spec: {
      transport: "stdio",
      command: "npx",
      args: ["-y", "mcp-server-mysql"],
      env: {
        MYSQL_HOST: "{{MYSQL_HOST}}",
        MYSQL_PORT: "{{MYSQL_PORT}}",
        MYSQL_USER: "{{MYSQL_USER}}",
        MYSQL_PASS: "{{MYSQL_PASS}}",
        MYSQL_DB: "{{MYSQL_DB}}",
      },
    },
  },

  // ---------------- 本机 / 运维 ----------------
  {
    id: "app-filesystem",
    vendor: "本机文件系统",
    title: "文件系统（限定目录）",
    category: "本机能力",
    transport: "stdio",
    kind: "config",
    description:
      "读、写、搜、改指定目录下的文件，越界会被拒。给 agent 一个安全边界内的文件操作通道。",
    docsUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem",
    fields: [
      {
        key: "path",
        label: "允许操作的目录（绝对路径）",
        placeholder: "D:\\dsh-workspace",
        required: true,
      },
    ],
    serverNameDefault: "filesystem",
    spec: {
      transport: "stdio",
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-filesystem", "{{path}}"],
    },
  },
  {
    id: "app-memory",
    vendor: "知识图谱记忆",
    title: "Memory（知识图谱）",
    category: "本机能力",
    transport: "stdio",
    kind: "config",
    description:
      "把实体和关系存成知识图谱，跨会话记住「谁是谁、做过什么」。本地 JSON 文件落盘，不上云。",
    docsUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/memory",
    fields: [
      {
        key: "file",
        label: "记忆文件路径（留空用默认）",
        placeholder: "D:\\dsh-workspace\\memory.json",
        required: false,
      },
    ],
    serverNameDefault: "memory",
    spec: {
      transport: "stdio",
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-memory"],
      env: { MEMORY_FILE_PATH: "{{file}}" },
    },
  },
  {
    id: "app-sequential-thinking",
    vendor: "官方参考实现",
    title: "Sequential Thinking（结构化推理）",
    category: "AI 平台",
    transport: "stdio",
    kind: "config",
    description:
      "给模型一个可修订的思考草稿板：分步推理、回退、分支。免密钥，装上就能用。",
    docsUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/sequentialthinking",
    fields: [],
    serverNameDefault: "sequential-thinking",
    spec: {
      transport: "stdio",
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-sequential-thinking"],
    },
  },
  {
    id: "app-kubernetes",
    vendor: "Kubernetes",
    title: "Kubernetes 集群",
    category: "云服务/后端",
    transport: "stdio",
    kind: "config",
    description:
      "看 Pod、日志、事件，扩缩容与滚更。读的是本机 kubeconfig 当前上下文，可开「只允许非破坏性操作」。",
    docsUrl: "https://github.com/Flux159/mcp-server-kubernetes",
    fields: [],
    serverNameDefault: "kubernetes",
    spec: {
      transport: "stdio",
      command: "npx",
      args: ["-y", "mcp-server-kubernetes"],
      env: { ALLOW_ONLY_NON_DESTRUCTIVE_TOOLS: "true" },
    },
  },
  {
    id: "app-docker",
    vendor: "Docker",
    title: "Docker 容器",
    category: "本机能力",
    transport: "stdio",
    kind: "config",
    description:
      "列容器、看日志、起停与构建镜像。连本机 Docker，需要 Docker Desktop / Engine 已运行。",
    docsUrl: "https://github.com/ckreiling/mcp-server-docker",
    fields: [],
    serverNameDefault: "docker",
    spec: {
      transport: "stdio",
      command: "npx",
      args: ["-y", "mcp-server-docker"],
    },
  },

  // ---------------- 浏览器 / 搜索 ----------------
  {
    id: "app-puppeteer",
    vendor: "Puppeteer",
    title: "Puppeteer 浏览器自动化",
    category: "浏览器自动化",
    transport: "stdio",
    kind: "config",
    description:
      "开浏览器、点页面、截图、抓 DOM、跑 JS。免密钥，首次运行会下载 Chromium。",
    docsUrl: "https://github.com/modelcontextprotocol/servers-archived/tree/main/src/puppeteer",
    fields: [],
    serverNameDefault: "puppeteer",
    spec: {
      transport: "stdio",
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-puppeteer"],
    },
  },
  {
    id: "app-browsermcp",
    vendor: "Browser MCP",
    title: "控制你自己的浏览器",
    category: "浏览器自动化",
    transport: "stdio",
    kind: "config",
    description:
      "操控你正在用的 Chrome/Edge（保留登录态），而不是另开一个干净浏览器。需先在浏览器装官方扩展。",
    docsUrl: "https://github.com/browsermcp/mcp",
    fields: [],
    serverNameDefault: "browsermcp",
    spec: {
      transport: "stdio",
      command: "npx",
      args: ["-y", "@browsermcp/mcp"],
    },
  },
  {
    id: "app-google-maps",
    vendor: "Google Maps",
    title: "Google Maps",
    category: "地图/出行",
    transport: "stdio",
    kind: "config",
    description:
      "地址解析、地点搜索、路线与距离计算。官方参考实现，要 Google Cloud 的 Maps API Key。",
    docsUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/google-maps",
    fields: [
      {
        key: "GOOGLE_MAPS_API_KEY",
        label: "Google Maps API Key",
        placeholder: "console.cloud.google.com 开启 Geocoding / Places / Directions API 后创建",
        required: true,
      },
    ],
    serverNameDefault: "google-maps",
    spec: {
      transport: "stdio",
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-google-maps"],
      env: { GOOGLE_MAPS_API_KEY: "{{GOOGLE_MAPS_API_KEY}}" },
    },
  },

  // ---------------- 只能看教程的（官方只走 OAuth） ----------------
  {
    id: "app-supabase",
    vendor: "Supabase",
    title: "Supabase（教程）",
    category: "云服务/后端",
    transport: "stdio",
    kind: "guide",
    description:
      "管项目、跑 SQL、看表结构与日志。官方托管端点要 OAuth，但用 Personal Access Token 跑本地 stdio 包同样能用。",
    docsUrl: "https://github.com/supabase-community/supabase-mcp",
    fields: [],
    serverNameDefault: "supabase",
    steps: [
      "去 supabase.com/dashboard/account/tokens 创建 Personal Access Token（sbp_ 开头），复制下来。",
      "在面板点右上角「手动配置」，把下面这段贴进去（token 换成你自己的）：",
      '{"mcpServers":{"supabase":{"command":"npx","args":["-y","@supabase/mcp-server-supabase@latest","--access-token=你的sbp_token"]}}}',
      "点确认，等 5～10 秒，再打开「已接入」页签看到「工具 N > 0」就成功了。",
      "如果你用的是本地 Supabase（supabase start），也可以不走 token，直接连 http://localhost:54321/mcp（本地端点免授权）。",
    ],
  },
  {
    id: "app-linear",
    vendor: "Linear",
    title: "Linear（教程）",
    category: "项目管理",
    transport: "streamable-http",
    kind: "guide",
    description:
      "查 issue、改状态、写评论。Linear 官方远程 MCP 走 OAuth 授权，本机客户端不会自动弹授权页，所以要走手动贴 Key 的路线。",
    docsUrl: "https://linear.app/docs/mcp",
    fields: [],
    serverNameDefault: "linear",
    steps: [
      "去 linear.app/settings/api 创建 Personal API Key（lin_api_ 开头）。",
      "注意：官方 MCP 端点不接受这种静态 Key，需要在本机跑一个把你 Key 转成标准 MCP 服务的中间层（例如 mcp-remote 加 --header 参数转发），或者等 DSH 的 mcp-client 支持 OAuth。",
      "替代做法：直接让我用 Linear GraphQL API 干活——把 Key 给我，我写脚本调 https://api.linear.app/graphql，不需要 MCP。",
      "不想折腾就用「手动配置」接别的记录工具（比如把任务写到 Notion 数据库）。",
    ],
  },
  {
    id: "app-vercel",
    vendor: "Vercel",
    title: "Vercel（教程）",
    category: "云服务/后端",
    transport: "streamable-http",
    kind: "guide",
    description:
      "看部署、查日志、回滚、管域名。官方远程 MCP 要 OAuth，本机走不通；但 Vercel 有完整 REST API。",
    docsUrl: "https://vercel.com/docs/mcp",
    fields: [],
    serverNameDefault: "vercel",
    steps: [
      "去 vercel.com/account/tokens 创建 Personal Access Token。",
      "官方 MCP 端点（https://mcp.vercel.com）只接受 OAuth，静态 token 直连会被拒。",
      "可行替代：把 token 给我，我直接用 Vercel REST API（https://api.vercel.com/v6/deployments 等）帮你查部署、拉日志、触发回滚。",
      "如果要固定成工具，可在面板「手动配置」里接一个通用 OpenAPI 转 MCP 的本地服务，把它指向 Vercel API。",
    ],
  },
  {
    id: "app-intercom",
    vendor: "Intercom",
    title: "Intercom（教程）",
    category: "项目管理",
    transport: "streamable-http",
    kind: "guide",
    description:
      "查客户会话、联系方式与工单。官方远程 MCP 走 OAuth，本机需要改成 Access Token 的方式。",
    docsUrl: "https://developers.intercom.com/docs/guides/mcp",
    fields: [],
    serverNameDefault: "intercom",
    steps: [
      "去 developers.intercom.com → Your apps → Authentication 创建 Access Token。",
      "官方 MCP 端点只认 OAuth 授权页，静态 token 无法直连。",
      "可行替代：把 token 给我，我直接调 Intercom REST API（https://api.intercom.io）查会话、客户与标签。",
      "注意：涉及给真实客户发消息的操作，我会先问你再做。",
    ],
  },
];

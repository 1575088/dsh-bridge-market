# dsh-bridge-market · 桥接市场

给 DeepSeek Harness 的 agent 装一个「应用插座」：列表里挑一个网站或 app，点「接入」，agent 当场就多出一批能调它的工具。

不需要记 npm 包名，不需要手写 YAML，也不需要懂 MCP 是什么。

---

## 一句话说明它干什么

agent 默认只会用自带的那几个工具。装了本插件之后：

```
你：帮我查一下高德地图上附近有哪些咖啡馆
agent：好，我先接入一下高德——（点「接入」后）
agent：……已连上，附近有 3 家……
```

中间那一步，本来要你自己去找「高德 MCP 服务器」的包名、命令、参数、key 放哪个环境变量。现在变成在下拉列表里选一个应用。

---

## 三步用起来

**第 1 步：安装**

在 DSH 会话里让 agent 装，或者手动执行：

```
plugin_manager  action: install_bundle  target: <本目录的绝对路径>
```

装完**重启一次 DSH**（插件带的工具和面板要重启才会注册）。

**第 2 步：打开面板**

重启后左侧边栏顶部会多一个入口，点开就是「桥接市场」。里面三个页签：

| 页签 | 干什么 |
| --- | --- |
| 应用目录 | 搜索 / 按分类挑应用，点一项就预填好配置 |
| 已接入 | 看已经接上的应用，每个显示「工具 N」 |
| 手动配置 | 直接粘贴 Claude Code 的 `.mcp.json` 片段，一次接一批 |

**第 3 步：接入一个应用**

选应用 → 如果它需要 key，就填进去 → 保存。

看「已接入」页签那一行的 **「工具 N」** 徽标：

- **N > 0** = 真的连上了，agent 现在就能用（可能等几秒，MCP 连接是异步的）
- **N = 0** = 没连上，通常是 key 填错、网络不通，或端点本身要求 OAuth 登录

---

## 不用申请 key 就能用的（先用这些试手感）

| 应用 | 能干什么 |
| --- | --- |
| DeepWiki | 对任意 GitHub 仓库提问，读它的代码结构说明 |
| Cloudflare 文档检索 | 查 Cloudflare 官方文档 |
| Hugging Face | 搜模型、数据集、论文 |
| Firecrawl | 抓网页、爬站、转 markdown |
| Exa 搜索 | 语义搜索（不填 key 也能用，有速度限制） |

这 5 条都是发过 `POST initialize` 实测返回 200 才收进目录的。

---

## 完整目录

**19 个可一键接入**（标 `*` 的是必须填的 key）：

| 分类 | 应用 | 需要的 key |
| --- | --- | --- |
| 地图/出行 | 高德地图 | `key*` |
| 地图/出行 | 腾讯地图 | `key*` |
| 地图/出行 | 百度地图 | `BAIDU_MAP_API_KEY*` |
| 协作/IM | 飞书 / Lark | `appId*`、`appSecret*` |
| 协作/IM | 钉钉 | `DINGTALK_Client_ID*`、`DINGTALK_Client_Secret*` |
| 协作/IM | Slack | `SLACK_MCP_XOXP_TOKEN*` |
| 代码托管 | GitHub | `token*` |
| API 工具 | Postman | `token*` |
| 云服务/后端 | Cloudflare | `token*` |
| 支付/金融 | Stripe | `token*` |
| 搜索/检索 | Exa 搜索 | 可不填 |
| 搜索/检索 | Brave 搜索 | `BRAVE_API_KEY*` |
| 搜索/检索 | DeepWiki | 不需要 |
| 搜索/检索 | Cloudflare 文档检索 | 不需要 |
| 搜索/检索 | Firecrawl | 不需要 |
| 搜索/检索 | Tavily 搜索 | `key*` |
| AI 平台 | 魔搭 ModelScope | `MODELSCOPE_API_TOKEN*` |
| AI 平台 | Hugging Face | 不需要（登录后功能更全） |
| 浏览器自动化 | Playwright | 不需要 |

**8 个说明卡**：Notion、Supabase、Linear、Sentry、Neon、Vercel、PayPal、Intercom。

它们官方只支持 OAuth 网页授权，而 DSH 的 MCP 客户端走的是 HTTP + 静态 header，接不上。列出来是为了让你知道「这个应用有 MCP，但当前接不了」，不假装能用。

另外还有 **11 条继承自上游的模板**（Apifox、Apipost、MasterGo、Pixso、context7、Chrome DevTools 等），和新目录混在一起显示，界面共 38 条。

---

## 常见问题

**接入后「工具 N」一直是 0？**
MCP 连接是异步的，等 5–10 秒再看。仍然是 0 就检查：key 是否正确、端点域名能否访问、这个端点是否其实要求 OAuth 登录。

**显示已接入，但 agent 还是不会用？**
先确认 `工具 N` > 0。装了新版本后没重启 DSH 的话，面板和 `bridge_market` 工具都不会出现——重启一次。

**会不会覆盖我手写的 MCP 配置？**
不会。本插件只重写自己那两条 marker 之间的内容，文件其余部分逐字节保留；你自己写的行会在列表里以只读方式显示。

**key 存在哪？会泄露吗？**
写在当前 profile 的 `cordis.patch.yml` 里（明文，就是普通配置文件）。列表接口返回的是掩码值。面板的 HTTP 接口只接受本机（loopback）请求。

**哪些有风险？**
标注「社区 MCP」的（比如小红书、知乎这类靠浏览器自动化逆向的）有账号风控风险。接入第三方 MCP 本质上就是让外部代码用你的身份跑，先看说明再决定。

---

## 让 agent 自己装

除了点面板，agent 自己也能操作这座市场。本插件注册了一个 `bridge_market` 工具：

| action | 作用 |
| --- | --- |
| `list` | 列目录，标出「可接入 / 已接入 / 仅说明」，以及还差哪几个必填键 |
| `attach` | 接入，例如 `{app: "app-amap", config: {key: "…"}}`，缺必填项会直接告诉你补什么 |
| `detach` | 断开（只允许移除本插件自己接的桥） |
| `status` | 列出当前所有桥和它们的工具数 |

所以「帮我接上高德，key 是 xxx」这句话就能完成接入，不用人点界面。

---

## 给开发者：它怎么实现的

每台桥 = 一个 `@deepseek-ai/dsh-mcp-client` 插件实例行，由本插件维护在当前 profile 的 `cordis.patch.yml` 托管区域内：

```yaml
# >>> dsh-bridge-market managed region >>> （请通过「桥接市场」面板管理，勿手改）
- insert:
    - id: mcp-market-context7
      name: '@deepseek-ai/dsh-mcp-client'
      config:
        serverName: context7
        transport: streamable-http
        url: https://mcp.context7.com/mcp
        headers: {}
# <<< dsh-bridge-market managed region <<<
```

三个要点：

1. **profile 自动解析**：上游写死 `profiles/web`，在 desktop/headless profile 下会写进 loader 不监视的文件，面板显示已接入但工具永远不出来。本插件按 `DSH_PROFILE_DIR` → `$DSH_HOME/profiles/<name>` → argv 里的 `...\profiles\<name>` → cwd 依次解析。
2. **热加载**：写入后 loader 自动重载该行，不必重启；「工具 N」就是验证闭环——它数的是 `tools.schemas()` 里真实出现的 `mcp__<name>__*`。
3. **托管区域**：只重写两条 marker 之间的内容，写入走临时文件 + rename。

目录数据在 `src/catalog.js`（`APP_CATALOG`）和 `src/templates.js`（`TEMPLATES`），加一个应用 = 加一个对象。

### 开发

```powershell
npm install --no-save esbuild        # build.mjs 用 esbuild 打包客户端
node build.mjs                       # 产出 dist/index.js（host）与 lib/client.js（client）
node --test tests/*.test.mjs         # 12 个用例：托管区读写、CRUD、粘贴解析、bridge_market 工具
```

测试用临时 `DSH_HOME` + `DSH_PROFILE_DIR` 隔离，不会碰真实配置。

---

## 归属

改造自 **Mrxieyong/dsh-mcp-market** v0.2.0（MIT），保留其 LICENSE 与托管区写入、路由、粘贴解析等基础实现；在此之上新增应用目录、profile 自动解析、工具数徽标、搜索与分类筛选、`bridge_market` 工具，以及「按应用接入」的界面定位。

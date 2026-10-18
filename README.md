# dsh-bridge-market · 桥接市场

让 agent 自己装插件的「桥接市场」：目录的单位是**网站 / app**（高德地图、飞书、语雀、小红书…），
而不是 npm 包名。选中一个应用 → 点「接入」→ agent 当场就多出一组 `mcp__<应用>__*` 工具可用。

## 它解决什么问题

官方市场（`@deepseek-ai/dsh-plugin-market-bundle`）的单位是 npm 包，面向开发者；
本插件在其之上加了一层**应用视角**：你说「我要用高德地图」，不用知道 `@amap/amap-maps-mcp-server`
叫什么、装哪、命令怎么拼——列表里选中它，填 key，完事。

## 界面

- **左侧边栏顶部入口行**（DOM 注入，与技能中心/任务板同机制），点击打开「桥接市场」弹窗。
- **会话顶部栏** MCP 图标快捷入口，共用同一弹窗。
- 三个页签：
  - **应用目录**：搜索框 + 分类 chips（地图出行 / 办公协作 / 内容平台 / 云与运维 / 开发工具 / 文档检索）。
    每项标注厂商与接入方式（官方 MCP / 社区 MCP / 官方 OpenAPI）。点一项 → 预填配置 JSON → 保存即接入。
  - **已接入**：列表显示每台桥的 `工具 N` 徽标（如实反映 `tools.schemas()` 里实际出现的
    `mcp__<name>__*` 数量，0 就是没连上）、启用/停用、编辑、删除、查看完整配置。
    托管区域之外的 MCP 行以只读方式呈现，不覆盖用户手写的配置。
  - **手动配置**：粘贴 Claude Code `.mcp.json` 格式的 `mcpServers` JSON（支持一次多台、支持 `//` 注释）。

## 目录现状

| 类型 | 数量 | 说明 |
| --- | --- | --- |
| 可一键接入（config） | 19 | 高德、腾讯地图、百度地图、飞书/Lark、钉钉、Slack、GitHub、Postman、Cloudflare、Stripe、Exa、Brave、ModelScope、Playwright、DeepWiki、Cloudflare 文档、Hugging Face、Firecrawl、Tavily、Apifox、Apipost、MasterGo、Pixso、context7、Chrome DevTools |
| 免密钥即可用 | 5 | DeepWiki、Cloudflare 文档检索、Hugging Face、Firecrawl、Exa——点「接入」就有工具，不用申请 key |
| 说明卡（info） | 8 | Notion、Supabase、Linear、Sentry、Neon、Vercel、PayPal、Intercom、Figma、蓝湖——官方只支持 OAuth 或有风险，先给说明 |
| 继承自上游的模板 | 11 | 原 `dsh-mcp-market` 的服务模板，已并入本目录 |

免密钥条目都用 `POST initialize` 实测过（200 才收进目录）。目录数据在 `src/catalog.js`（`APP_CATALOG`）与 `src/templates.js`（`TEMPLATES`），加一条就是加一个应用。

## 工作原理

每台桥 = 一个 `@deepseek-ai/dsh-mcp-client` 插件实例行，由本插件维护在当前 profile 的
`cordis.patch.yml` 托管区域内：

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

三个关键点：

1. **profile 自动解析**。上游写死 `profiles/web`，在 desktop/headless profile 下会写进 loader
   不监视的文件——面板显示已接入、工具永远不出来。本插件按
   `DSH_PROFILE_DIR` → `$DSH_HOME/profiles/<name>` → argv 里的 `...\profiles\<name>` → cwd 解析。
2. **热加载**。写入后 loader 自动重载该行，无需重启 DSH；`工具 N` 徽标即验证闭环。
3. **托管区域**。只重写两条 marker 之间的内容，文件其余部分（含用户自己的注释与行）逐字节保留；
   写入走临时文件 + rename。

## agent 侧工具：`bridge_market`

除了点面板，agent 自己也能操作这座市场。插件注册了一个工具：

| action | 作用 |
| --- | --- |
| `list` | 列出目录（可按 `query` 过滤），标出「可接入 / 已接入 / 仅说明」与还差哪几个必填键 |
| `attach` | 接入：`{app: "app-amap", config: {key: "…"}}`，缺必填项会直接告诉你补什么 |
| `detach` | 断开（只允许移除本插件托管的行） |
| `status` | 当前所有桥及其工具数 |

所以「帮我接上高德，key 是 xxx」这句话就能完成接入，不需要人点界面。

## 安装

```powershell
# 在 DSH 会话里，把本包目录的绝对路径交给 plugin_manager
# action: install_bundle, target: <本包绝对路径>
```

重启 DSH 后左侧边栏出现入口；已开启热加载的会话刷新页面即可。

## 开发

```powershell
cd dsh-bridge-market
npm install --no-save esbuild         # build.mjs 用 esbuild 打包客户端
node build.mjs                        # 产出 dist/index.js（host）与 lib/client.js（client）
node --test tests/*.test.mjs          # 12 个用例：托管区读写、CRUD、粘贴解析、bridge_market 工具
```

测试用临时 `DSH_HOME` + `DSH_PROFILE_DIR` 隔离，不会碰真实配置。

## 安全与风险

- 接入第三方 MCP = 让外部代码在你的机器上以你的身份运行。目录里标 `社区 MCP` 的
  （如小红书、知乎浏览器自动化）有风控与账号风险，说明卡里写明后再决定。
- 只有 loopback 请求能调本插件的 API（`isLoopbackRequest` 校验）。
- 密钥写在 `cordis.patch.yml` 里，列表接口返回的是掩码值。

## 归属

本插件改造自 **Mrxieyong/dsh-mcp-market** v0.2.0（MIT），保留其 LICENSE 与托管区写入、
路由、粘贴解析等基础实现；在此之上新增应用目录、profile 自动解析、工具数徽标、搜索与分类筛选、
桥接市场定位的界面文案。

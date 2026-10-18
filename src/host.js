/**
 * dsh-mcp-market host 侧插件：
 * - 在 web profile 的 cordis.patch.yml 中维护一个「托管区域」，
 *   每行是一个 @deepseek-ai/dsh-mcp-client 实例（即一个 MCP 服务器）。
 * - loader 的 watchUserPatches 会持续热加载该文件：新增/修改/删除行立即
 *   生效（新增实例会 spawn 连接 MCP 服务器并注册工具），无需重启 dsh web。
 * - 通过 /api/mcp-market/* 路由（仅限回环请求）给浏览器侧面板提供 CRUD。
 */
import yaml from "js-yaml";
import { readFile, writeFile, rename, mkdir } from "node:fs/promises";
import { existsSync, readdirSync, statSync } from "node:fs";
import { join, sep } from "node:path";
import { homedir } from "node:os";
import { TEMPLATES, templateById, fillSpec } from "./templates.js";
import { APP_CATALOG } from "./catalog.js";

export const name = "dsh-bridge-market";
export const inject = ["webServer"];

const MCP_CLIENT = "@deepseek-ai/dsh-mcp-client";
const REGION_START = "# >>> dsh-bridge-market managed region >>> （请通过「桥接市场」面板管理，勿手改）";
const REGION_END = "# <<< dsh-bridge-market managed region <<<";
const MAX_BODY_BYTES = 1 << 20;
const NAME_RE = /^[A-Za-z0-9_-]{1,32}$/;

// ---------------------------------------------------------------------------
// 基础设施
// ---------------------------------------------------------------------------

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
    const found = readdirSync(base, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => join(base, d.name))
      .filter(isProfileDir);
    return found.length === 1 ? found[0] : null;
  } catch {
    return null;
  }
}

function profileDir() {
  // 原版写死 profiles/web：在 desktop / headless profile 下会把 MCP 行写进
  // loader 根本不监视的文件里——面板显示「已接入」，agent 却永远看不到工具。
  // 更坑的是：宿主进程自己不带 DSH_PROFILE / DSH_PROFILE_DIR 环境变量
  // （那是给子进程的），单靠 env 会一路兜底到 web。这里按「能确定」的优先级解析：
  //   ① DSH_PROFILE_DIR（子进程 / 测试显式指定）
  //   ② DSH_HOME 下按名找，或唯一候选——测试用临时 home 时走这条，避免写进真配置
  //   ③ 启动参数里形如 ...\profiles\<name> 且带 patch 文件的目录（桌面版 argv 第 3 项）
  //   ④ 进程 cwd
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

/** js-yaml 解析容错：把 !!js 表达式当字符串读，避免未知 tag 抛错。 */
const JsTag = new yaml.Type("!js", {
  kind: "scalar",
  resolve: () => true,
  construct: (data) => String(data),
});
const SAFE_SCHEMA = yaml.DEFAULT_SCHEMA.extend([JsTag]);

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
  if (origin === undefined) return true;
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

// ---------------------------------------------------------------------------
// patch 文件读取 / 区域维护
// ---------------------------------------------------------------------------

async function readPatchFile() {
  const path = patchPath();
  if (!existsSync(path)) return "";
  return readFile(path, "utf8");
}

/** 从托管区域解析出 MCP 行列表。 */
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

/** 解析整个 patch 文件为行列表（容错，失败返回 undefined）。 */
function parseWholePatch(content) {
  if (!content.trim()) return [];
  try {
    const doc = yaml.load(content, { schema: SAFE_SCHEMA });
    return Array.isArray(doc) ? doc : [];
  } catch {
    return undefined;
  }
}

/** 提取整份 patch 中所有 @deepseek-ai/dsh-mcp-client 插入行（含托管区域内外的）。 */
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

/** 把托管区域重写为新行集合；其余内容逐字节保留。原子写（tmp + rename）。 */
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

  const body =
    rows.length === 0
      ? ""
      : yaml.dump([{ insert: rows }], { lineWidth: -1, noRefs: true });
  const region = `${REGION_START}\n${body}${REGION_END}`;

  const parts = [before.trimEnd(), region, after.trimStart()].filter((p) => p !== "");
  const next = `${parts.join("\n\n")}\n`;

  const tmp = `${path}.tmp`;
  await mkdir(join(path, ".."), { recursive: true });
  await writeFile(tmp, next, "utf8");
  await rename(tmp, path);
}

// ---------------------------------------------------------------------------
// 服务器模型与校验
// ---------------------------------------------------------------------------

function normalizeServer(raw) {
  const serverName = typeof raw.serverName === "string" ? raw.serverName.trim() : "";
  const transport = raw.transport === "stdio" ? "stdio" : "streamable-http";

  const row = {
    id: `mcp-market-${serverName.toLowerCase().replace(/[^a-z0-9_-]/g, "-")}`,
    name: MCP_CLIENT,
    config: { serverName, transport },
  };
  if (raw.disabled) row.disabled = true;

  if (transport === "stdio") {
    if (typeof raw.command !== "string" || raw.command.trim() === "")
      throw new Error("stdio 服务器必须提供 command");
    row.config.command = raw.command.trim();
    if (Array.isArray(raw.args)) row.config.args = raw.args.map(String);
    const env = {};
    if (raw.env && typeof raw.env === "object") {
      for (const [k, v] of Object.entries(raw.env)) if (v !== undefined) env[k] = String(v);
    }
    row.config.env = env;
  } else {
    if (typeof raw.url !== "string" || !/^https?:\/\//.test(raw.url.trim()))
      throw new Error("streamable-http 服务器必须提供 http(s) 的 url");
    row.config.url = raw.url.trim();
    const headers = {};
    if (raw.headers && typeof raw.headers === "object") {
      for (const [k, v] of Object.entries(raw.headers)) if (v !== undefined) headers[k] = String(v);
    }
    row.config.headers = headers;
  }
  return row;
}

function validateServerName(serverName, takenNames) {
  if (!NAME_RE.test(serverName)) throw new Error("serverName 需为 1–32 位字母/数字/下划线/连字符");
  if (takenNames.has(serverName)) throw new Error(`serverName "${serverName}" 已被占用`);
  return serverName;
}

/** 行 → 面板展示模型（含脱敏认证信息）。 */
function presentRow(row, managed) {
  const c = row.config ?? {};
  const authKeys =
    c.transport === "stdio" ? Object.keys(c.env ?? {}) : Object.keys(c.headers ?? {});
  const summary =
    c.transport === "stdio"
      ? [c.command, ...(c.args ?? [])].join(" ")
      : c.url ?? "";
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
      }),
    ),
    rawConfig: c,
  };
}

function mask(value) {
  const s = String(value ?? "");
  if (s.length <= 8) return "••••••••";
  return `${s.slice(0, 3)}•••${s.slice(-3)}`;
}

// ---------------------------------------------------------------------------
// 粘贴 JSON / YAML 转换（Claude Code mcpServers 或 DSH patch 行）
// ---------------------------------------------------------------------------

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
        env: cfg.env && typeof cfg.env === "object" ? cfg.env : {},
      });
    } else if (typeof cfg.url === "string") {
      const headers =
        cfg.headers && typeof cfg.headers === "object"
          ? { ...cfg.headers }
          : {};
      if (typeof cfg.token === "string" && cfg.token !== "" && !headers.Authorization && !headers.authorization) {
        headers.Authorization = `Bearer ${cfg.token}`;
      }
      servers.push({ serverName, transport: "streamable-http", url: cfg.url, headers });
    } else {
      servers.push({
        serverName,
        error: `无法识别 "${rawName}" 的配置（既无 command 也无 url），已跳过`,
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
  if (!trimmed) throw new Error("请先粘贴配置内容");
  const servers = [];

  // 1) Claude Code mcpServers JSON
  try {
    const parsed = JSON.parse(trimmed);
    if (parsed && typeof parsed === "object") {
      const map = parsed.mcpServers ?? parsed;
      servers.push(...convertMcpServers(map));
      if (servers.length > 0) return servers;
    }
  } catch {
    /* fall through */
  }

  // 2) DSH patch 行（- insert: 区域 / 裸行）
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
        headers: row.headers,
      });
    }
    if (servers.length > 0) return servers;
  } catch {
    /* fall through */
  }

  throw new Error("无法解析：请粘贴 mcpServers JSON（Claude Code 格式）或 DSH patch 行");
}

// ---------------------------------------------------------------------------
// 状态
// ---------------------------------------------------------------------------

let toolsService = null;

/**
 * 数出每个已接入服务当前真正注册进宿主的工具数量。
 * 宿主的命名约定是 mcp__<serverName>__<toolName>（本机实测：mcp__photocraft__command_run）。
 * 拿不到 tools 服务时返回空对象，面板显示「未知」而不是假装 0。
 */
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
    const name = schema && schema.name;
    if (typeof name !== "string" || !name.startsWith("mcp__")) continue;
    const rest = name.slice(5);
    const sep = rest.indexOf("__");
    if (sep <= 0) continue;
    const serverName = rest.slice(0, sep);
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
    return presentRow(row, serverName !== undefined && managedNames.has(serverName));
  });

  const counts = collectToolCounts();
  for (const server of servers) {
    server.toolCount = counts === null ? null : (counts[server.serverName] ?? 0);
  }

  return {
    patchPath: patchPath(),
    profile: process.env.DSH_PROFILE ?? null,
    hotReload: true,
    servers,
    templates: [...APP_CATALOG, ...TEMPLATES],
    toolCounts: counts,
    clientBoot: clientBootRecord(),
  };
}

async function upsertServer(server) {
  const content = await readPatchFile();
  const allRows = collectMcpRows(content);
  const takenNames = new Set(
    allRows
      .map((r) => r.config?.serverName)
      .filter((n) => typeof n === "string" && n !== ""),
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
  if (!found) throw new Error(`未找到服务器 "${serverName}"`);
  await rewriteRegion(next);
  return readState();
}

// ---------------------------------------------------------------------------
// 客户端启动信标（诊断用：面板入口是否已挂载）
// ---------------------------------------------------------------------------

let bootCount = 0;
let bootLastAt = null;
function clientBootRecord() {
  return { count: bootCount, lastAt: bootLastAt };
}
function recordClientBoot() {
  bootCount += 1;
  bootLastAt = new Date().toISOString();
}

// ---------------------------------------------------------------------------
// 路由
// ---------------------------------------------------------------------------

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
      },
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
      },
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
      },
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
      },
    },
    {
      kind: "exact",
      path: "/api/mcp-market/client-boot",
      handler: async (req, res) => {
        if (!guard(req, res, "POST")) return;
        recordClientBoot();
        ok(res, { booted: true, ...clientBootRecord() });
      },
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
      },
    },
  ];
}

// ---------------------------------------------------------------------------
// 插件入口
// ---------------------------------------------------------------------------

/**
 * 给 agent 自己的入口：不经过浏览器面板也能查目录、接入、断开。
 * 注册失败（旧宿主没有 tools 服务）就静默跳过，不影响面板可用。
 */
function registerBridgeTool(ctx) {
  const tools = toolsService;
  if (!tools || typeof tools.register !== "function") return null;
  return tools.register({
    name: "bridge_market",
    description:
      "桥接市场（按「网站/app」为单位）：list 查目录，attach 接入一个应用，detach 断开，status 看已接入的桥与实时工具数。" +
      "接入即生效（无需重启），工具随后以 mcp__<serverName>__* 出现。config 只填该条目 fields 里列出、spec 里带 {{...}} 占位的键。",
    parameters: {
      type: "object",
      properties: {
        action: { type: "string", enum: ["list", "attach", "detach", "status"] },
        query: { type: "string", description: "list 的关键字过滤（匹配名称、厂商、分类、描述）" },
        app: {
          type: "string",
          description: "attach 传目录 id（如 app-amap）；detach 传已接入的 serverName",
        },
        config: {
          type: "object",
          description: "attach 时填占位符的值，键名来自 list 返回的 fields",
        },
      },
      required: ["action"],
      additionalProperties: false,
    },
    output: {
      schema: { type: "string" },
      render: (_args, value) => [{ type: "text", text: String(value) }],
    },
    async execute(args) {
      const action = String(args?.action ?? "list");
      const all = [...APP_CATALOG, ...TEMPLATES];

      if (action === "list") {
        const q = String(args?.query ?? "").trim().toLowerCase();
        const st = await readState();
        const attached = new Map(
          st.servers.filter((s) => s.managed).map((s) => [s.serverName, s]),
        );
        const hits = all.filter((t) => {
          if (q === "") return true;
          return [t.id, t.vendor, t.title, t.category, t.description]
            .filter(Boolean)
            .some((v) => String(v).toLowerCase().includes(q));
        });
        if (hits.length === 0) return `目录里没有匹配「${args?.query ?? ""}」的应用。`;
        const lines = hits.map((t) => {
          const name = t.serverNameDefault || t.id;
          const state = attached.get(name);
          const mark = state ? `已接入${state.enabled === false ? "(已停用)" : ""}` : t.kind === "info" ? "仅说明" : "可接入";
          const need = (t.fields || []).length > 0 ? ` 需填: ${t.fields.map((f) => f.key).join(",")}` : "";
          return `- ${t.id} | ${t.vendor || t.title} · ${t.title} | ${t.category || "-"} | ${t.transport || "-"} | ${mark}${need}`;
        });
        return `应用目录 ${hits.length} 条（共 ${all.length} 条）：\n${lines.join("\n")}`;
      }

      if (action === "attach") {
        const wanted = String(args?.app ?? "").trim().toLowerCase();
        if (wanted === "") return "attach 需要 app 参数（目录 id，如 app-amap）。先用 action=list 查。";
        const entry =
          all.find((t) => String(t.id).toLowerCase() === wanted) ||
          all.find((t) => String(t.serverNameDefault ?? "").toLowerCase() === wanted) ||
          all.find((t) =>
            [t.title, t.vendor].filter(Boolean).some((v) => String(v).toLowerCase().includes(wanted)),
          );
        if (!entry) return `目录里没有「${args?.app}」。先用 action=list 看可用 id。`;
        if (entry.kind === "info") {
          return `「${entry.title}」不能一键接入：${entry.description}${
            entry.docsUrl ? `\n文档：${entry.docsUrl}` : ""
          }`;
        }
        const values = args?.config && typeof args.config === "object" ? args.config : {};
        const missing = (entry.fields || [])
          .filter((f) => f.required && (values[f.key] === undefined || String(values[f.key]).trim() === ""))
          .map((f) => f.key);
        if (missing.length > 0) {
          return `接入「${entry.title}」还缺必填项：${missing.join("、")}。用 config=${JSON.stringify(
            Object.fromEntries(missing.map((k) => [k, "<值>"])),
          )} 再调一次。`;
        }
        const server = { serverName: entry.serverNameDefault || entry.id, ...fillSpec(entry.spec, values) };
        await upsertServer(server);
        return `已接入「${entry.title}」，serverName=${server.serverName}。无需重启；几秒后用 action=status 看工具数，出现 mcp__${server.serverName}__* 即可调用。`;
      }

      if (action === "detach") {
        const name = String(args?.app ?? "").trim();
        if (name === "") return "detach 需要 app 参数（已接入的 serverName）。先用 action=status 查。";
        const before = (await readState()).servers.some((s) => s.serverName === name && s.managed);
        if (!before) return `没有名为 ${name} 的可托管桥（外部配置行不能在这里断）。`;
        await deleteServer(name);
        return `已断开 ${name}，其 mcp__${name}__* 工具会随之消失。`;
      }

      if (action === "status") {
        const st = await readState();
        if (st.servers.length === 0) return "当前没有任何 MCP 桥。用 action=list 挑一个接入。";
        const lines = st.servers.map(
          (s) =>
            `- ${s.serverName} | ${s.transport} | ${s.managed ? "市场托管" : "外部配置(只读)"} | ${
              s.enabled === false ? "已停用" : "启用"
            } | 工具 ${s.toolCount ?? "?"}`,
        );
        return `已接入 ${st.servers.length} 台：\n${lines.join("\n")}\n管理文件：${st.patchPath}`;
      }

      return `未知 action：${action}`;
    },
  });
}

export function apply(ctx) {
  toolsService = typeof ctx.get === "function" ? (ctx.get("tools") ?? null) : null;
  registerBridgeTool(ctx);
  const routes = makeRoutes();
  ctx.effect(() => {
    const disposers = routes.map((route) => ctx.webServer.register(route));
    return () => {
      for (const dispose of disposers) dispose();
    };
  }, "dsh-mcp-market: routes");
  console.log(
    `[dsh-bridge-market] 桥接市场已启动：管理文件 ${patchPath()}（修改将热加载生效）`,
  );
}

export { templateById, fillSpec };
export {
  parseRegionRows,
  collectMcpRows,
  rewriteRegion,
  upsertServer,
  deleteServer,
  setEnabled,
  parsePasted,
  readState,
  patchPath,
};

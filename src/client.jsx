/**
 * dsh-mcp-market 浏览器侧插件（v3 · Trae 式交互）：
 * - 左侧边栏顶部（技能中心下方）DOM 注入「MCP 服务」入口行；
 * - 点击打开居中弹窗：已配置 MCP 列表（头像 + 名称 + 下拉箭头，点击展开详情/操作）；
 *   右上角「+ 添加 MCP Servers」→「从市场添加 / 手动配置」。
 * - 从市场添加：模板列表（官方模板作为快捷方式），点击 → 与手动配置相同的页面，
 *   JSON 预填模板骨架，用户自己在 JSON 里补令牌与私有化参数。
 * - 手动配置：粘贴完整 mcpServers JSON（支持多台），确认后保存。
 * - 弹窗用独立 React root + ErrorBoundary，与入口行解耦。
 */
import { createRoot } from "react-dom/client";
import { Component, useEffect, useMemo, useRef, useState } from "react";
import { jsx, jsxs, Fragment } from "react/jsx-runtime";

const inject = ["slots"];

// ---------------------------------------------------------------------------
// 小工具
// ---------------------------------------------------------------------------

async function api(path, init) {
  const res = await fetch(path, {
    headers: { "content-type": "application/json" },
    ...init,
  });
  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error(`请求失败（HTTP ${res.status}）`);
  }
  if (!res.ok || data.ok === false) {
    throw new Error(data?.error?.message ?? `请求失败（HTTP ${res.status}）`);
  }
  return data;
}

const TRANSPORT_LABEL = { stdio: "stdio", "streamable-http": "HTTP" };

const STYLE = `
.mm-entry{box-sizing:border-box;width:100%;height:36px;color:var(--dsw-alias-label-secondary);
  cursor:pointer;white-space:nowrap;background:0 0;border:none;border-radius:8px;
  align-items:center;gap:8px;padding:0 10px;font-size:13px;display:flex;text-align:left}
.mm-entry:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.mm-entryIcon{flex:none;justify-content:center;align-items:center;width:24px;height:24px;display:inline-flex}
.mm-entryIcon svg{width:18px;height:18px;display:block}
.mm-entryLabel{text-overflow:ellipsis;overflow:hidden;text-align:left}
.mm-entryCount{background:var(--dsw-alias-interactive-bg-hover,#eef2ff);color:var(--dsw-alias-label-primary);
  font-size:10.5px;font-weight:600;padding:0 6px;border-radius:999px;height:16px;line-height:16px;min-width:16px;text-align:center;margin-left:auto}
[data-dsh-frame][data-sidebar-collapsed] .mm-entry{border-radius:50%!important;justify-content:center!important;width:36px!important;height:36px!important;margin:0 auto 12px!important;padding:0!important}
[data-dsh-frame][data-sidebar-collapsed] .mm-entryLabel{display:none!important}
[data-dsh-frame][data-sidebar-collapsed] .mm-entryCount{display:none!important}
.mm-overlay{background:var(--dsw-alias-bg-mask-2,#080a1073);z-index:9999;justify-content:center;
  align-items:center;font-family:system-ui,-apple-system,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif;display:flex;position:fixed;inset:0}
.mm-card{background:var(--dsw-alias-bg-overlay,#fdfdfd);width:min(760px,92vw);max-height:84vh;
  color:var(--dsw-alias-label-primary,#1c1e26);border-radius:12px;flex-direction:column;display:flex;
  overflow:hidden;box-shadow:0 18px 60px #00000059}
.mm-head{background:var(--dsw-alias-bg-base,#fff);align-items:center;gap:10px;padding:12px 16px;display:flex;border-bottom:1px solid var(--dsw-alias-line,#e7e8ea);position:relative}
.mm-headTitle{margin:0;font-size:15px;font-weight:600;display:flex;align-items:center;gap:8px}
.mm-headSub{color:var(--dsw-alias-label-secondary,#8a8f9c);font-size:12px}
.mm-headActions{margin-left:auto;display:flex;align-items:center;gap:8px;position:relative}
.mm-close{color:var(--dsw-alias-label-secondary,#8a8f9c);cursor:pointer;background:transparent;border:none;border-radius:6px;padding:4px 8px;font-size:16px}
.mm-close:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.mm-body{padding:16px 18px;overflow-y:auto;flex:1;background:var(--dsw-alias-bg-base,#fff)}
.mm-note{display:flex;gap:8px;align-items:flex-start;background:var(--dsw-alias-bg-fill-2,#eef2ff);
  border:1px solid var(--dsw-alias-brand,#4c6ef5);border-radius:8px;padding:8px 12px;font-size:12px;margin-bottom:14px;color:var(--dsw-alias-label-primary)}
.mm-btn{border:1px solid var(--dsw-alias-line,#e7e8ea);background:transparent;color:var(--dsw-alias-label-primary,#1c1e26);
  padding:5px 12px;border-radius:7px;cursor:pointer;font-size:12.5px}
.mm-btn:hover{border-color:var(--dsw-alias-brand,#4c6ef5);color:var(--dsw-alias-brand,#4c6ef5)}
.mm-btn.primary{background:var(--dsw-alias-brand,#4c6ef5);border-color:var(--dsw-alias-brand,#4c6ef5);color:#fff}
.mm-btn.primary:hover{opacity:.88;color:#fff}
.mm-btn.danger{color:#e03131}
.mm-btn.danger:hover{border-color:#e03131;background:#fff5f5}
.mm-btn:disabled{opacity:.5;cursor:not-allowed}
.mm-add-btn{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--dsw-alias-line,#e7e8ea);
  background:transparent;color:var(--dsw-alias-label-primary,#1c1e26);border-radius:7px;padding:5px 12px;cursor:pointer;font-size:12.5px}
.mm-add-btn:hover{border-color:var(--dsw-alias-brand,#4c6ef5);color:var(--dsw-alias-brand,#4c6ef5)}
.mm-menu{position:absolute;top:calc(100% + 6px);right:0;min-width:150px;background:var(--dsw-alias-bg-overlay,#fff);
  border:1px solid var(--dsw-alias-line,#e7e8ea);border-radius:10px;box-shadow:0 12px 32px #0000002b;padding:6px;z-index:20}
.mm-menu-item{display:flex;align-items:center;gap:8px;width:100%;border:none;background:transparent;cursor:pointer;
  color:var(--dsw-alias-label-primary,#1c1e26);font-size:13px;padding:8px 10px;border-radius:7px;text-align:left}
.mm-menu-item:hover{background:var(--dsw-alias-interactive-bg-hover)}
.mm-avatar{flex:none;width:30px;height:30px;border-radius:8px;display:inline-flex;align-items:center;justify-content:center;
  font-size:13px;font-weight:600;color:#fff}
.mm-server-row{display:flex;align-items:center;gap:10px;width:100%;border:1px solid transparent;background:transparent;
  cursor:pointer;border-radius:9px;padding:8px 10px;font-size:13.5px;color:var(--dsw-alias-label-primary,#1c1e26);text-align:left}
.mm-server-row:hover{background:var(--dsw-alias-interactive-bg-hover)}
.mm-server-row .mm-name{font-weight:600;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.mm-chevron{flex:none;color:var(--dsw-alias-label-secondary,#8a8f9c);transition:transform .15s}
.mm-server-row.open .mm-chevron{transform:rotate(180deg)}
.mm-detail{margin:0 8px 10px 48px;border-left:2px solid var(--dsw-alias-line,#e7e8ea);padding:2px 0 2px 12px}
.mm-badge{display:inline-block;font-size:10.5px;padding:2px 8px;border-radius:999px;border:1px solid var(--dsw-alias-line,#e7e8ea);color:var(--dsw-alias-label-secondary,#8a8f9c)}
.mm-badge.http{color:#e8590c;border-color:#ffc9a3;background:#fff4e6}
.mm-badge.stdio{color:var(--dsw-alias-brand,#4c6ef5);border-color:var(--dsw-alias-brand,#4c6ef5);background:var(--dsw-alias-bg-fill-2,#eef2ff)}
.mm-badge.ok{color:#2f9e44;border-color:#b2f2bb;background:#e6fcf5}
.mm-badge.off{color:var(--dsw-alias-label-secondary,#8a8f9c);background:transparent}
.mm-summary{font-family:ui-monospace,Menlo,monospace;font-size:11.5px;color:var(--dsw-alias-label-secondary,#8a8f9c);word-break:break-all;margin:6px 0}
.mm-auth{font-size:11.5px;color:var(--dsw-alias-label-secondary,#8a8f9c);margin:4px 0}
.mm-actions{display:flex;gap:6px;margin-top:8px;flex-wrap:wrap}
.mm-empty{color:var(--dsw-alias-label-secondary,#8a8f9c);text-align:center;padding:36px 12px;font-size:13px}
.mm-section-title{font-size:12px;color:var(--dsw-alias-label-secondary,#8a8f9c);margin:16px 0 8px;font-weight:600}
.mm-tpl-row{display:flex;align-items:center;gap:10px;width:100%;border:1px solid var(--dsw-alias-line,#e7e8ea);
  background:var(--dsw-alias-bg-overlay,#fff);cursor:pointer;border-radius:9px;padding:10px 12px;margin-bottom:8px;text-align:left;color:var(--dsw-alias-label-primary,#1c1e26)}
.mm-tpl-row:hover{border-color:var(--dsw-alias-brand,#4c6ef5)}
.mm-tpl-row .mm-tpl-main{flex:1;min-width:0}
.mm-tpl-row .mm-tpl-name{font-size:13px;font-weight:600}
.mm-tpl-row .mm-tpl-desc{font-size:11.5px;color:var(--dsw-alias-label-secondary,#8a8f9c);margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.mm-field{display:flex;flex-direction:column;gap:5px;margin-bottom:12px}
.mm-field label{font-size:12px;color:var(--dsw-alias-label-secondary,#8a8f9c)}
.mm-help{font-size:11px;color:var(--dsw-alias-label-secondary,#8a8f9c);opacity:.85}
.mm-textarea{width:100%;min-height:200px;resize:vertical;box-sizing:border-box;background:var(--dsw-alias-bg-overlay,#fff);
  border:1px solid var(--dsw-alias-line,#e7e8ea);color:var(--dsw-alias-label-primary,#1c1e26);border-radius:8px;
  padding:10px 12px;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:12px;outline:none}
.mm-textarea:focus{border-color:var(--dsw-alias-brand,#4c6ef5)}
.mm-error{color:#e03131;font-size:12px;margin:8px 0}
.mm-toast{position:fixed;bottom:28px;left:50%;transform:translateX(-50%);z-index:10000;
  background:#e6fcf5;color:#2f9e44;border:1px solid #b2f2bb;padding:8px 16px;border-radius:8px;font-size:13px;box-shadow:0 18px 60px #00000059}
.mm-toast.err{background:#fff5f5;color:#e03131;border-color:#ffc9c9}
.mm-a{color:var(--dsw-alias-brand,#4c6ef5);text-decoration:none}
.mm-a:hover{text-decoration:underline}
.mm-warn{color:#e8590c}
.mm-modal-foot{display:flex;justify-content:flex-end;gap:8px;margin-top:14px}
.mm-head-btn{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;
  border:1px solid var(--dsw-alias-line,#e7e8ea);border-radius:8px;background:transparent;
  color:var(--dsw-alias-label-secondary,#8a8f9c);cursor:pointer;padding:0}
.mm-head-btn:hover{color:var(--dsw-alias-brand,#4c6ef5);border-color:var(--dsw-alias-brand,#4c6ef5);background:var(--dsw-alias-bg-fill-2,#eef2ff)}
`;

// ---------------------------------------------------------------------------
// 图标
// ---------------------------------------------------------------------------

function McpIcon({ size = 16 }) {
  return jsx(
    "svg",
    {
      viewBox: "0 0 24 24",
      width: size,
      height: size,
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 1.8,
      strokeLinecap: "round",
      strokeLinejoin: "round",
      "aria-hidden": "true",
      children: jsxs(Fragment, {
        children: [
          jsx("rect", { x: 3, y: 3, width: 7, height: 7, rx: 1.5 }),
          jsx("rect", { x: 14, y: 14, width: 7, height: 7, rx: 1.5 }),
          jsx("path", { d: "M6.5 10v3a2 2 0 0 0 2 2H14" }),
          jsx("path", { d: "M17.5 14v-3a2 2 0 0 0-2-2H10" }),
        ],
      }),
    },
  );
}

function CloseIcon({ size = 14 }) {
  return jsx(
    "svg",
    {
      viewBox: "0 0 24 24",
      width: size,
      height: size,
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 2,
      strokeLinecap: "round",
      children: jsxs(Fragment, {
        children: [jsx("path", { d: "M6 6l12 12" }), jsx("path", { d: "M18 6L6 18" })],
      }),
    },
  );
}

function ChevronIcon({ size = 14 }) {
  return jsx(
    "svg",
    {
      viewBox: "0 0 24 24",
      width: size,
      height: size,
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 2,
      strokeLinecap: "round",
      strokeLinejoin: "round",
      "aria-hidden": "true",
      children: jsx("path", { d: "M6 9l6 6 6-6" }),
    },
  );
}

function PlusIcon({ size = 13 }) {
  return jsx(
    "svg",
    {
      viewBox: "0 0 24 24",
      width: size,
      height: size,
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 2,
      strokeLinecap: "round",
      children: jsxs(Fragment, {
        children: [jsx("path", { d: "M12 5v14" }), jsx("path", { d: "M5 12h14" })],
      }),
    },
  );
}

const ENTRY_ICON =
  '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><path d="M6.5 10v3a2 2 0 0 0 2 2H14"/><path d="M17.5 14v-3a2 2 0 0 0-2-2H10"/></svg>';

// ---------------------------------------------------------------------------
// 错误边界：弹窗内渲染出错时以居中弹窗展示，不影响布局
// ---------------------------------------------------------------------------

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    if (this.state.error !== null) {
      return jsx(
        "div",
        { className: "mm-overlay" },
        jsxs("div", {
          className: "mm-card",
          style: { padding: 24 },
          children: [
            jsx("div", { style: { fontWeight: 600, marginBottom: 8, fontSize: 15 }, children: "面板渲染出错了" }),
            jsx("pre", {
              style: { whiteSpace: "pre-wrap", wordBreak: "break-all", fontSize: 12, color: "#e03131", margin: 0 },
              children: String(this.state.error?.stack ?? this.state.error),
            }),
            jsx(
              "button",
              {
                className: "mm-btn",
                style: { marginTop: 14, alignSelf: "flex-start" },
                onClick: () => this.setState({ error: null }),
                children: "重试",
              },
            ),
          ],
        }),
      );
    }
    return this.props.children;
  }
}

// ---------------------------------------------------------------------------
// 头像
// ---------------------------------------------------------------------------

const AVATAR_COLORS = ["#4c6ef5", "#2f9e44", "#e8590c", "#9c36b5", "#0b7285", "#c92a2a", "#5f3dc4", "#e67700"];

function avatarColor(name) {
  let h = 0;
  for (const ch of String(name)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

function Avatar({ name }) {
  const letter = String(name || "?").trim().charAt(0).toUpperCase() || "?";
  return jsx(
    "span",
    { className: "mm-avatar", style: { background: avatarColor(name) }, children: letter },
  );
}

// ---------------------------------------------------------------------------
// 模板 → mcpServers JSON 预填（市场添加 = 手动配置的快捷方式）
// ---------------------------------------------------------------------------

function fillSpecLocal(spec, values) {
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

function templatePrefillJson(template) {
  const values = {};
  for (const f of template.fields ?? []) {
    values[f.key] = f.type === "password" ? "" : `<${f.label.replace(/\s+/g, "")}>`;
  }
  const spec = fillSpecLocal(template.spec, values);
  const serverConfig =
    spec.transport === "stdio"
      ? { command: spec.command, args: spec.args ?? [], env: spec.env ?? {} }
      : { url: spec.url, headers: spec.headers ?? {} };
  return JSON.stringify(
    { mcpServers: { [template.serverNameDefault]: serverConfig } },
    null,
    2,
  );
}

function serverPrefillJson(server) {
  const c = server.rawConfig ?? {};
  const serverConfig =
    c.transport === "stdio"
      ? { command: c.command, args: c.args ?? [], env: c.env ?? {} }
      : { url: c.url, headers: c.headers ?? {} };
  return JSON.stringify({ mcpServers: { [server.serverName]: serverConfig } }, null, 2);
}

/** 去掉 // 行注释与行尾注释（Trae 示例常带注释）。 */
function stripComments(text) {
  return text
    .split("\n")
    .map((line) => {
      let out = "";
      let inString = false;
      let escaped = false;
      for (let i = 0; i < line.length; i += 1) {
        const ch = line[i];
        if (escaped) {
          out += ch;
          escaped = false;
          continue;
        }
        if (ch === "\\" && inString) {
          out += ch;
          escaped = true;
          continue;
        }
        if (ch === '"') {
          inString = !inString;
          out += ch;
          continue;
        }
        if (!inString && ch === "/" && line[i + 1] === "/") break;
        out += ch;
      }
      return out;
    })
    .join("\n");
}

// ---------------------------------------------------------------------------
// 主面板
// ---------------------------------------------------------------------------

function McpMarketPanel({ onClose }) {
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("list"); // list | templates | configure
  const [configure, setConfigure] = useState(null); // { title, prefill } | null
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [expanded, setExpanded] = useState({});
  const [busyName, setBusyName] = useState("");
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  function showToast(message, isError = false) {
    setToast({ message, isError });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }

  async function refresh() {
    setLoading(true);
    try {
      setState(await api("/api/mcp-market/state"));
    } catch (e) {
      showToast(e instanceof Error ? e.message : String(e), true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    return () => clearTimeout(toastTimer.current);
  }, []);

  const onError = (e) => showToast(e instanceof Error ? e.message : String(e), true);

  const managed = (state?.servers ?? []).filter((s) => s.managed);
  const external = (state?.servers ?? []).filter((s) => !s.managed);

  async function toggle(server) {
    setBusyName(server.serverName);
    try {
      await api("/api/mcp-market/servers/toggle", {
        method: "POST",
        body: JSON.stringify({ serverName: server.serverName, enabled: server.disabled }),
      });
      await refresh();
      showToast("已更新，配置已热加载生效");
    } catch (e) {
      onError(e);
    } finally {
      setBusyName("");
    }
  }

  async function remove(server) {
    if (!window.confirm(`断开应用「${server.serverName}」？\n该操作会从配置中移除并断开连接。`)) return;
    setBusyName(server.serverName);
    try {
      await api("/api/mcp-market/servers/delete", {
        method: "POST",
        body: JSON.stringify({ serverName: server.serverName }),
      });
      await refresh();
      showToast("已删除");
    } catch (e) {
      onError(e);
    } finally {
      setBusyName("");
    }
  }

  async function saveServers(servers) {
    const errors = [];
    for (const server of servers) {
      const { error: _e, ...rest } = server;
      try {
        await api("/api/mcp-market/servers", {
          method: "POST",
          body: JSON.stringify({ server: rest }),
        });
      } catch (e) {
        errors.push(`${rest.serverName ?? "?"}: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
    return errors;
  }

  async function confirmConfigure(prefill) {
    const text = stripComments(prefill.text.trim());
    if (!text) return "请先粘贴或填写配置 JSON";
    let parsed;
    try {
      parsed = await api("/api/mcp-market/parse", {
        method: "POST",
        body: JSON.stringify({ text }),
      });
    } catch (e) {
      return e instanceof Error ? e.message : String(e);
    }
    const servers = (parsed.servers ?? []).filter((s) => !s.error);
    if (servers.length === 0) return "没有解析到有效的 mcpServers 配置";
    const errors = await saveServers(servers);
    await refresh();
    setView("list");
    setConfigure(null);
    if (errors.length > 0) {
      showToast(`已保存 ${servers.length - errors.length} 台，失败：${errors.join("；")}`, true);
    } else {
      showToast(`已接入 ${servers.length} 个应用，配置已热加载生效`);
    }
    return null;
  }

  return jsx(
    "div",
    { className: "mm-overlay", onMouseDown: (e) => e.target === e.currentTarget && onClose(), children:
      jsxs("div", { className: "mm-card", children: [
        // ---- 头部 ----
        jsxs("div", { className: "mm-head", children: [
          jsx("div", { className: "mm-headTitle", children: [
            jsx(McpIcon, { size: 17 }),
            "桥接市场",
          ]}),
          jsx("span", { className: "mm-headSub", children: managed.length > 0 ? `${managed.length} 个服务` : "" }),
          jsxs("div", { className: "mm-headActions", children: [
            view === "list" &&
              jsxs(Fragment, { children: [
                jsxs("button", {
                  className: "mm-add-btn",
                  onClick: () => setAddMenuOpen((v) => !v),
                  children: [jsx(PlusIcon, {}), "接入应用"],
                }),
                addMenuOpen &&
                  jsxs("div", { className: "mm-menu", children: [
                    jsxs("button", {
                      className: "mm-menu-item",
                      onClick: () => { setAddMenuOpen(false); setView("templates"); },
                      children: [jsx("span", { children: "🏪" }), "桥接市场"],
                    }),
                    jsxs("button", {
                      className: "mm-menu-item",
                      onClick: () => {
                        setAddMenuOpen(false);
                        setConfigure({ title: "手动配置", prefill: "", backView: "list" });
                        setView("configure");
                      },
                      children: [jsx("span", { children: "⌨️" }), "手动配置"],
                    }),
                  ]}),
              ]}),
            jsx("button", { className: "mm-close", onClick: onClose, title: "关闭", children: jsx(CloseIcon, {}) }),
          ]}),
        ]}),
        // ---- 内容 ----
        jsx("div", { className: "mm-body", children:
          loading
            ? jsx("div", { className: "mm-empty", children: "加载中…" })
            : view === "configure"
              ? jsx(ConfigurePane, {
                  title: configure?.title ?? "手动配置",
                  prefill: configure?.prefill ?? "",
                  onCancel: () => { setView(configure?.backView ?? "list"); setConfigure(null); },
                  onConfirm: confirmConfigure,
                })
              : view === "templates"
                ? jsx(TemplateListPane, {
                    templates: state?.templates ?? [],
                    onBack: () => setView("list"),
                    onPick: (t) => {
                      setConfigure({
                        title: t.title,
                        prefill: templatePrefillJson(t),
                        backView: "templates",
                      });
                      setView("configure");
                    },
                  })
                : jsx(ServerListPane, {
                    managed,
                    external,
                    patchPath: state?.patchPath ?? "",
                    expanded,
                    setExpanded,
                    busyName,
                    onToggle: toggle,
                    onEdit: (server) => {
                      setConfigure({ title: `编辑 ${server.serverName}`, prefill: serverPrefillJson(server), backView: "list" });
                      setView("configure");
                    },
                    onDelete: remove,
                  }),
        }),
        toast && jsx("div", { className: `mm-toast ${toast.isError ? "err" : ""}`, children: toast.message }),
      ]}),
    },
  );
}

// ---------------------------------------------------------------------------
// 已配置列表（Trae 式：头像 + 名称 + 下拉箭头）
// ---------------------------------------------------------------------------

function ServerListPane({ managed, external, patchPath, expanded, setExpanded, busyName, onToggle, onEdit, onDelete }) {
  return jsxs("div", {
    children: [
      jsx("div", { className: "mm-note", children: jsx("span", {
        children: `配置写入 ${patchPath}，由 loader 热加载：保存/启停/删除后立即生效，无需重启 dsh web。`,
      })}),
      managed.length === 0 &&
        jsx("div", { className: "mm-empty", children: "还没有接入任何应用 —— 点右上角「接入应用」，从桥接市场里挑一个。" }),
      managed.map((server) => {
        const open = expanded[server.serverName] === true;
        return jsxs(Fragment, { children: [
          jsxs("button", {
            key: server.serverName,
            className: `mm-server-row ${open ? "open" : ""}`,
            onClick: () => setExpanded((s) => ({ ...s, [server.serverName]: !open })),
            children: [
              jsx(Avatar, { name: server.serverName }),
              jsx("span", { className: "mm-name", children: server.serverName }),
              jsx("span", { className: `mm-badge ${server.transport === "stdio" ? "stdio" : "http"}`, children: TRANSPORT_LABEL[server.transport] }),
              server.disabled
                ? jsx("span", { className: "mm-badge off", children: "已停用" })
                : jsx("span", { className: "mm-badge ok", children: "已启用" }),
              server.toolCount === null || server.toolCount === undefined
                ? null
                : jsx("span", { className: "mm-badge", children: "工具 " + server.toolCount }),
              jsx("span", { className: "mm-chevron", children: jsx(ChevronIcon, {}) }),
            ],
          }),
          open &&
            jsxs("div", { key: `${server.serverName}-detail`, className: "mm-detail", children: [
              jsx("div", { className: "mm-summary", children: server.summary }),
              server.authKeys.length > 0 &&
                jsx("div", { className: "mm-auth", children: server.authKeys.map((k) => `${k}: ${server.maskedAuth[k]}`).join("　") }),
              jsxs("div", { className: "mm-actions", children: [
                jsx("button", {
                  className: "mm-btn",
                  disabled: busyName === server.serverName,
                  onClick: () => onToggle(server),
                  children: server.disabled ? "启用" : "停用",
                }),
                jsx("button", { className: "mm-btn", onClick: () => onEdit(server), children: "编辑" }),
                jsx("button", {
                  className: "mm-btn danger",
                  disabled: busyName === server.serverName,
                  onClick: () => onDelete(server),
                  children: "删除",
                }),
              ]}),
              jsx("pre", {
                className: "mm-summary",
                style: { whiteSpace: "pre-wrap", background: "var(--dsw-alias-bg-fill-1,#f6f8fa)", padding: "8px 10px", borderRadius: 8 },
                children: JSON.stringify(server.rawConfig, null, 2),
              }),
            ]}),
        ]}, server.serverName);
      }),
      external.length > 0 && jsxs(Fragment, { children: [
        jsx("div", { className: "mm-section-title", children: "其他来源配置（只读，请到对应来源修改）" }),
        external.map((server) =>
          jsxs("div", {
            key: server.serverName,
            className: "mm-server-row",
            style: { cursor: "default" },
            children: [
              jsx(Avatar, { name: server.serverName }),
              jsx("span", { className: "mm-name", children: server.serverName }),
              jsx("span", { className: `mm-badge ${server.transport === "stdio" ? "stdio" : "http"}`, children: TRANSPORT_LABEL[server.transport] }),
              server.disabled ? jsx("span", { className: "mm-badge off", children: "已停用" }) : null,
            ],
          }),
        ),
      ]}),
    ],
  });
}

// ---------------------------------------------------------------------------
// 从市场添加：模板列表（点击 = 快捷方式，进入与手动配置相同的页面）
// ---------------------------------------------------------------------------

function TemplateListPane({ templates, onBack, onPick }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("全部");

  const categories = useMemo(() => {
    const seen = ["全部"];
    for (const t of templates) {
      const c = t.category || "其他";
      if (t.kind !== "info" && !seen.includes(c)) seen.push(c);
    }
    return seen;
  }, [templates]);

  const list = useMemo(() => {
    const key = q.trim().toLowerCase();
    return templates.filter((t) => {
      if (cat !== "全部" && (t.category || "其他") !== cat) return false;
      if (key === "") return true;
      const hay = [t.vendor, t.title, t.description, t.category]
        .concat(t.keywords ?? [])
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(key);
    });
  }, [templates, q, cat]);

  return jsxs("div", {
    children: [
      jsx("button", { className: "mm-btn", onClick: onBack, children: "← 返回" }),
      jsx("h3", { style: { fontSize: 15, margin: "12px 0 4px" }, children: "桥接市场 · 找应用" }),
      jsx("p", { className: "mm-help", children:
        "按应用找，不按包名找。选一个应用 → 把它的令牌贴进 JSON → 保存后 loader 热加载，agent 立刻多出这个应用的工具。" }),
      jsx("input", {
        className: "mm-btn",
        style: { width: "100%", marginTop: 10, padding: "7px 10px", cursor: "text", fontSize: 12.5 },
        placeholder: "搜应用 / 网站（高德、飞书、Notion…）",
        value: q,
        onChange: (e) => setQ(e.target.value),
      }),
      jsx("div", { style: { display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }, children:
        categories.map((c) =>
          jsx("button", {
            key: c,
            className: "mm-btn",
            onClick: () => setCat(c),
            style: cat === c
              ? { borderColor: "var(--dsw-alias-brand,#4c6ef5)", color: "var(--dsw-alias-brand,#4c6ef5)" }
              : undefined,
            children: c,
          }),
        ),
      }),
      list.length === 0 &&
        jsx("div", { className: "mm-empty", style: { marginTop: 12 }, children: "没有匹配的应用。换个关键词，或用「手动配置」粘贴任意 MCP JSON。" }),
      jsx("div", { style: { marginTop: 12 }, children:
        list.map((t) => {
          if (t.kind === "info") {
            return jsxs("div", {
              key: t.id,
              className: "mm-tpl-row",
              style: { cursor: "default", borderColor: "#ffc9a3", background: "#fff4e6" },
              children: [
                jsx("span", { className: "mm-tpl-main", children: jsxs(Fragment, { children: [
                  jsx("div", { className: "mm-tpl-name", children: `${t.vendor} · ${t.title}` }),
                  jsx("div", { className: "mm-tpl-desc", children: t.note ?? t.description }),
                ]})}),
                jsx("a", { className: "mm-a", href: t.docsUrl, target: "_blank", rel: "noreferrer", children: "文档 ↗" }),
              ],
            });
          }
          return jsxs("button", {
            key: t.id,
            className: "mm-tpl-row",
            onClick: () => onPick(t),
            children: [
              jsx("span", { className: "mm-avatar", style: { background: avatarColor(t.vendor) }, children: t.vendor.charAt(0) }),
              jsx("span", { className: "mm-tpl-main", children: jsxs(Fragment, { children: [
                jsx("div", { className: "mm-tpl-name", children: `${t.vendor} · ${t.title}` }),
                jsx("div", { className: "mm-tpl-desc", children: t.description }),
              ]})}),
              jsx("span", { className: `mm-badge ${t.transport === "stdio" ? "stdio" : "http"}`, children: TRANSPORT_LABEL[t.transport] }),
            ],
          });
        }),
      }),
    ],
  });
}

// ---------------------------------------------------------------------------
// 手动配置页（从市场添加与手动配置共用）
// ---------------------------------------------------------------------------

function ConfigurePane({ title, prefill, onCancel, onConfirm }) {
  const [text, setText] = useState(prefill);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setText(prefill);
    setError("");
  }, [prefill]);

  async function confirm() {
    setBusy(true);
    setError("");
    try {
      const err = await onConfirm({ text });
      if (err) setError(err);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return jsxs("div", {
    children: [
      jsx("button", { className: "mm-btn", onClick: onCancel, children: "← 返回" }),
      jsx("h3", { style: { fontSize: 15, margin: "12px 0 6px" }, children: title }),
      jsxs("div", { className: "mm-field", children: [
        jsx("label", { children: "原始配置（JSON）" }),
        jsx("textarea", {
          className: "mm-textarea",
          value: text,
          spellCheck: false,
          placeholder:
            '// 示例：\n// {\n//   "mcpServers": {\n//     "example-server": {\n//       "command": "npx",\n//       "args": ["-y", "mcp-server-example"]\n//     }\n//   }\n// }\n\n// 请从 MCP Servers 的介绍页面复制配置 JSON（优先使用 NPX 或 UVX 配置），并粘贴到输入框中。',
          onChange: (e) => setText(e.target.value),
        }),
        jsx("span", { className: "mm-help", children:
          "支持 Claude Code .mcp.json 的 mcpServers 格式（可一次粘贴多台服务器）。令牌等敏感信息保存在本机配置文件中。" }),
        jsx("span", { className: "mm-help mm-warn", children: "⚠ 配置前请确认来源，甄别风险。" }),
      ]}),
      error ? jsx("div", { className: "mm-error", children: error }) : null,
      jsxs("div", { className: "mm-modal-foot", children: [
        jsx("button", { className: "mm-btn", onClick: onCancel, children: "取消" }),
        jsx("button", {
          className: "mm-btn primary",
          disabled: busy || !text.trim(),
          onClick: confirm,
          children: busy ? "保存中…" : "确认",
        }),
      ]}),
    ],
  });
}

// ---------------------------------------------------------------------------
// 弹窗控制器：独立 React root（document.body），与入口行解耦
// ---------------------------------------------------------------------------

function mountPanel() {
  let root = null;
  let container = null;
  const close = () => {
    if (root === null) return;
    try {
      root.unmount();
    } catch {
      /* 继续清理容器 */
    }
    root = null;
    container?.remove();
    container = null;
  };
  const open = () => {
    if (root !== null) return;
    container = document.createElement("div");
    container.dataset.dshMcpMarketPanel = "";
    container.dataset.dshPlugin = "dsh-mcp-market";
    document.body.appendChild(container);
    root = createRoot(container);
    root.render(
      jsx(ErrorBoundary, {
        children: jsx(McpMarketPanel, { onClose: close }),
      }),
    );
  };
  const toggle = () => {
    if (root !== null) close();
    else open();
  };
  return { toggle, open, close, dispose: close };
}

// ---------------------------------------------------------------------------
// 左侧边栏顶部入口行：DOM 注入（技能中心 / 任务板 / dsh-ssh 同款机制）
// ---------------------------------------------------------------------------

function sidebarRoot() {
  const column = document.querySelector('[data-pane="sidebar"], [class*="sidebarCol"]');
  if (column === null) return undefined;
  return column.querySelector("[class*=\"logoRow\"]")?.parentElement ?? column.firstElementChild;
}

function newSessionButton(root) {
  const nested = root.querySelector("button[class*=\"newSession\"]");
  if (nested !== null) return nested;
  for (const child of root.children) if (child.tagName === "BUTTON") return child;
}

const FAMILY_SELECTORS = [
  "[data-dsh-taskboard-entry]",
  "[data-dsh-ssh-entry]",
  "[data-dsh-skill-explorer-entry]",
  "[data-dsh-mcp-market-entry]",
];

function mountSidebarEntry(onToggle, getCount) {
  if (document.querySelector("[data-dsh-mcp-market-entry]") !== null) return () => {};
  const entry = document.createElement("button");
  entry.type = "button";
  entry.setAttribute("data-dsh-mcp-market-entry", "");
  entry.setAttribute("data-dsh-plugin", "dsh-mcp-market");
  entry.setAttribute("data-dsh-part", "sidebar-entry");
  entry.className = "mm-entry";
  entry.setAttribute("aria-label", "桥接市场");
  entry.setAttribute("title", "桥接市场（找应用接入）");
  // 行内兜底：即使样式表未注入（热更新竞态），布局关键属性也保持不变
  entry.setAttribute(
    "style",
    "box-sizing:border-box;width:100%;height:36px;display:flex;align-items:center;" +
      "gap:8px;padding:0 10px;background:transparent;border:none;border-radius:8px;" +
      "cursor:pointer;font-size:13px;white-space:nowrap;text-align:left;",
  );
  entry.innerHTML =
    '<span class="mm-entryIcon" style="flex:none;width:24px;height:24px;display:inline-flex;align-items:center;justify-content:center">' +
    ENTRY_ICON +
    '</span><span class="mm-entryLabel" style="flex:1;text-align:left;overflow:hidden;text-overflow:ellipsis">桥接市场</span>' +
    '<span class="mm-entryCount" style="display:none"></span>';
  const countEl = entry.querySelector(".mm-entryCount");
  entry.addEventListener("click", onToggle);

  const syncCount = () => {
    const n = getCount();
    if (n > 0) {
      countEl.textContent = String(n > 99 ? "99+" : n);
      countEl.style.display = "";
    } else {
      countEl.style.display = "none";
    }
  };

  let root;
  let placed = false;
  let observing = false;
  const place = () => {
    if (root !== undefined && !root.isConnected) {
      rootObserver.disconnect();
      observing = false;
      root = undefined;
      placed = false;
    }
    if (placed) {
      if (document.body.contains(entry)) return;
      rootObserver.disconnect();
      observing = false;
      root = undefined;
      placed = false;
    }
    root ??= sidebarRoot();
    if (root === undefined) return;
    const button = newSessionButton(root);
    if (button === undefined) return;
    if (entry.parentElement !== root) {
      const row = button.closest("[class*=\"logoRow\"]");
      const base = row !== null && row.parentElement === root ? row : button;
      const family = Array.from(root.children).filter(
        (el) => el instanceof HTMLElement && el.matches(FAMILY_SELECTORS.join(", ")),
      );
      const anchor =
        family.length > 0 ? family[family.length - 1].nextElementSibling : base.nextElementSibling;
      root.insertBefore(entry, anchor);
    }
    placed = true;
    if (!observing) {
      rootObserver.observe(root, { childList: true, subtree: true });
      observing = true;
    }
  };

  const waitObserver = new MutationObserver(() => place());
  waitObserver.observe(document.body, { childList: true, subtree: true });
  const rootObserver = new MutationObserver(() => {
    if (root === undefined || !root.isConnected) {
      placed = false;
      place();
      return;
    }
    if (!root.contains(entry)) {
      placed = false;
      place();
    }
  });

  place();
  syncCount();

  return () => {
    waitObserver.disconnect();
    rootObserver.disconnect();
    entry.remove();
  };
}

// ---------------------------------------------------------------------------
// 会话顶部栏入口（slot，共用弹窗控制器）
// ---------------------------------------------------------------------------

function HeaderMcpAction({ toggle }) {
  return jsx(
    "button",
    {
      className: "mm-head-btn",
      title: "桥接市场（找应用接入）",
      "aria-label": "桥接市场",
      onClick: toggle,
      children: jsx(McpIcon, { size: 15 }),
    },
  );
}

// ---------------------------------------------------------------------------
// 插件入口
// ---------------------------------------------------------------------------

function apply(ctx) {
  ctx.effect(() => {
    const styleId = "dsh-mcp-market-style";
    let style = document.getElementById(styleId);
    if (style === null) {
      style = document.createElement("style");
      style.id = styleId;
      document.head.appendChild(style);
    }
    // 总是覆写内容：热更新/多次挂载时旧样式不会残留
    style.textContent = STYLE;
    return () => {
      if (document.getElementById(styleId) === style) style.remove();
    };
  }, "dsh-mcp-market: style");

  // 启动信标：帮助诊断浏览器侧插件是否成功挂载
  // 宿主 Web 服务要求 POST 必须带 application/json（否则 415），故补头与空 JSON 体
  fetch("/api/mcp-market/client-boot", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{}",
  }).catch(() => {});

  const panel = mountPanel();

  let serverCount = 0;
  const updateCount = () => {
    api("/api/mcp-market/state")
      .then((s) => {
        serverCount = s.servers.filter((x) => x.managed).length;
      })
      .catch(() => {});
  };
  updateCount();

  const disposers = [];
  disposers.push(
    mountSidebarEntry(() => {
      updateCount();
      panel.toggle();
    }, () => serverCount),
  );
  disposers.push(() => panel.dispose());

  // 会话顶部栏快捷入口（共用同一个弹窗）
  ctx.slots.inject("conversation.session.header.actions", () =>
    ctx.slots.register(
      {
        name: "conversation.session.header.actions",
        id: "mcp-market",
        order: 60,
        label: "桥接市场",
        inject: () => ({ toggle: panel.toggle }),
      },
      HeaderMcpAction,
    ),
  );

  ctx.effect(() => {
    return () => {
      for (const dispose of disposers) dispose();
    };
  }, "dsh-mcp-market: sidebar entry cleanup");
}

module.exports = { inject, apply };

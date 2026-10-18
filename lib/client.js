window.__ModuleLoader__.load({ id: "dsh-bridge-market", factory: (require) => {
var module = { exports: {} };
var exports = module.exports;

// src/client.jsx
var import_client = require("react-dom/client");
var import_react = require("react");
var import_jsx_runtime = require("react/jsx-runtime");
var inject = ["slots"];
async function api(path, init) {
  const res = await fetch(path, {
    headers: { "content-type": "application/json" },
    ...init
  });
  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error(`\u8BF7\u6C42\u5931\u8D25\uFF08HTTP ${res.status}\uFF09`);
  }
  if (!res.ok || data.ok === false) {
    throw new Error(data?.error?.message ?? `\u8BF7\u6C42\u5931\u8D25\uFF08HTTP ${res.status}\uFF09`);
  }
  return data;
}
var TRANSPORT_LABEL = { stdio: "stdio", "streamable-http": "HTTP" };
var STYLE = `
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
/* ---- \u5E02\u573A\u5F0F\u754C\u9762 ---- */
.mm-tabs{display:flex;gap:4px;padding:0 16px;background:var(--dsw-alias-bg-base,#fff);border-bottom:1px solid var(--dsw-alias-line,#e7e8ea)}
.mm-tab{position:relative;border:none;background:transparent;color:var(--dsw-alias-label-secondary,#8a8f9c);
  padding:10px 12px 11px;font-size:13px;font-weight:500;cursor:pointer;border-bottom:2px solid transparent;display:inline-flex;align-items:center;gap:6px}
.mm-tab:hover{color:var(--dsw-alias-label-primary,#1c1e26)}
.mm-tab.active{color:var(--dsw-alias-brand,#4c6ef5);border-bottom-color:var(--dsw-alias-brand,#4c6ef5)}
.mm-tab-num{font-size:10.5px;font-weight:600;min-width:16px;height:16px;line-height:16px;text-align:center;
  padding:0 5px;border-radius:999px;background:var(--dsw-alias-interactive-bg-hover,#eef2ff);color:var(--dsw-alias-label-secondary,#8a8f9c)}
.mm-tab.active .mm-tab-num{background:var(--dsw-alias-brand,#4c6ef5);color:#fff}
.mm-toolbar{display:flex;flex-direction:column;gap:10px;margin-bottom:14px}
.mm-search{position:relative}
.mm-search input{box-sizing:border-box;width:100%;padding:9px 12px 9px 33px;border-radius:10px;
  border:1px solid var(--dsw-alias-line,#e7e8ea);background:var(--dsw-alias-bg-overlay,#fff);
  color:var(--dsw-alias-label-primary,#1c1e26);font-size:13px;outline:none}
.mm-search input::placeholder{color:var(--dsw-alias-label-secondary,#8a8f9c)}
.mm-search input:focus{border-color:var(--dsw-alias-brand,#4c6ef5);box-shadow:0 0 0 3px #4c6ef51f}
.mm-search svg{position:absolute;left:11px;top:50%;transform:translateY(-50%);color:var(--dsw-alias-label-secondary,#8a8f9c)}
.mm-chips{display:flex;flex-wrap:wrap;gap:6px}
.mm-chip{border:1px solid var(--dsw-alias-line,#e7e8ea);background:transparent;color:var(--dsw-alias-label-secondary,#8a8f9c);
  border-radius:999px;padding:4px 12px;font-size:12px;cursor:pointer}
.mm-chip:hover{color:var(--dsw-alias-label-primary,#1c1e26);border-color:var(--dsw-alias-brand,#4c6ef5)}
.mm-chip.active{background:var(--dsw-alias-brand,#4c6ef5);border-color:var(--dsw-alias-brand,#4c6ef5);color:#fff}
.mm-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(228px,1fr));gap:10px}
.mm-app{box-sizing:border-box;display:flex;flex-direction:column;gap:8px;min-height:136px;text-align:left;
  border:1px solid var(--dsw-alias-line,#e7e8ea);border-radius:12px;background:var(--dsw-alias-bg-overlay,#fff);
  color:var(--dsw-alias-label-primary,#1c1e26);padding:12px;cursor:pointer;transition:border-color .15s,box-shadow .15s,transform .15s}
.mm-app:hover{border-color:var(--dsw-alias-brand,#4c6ef5);box-shadow:0 6px 20px #4c6ef51f;transform:translateY(-1px)}
.mm-app.info{cursor:default;border-style:dashed;background:transparent}
.mm-app.info:hover{transform:none;box-shadow:none;border-color:#ffc9a3}
.mm-app-top{display:flex;align-items:center;gap:9px}
.mm-app-avatar{flex:none;width:34px;height:34px;border-radius:9px;display:inline-flex;align-items:center;justify-content:center;
  color:#fff;font-size:15px;font-weight:600}
.mm-app-titles{min-width:0;flex:1}
.mm-app-name{font-size:13.5px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.mm-app-vendor{font-size:11.5px;color:var(--dsw-alias-label-secondary,#8a8f9c);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-top:1px}
.mm-app-desc{font-size:11.5px;line-height:1.45;color:var(--dsw-alias-label-secondary,#8a8f9c);flex:1;
  max-height:34px;overflow:hidden}
.mm-app-foot{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.mm-pill{font-size:10.5px;padding:2px 8px;border-radius:999px;border:1px solid var(--dsw-alias-line,#e7e8ea);
  color:var(--dsw-alias-label-secondary,#8a8f9c);white-space:nowrap}
.mm-pill.free{color:#2f9e44;border-color:#b2f2bb;background:#e6fcf5}
.mm-pill.key{color:#e8590c;border-color:#ffc9a3;background:#fff4e6}
.mm-pill.on{color:#2f9e44;border-color:#b2f2bb;background:#e6fcf5}
.mm-pill.dim{border-style:dashed}
.mm-app-cta{margin-left:auto;font-size:11.5px;font-weight:600;color:var(--dsw-alias-brand,#4c6ef5)}
.mm-app.attached{border-color:#b2f2bb}
.mm-app.attached .mm-app-cta{color:#2f9e44}
.mm-inst{display:flex;align-items:center;gap:10px;width:100%;box-sizing:border-box;text-align:left;cursor:pointer;
  border:1px solid var(--dsw-alias-line,#e7e8ea);border-radius:12px;background:var(--dsw-alias-bg-overlay,#fff);
  color:var(--dsw-alias-label-primary,#1c1e26);padding:11px 12px;margin-bottom:8px}
.mm-inst:hover{border-color:var(--dsw-alias-brand,#4c6ef5)}
.mm-inst .mm-inst-main{flex:1;min-width:0}
.mm-inst .mm-inst-name{font-size:13.5px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.mm-inst .mm-inst-sub{font-size:11.5px;color:var(--dsw-alias-label-secondary,#8a8f9c);margin-top:2px;
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.mm-inst-tools{flex:none;display:inline-flex;flex-direction:column;align-items:center;justify-content:center;
  min-width:44px;padding:3px 8px;border-radius:9px;border:1px solid #b2f2bb;background:#e6fcf5;color:#2f9e44}
.mm-inst-tools.zero{border-color:#ffc9a3;background:#fff4e6;color:#e8590c}
.mm-inst-tools .n{font-size:14px;font-weight:700;line-height:1.1}
.mm-inst-tools .t{font-size:9.5px;opacity:.85;line-height:1.2}
.mm-empty-cta{display:flex;flex-direction:column;align-items:center;gap:10px;padding:44px 12px}
.mm-app.guide{border-style:solid;border-color:#dbe4ff}
.mm-app.guide .mm-app-cta{color:#4263eb}
.mm-guide{display:flex;flex-direction:column;gap:10px}
.mm-guide-head{display:flex;align-items:center;gap:10px}
.mm-back{cursor:pointer;border:1px solid var(--dsw-alias-line,#e7e8ea);background:transparent;border-radius:8px;
  padding:4px 10px;font-size:12px;color:var(--dsw-alias-label-secondary,#8a8f9c);font-family:inherit}
.mm-back:hover{color:var(--dsw-alias-label-primary,#1c1e26);border-color:var(--dsw-alias-brand,#4c6ef5)}
.mm-guide-title{margin:0;font-size:15px;font-weight:650;color:var(--dsw-alias-label-primary,#1c1e26)}
.mm-guide-desc{margin:0;font-size:12.5px;line-height:1.6;color:var(--dsw-alias-label-secondary,#8a8f9c)}
.mm-guide-steps{margin:0;padding-left:20px;display:flex;flex-direction:column;gap:9px}
.mm-guide-steps>li{font-size:12.5px;line-height:1.6;color:var(--dsw-alias-label-primary,#1c1e26)}
.mm-snippet{position:relative;margin-top:6px;border:1px solid var(--dsw-alias-line,#e7e8ea);border-radius:9px;
  background:var(--dsw-alias-bg-sunken,#f6f7f9)}
.mm-snippet pre{margin:0;padding:10px 12px 10px 12px;padding-right:64px;font-size:11.5px;line-height:1.5;white-space:pre-wrap;word-break:break-all;
  font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}
.mm-btn.mm-copy{position:absolute;top:6px;right:6px;font-size:11px;padding:3px 9px}
.mm-guide-foot{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-top:4px}
.mm-guide-foot .mm-app-cta{margin-left:0}
.mm-app,.mm-inst,.mm-tab,.mm-chip{font-family:inherit;line-height:inherit}
.mm-app:focus-visible,.mm-inst:focus-visible,.mm-chip:focus-visible,.mm-tab:focus-visible{outline:2px solid var(--dsw-alias-brand,#4c6ef5);outline-offset:2px}
`;
function McpIcon({ size = 16 }) {
  return (0, import_jsx_runtime.jsx)(
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
      children: (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, {
        children: [
          (0, import_jsx_runtime.jsx)("rect", { x: 3, y: 3, width: 7, height: 7, rx: 1.5 }),
          (0, import_jsx_runtime.jsx)("rect", { x: 14, y: 14, width: 7, height: 7, rx: 1.5 }),
          (0, import_jsx_runtime.jsx)("path", { d: "M6.5 10v3a2 2 0 0 0 2 2H14" }),
          (0, import_jsx_runtime.jsx)("path", { d: "M17.5 14v-3a2 2 0 0 0-2-2H10" })
        ]
      })
    }
  );
}
function CloseIcon({ size = 14 }) {
  return (0, import_jsx_runtime.jsx)(
    "svg",
    {
      viewBox: "0 0 24 24",
      width: size,
      height: size,
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 2,
      strokeLinecap: "round",
      children: (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, {
        children: [(0, import_jsx_runtime.jsx)("path", { d: "M6 6l12 12" }), (0, import_jsx_runtime.jsx)("path", { d: "M18 6L6 18" })]
      })
    }
  );
}
function ChevronIcon({ size = 14 }) {
  return (0, import_jsx_runtime.jsx)(
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
      children: (0, import_jsx_runtime.jsx)("path", { d: "M6 9l6 6 6-6" })
    }
  );
}
function PlusIcon({ size = 13 }) {
  return (0, import_jsx_runtime.jsx)(
    "svg",
    {
      viewBox: "0 0 24 24",
      width: size,
      height: size,
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 2,
      strokeLinecap: "round",
      children: (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, {
        children: [(0, import_jsx_runtime.jsx)("path", { d: "M12 5v14" }), (0, import_jsx_runtime.jsx)("path", { d: "M5 12h14" })]
      })
    }
  );
}
var ENTRY_ICON = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><path d="M6.5 10v3a2 2 0 0 0 2 2H14"/><path d="M17.5 14v-3a2 2 0 0 0-2-2H10"/></svg>';
var ErrorBoundary = class extends import_react.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    if (this.state.error !== null) {
      return (0, import_jsx_runtime.jsx)(
        "div",
        { className: "mm-overlay" },
        (0, import_jsx_runtime.jsxs)("div", {
          className: "mm-card",
          style: { padding: 24 },
          children: [
            (0, import_jsx_runtime.jsx)("div", { style: { fontWeight: 600, marginBottom: 8, fontSize: 15 }, children: "\u9762\u677F\u6E32\u67D3\u51FA\u9519\u4E86" }),
            (0, import_jsx_runtime.jsx)("pre", {
              style: { whiteSpace: "pre-wrap", wordBreak: "break-all", fontSize: 12, color: "#e03131", margin: 0 },
              children: String(this.state.error?.stack ?? this.state.error)
            }),
            (0, import_jsx_runtime.jsx)(
              "button",
              {
                className: "mm-btn",
                style: { marginTop: 14, alignSelf: "flex-start" },
                onClick: () => this.setState({ error: null }),
                children: "\u91CD\u8BD5"
              }
            )
          ]
        })
      );
    }
    return this.props.children;
  }
};
var AVATAR_COLORS = ["#4c6ef5", "#2f9e44", "#e8590c", "#9c36b5", "#0b7285", "#c92a2a", "#5f3dc4", "#e67700"];
function avatarColor(name) {
  let h = 0;
  for (const ch of String(name)) h = h * 31 + ch.charCodeAt(0) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}
function fillSpecLocal(spec, values) {
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
function templatePrefillJson(template) {
  const values = {};
  for (const f of template.fields ?? []) {
    values[f.key] = f.type === "password" ? "" : `<${f.label.replace(/\s+/g, "")}>`;
  }
  const spec = fillSpecLocal(template.spec, values);
  const serverConfig = spec.transport === "stdio" ? { command: spec.command, args: spec.args ?? [], env: spec.env ?? {} } : { url: spec.url, headers: spec.headers ?? {} };
  return JSON.stringify(
    { mcpServers: { [template.serverNameDefault]: serverConfig } },
    null,
    2
  );
}
function serverPrefillJson(server) {
  const c = server.rawConfig ?? {};
  const serverConfig = c.transport === "stdio" ? { command: c.command, args: c.args ?? [], env: c.env ?? {} } : { url: c.url, headers: c.headers ?? {} };
  return JSON.stringify({ mcpServers: { [server.serverName]: serverConfig } }, null, 2);
}
function stripComments(text) {
  return text.split("\n").map((line) => {
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
  }).join("\n");
}
function McpMarketPanel({ onClose }) {
  const [state, setState] = (0, import_react.useState)(null);
  const [loading, setLoading] = (0, import_react.useState)(true);
  const [view, setView] = (0, import_react.useState)("market");
  const [configure, setConfigure] = (0, import_react.useState)(null);
  const [guide, setGuide] = (0, import_react.useState)(null);
  const [expanded, setExpanded] = (0, import_react.useState)({});
  const [busyName, setBusyName] = (0, import_react.useState)("");
  const [toast, setToast] = (0, import_react.useState)(null);
  const toastTimer = (0, import_react.useRef)(null);
  const bodyRef = (0, import_react.useRef)(null);
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
  (0, import_react.useEffect)(() => {
    refresh();
    return () => clearTimeout(toastTimer.current);
  }, []);
  (0, import_react.useEffect)(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = 0;
  }, [view]);
  const onError = (e) => showToast(e instanceof Error ? e.message : String(e), true);
  const managed = (state?.servers ?? []).filter((s) => s.managed);
  const external = (state?.servers ?? []).filter((s) => !s.managed);
  async function toggle(server) {
    setBusyName(server.serverName);
    try {
      await api("/api/mcp-market/servers/toggle", {
        method: "POST",
        body: JSON.stringify({ serverName: server.serverName, enabled: server.disabled })
      });
      await refresh();
      showToast("\u5DF2\u66F4\u65B0\uFF0C\u914D\u7F6E\u5DF2\u70ED\u52A0\u8F7D\u751F\u6548");
    } catch (e) {
      onError(e);
    } finally {
      setBusyName("");
    }
  }
  async function remove(server) {
    if (!window.confirm(`\u65AD\u5F00\u5E94\u7528\u300C${server.serverName}\u300D\uFF1F
\u8BE5\u64CD\u4F5C\u4F1A\u4ECE\u914D\u7F6E\u4E2D\u79FB\u9664\u5E76\u65AD\u5F00\u8FDE\u63A5\u3002`)) return;
    setBusyName(server.serverName);
    try {
      await api("/api/mcp-market/servers/delete", {
        method: "POST",
        body: JSON.stringify({ serverName: server.serverName })
      });
      await refresh();
      showToast("\u5DF2\u5220\u9664");
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
          body: JSON.stringify({ server: rest })
        });
      } catch (e) {
        errors.push(`${rest.serverName ?? "?"}: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
    return errors;
  }
  async function confirmConfigure(prefill) {
    const text = stripComments(prefill.text.trim());
    if (!text) return "\u8BF7\u5148\u7C98\u8D34\u6216\u586B\u5199\u914D\u7F6E JSON";
    let parsed;
    try {
      parsed = await api("/api/mcp-market/parse", {
        method: "POST",
        body: JSON.stringify({ text })
      });
    } catch (e) {
      return e instanceof Error ? e.message : String(e);
    }
    const servers = (parsed.servers ?? []).filter((s) => !s.error);
    if (servers.length === 0) return "\u6CA1\u6709\u89E3\u6790\u5230\u6709\u6548\u7684 mcpServers \u914D\u7F6E";
    const errors = await saveServers(servers);
    await refresh();
    setView("market");
    setConfigure(null);
    if (errors.length > 0) {
      showToast(`\u5DF2\u4FDD\u5B58 ${servers.length - errors.length} \u53F0\uFF0C\u5931\u8D25\uFF1A${errors.join("\uFF1B")}`, true);
    } else {
      showToast(`\u5DF2\u63A5\u5165 ${servers.length} \u4E2A\u5E94\u7528\uFF0C\u914D\u7F6E\u5DF2\u70ED\u52A0\u8F7D\u751F\u6548`);
    }
    return null;
  }
  return (0, import_jsx_runtime.jsx)(
    "div",
    {
      className: "mm-overlay",
      onMouseDown: (e) => e.target === e.currentTarget && onClose(),
      children: (0, import_jsx_runtime.jsxs)("div", { className: "mm-card", children: [
        // ---- 头部 ----
        (0, import_jsx_runtime.jsxs)("div", { className: "mm-head", children: [
          (0, import_jsx_runtime.jsx)("div", { className: "mm-headTitle", children: [
            (0, import_jsx_runtime.jsx)(McpIcon, { size: 17 }),
            "\u6865\u63A5\u5E02\u573A"
          ] }),
          (0, import_jsx_runtime.jsx)("span", { className: "mm-headSub", children: managed.length > 0 ? `${managed.length} \u4E2A\u5E94\u7528\u5DF2\u63A5\u5165` : "\u9009\u4E00\u4E2A\u5E94\u7528\uFF0C\u63A5\u5165\u540E agent \u7ACB\u523B\u80FD\u8C03\u7528" }),
          (0, import_jsx_runtime.jsxs)("div", { className: "mm-headActions", children: [
            view !== "configure" && (0, import_jsx_runtime.jsxs)("button", {
              className: "mm-add-btn",
              onClick: () => {
                setConfigure({ title: "\u624B\u52A8\u914D\u7F6E", prefill: "", backView: view });
                setView("configure");
              },
              title: "\u7C98\u8D34\u4EFB\u610F MCP \u914D\u7F6E JSON",
              children: [(0, import_jsx_runtime.jsx)(PlusIcon, {}), "\u624B\u52A8\u914D\u7F6E"]
            }),
            (0, import_jsx_runtime.jsx)("button", { className: "mm-close", onClick: onClose, title: "\u5173\u95ED", children: (0, import_jsx_runtime.jsx)(CloseIcon, {}) })
          ] })
        ] }),
        // ---- 页签 ----
        view !== "configure" && (0, import_jsx_runtime.jsxs)("div", { className: "mm-tabs", children: [
          (0, import_jsx_runtime.jsxs)("button", {
            className: "mm-tab " + (view === "market" ? "active" : ""),
            onClick: () => setView("market"),
            children: [
              "\u53D1\u73B0\u5E94\u7528",
              (0, import_jsx_runtime.jsx)("span", { className: "mm-tab-num", children: (state?.templates ?? []).length })
            ]
          }),
          (0, import_jsx_runtime.jsxs)("button", {
            className: "mm-tab " + (view === "installed" ? "active" : ""),
            onClick: () => setView("installed"),
            children: [
              "\u5DF2\u63A5\u5165",
              (0, import_jsx_runtime.jsx)("span", { className: "mm-tab-num", children: managed.length })
            ]
          })
        ] }),
        // ---- 内容 ----
        (0, import_jsx_runtime.jsx)("div", {
          className: "mm-body",
          ref: bodyRef,
          children: loading ? (0, import_jsx_runtime.jsx)("div", { className: "mm-empty", children: "\u52A0\u8F7D\u4E2D\u2026" }) : view === "configure" ? (0, import_jsx_runtime.jsx)(ConfigurePane, {
            title: configure?.title ?? "\u624B\u52A8\u914D\u7F6E",
            prefill: configure?.prefill ?? "",
            onCancel: () => {
              setView(configure?.backView ?? "market");
              setConfigure(null);
            },
            onConfirm: confirmConfigure
          }) : view === "guide" ? (0, import_jsx_runtime.jsx)(GuidePane, { entry: guide, onBack: () => setView("market"), onClose }) : view === "installed" ? (0, import_jsx_runtime.jsx)(ServerListPane, {
            managed,
            external,
            patchPath: state?.patchPath ?? "",
            expanded,
            setExpanded,
            busyName,
            onToggle: toggle,
            onEdit: (server) => {
              setConfigure({
                title: "\u7F16\u8F91 " + server.serverName,
                prefill: serverPrefillJson(server),
                backView: "installed"
              });
              setView("configure");
            },
            onDelete: remove
          }) : (0, import_jsx_runtime.jsx)(MarketPane, {
            templates: state?.templates ?? [],
            servers: managed,
            onPick: (t) => {
              if (t.kind === "guide") {
                setGuide(t);
                setView("guide");
                return;
              }
              setConfigure({
                title: (t.vendor && t.vendor !== t.title ? t.vendor + " \xB7 " : "") + (t.title ?? t.id),
                prefill: templatePrefillJson(t),
                backView: "market"
              });
              setView("configure");
            },
            onOpenInstalled: () => setView("installed")
          })
        }),
        toast && (0, import_jsx_runtime.jsx)("div", { className: `mm-toast ${toast.isError ? "err" : ""}`, children: toast.message })
      ] })
    }
  );
}
function ServerListPane({ managed, external, patchPath, expanded, setExpanded, busyName, onToggle, onEdit, onDelete }) {
  return (0, import_jsx_runtime.jsxs)("div", {
    children: [
      managed.length === 0 && (0, import_jsx_runtime.jsxs)("div", { className: "mm-empty-cta", children: [
        (0, import_jsx_runtime.jsx)("span", { style: { fontSize: 30 }, children: "\u{1F9E9}" }),
        (0, import_jsx_runtime.jsx)("div", { style: { fontSize: 13.5, fontWeight: 600 }, children: "\u8FD8\u6CA1\u6709\u63A5\u5165\u4EFB\u4F55\u5E94\u7528" }),
        (0, import_jsx_runtime.jsx)("div", { className: "mm-help", style: { marginTop: 0 }, children: "\u5230\u300C\u53D1\u73B0\u5E94\u7528\u300D\u6311\u4E00\u4E2A\uFF0C\u63A5\u5165\u540E agent \u7ACB\u523B\u5C31\u80FD\u8C03\u7528\u5B83\u3002" })
      ] }),
      managed.map((server) => {
        const open = expanded[server.serverName] === true;
        const count = server.toolCount;
        const initial = (server.serverName || "?").trim().charAt(0).toUpperCase();
        return (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
          (0, import_jsx_runtime.jsxs)("button", {
            className: "mm-inst",
            onClick: () => setExpanded((s) => ({ ...s, [server.serverName]: !open })),
            children: [
              (0, import_jsx_runtime.jsx)("span", {
                className: "mm-app-avatar",
                style: { background: avatarColor(server.serverName) },
                children: initial
              }),
              (0, import_jsx_runtime.jsxs)("span", { className: "mm-inst-main", children: [
                (0, import_jsx_runtime.jsx)("div", { className: "mm-inst-name", children: server.serverName }),
                (0, import_jsx_runtime.jsx)("div", { className: "mm-inst-sub", children: [
                  TRANSPORT_LABEL[server.transport] ?? server.transport,
                  " \xB7 ",
                  server.disabled ? "\u5DF2\u505C\u7528" : "\u5DF2\u542F\u7528",
                  server.authKeys.length > 0 ? " \xB7 " + server.authKeys.length + " \u4E2A\u51ED\u636E" : ""
                ].join("") })
              ] }),
              count === null || count === void 0 ? null : (0, import_jsx_runtime.jsxs)("span", { className: "mm-inst-tools " + (count > 0 ? "" : "zero"), children: [
                (0, import_jsx_runtime.jsx)("span", { className: "n", children: String(count) }),
                (0, import_jsx_runtime.jsx)("span", { className: "t", children: "\u5DE5\u5177" })
              ] }),
              (0, import_jsx_runtime.jsx)("span", { className: "mm-chevron", children: (0, import_jsx_runtime.jsx)(ChevronIcon, {}) })
            ]
          }),
          open && (0, import_jsx_runtime.jsxs)("div", { className: "mm-detail", children: [
            (0, import_jsx_runtime.jsx)("div", { className: "mm-summary", children: server.summary }),
            server.authKeys.length > 0 && (0, import_jsx_runtime.jsx)("div", { className: "mm-auth", children: server.authKeys.map((k) => k + ": " + server.maskedAuth[k]).join("\u3000") }),
            (0, import_jsx_runtime.jsxs)("div", { className: "mm-actions", children: [
              (0, import_jsx_runtime.jsx)("button", {
                className: "mm-btn",
                disabled: busyName === server.serverName,
                onClick: () => onToggle(server),
                children: server.disabled ? "\u542F\u7528" : "\u505C\u7528"
              }),
              (0, import_jsx_runtime.jsx)("button", { className: "mm-btn", onClick: () => onEdit(server), children: "\u7F16\u8F91" }),
              (0, import_jsx_runtime.jsx)("button", {
                className: "mm-btn danger",
                disabled: busyName === server.serverName,
                onClick: () => onDelete(server),
                children: "\u65AD\u5F00"
              })
            ] }),
            (0, import_jsx_runtime.jsx)("pre", {
              className: "mm-summary",
              style: { whiteSpace: "pre-wrap", background: "var(--dsw-alias-bg-fill-1,#f6f8fa)", padding: "8px 10px", borderRadius: 8 },
              children: JSON.stringify(server.rawConfig, null, 2)
            })
          ] })
        ] }, server.serverName);
      }),
      external.length > 0 && (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
        (0, import_jsx_runtime.jsx)("div", { className: "mm-section-title", children: "\u5176\u4ED6\u6765\u6E90\u914D\u7F6E\uFF08\u53EA\u8BFB\uFF0C\u8BF7\u5230\u5BF9\u5E94\u6765\u6E90\u4FEE\u6539\uFF09" }),
        external.map(
          (server) => (0, import_jsx_runtime.jsxs)("div", {
            key: server.serverName,
            className: "mm-inst",
            style: { cursor: "default" },
            children: [
              (0, import_jsx_runtime.jsx)("span", {
                className: "mm-app-avatar",
                style: { background: avatarColor(server.serverName) },
                children: (server.serverName || "?").trim().charAt(0).toUpperCase()
              }),
              (0, import_jsx_runtime.jsxs)("span", { className: "mm-inst-main", children: [
                (0, import_jsx_runtime.jsx)("div", { className: "mm-inst-name", children: server.serverName }),
                (0, import_jsx_runtime.jsx)("div", { className: "mm-inst-sub", children: [
                  TRANSPORT_LABEL[server.transport] ?? server.transport,
                  server.disabled ? " \xB7 \u5DF2\u505C\u7528" : "",
                  countText(server)
                ].join("") })
              ] })
            ]
          })
        )
      ] }),
      (0, import_jsx_runtime.jsx)("div", { className: "mm-note", style: { marginTop: 4 }, children: (0, import_jsx_runtime.jsx)("span", {
        children: "\u914D\u7F6E\u5199\u5165 " + patchPath + "\uFF0C\u7531 loader \u70ED\u52A0\u8F7D\uFF1A\u4FDD\u5B58/\u542F\u505C/\u65AD\u5F00\u540E\u7ACB\u5373\u751F\u6548\uFF0C\u65E0\u9700\u91CD\u542F dsh\u3002"
      }) })
    ]
  });
}
function countText(server) {
  return server.toolCount === null || server.toolCount === void 0 ? "" : " \xB7 " + server.toolCount + " \u4E2A\u5DE5\u5177";
}
function MarketPane({ templates, servers, onPick, onOpenInstalled }) {
  const [q, setQ] = (0, import_react.useState)("");
  const [cat, setCat] = (0, import_react.useState)("\u5168\u90E8");
  const attached = (0, import_react.useMemo)(() => {
    const map = {};
    for (const s of servers ?? []) map[s.serverName] = s;
    return map;
  }, [servers]);
  const categories = (0, import_react.useMemo)(() => {
    const seen = ["\u5168\u90E8", "\u514D\u5BC6\u94A5", "\u5DF2\u63A5\u5165"];
    for (const t of templates) {
      const c = t.category || "\u5176\u4ED6";
      if (!seen.includes(c)) seen.push(c);
    }
    return seen;
  }, [templates]);
  const list = (0, import_react.useMemo)(() => {
    const key = q.trim().toLowerCase();
    const isFree = (t) => (t.kind ?? "config") === "config" && !(t.fields ?? []).some((f) => f.required);
    return templates.filter((t) => {
      if (cat === "\u514D\u5BC6\u94A5") {
        if (!isFree(t)) return false;
      } else if (cat === "\u5DF2\u63A5\u5165") {
        if (!attached[t.serverNameDefault || t.id]) return false;
      } else if (cat !== "\u5168\u90E8" && (t.category || "\u5176\u4ED6") !== cat) {
        return false;
      }
      if (key === "") return true;
      const hay = [t.vendor, t.title, t.description, t.category].concat(t.keywords ?? []).filter(Boolean).join(" ").toLowerCase();
      return hay.includes(key);
    });
  }, [templates, q, cat, attached]);
  const free = list.filter((t) => (t.kind ?? "config") === "config" && !(t.fields ?? []).some((f) => f.required)).length;
  const attachedCount = list.filter((t) => attached[t.serverNameDefault || t.id]).length;
  return (0, import_jsx_runtime.jsxs)("div", {
    children: [
      (0, import_jsx_runtime.jsxs)("div", { className: "mm-toolbar", children: [
        (0, import_jsx_runtime.jsxs)("div", { className: "mm-search", children: [
          (0, import_jsx_runtime.jsx)("svg", {
            width: 14,
            height: 14,
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            strokeWidth: 2,
            strokeLinecap: "round",
            children: (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
              (0, import_jsx_runtime.jsx)("circle", { cx: 11, cy: 11, r: 7 }),
              (0, import_jsx_runtime.jsx)("path", { d: "M20 20l-3.6-3.6" })
            ] })
          }),
          (0, import_jsx_runtime.jsx)("input", {
            placeholder: "\u641C\u7D22\u5E94\u7528\u6216\u7F51\u7AD9\uFF1A\u9AD8\u5FB7\u3001\u98DE\u4E66\u3001Notion\u3001GitHub\u2026",
            value: q,
            onChange: (e) => setQ(e.target.value)
          })
        ] }),
        (0, import_jsx_runtime.jsx)("div", {
          className: "mm-chips",
          children: categories.map(
            (c) => (0, import_jsx_runtime.jsx)("button", {
              key: c,
              className: "mm-chip " + (cat === c ? "active" : "") + (c === "\u514D\u5BC6\u94A5" || c === "\u5DF2\u63A5\u5165" ? " smart" : ""),
              onClick: () => setCat(c),
              children: c === "\u514D\u5BC6\u94A5" ? "\u514D\u5BC6\u94A5 " + templates.filter((t) => (t.kind ?? "config") === "config" && !(t.fields ?? []).some((f) => f.required)).length : c === "\u5DF2\u63A5\u5165" ? "\u5DF2\u63A5\u5165 " + templates.filter((t) => attached[t.serverNameDefault || t.id]).length : c
            })
          )
        })
      ] }),
      list.length > 0 && (0, import_jsx_runtime.jsx)("div", { className: "mm-help", style: { margin: "0 0 12px" }, children: list.length + " \u4E2A\u5E94\u7528 \xB7 " + free + " \u4E2A\u514D\u5BC6\u94A5\u53EF\u76F4\u63A5\u63A5 \xB7 " + attachedCount + " \u4E2A\u5DF2\u63A5\u5165" }),
      list.length === 0 && (0, import_jsx_runtime.jsx)("div", { className: "mm-empty", children: "\u6CA1\u6709\u5339\u914D\u7684\u5E94\u7528\u3002\u6362\u4E2A\u5173\u952E\u8BCD\uFF0C\u6216\u70B9\u53F3\u4E0A\u89D2\u300C\u624B\u52A8\u914D\u7F6E\u300D\u7C98\u8D34\u4EFB\u610F MCP JSON\u3002" }),
      (0, import_jsx_runtime.jsx)("div", {
        className: "mm-grid",
        children: list.map((t) => {
          const info = t.kind === "info";
          const server = attached[t.serverNameDefault || t.id];
          const needsKey = (t.fields ?? []).some((f) => f.required);
          const title = t.title || t.id;
          const vendor = t.vendor || "";
          const initial = (vendor || title || "?").trim().charAt(0).toUpperCase();
          const top = (0, import_jsx_runtime.jsxs)("div", { className: "mm-app-top", children: [
            (0, import_jsx_runtime.jsx)("span", {
              className: "mm-app-avatar",
              style: { background: avatarColor(vendor || t.id) },
              children: initial
            }),
            (0, import_jsx_runtime.jsxs)("span", { className: "mm-app-titles", children: [
              (0, import_jsx_runtime.jsx)("div", { className: "mm-app-name", title, children: title }),
              vendor ? (0, import_jsx_runtime.jsx)("div", { className: "mm-app-vendor", children: vendor }) : null
            ] })
          ] });
          const desc = (0, import_jsx_runtime.jsx)("div", { className: "mm-app-desc", children: info ? t.note ?? t.description : t.description });
          const transportPill = (0, import_jsx_runtime.jsx)("span", { className: "mm-pill", children: TRANSPORT_LABEL[t.transport] ?? t.transport });
          if (info) {
            return (0, import_jsx_runtime.jsxs)("div", { className: "mm-app info", children: [
              top,
              desc,
              (0, import_jsx_runtime.jsxs)("div", { className: "mm-app-foot", children: [
                (0, import_jsx_runtime.jsx)("span", { className: "mm-pill dim", children: "\u4EC5\u8BF4\u660E" }),
                (0, import_jsx_runtime.jsx)("a", { className: "mm-app-cta", href: t.docsUrl, target: "_blank", rel: "noreferrer", children: "\u6587\u6863 \u2197" })
              ] })
            ] }, t.id);
          }
          if (t.kind === "guide") {
            return (0, import_jsx_runtime.jsxs)("button", {
              className: "mm-app guide",
              onClick: () => onPick(t),
              children: [
                top,
                desc,
                (0, import_jsx_runtime.jsxs)("div", { className: "mm-app-foot", children: [
                  (0, import_jsx_runtime.jsx)("span", { className: "mm-pill dim", children: "\u9700\u6559\u7A0B" }),
                  transportPill,
                  (0, import_jsx_runtime.jsx)("span", { className: "mm-app-cta", children: "\u770B\u6559\u7A0B \u2192" })
                ] })
              ]
            }, t.id);
          }
          const statusPill = needsKey ? (0, import_jsx_runtime.jsx)("span", { className: "mm-pill key", children: "\u9700 Key" }) : (0, import_jsx_runtime.jsx)("span", { className: "mm-pill free", children: "\u514D\u5BC6\u94A5" });
          return (0, import_jsx_runtime.jsxs)("button", {
            className: "mm-app" + (server ? " attached" : ""),
            onClick: () => server ? onOpenInstalled() : onPick(t),
            children: [
              top,
              desc,
              (0, import_jsx_runtime.jsxs)("div", { className: "mm-app-foot", children: [
                statusPill,
                transportPill,
                (0, import_jsx_runtime.jsx)("span", {
                  className: "mm-app-cta",
                  children: server ? "\u5DF2\u63A5\u5165 \u2713" : "\u63A5\u5165"
                })
              ] })
            ]
          }, t.id);
        })
      })
    ]
  });
}
function GuidePane({ entry, onBack }) {
  const [copied, setCopied] = (0, import_react.useState)("");
  if (!entry) return (0, import_jsx_runtime.jsx)("div", { className: "mm-empty", children: "\u6CA1\u6709\u53EF\u663E\u793A\u7684\u6559\u7A0B\u3002" });
  async function copy(text) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied("\u5DF2\u590D\u5236");
      setTimeout(() => setCopied(""), 1500);
    } catch {
      setCopied("\u590D\u5236\u5931\u8D25\uFF0C\u8BF7\u624B\u52A8\u9009\u4E2D");
      setTimeout(() => setCopied(""), 2e3);
    }
  }
  const steps = entry.steps ?? [];
  return (0, import_jsx_runtime.jsxs)("div", { className: "mm-guide", children: [
    (0, import_jsx_runtime.jsxs)("div", { className: "mm-guide-head", children: [
      (0, import_jsx_runtime.jsx)("button", { className: "mm-back", onClick: onBack, children: "\u2190 \u8FD4\u56DE" }),
      (0, import_jsx_runtime.jsx)("span", { className: "mm-pill dim", children: "\u9700\u624B\u52A8\u63A5" })
    ] }),
    (0, import_jsx_runtime.jsx)("h3", { className: "mm-guide-title", children: (entry.vendor ? entry.vendor + " \xB7 " : "") + (entry.title || entry.id) }),
    (0, import_jsx_runtime.jsx)("p", { className: "mm-guide-desc", children: entry.description }),
    (0, import_jsx_runtime.jsx)("ol", { className: "mm-guide-steps", children: steps.map((s, i) => {
      const isSnippet = typeof s === "string" && s.trim().startsWith("{");
      return (0, import_jsx_runtime.jsx)("li", { children: isSnippet ? (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
        (0, import_jsx_runtime.jsx)("div", { children: "\u628A\u4E0B\u9762\u8FD9\u6BB5\u8D34\u8FDB\u300C\u624B\u52A8\u914D\u7F6E\u300D\uFF1A" }),
        (0, import_jsx_runtime.jsxs)("div", { className: "mm-snippet", children: [
          (0, import_jsx_runtime.jsx)("pre", { children: s }),
          (0, import_jsx_runtime.jsx)("button", { className: "mm-btn mm-copy", onClick: () => copy(s), children: copied || "\u590D\u5236" })
        ] })
      ] }) : s }, i);
    }) }),
    (0, import_jsx_runtime.jsxs)("div", { className: "mm-guide-foot", children: [
      entry.docsUrl ? (0, import_jsx_runtime.jsx)("a", { className: "mm-app-cta", href: entry.docsUrl, target: "_blank", rel: "noreferrer", children: "\u5B98\u65B9\u6587\u6863 \u2197" }) : null,
      (0, import_jsx_runtime.jsx)("span", { className: "mm-help", style: { margin: 0 }, children: "\u770B\u4E0D\u61C2\u54EA\u4E00\u6B65\u5C31\u95EE agent\uFF1A\u8BA9\u5B83\u7167\u7740\u8FD9\u4EFD\u6559\u7A0B\u5E2E\u4F60\u914D\u3002" })
    ] })
  ] });
}
function ConfigurePane({ title, prefill, onCancel, onConfirm }) {
  const [text, setText] = (0, import_react.useState)(prefill);
  const [busy, setBusy] = (0, import_react.useState)(false);
  const [error, setError] = (0, import_react.useState)("");
  (0, import_react.useEffect)(() => {
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
  return (0, import_jsx_runtime.jsxs)("div", {
    children: [
      (0, import_jsx_runtime.jsx)("button", { className: "mm-btn", onClick: onCancel, children: "\u2190 \u8FD4\u56DE" }),
      (0, import_jsx_runtime.jsx)("h3", { style: { fontSize: 15, margin: "12px 0 6px" }, children: title }),
      (0, import_jsx_runtime.jsxs)("div", { className: "mm-field", children: [
        (0, import_jsx_runtime.jsx)("label", { children: "\u539F\u59CB\u914D\u7F6E\uFF08JSON\uFF09" }),
        (0, import_jsx_runtime.jsx)("textarea", {
          className: "mm-textarea",
          value: text,
          spellCheck: false,
          placeholder: '// \u793A\u4F8B\uFF1A\n// {\n//   "mcpServers": {\n//     "example-server": {\n//       "command": "npx",\n//       "args": ["-y", "mcp-server-example"]\n//     }\n//   }\n// }\n\n// \u8BF7\u4ECE MCP Servers \u7684\u4ECB\u7ECD\u9875\u9762\u590D\u5236\u914D\u7F6E JSON\uFF08\u4F18\u5148\u4F7F\u7528 NPX \u6216 UVX \u914D\u7F6E\uFF09\uFF0C\u5E76\u7C98\u8D34\u5230\u8F93\u5165\u6846\u4E2D\u3002',
          onChange: (e) => setText(e.target.value)
        }),
        (0, import_jsx_runtime.jsx)("span", { className: "mm-help", children: "\u652F\u6301 Claude Code .mcp.json \u7684 mcpServers \u683C\u5F0F\uFF08\u53EF\u4E00\u6B21\u7C98\u8D34\u591A\u53F0\u670D\u52A1\u5668\uFF09\u3002\u4EE4\u724C\u7B49\u654F\u611F\u4FE1\u606F\u4FDD\u5B58\u5728\u672C\u673A\u914D\u7F6E\u6587\u4EF6\u4E2D\u3002" }),
        (0, import_jsx_runtime.jsx)("span", { className: "mm-help mm-warn", children: "\u26A0 \u914D\u7F6E\u524D\u8BF7\u786E\u8BA4\u6765\u6E90\uFF0C\u7504\u522B\u98CE\u9669\u3002" })
      ] }),
      error ? (0, import_jsx_runtime.jsx)("div", { className: "mm-error", children: error }) : null,
      (0, import_jsx_runtime.jsxs)("div", { className: "mm-modal-foot", children: [
        (0, import_jsx_runtime.jsx)("button", { className: "mm-btn", onClick: onCancel, children: "\u53D6\u6D88" }),
        (0, import_jsx_runtime.jsx)("button", {
          className: "mm-btn primary",
          disabled: busy || !text.trim(),
          onClick: confirm,
          children: busy ? "\u4FDD\u5B58\u4E2D\u2026" : "\u786E\u8BA4"
        })
      ] })
    ]
  });
}
function mountPanel() {
  let root = null;
  let container = null;
  const close = () => {
    if (root === null) return;
    try {
      root.unmount();
    } catch {
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
    root = (0, import_client.createRoot)(container);
    root.render(
      (0, import_jsx_runtime.jsx)(ErrorBoundary, {
        children: (0, import_jsx_runtime.jsx)(McpMarketPanel, { onClose: close })
      })
    );
  };
  const toggle = () => {
    if (root !== null) close();
    else open();
  };
  return { toggle, open, close, dispose: close };
}
function sidebarRoot() {
  const column = document.querySelector('[data-pane="sidebar"], [class*="sidebarCol"]');
  if (column === null) return void 0;
  return column.querySelector('[class*="logoRow"]')?.parentElement ?? column.firstElementChild;
}
function newSessionButton(root) {
  const nested = root.querySelector('button[class*="newSession"]');
  if (nested !== null) return nested;
  for (const child of root.children) if (child.tagName === "BUTTON") return child;
}
var FAMILY_SELECTORS = [
  "[data-dsh-taskboard-entry]",
  "[data-dsh-ssh-entry]",
  "[data-dsh-skill-explorer-entry]",
  "[data-dsh-mcp-market-entry]"
];
function mountSidebarEntry(onToggle, getCount) {
  if (document.querySelector("[data-dsh-mcp-market-entry]") !== null) return () => {
  };
  const entry = document.createElement("button");
  entry.type = "button";
  entry.setAttribute("data-dsh-mcp-market-entry", "");
  entry.setAttribute("data-dsh-plugin", "dsh-mcp-market");
  entry.setAttribute("data-dsh-part", "sidebar-entry");
  entry.className = "mm-entry";
  entry.setAttribute("aria-label", "\u6865\u63A5\u5E02\u573A");
  entry.setAttribute("title", "\u6865\u63A5\u5E02\u573A\uFF08\u627E\u5E94\u7528\u63A5\u5165\uFF09");
  entry.setAttribute(
    "style",
    "box-sizing:border-box;width:100%;height:36px;display:flex;align-items:center;gap:8px;padding:0 10px;background:transparent;border:none;border-radius:8px;cursor:pointer;font-size:13px;white-space:nowrap;text-align:left;"
  );
  entry.innerHTML = '<span class="mm-entryIcon" style="flex:none;width:24px;height:24px;display:inline-flex;align-items:center;justify-content:center">' + ENTRY_ICON + '</span><span class="mm-entryLabel" style="flex:1;text-align:left;overflow:hidden;text-overflow:ellipsis">\u6865\u63A5\u5E02\u573A</span><span class="mm-entryCount" style="display:none"></span>';
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
    if (root !== void 0 && !root.isConnected) {
      rootObserver.disconnect();
      observing = false;
      root = void 0;
      placed = false;
    }
    if (placed) {
      if (document.body.contains(entry)) return;
      rootObserver.disconnect();
      observing = false;
      root = void 0;
      placed = false;
    }
    root ?? (root = sidebarRoot());
    if (root === void 0) return;
    const button = newSessionButton(root);
    if (button === void 0) return;
    if (entry.parentElement !== root) {
      const row = button.closest('[class*="logoRow"]');
      const base = row !== null && row.parentElement === root ? row : button;
      const family = Array.from(root.children).filter(
        (el) => el instanceof HTMLElement && el.matches(FAMILY_SELECTORS.join(", "))
      );
      const anchor = family.length > 0 ? family[family.length - 1].nextElementSibling : base.nextElementSibling;
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
    if (root === void 0 || !root.isConnected) {
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
function HeaderMcpAction({ toggle }) {
  return (0, import_jsx_runtime.jsx)(
    "button",
    {
      className: "mm-head-btn",
      title: "\u6865\u63A5\u5E02\u573A\uFF08\u627E\u5E94\u7528\u63A5\u5165\uFF09",
      "aria-label": "\u6865\u63A5\u5E02\u573A",
      onClick: toggle,
      children: (0, import_jsx_runtime.jsx)(McpIcon, { size: 15 })
    }
  );
}
function apply(ctx) {
  ctx.effect(() => {
    const styleId = "dsh-mcp-market-style";
    let style = document.getElementById(styleId);
    if (style === null) {
      style = document.createElement("style");
      style.id = styleId;
      document.head.appendChild(style);
    }
    style.textContent = STYLE;
    return () => {
      if (document.getElementById(styleId) === style) style.remove();
    };
  }, "dsh-mcp-market: style");
  fetch("/api/mcp-market/client-boot", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{}"
  }).catch(() => {
  });
  const panel = mountPanel();
  let serverCount = 0;
  const updateCount = () => {
    api("/api/mcp-market/state").then((s) => {
      serverCount = s.servers.filter((x) => x.managed).length;
    }).catch(() => {
    });
  };
  updateCount();
  const disposers = [];
  disposers.push(
    mountSidebarEntry(() => {
      updateCount();
      panel.toggle();
    }, () => serverCount)
  );
  disposers.push(() => panel.dispose());
  ctx.slots.inject(
    "conversation.session.header.actions",
    () => ctx.slots.register(
      {
        name: "conversation.session.header.actions",
        id: "mcp-market",
        order: 60,
        label: "\u6865\u63A5\u5E02\u573A",
        inject: () => ({ toggle: panel.toggle })
      },
      HeaderMcpAction
    )
  );
  ctx.effect(() => {
    return () => {
      for (const dispose of disposers) dispose();
    };
  }, "dsh-mcp-market: sidebar entry cleanup");
}
module.exports = { inject, apply };
return module.exports;
}});

import{r as h,j as e,L as l,w as x,a as v,u as f,M as y,b,S as k,c as w,O as N,i as S}from"./jsx-runtime-F7w9VrsA.js";import{u as p,r as E}from"./locale-ClUtVPCM.js";import{u as L,T as g}from"./theme-DrWVvHAC.js";import{u as I}from"./telemetry-D4uyJKwX.js";import{c as C}from"./cx-2dOUpm6k.js";const R=`/*
 * SPDX-FileCopyrightText: © 2026-Present IKI Systems
 * SPDX-License-Identifier: LicenseRef-Proprietary
 */

/* The palette. Inlined into every page's <head> before the deferred
   stylesheet loads, which is what stops a light flash on dark systems.
   styles.css only consumes these via var(--*); this file is the one place
   a colour is defined. Build step: scripts/extract-theme-prelude.mjs. */
:root,
html[data-theme="light"] {
  color-scheme: light;
  --bg: #faf7f0;
  --surface: #fffefb;
  --surface-2: #f2ece0;
  --text: #2b2620;
  --text-dim: #6b6056;
  --accent: #9a5b34;
  --accent-strong: #7f4622;
  --on-accent: #fdf8ee;
  --rule: rgba(43, 38, 32, 0.12);
  --shadow: 0 2px 20px rgba(43, 38, 32, 0.07);
  --shot-edge: rgba(43, 38, 32, 0.28);
  --hero-grad: linear-gradient(160deg, #f2ece0 0%, #faf7f0 60%);
  --max-width: 760px;
}
html[data-theme="dark"] {
  color-scheme: dark;
  --bg: #131418;
  --surface: #1c2025;
  --surface-2: #252a30;
  --text: #f1efe9;
  --text-dim: #a8a399;
  --accent: #f3b54a;
  --accent-strong: #f6c163;
  --on-accent: #15171a;
  --rule: rgba(241, 239, 233, 0.15);
  --shadow: 0 4px 22px rgba(0, 0, 0, 0.30);
  --shot-edge: rgba(255, 255, 255, 0.18);
  --hero-grad: linear-gradient(160deg, #1c2025 0%, #131418 65%);
}
`,T=`/*
 * SPDX-FileCopyrightText: © 2026-Present IKI Systems
 * SPDX-License-Identifier: LicenseRef-Proprietary
 */

// Resolve and apply the saved theme before first paint, so the page never
// flashes the wrong palette. Inlined into every page's <head> verbatim by
// scripts/extract-theme-prelude.mjs, ahead of any React code: it must run
// synchronously and cannot be a module.
(function () {
  var choice = "system";
  try {
    var key = "speakwith-theme";
    var raw = localStorage.getItem(key);
    if (raw == null) {
      var legacy = localStorage.getItem("lifebond-theme");
      if (legacy != null) {
        localStorage.setItem(key, legacy);
        localStorage.removeItem("lifebond-theme");
        raw = legacy;
      }
    }
    if (raw === "system" || raw === "light" || raw === "dark") {
      choice = raw;
    }
  } catch (e) {}
  var resolved = choice === "system"
    ? (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark")
    : choice;
  document.documentElement.setAttribute("data-theme", resolved);
})();
`,u="speakwith-chunk-reload-at",P=1e4;function M(){h.useEffect(()=>{const a=n=>{let i=0;try{i=Number(sessionStorage.getItem(u)??"0")}catch{}if(!(Date.now()-i<P)){try{sessionStorage.setItem(u,String(Date.now()))}catch{}location.assign(n)}},t=n=>{n.preventDefault(),a(location.href)},r=n=>{j(n.reason)&&a(location.href)};return window.addEventListener("vite:preloadError",t),window.addEventListener("unhandledrejection",r),()=>{window.removeEventListener("vite:preloadError",t),window.removeEventListener("unhandledrejection",r)}},[])}function j(a){if(a&&a.name==="ChunkLoadError")return!0;const t=(a instanceof Error?a.message:String(a??"")).toLowerCase();return t.includes("dynamically imported module")||t.includes("failed to fetch dynamically")||t.includes("loading chunk")||t.includes("importing a module script failed")}const D="_nav_dbj9s_9",O="_nav__inner_dbj9s_18",H="_wordmark_dbj9s_27",W="_wordmark__icon_dbj9s_39",A="_nav__links_dbj9s_55",$="_active_dbj9s_73",B="_nav__controls_dbj9s_87",F="_theme_dbj9s_94",K="_locale__summary_dbj9s_111",X="_locale__chevron_dbj9s_135",U="_locale_dbj9s_81",z="_locale__panel_dbj9s_143",Y="_locale__list_dbj9s_156",q="_locale__note_dbj9s_183",s={nav:D,nav__inner:O,wordmark:H,wordmark__icon:W,nav__links:A,active:$,nav__controls:B,theme:F,locale__summary:K,locale__chevron:X,locale:U,locale__panel:z,locale__list:Y,"locale__link--current":"_locale__link--current_dbj9s_175",locale__note:q};function J(){const a=p(),{copy:t}=a,{themeChoice:r,setTheme:n}=L(),i=h.useRef(null);h.useEffect(()=>{i.current?.removeAttribute("open")},[a.page,a.locale.code]);const m=o=>o===""?a.page==="":a.page===o||a.page.startsWith(`${o}/`),d=o=>m(o)?{className:s.active,"aria-current":"page"}:{};return e.jsx("header",{className:s.nav,children:e.jsxs("div",{className:`container ${s.nav__inner}`,children:[e.jsxs(l,{className:s.wordmark,to:a.path(""),"aria-label":"SpeakWith home",children:[e.jsx("img",{className:s.wordmark__icon,src:"/brand-icon.svg",alt:"","aria-hidden":"true",width:44,height:44}),t.nav.wordmark]}),e.jsxs("nav",{className:s.nav__links,"aria-label":"Primary",children:[e.jsx(l,{to:a.path(""),...d(""),children:t.nav.links.home}),e.jsx(l,{to:a.path("guides"),...d("guides"),children:t.nav.links.guides}),e.jsx(l,{to:a.path("privacy"),...d("privacy"),children:t.nav.links.privacy}),e.jsx(l,{to:a.path("terms"),...d("terms"),children:t.nav.links.terms}),e.jsx(l,{to:a.path("pricing"),...d("pricing"),children:t.nav.links.pricing})]}),e.jsxs("div",{className:s.nav__controls,children:[e.jsxs("label",{className:s.theme,children:[e.jsx("span",{className:"visually-hidden",children:t.nav.theme.label}),e.jsxs("select",{value:r,onChange:o=>n(o.target.value),"aria-label":t.nav.theme.label,children:[e.jsx("option",{value:"system",children:t.nav.theme.system}),e.jsx("option",{value:"light",children:t.nav.theme.light}),e.jsx("option",{value:"dark",children:t.nav.theme.dark})]})]}),a.multilingual&&e.jsxs("details",{className:s.locale,ref:i,children:[e.jsxs("summary",{className:s.locale__summary,children:[e.jsxs("svg",{className:s.locale__globe,viewBox:"0 0 24 24",width:"16",height:"16","aria-hidden":"true",focusable:"false",children:[e.jsx("circle",{cx:"12",cy:"12",r:"10",fill:"none",stroke:"currentColor",strokeWidth:"1.6"}),e.jsx("ellipse",{cx:"12",cy:"12",rx:"4",ry:"10",fill:"none",stroke:"currentColor",strokeWidth:"1.6"}),e.jsx("path",{d:"M2 12h20M4.5 7h15M4.5 17h15",fill:"none",stroke:"currentColor",strokeWidth:"1.6"})]}),e.jsxs("span",{className:"visually-hidden",children:[t.app.localeSwitcher.label,":"]}),e.jsx("span",{className:s.locale__current,lang:a.locale.htmlLang,children:a.locale.endonym}),e.jsx("svg",{className:s.locale__chevron,viewBox:"0 0 16 16",width:"14",height:"14","aria-hidden":"true",focusable:"false",children:e.jsx("path",{d:"M3.5 6l4.5 4.5L12.5 6",fill:"none",stroke:"currentColor",strokeWidth:"1.8",strokeLinecap:"round",strokeLinejoin:"round"})})]}),e.jsxs("div",{className:s.locale__panel,children:[e.jsx("ul",{className:s.locale__list,"aria-label":t.app.localeSwitcher.label,children:a.switcherLinks.map(o=>e.jsx("li",{children:e.jsx("a",{href:o.href,lang:o.locale.htmlLang,hrefLang:o.locale.htmlLang,"aria-current":o.current?"true":void 0,className:o.current?s["locale__link--current"]:void 0,children:o.locale.endonym})},o.locale.code))}),!a.pageIsLocalized&&e.jsx("p",{className:s.locale__note,children:t.app.localeSwitcher.legalNote})]})]})]})]})})}const V="_footer_87fj0_7",G="_footer__inner_87fj0_14",Q="_footer__links_87fj0_19",Z="_footer__credits_87fj0_42",ee="_footer__fine_87fj0_61",c={footer:V,footer__inner:G,footer__links:Q,footer__credits:Z,"footer__credits-label":"_footer__credits-label_87fj0_47",footer__fine:ee};function te(){const a=p(),{copy:t}=a,r=t.app.footer.copyrightHtml.replace("{{year}}",String(new Date().getFullYear())).replace("{{ikiSystemsHome}}",t.links.ikiSystemsHome);return e.jsx("footer",{className:c.footer,children:e.jsxs("div",{className:`container ${c.footer__inner}`,children:[e.jsxs("nav",{className:c.footer__links,"aria-label":"Footer",children:[e.jsx(l,{to:a.path(""),children:t.app.footer.links.home}),e.jsx(l,{to:a.path("automation"),children:t.app.footer.links.automation}),e.jsx(l,{to:a.path("guides"),children:t.app.footer.links.guides}),e.jsx(l,{to:a.path("privacy"),children:t.app.footer.links.privacy}),e.jsx(l,{to:a.path("terms"),children:t.app.footer.links.terms}),e.jsx("a",{href:t.links.supportContactUrl,target:"_blank",rel:"noopener noreferrer",children:t.app.footer.links.contact})]}),e.jsx("p",{children:t.app.footer.tagline}),e.jsxs("p",{className:c.footer__credits,children:[e.jsx("span",{className:c["footer__credits-label"],children:t.app.footer.builtOn.label}),t.app.footer.builtOn.components]}),e.jsxs("p",{className:c.footer__credits,children:[e.jsx("span",{className:c["footer__credits-label"],children:t.app.footer.builtOn.researchLabel}),e.jsx("a",{href:t.app.footer.builtOn.ctaUrl,target:"_blank",rel:"noopener noreferrer",children:t.app.footer.builtOn.citation})]}),e.jsx("p",{className:c.footer__fine,dangerouslySetInnerHTML:{__html:r}})]})})}const ae="_shell_detsc_13",re={shell:ae},se="_err_6e0wk_10",oe="_err__mark_6e0wk_15",ne="_err__lead_6e0wk_22",le="_err__actions_6e0wk_28",_={err:se,err__mark:oe,err__lead:ne,err__actions:le},ue=()=>[{rel:"icon",type:"image/svg+xml",href:"/favicon.svg?v=20260925b"},{rel:"icon",type:"image/png",href:"/favicon-32.png?v=20260925b",sizes:"32x32"},{rel:"apple-touch-icon",href:"/apple-touch-icon.png?v=20260925b"}];function fe({children:a}){const{pathname:t}=f(),{locale:r}=E(t);return e.jsxs("html",{lang:r.htmlLang,suppressHydrationWarning:!0,children:[e.jsxs("head",{children:[e.jsx("meta",{charSet:"utf-8"}),e.jsx("meta",{name:"viewport",content:"width=device-width, initial-scale=1"}),e.jsx("meta",{name:"theme-color",content:"#131418",id:"meta-theme-color"}),e.jsx("style",{id:"theme-tokens",dangerouslySetInnerHTML:{__html:R}}),e.jsx("script",{dangerouslySetInnerHTML:{__html:T}}),e.jsx(y,{}),e.jsx(b,{})]}),e.jsxs("body",{children:[a,e.jsx(k,{}),e.jsx(w,{})]})]})}const ge=x(function(){return I(),M(),ce(),e.jsx(g,{children:e.jsxs("app-root",{className:re.shell,children:[e.jsx(J,{}),e.jsx("main",{children:e.jsx(N,{})}),e.jsx(te,{})]})})});function ce(){const{hash:a,key:t}=f();h.useEffect(()=>{if(!a)return;const r=document.getElementById(decodeURIComponent(a.slice(1)));r&&r.scrollIntoView()},[a,t])}const je=v(function({error:t}){return e.jsx(g,{children:e.jsx(ie,{error:t})})});function ie({error:a}){const t=p(),r=t.copy.error,n=S(a)?a:null,i=j(a),m=n?`${n.status} ${n.statusText}`:r.heading,d=i?r.leadStaleChunk:n?r.leadRequest:r.lead;return e.jsx("main",{children:e.jsxs("section",{className:C("container",_.err),children:[e.jsx("p",{className:_.err__mark,"aria-hidden":"true",children:"⚠"}),e.jsx("h1",{children:m}),e.jsx("p",{className:_.err__lead,children:d}),e.jsxs("div",{className:_.err__actions,children:[e.jsx("button",{type:"button",className:"button button--primary",onClick:()=>location.reload(),children:r.reload}),e.jsx(l,{className:"button button--ghost",to:t.path(""),children:r.home})]}),!1]})})}export{je as ErrorBoundary,fe as Layout,ge as default,ue as links};

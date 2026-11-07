import{r as p,j as e,L as n,w as v,a as x,u,M as j,b as y,S as k,c as b,O as w,i as N}from"./jsx-runtime-F7w9VrsA.js";import{u as _,r as E}from"./locale-DfyrAo_N.js";import{u as L,T as f}from"./theme-DrWVvHAC.js";import{u as S}from"./telemetry-Dk5cjo1t.js";import{c as C}from"./cx-2dOUpm6k.js";const I=`/* The palette. Inlined into every page's <head> before the deferred
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
`,R=`// Resolve and apply the saved theme before first paint, so the page never
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
`,m="speakwith-chunk-reload-at",T=1e4;function M(){p.useEffect(()=>{const a=r=>{let h=0;try{h=Number(sessionStorage.getItem(m)??"0")}catch{}if(!(Date.now()-h<T)){try{sessionStorage.setItem(m,String(Date.now()))}catch{}location.assign(r)}},t=r=>{r.preventDefault(),a(location.href)},o=r=>{g(r.reason)&&a(location.href)};return window.addEventListener("vite:preloadError",t),window.addEventListener("unhandledrejection",o),()=>{window.removeEventListener("vite:preloadError",t),window.removeEventListener("unhandledrejection",o)}},[])}function g(a){if(a&&a.name==="ChunkLoadError")return!0;const t=(a instanceof Error?a.message:String(a??"")).toLowerCase();return t.includes("dynamically imported module")||t.includes("failed to fetch dynamically")||t.includes("loading chunk")||t.includes("importing a module script failed")}const O="_nav_v6nbp_4",H="_nav__inner_v6nbp_13",W="_wordmark_v6nbp_21",$="_wordmark__icon_v6nbp_32",A="_nav__links_v6nbp_48",B="_active_v6nbp_65",D="_theme_v6nbp_70",i={nav:O,nav__inner:H,wordmark:W,wordmark__icon:$,nav__links:A,active:B,theme:D};function P(){const a=_(),{copy:t}=a,{themeChoice:o,setTheme:r}=L(),h=l=>l===""?a.page==="":a.page===l||a.page.startsWith(`${l}/`),c=l=>h(l)?{className:i.active,"aria-current":"page"}:{};return e.jsx("header",{className:i.nav,children:e.jsxs("div",{className:`container ${i.nav__inner}`,children:[e.jsxs(n,{className:i.wordmark,to:a.path(""),"aria-label":"SpeakWith home",children:[e.jsx("img",{className:i.wordmark__icon,src:"/brand-icon.svg",alt:"","aria-hidden":"true",width:44,height:44}),t.nav.wordmark]}),e.jsxs("nav",{className:i.nav__links,"aria-label":"Primary",children:[e.jsx(n,{to:a.path(""),...c(""),children:t.nav.links.home}),e.jsx(n,{to:a.path("guides"),...c("guides"),children:t.nav.links.guides}),e.jsx(n,{to:a.path("privacy"),...c("privacy"),children:t.nav.links.privacy}),e.jsx(n,{to:a.path("terms"),...c("terms"),children:t.nav.links.terms}),e.jsx(n,{to:a.path("pricing"),...c("pricing"),children:t.nav.links.pricing})]}),e.jsxs("label",{className:i.theme,children:[e.jsx("span",{className:"visually-hidden",children:t.nav.theme.label}),e.jsxs("select",{value:o,onChange:l=>r(l.target.value),"aria-label":t.nav.theme.label,children:[e.jsx("option",{value:"system",children:t.nav.theme.system}),e.jsx("option",{value:"light",children:t.nav.theme.light}),e.jsx("option",{value:"dark",children:t.nav.theme.dark})]})]})]})})}const F="_footer_1wi85_2",U="_footer__inner_1wi85_9",q="_footer__links_1wi85_14",z="_footer__credits_1wi85_37",K="_footer__fine_1wi85_56",Y="_locale_1wi85_62",J="_locale__summary_1wi85_69",V="_locale__chevron_1wi85_93",G="_locale__list_1wi85_101",Q="_locale__note_1wi85_131",s={footer:F,footer__inner:U,footer__links:q,footer__credits:z,"footer__credits-label":"_footer__credits-label_1wi85_42",footer__fine:K,locale:Y,locale__summary:J,locale__chevron:V,locale__list:G,"locale__link--current":"_locale__link--current_1wi85_125",locale__note:Q};function X(){const a=_(),{copy:t}=a,o=t.app.footer.copyrightHtml.replace("{{year}}",String(new Date().getFullYear())).replace("{{ikiSystemsHome}}",t.links.ikiSystemsHome);return e.jsx("footer",{className:s.footer,children:e.jsxs("div",{className:`container ${s.footer__inner}`,children:[e.jsxs("nav",{className:s.footer__links,"aria-label":"Footer",children:[e.jsx(n,{to:a.path(""),children:t.app.footer.links.home}),e.jsx(n,{to:a.path("automation"),children:t.app.footer.links.automation}),e.jsx(n,{to:a.path("guides"),children:t.app.footer.links.guides}),e.jsx(n,{to:a.path("privacy"),children:t.app.footer.links.privacy}),e.jsx(n,{to:a.path("terms"),children:t.app.footer.links.terms}),e.jsx("a",{href:t.links.supportContactUrl,target:"_blank",rel:"noopener noreferrer",children:t.app.footer.links.contact})]}),e.jsx("p",{children:t.app.footer.tagline}),a.multilingual&&e.jsxs("details",{className:s.locale,children:[e.jsxs("summary",{className:s.locale__summary,children:[e.jsxs("svg",{className:s.locale__globe,viewBox:"0 0 24 24",width:"16",height:"16","aria-hidden":"true",focusable:"false",children:[e.jsx("circle",{cx:"12",cy:"12",r:"10",fill:"none",stroke:"currentColor",strokeWidth:"1.6"}),e.jsx("ellipse",{cx:"12",cy:"12",rx:"4",ry:"10",fill:"none",stroke:"currentColor",strokeWidth:"1.6"}),e.jsx("path",{d:"M2 12h20M4.5 7h15M4.5 17h15",fill:"none",stroke:"currentColor",strokeWidth:"1.6"})]}),e.jsxs("span",{className:"visually-hidden",children:[t.app.localeSwitcher.label,":"]}),e.jsx("span",{className:s.locale__current,lang:a.locale.htmlLang,children:a.locale.endonym}),e.jsx("svg",{className:s.locale__chevron,viewBox:"0 0 16 16",width:"14",height:"14","aria-hidden":"true",focusable:"false",children:e.jsx("path",{d:"M3.5 6l4.5 4.5L12.5 6",fill:"none",stroke:"currentColor",strokeWidth:"1.8",strokeLinecap:"round",strokeLinejoin:"round"})})]}),e.jsx("ul",{className:s.locale__list,"aria-label":t.app.localeSwitcher.label,children:a.switcherLinks.map(r=>e.jsx("li",{children:e.jsx("a",{href:r.href,lang:r.locale.htmlLang,hrefLang:r.locale.htmlLang,"aria-current":r.current?"true":void 0,className:r.current?s["locale__link--current"]:void 0,children:r.locale.endonym})},r.locale.code))}),!a.pageIsLocalized&&e.jsx("p",{className:s.locale__note,children:t.app.localeSwitcher.legalNote})]}),e.jsxs("p",{className:s.footer__credits,children:[e.jsx("span",{className:s["footer__credits-label"],children:t.app.footer.builtOn.label}),t.app.footer.builtOn.components]}),e.jsxs("p",{className:s.footer__credits,children:[e.jsx("span",{className:s["footer__credits-label"],children:t.app.footer.builtOn.researchLabel}),e.jsx("a",{href:t.app.footer.builtOn.ctaUrl,target:"_blank",rel:"noopener noreferrer",children:t.app.footer.builtOn.citation})]}),e.jsx("p",{className:s.footer__fine,dangerouslySetInnerHTML:{__html:o}})]})})}const Z="_shell_qlov3_8",ee={shell:Z},te="_err_1g94r_5",ae="_err__mark_1g94r_10",re="_err__lead_1g94r_17",oe="_err__actions_1g94r_23",d={err:te,err__mark:ae,err__lead:re,err__actions:oe},_e=()=>[{rel:"icon",type:"image/svg+xml",href:"/favicon.svg?v=20260925b"},{rel:"icon",type:"image/png",href:"/favicon-32.png?v=20260925b",sizes:"32x32"},{rel:"apple-touch-icon",href:"/apple-touch-icon.png?v=20260925b"}];function me({children:a}){const{pathname:t}=u(),{locale:o}=E(t);return e.jsxs("html",{lang:o.htmlLang,suppressHydrationWarning:!0,children:[e.jsxs("head",{children:[e.jsx("meta",{charSet:"utf-8"}),e.jsx("meta",{name:"viewport",content:"width=device-width, initial-scale=1"}),e.jsx("meta",{name:"theme-color",content:"#131418",id:"meta-theme-color"}),e.jsx("style",{id:"theme-tokens",dangerouslySetInnerHTML:{__html:I}}),e.jsx("script",{dangerouslySetInnerHTML:{__html:R}}),e.jsx(j,{}),e.jsx(y,{})]}),e.jsxs("body",{children:[a,e.jsx(k,{}),e.jsx(b,{})]})]})}const pe=v(function(){return S(),M(),se(),e.jsx(f,{children:e.jsxs("app-root",{className:ee.shell,children:[e.jsx(P,{}),e.jsx("main",{children:e.jsx(w,{})}),e.jsx(X,{})]})})});function se(){const{hash:a,key:t}=u();p.useEffect(()=>{if(!a)return;const o=document.getElementById(decodeURIComponent(a.slice(1)));o&&o.scrollIntoView()},[a,t])}const ue=x(function({error:t}){return e.jsx(f,{children:e.jsx(ne,{error:t})})});function ne({error:a}){const t=_(),o=t.copy.error,r=N(a)?a:null,h=g(a),c=r?`${r.status} ${r.statusText}`:o.heading,l=h?o.leadStaleChunk:r?o.leadRequest:o.lead;return e.jsx("main",{children:e.jsxs("section",{className:C("container",d.err),children:[e.jsx("p",{className:d.err__mark,"aria-hidden":"true",children:"⚠"}),e.jsx("h1",{children:c}),e.jsx("p",{className:d.err__lead,children:l}),e.jsxs("div",{className:d.err__actions,children:[e.jsx("button",{type:"button",className:"button button--primary",onClick:()=>location.reload(),children:o.reload}),e.jsx(n,{className:"button button--ghost",to:t.path(""),children:o.home})]}),!1]})})}export{ue as ErrorBoundary,me as Layout,pe as default,_e as links};

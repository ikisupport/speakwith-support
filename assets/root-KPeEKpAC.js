import{r as u,j as e,L as n,w as v,a as j,u as f,M as k,b as y,S as b,c as w,O as N,i as E}from"./jsx-runtime-F7w9VrsA.js";import{u as _,r as S}from"./locale-DQO1phFi.js";import{u as L,T as g}from"./theme-DrWVvHAC.js";import{s as m,u as C}from"./telemetry-Dk5cjo1t.js";import{c as I}from"./cx-2dOUpm6k.js";const R=`/* The palette. Inlined into every page's <head> before the deferred
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
`,T=`// Resolve and apply the saved theme before first paint, so the page never
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
`,p="speakwith-chunk-reload-at",M=1e4;function H(){u.useEffect(()=>{const t=a=>{let h=0;try{h=Number(sessionStorage.getItem(p)??"0")}catch{}if(!(Date.now()-h<M)){try{sessionStorage.setItem(p,String(Date.now()))}catch{}location.assign(a)}},r=a=>{a.preventDefault(),t(location.href)},o=a=>{x(a.reason)&&t(location.href)};return window.addEventListener("vite:preloadError",r),window.addEventListener("unhandledrejection",o),()=>{window.removeEventListener("vite:preloadError",r),window.removeEventListener("unhandledrejection",o)}},[])}function x(t){if(t&&t.name==="ChunkLoadError")return!0;const r=(t instanceof Error?t.message:String(t??"")).toLowerCase();return r.includes("dynamically imported module")||r.includes("failed to fetch dynamically")||r.includes("loading chunk")||r.includes("importing a module script failed")}const O="_nav_v6nbp_4",W="_nav__inner_v6nbp_13",$="_wordmark_v6nbp_21",A="_wordmark__icon_v6nbp_32",B="_nav__links_v6nbp_48",D="_active_v6nbp_65",P="_theme_v6nbp_70",i={nav:O,nav__inner:W,wordmark:$,wordmark__icon:A,nav__links:B,active:D,theme:P};function F(){const t=_(),{copy:r}=t,{themeChoice:o,setTheme:a}=L(),h=l=>l===""?t.page==="":t.page===l||t.page.startsWith(`${l}/`),c=l=>h(l)?{className:i.active,"aria-current":"page"}:{};return e.jsx("header",{className:i.nav,children:e.jsxs("div",{className:`container ${i.nav__inner}`,children:[e.jsxs(n,{className:i.wordmark,to:t.path(""),"aria-label":"SpeakWith home",children:[e.jsx("img",{className:i.wordmark__icon,src:"/brand-icon.svg",alt:"","aria-hidden":"true",width:44,height:44}),r.nav.wordmark]}),e.jsxs("nav",{className:i.nav__links,"aria-label":"Primary",children:[e.jsx(n,{to:t.path(""),...c(""),children:r.nav.links.home}),e.jsx(n,{to:t.path("guides"),...c("guides"),children:r.nav.links.guides}),e.jsx(n,{to:t.path("privacy"),...c("privacy"),children:r.nav.links.privacy}),e.jsx(n,{to:t.path("terms"),...c("terms"),children:r.nav.links.terms}),e.jsx(n,{to:t.path("pricing"),...c("pricing"),children:r.nav.links.pricing})]}),e.jsxs("label",{className:i.theme,children:[e.jsx("span",{className:"visually-hidden",children:r.nav.theme.label}),e.jsxs("select",{value:o,onChange:l=>a(l.target.value),"aria-label":r.nav.theme.label,children:[e.jsx("option",{value:"system",children:r.nav.theme.system}),e.jsx("option",{value:"light",children:r.nav.theme.light}),e.jsx("option",{value:"dark",children:r.nav.theme.dark})]})]})]})})}const z="_footer_1wi85_2",K="_footer__inner_1wi85_9",U="_footer__links_1wi85_14",Y="_footer__credits_1wi85_37",q="_footer__fine_1wi85_56",J="_locale_1wi85_62",V="_locale__summary_1wi85_69",G="_locale__chevron_1wi85_93",Q="_locale__list_1wi85_101",X="_locale__note_1wi85_131",s={footer:z,footer__inner:K,footer__links:U,footer__credits:Y,"footer__credits-label":"_footer__credits-label_1wi85_42",footer__fine:q,locale:J,locale__summary:V,locale__chevron:G,locale__list:Q,"locale__link--current":"_locale__link--current_1wi85_125",locale__note:X};function Z(){const t=_(),{copy:r}=t,o=r.app.footer.copyrightHtml.replace("{{year}}",String(new Date().getFullYear())).replace("{{ikiSystemsHome}}",r.links.ikiSystemsHome);return e.jsx("footer",{className:s.footer,children:e.jsxs("div",{className:`container ${s.footer__inner}`,children:[e.jsxs("nav",{className:s.footer__links,"aria-label":"Footer",children:[e.jsx(n,{to:t.path(""),children:r.app.footer.links.home}),e.jsx(n,{to:t.path("automation"),children:r.app.footer.links.automation}),e.jsx(n,{to:t.path("guides"),children:r.app.footer.links.guides}),e.jsx(n,{to:t.path("privacy"),children:r.app.footer.links.privacy}),e.jsx(n,{to:t.path("terms"),children:r.app.footer.links.terms}),e.jsx("a",{href:r.links.newsletter,target:"_blank",rel:"noopener noreferrer",onClick:()=>m("cta.newsletter",{placement:"footer"}),children:r.app.footer.links.newsletter}),e.jsx("a",{href:r.links.x,target:"_blank",rel:"noopener noreferrer",onClick:()=>m("cta.x",{placement:"footer"}),children:r.app.footer.links.x}),e.jsx("a",{href:r.links.ikiSystemsHome,target:"_blank",rel:"noopener noreferrer",children:r.app.footer.links.ikiSystems})]}),e.jsx("p",{children:r.app.footer.tagline}),t.multilingual&&e.jsxs("details",{className:s.locale,children:[e.jsxs("summary",{className:s.locale__summary,children:[e.jsxs("svg",{className:s.locale__globe,viewBox:"0 0 24 24",width:"16",height:"16","aria-hidden":"true",focusable:"false",children:[e.jsx("circle",{cx:"12",cy:"12",r:"10",fill:"none",stroke:"currentColor",strokeWidth:"1.6"}),e.jsx("ellipse",{cx:"12",cy:"12",rx:"4",ry:"10",fill:"none",stroke:"currentColor",strokeWidth:"1.6"}),e.jsx("path",{d:"M2 12h20M4.5 7h15M4.5 17h15",fill:"none",stroke:"currentColor",strokeWidth:"1.6"})]}),e.jsxs("span",{className:"visually-hidden",children:[r.app.localeSwitcher.label,":"]}),e.jsx("span",{className:s.locale__current,lang:t.locale.htmlLang,children:t.locale.endonym}),e.jsx("svg",{className:s.locale__chevron,viewBox:"0 0 16 16",width:"14",height:"14","aria-hidden":"true",focusable:"false",children:e.jsx("path",{d:"M3.5 6l4.5 4.5L12.5 6",fill:"none",stroke:"currentColor",strokeWidth:"1.8",strokeLinecap:"round",strokeLinejoin:"round"})})]}),e.jsx("ul",{className:s.locale__list,"aria-label":r.app.localeSwitcher.label,children:t.switcherLinks.map(a=>e.jsx("li",{children:e.jsx("a",{href:a.href,lang:a.locale.htmlLang,hrefLang:a.locale.htmlLang,"aria-current":a.current?"true":void 0,className:a.current?s["locale__link--current"]:void 0,children:a.locale.endonym})},a.locale.code))}),!t.pageIsLocalized&&e.jsx("p",{className:s.locale__note,children:r.app.localeSwitcher.legalNote})]}),e.jsxs("p",{className:s.footer__credits,children:[e.jsx("span",{className:s["footer__credits-label"],children:r.app.footer.builtOn.label}),r.app.footer.builtOn.components]}),e.jsxs("p",{className:s.footer__credits,children:[e.jsx("span",{className:s["footer__credits-label"],children:r.app.footer.builtOn.researchLabel}),e.jsx("a",{href:r.app.footer.builtOn.ctaUrl,target:"_blank",rel:"noopener noreferrer",children:r.app.footer.builtOn.citation})]}),e.jsx("p",{className:s.footer__fine,dangerouslySetInnerHTML:{__html:o}})]})})}const ee="_shell_ypk7l_8",re={shell:ee},te="_err_1g94r_5",ae="_err__mark_1g94r_10",oe="_err__lead_1g94r_17",se="_err__actions_1g94r_23",d={err:te,err__mark:ae,err__lead:oe,err__actions:se},me=()=>[{rel:"icon",type:"image/svg+xml",href:"/favicon.svg?v=20260925b"},{rel:"icon",type:"image/png",href:"/favicon-32.png?v=20260925b",sizes:"32x32"},{rel:"apple-touch-icon",href:"/apple-touch-icon.png?v=20260925b"}];function pe({children:t}){const{pathname:r}=f(),{locale:o}=S(r);return e.jsxs("html",{lang:o.htmlLang,suppressHydrationWarning:!0,children:[e.jsxs("head",{children:[e.jsx("meta",{charSet:"utf-8"}),e.jsx("meta",{name:"viewport",content:"width=device-width, initial-scale=1"}),e.jsx("meta",{name:"theme-color",content:"#131418",id:"meta-theme-color"}),e.jsx("style",{id:"theme-tokens",dangerouslySetInnerHTML:{__html:R}}),e.jsx("script",{dangerouslySetInnerHTML:{__html:T}}),e.jsx(k,{}),e.jsx(y,{})]}),e.jsxs("body",{children:[t,e.jsx(b,{}),e.jsx(w,{})]})]})}const ue=v(function(){return C(),H(),ne(),e.jsx(g,{children:e.jsxs("app-root",{className:re.shell,children:[e.jsx(F,{}),e.jsx("main",{children:e.jsx(N,{})}),e.jsx(Z,{})]})})});function ne(){const{hash:t,key:r}=f();u.useEffect(()=>{if(!t)return;const o=document.getElementById(decodeURIComponent(t.slice(1)));o&&o.scrollIntoView()},[t,r])}const fe=j(function({error:r}){return e.jsx(g,{children:e.jsx(le,{error:r})})});function le({error:t}){const r=_(),o=r.copy.error,a=E(t)?t:null,h=x(t),c=a?`${a.status} ${a.statusText}`:o.heading,l=h?o.leadStaleChunk:a?o.leadRequest:o.lead;return e.jsx("main",{children:e.jsxs("section",{className:I("container",d.err),children:[e.jsx("p",{className:d.err__mark,"aria-hidden":"true",children:"⚠"}),e.jsx("h1",{children:c}),e.jsx("p",{className:d.err__lead,children:l}),e.jsxs("div",{className:d.err__actions,children:[e.jsx("button",{type:"button",className:"button button--primary",onClick:()=>location.reload(),children:o.reload}),e.jsx(n,{className:"button button--ghost",to:r.path(""),children:o.home})]}),!1]})})}export{fe as ErrorBoundary,pe as Layout,ue as default,me as links};

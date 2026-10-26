#!/usr/bin/env node
// Mechanical first pass from an Angular standalone component to a React page.
//
// This is a migration aid, not a compiler. It does the bulk, repetitive 90% —
// interpolations, control flow, attribute bindings, class routing, void
// elements — and every page it produces is then read and finished by hand. It
// is committed because it documents how the port was made and can be re-run
// against a changed Angular page to see what moved.
//
// The CSS module is imported as `css`, never `s`: home.component.ts has a
// `@for (s of ...)` loop whose variable is literally `s`, and `src={s.src}`
// would then silently read the stylesheet object instead of the screenshot.
//
// Class routing is the part worth understanding. A class name is module-scoped
// if and only if the component's OWN `styles:` block defines it; anything else
// stays a plain global string. That is exactly the boundary Angular's emulated
// view encapsulation drew, so it preserves the collisions the CSS audit found
// (pricing's `.eyebrow` and the guides' `.eyebrow` carry different rules and
// must not merge) while leaving the genuinely global classes from styles.css
// — .container, .button, .prose, .card, and home's app-home-scoped layout
// classes — alone.
//
//   node scripts/dev/ng2react.mjs <component.ts> [--css] [--tsx]
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { REPO_ROOT } from '../lib/site-content.mjs';

const file = process.argv[2];
if (!file) {
  console.error('usage: ng2react.mjs <path/to/x.component.ts> [--css] [--tsx]');
  process.exit(1);
}
const src = readFileSync(file, 'utf8');

/* ---------- extract the two blocks ---------- */

function extractBacktick(source, key) {
  const at = source.indexOf(`${key}:`);
  if (at === -1) return '';
  const open = source.indexOf('`', at);
  if (open === -1) return '';
  let i = open + 1;
  while (i < source.length) {
    if (source[i] === '\\') { i += 2; continue; }
    if (source[i] === '`') break;
    i++;
  }
  return source.slice(open + 1, i);
}

const template = extractBacktick(src, 'template');
const styles = extractBacktick(src, 'styles');

/* ---------- which classes are this component's own ---------- */

// Classes the shared styles.css defines UNCONDITIONALLY (.container, .prose,
// .button…) can never be module-scoped: a component's styles block often only
// scopes rules *under* one of them — agent-lists writes `.prose .eyebrow` —
// and routing the ancestor into the module would quietly drop every global
// rule hanging off it. Classes styles.css defines only under `app-home` are a
// separate case: global on the home page, and the home page's business alone.
const globalCss = readFileSync(resolve(REPO_ROOT, 'src/styles.css'), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '');
const GLOBAL_UNCONDITIONAL = new Set();
const HOME_SCOPED = new Set();
for (const m of globalCss.matchAll(/([^{}]+)\{/g)) {
  const selector = m[1].trim();
  if (!selector || selector.startsWith('@')) continue;
  for (const part of selector.split(',')) {
    const sel = part.trim();
    const classes = [...sel.matchAll(/\.([A-Za-z_][\w-]*)/g)].map(c => c[1]);
    if (!classes.length) continue;
    const target = /\bapp-[a-z-]+\b/.test(sel) ? HOME_SCOPED : GLOBAL_UNCONDITIONAL;
    for (const c of classes) target.add(c);
  }
}

const isHomePage = /selector:\s*'app-home'/.test(src);

const moduleClasses = new Set();
for (const m of styles.matchAll(/\.([A-Za-z_][\w-]*)/g)) {
  const cls = m[1];
  if (GLOBAL_UNCONDITIONAL.has(cls)) continue;
  if (isHomePage && HOME_SCOPED.has(cls)) continue;
  moduleClasses.add(cls);
}

/* ---------- CSS: make a component styles block safe as a module ---------- */

/** Split on top-level commas only, so `:is(th, td)` survives intact. */
function splitSelectorList(selector) {
  const parts = [];
  let depth = 0, current = '';
  for (const ch of selector) {
    if (ch === '(' || ch === '[') depth++;
    else if (ch === ')' || ch === ']') depth--;
    if (ch === ',' && depth === 0) { parts.push(current); current = ''; continue; }
    current += ch;
  }
  parts.push(current);
  return parts.map(p => p.trim()).filter(Boolean);
}

/**
 * Two corrections, both of which are silent bugs if skipped.
 *
 * 1. A class the shared styles.css owns must stay global inside the module,
 *    or `.prose .eyebrow` hashes BOTH names and the ancestor stops matching
 *    the element that carries the real global `prose`.
 * 2. A bare element selector — Angular scoped `table`, `th`, `td` to the
 *    pricing component — has no class to hash, so a CSS Module leaves it
 *    GLOBAL and it restyles every table on the site. The automation and
 *    live-transcript pages both have tables. Anchor it under the page's host
 *    element, which is the same scope Angular gave it.
 */
function moduleSafeSelector(selector, host) {
  return splitSelectorList(selector)
    .map(part => {
      let out = part.replace(/\.([A-Za-z_][\w-]*)/g, (whole, cls) =>
        moduleClasses.has(cls) ? whole : `:global(.${cls})`,
      );
      const firstToken = out.trim().split(/[\s>+~]/)[0];
      const startsBareElement =
        /^[a-z][a-z0-9]*(?:[:[].*)?$/.test(firstToken) &&
        !firstToken.startsWith(':') &&
        !firstToken.startsWith('app-');
      if (startsBareElement) {
        out = `${host} ${out.trim()}`;
      }
      return out.trim();
    })
    .join(',\n');
}

/** Rewrite every rule in a styles block, and dedent it. */
function moduleSafeCss(css, host) {
  const dedented = css
    .replace(/^\n/, '')
    .split('\n')
    .map(l => l.replace(/^ {4}/, ''))
    .join('\n');
  // `(^|[{}])`, not `(^|})`: the FIRST rule inside an `@media (...) {` block
  // is preceded by `{`, so anchoring only on `}` would skip it -- leaving a
  // bare `th` there global, or hashing a `.container` there and dropping its
  // global rule, in exactly the place nobody looks.
  return dedented.replace(/(^|[{}])([^{}]*)\{/g, (whole, before, selector) => {
    const trimmed = selector.trim();
    if (!trimmed || trimmed.startsWith('@')) return whole;
    const lead = selector.match(/^\s*/)[0];
    return `${before}${lead}${moduleSafeSelector(trimmed, host)} {`;
  });
}

/* ---------- balanced-brace helpers for @if / @for ---------- */

/** Index just past the `}` that closes the `{` at `open`. */
function matchBrace(text, open) {
  let depth = 0;
  for (let i = open; i < text.length; i++) {
    if (text[i] === '{') depth++;
    else if (text[i] === '}') {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

/** Innermost-first so nested blocks are already converted when we wrap them. */
function convertControlFlow(text) {
  for (;;) {
    const at = findLastBlock(text);
    if (!at) return text;
    text = text.slice(0, at.start) + at.replacement + text.slice(at.end);
  }
}

function findLastBlock(text) {
  // Scan for the LAST @if/@for, which is necessarily innermost or independent.
  const re = /@(if|for)\s*\(/g;
  let last = null;
  for (const m of text.matchAll(re)) last = m;
  if (!last) return null;

  const kind = last[1];
  const parenStart = text.indexOf('(', last.index);
  let depth = 0, i = parenStart;
  for (; i < text.length; i++) {
    if (text[i] === '(') depth++;
    else if (text[i] === ')') { depth--; if (depth === 0) break; }
  }
  const head = text.slice(parenStart + 1, i);
  const braceOpen = text.indexOf('{', i);
  const braceClose = matchBrace(text, braceOpen);
  const body = text.slice(braceOpen + 1, braceClose);
  let end = braceClose + 1;

  if (kind === 'for') {
    const [, item, list] = head.match(/^\s*(\S+)\s+of\s+([^;]+)/) ?? [];
    const trackMatch = head.match(/track\s+([^;)]+)/);
    const track = trackMatch ? trackMatch[1].trim() : '$index';
    const key = track === '$index' ? '{$index}' : `{${track}}`;
    return {
      start: last.index,
      end,
      replacement:
        `{${list.trim()}.map((${item.trim()}, $index) => (\n<Fragment key=${key}>${body}</Fragment>\n))}`,
    };
  }

  // @if, with any number of @else if, then an optional @else.
  const branches = [{ cond: head.trim(), body }];
  let rest = text.slice(end);
  for (;;) {
    const elseIf = rest.match(/^\s*@else\s+if\s*\(/);
    const plainElse = rest.match(/^\s*@else\s*\{/);
    if (elseIf) {
      const o = rest.indexOf('(');
      let d = 0, j = o;
      for (; j < rest.length; j++) {
        if (rest[j] === '(') d++;
        else if (rest[j] === ')') { d--; if (d === 0) break; }
      }
      const bo = rest.indexOf('{', j);
      const bc = matchBrace(rest, bo);
      branches.push({ cond: rest.slice(o + 1, j).trim(), body: rest.slice(bo + 1, bc) });
      end += bc + 1;
      rest = rest.slice(bc + 1);
      continue;
    }
    if (plainElse) {
      const bo = rest.indexOf('{');
      const bc = matchBrace(rest, bo);
      branches.push({ cond: null, body: rest.slice(bo + 1, bc) });
      end += bc + 1;
    }
    break;
  }

  const wrap = b => `(<>${b}</>)`;
  let expr = '';
  const hasElse = branches[branches.length - 1].cond === null;
  const conds = hasElse ? branches.slice(0, -1) : branches;
  const tail = hasElse ? wrap(branches[branches.length - 1].body) : 'null';
  if (conds.length === 1 && !hasElse) {
    expr = `${conds[0].cond} && ${wrap(conds[0].body)}`;
  } else {
    expr = conds.map(b => `${b.cond} ? ${wrap(b.body)} : `).join('') + tail;
  }
  return { start: last.index, end, replacement: `{${expr}}` };
}

/* ---------- attribute + class rewriting ---------- */

const ATTR_RENAME = {
  'stroke-width': 'strokeWidth', 'stroke-linecap': 'strokeLinecap',
  'stroke-linejoin': 'strokeLinejoin', 'stroke-dasharray': 'strokeDasharray',
  'stroke-opacity': 'strokeOpacity', 'fill-opacity': 'fillOpacity',
  'fill-rule': 'fillRule', 'clip-rule': 'clipRule', 'stop-color': 'stopColor',
  'stop-opacity': 'stopOpacity', 'text-anchor': 'textAnchor',
  'font-family': 'fontFamily', 'font-size': 'fontSize', 'font-weight': 'fontWeight',
  'xlink:href': 'xlinkHref', 'clip-path': 'clipPath', 'marker-end': 'markerEnd',
  for: 'htmlFor', colspan: 'colSpan', rowspan: 'rowSpan', tabindex: 'tabIndex',
  readonly: 'readOnly', maxlength: 'maxLength', autocomplete: 'autoComplete',
  srcset: 'srcSet', hreflang: 'hrefLang', crossorigin: 'crossOrigin',
  playsinline: 'playsInline', autoplay: 'autoPlay', novalidate: 'noValidate',
  enterkeyhint: 'enterKeyHint', inputmode: 'inputMode', spellcheck: 'spellCheck',
  preserveaspectratio: 'preserveAspectRatio', viewbox: 'viewBox',
};

const VOID = new Set(['img', 'br', 'hr', 'input', 'source', 'track', 'meta', 'link', 'area', 'base', 'col', 'embed', 'param', 'wbr', 'use', 'path', 'circle', 'ellipse', 'rect', 'line', 'polygon', 'polyline', 'stop']);

/** 'a b c' -> className={...}, routing each name to the module or to a global. */
function classAttr(names) {
  const parts = names.split(/\s+/).filter(Boolean);
  if (!parts.length) return '';
  const exprs = parts.map(n =>
    moduleClasses.has(n)
      ? (/^[A-Za-z_$][\w$]*$/.test(n) ? `css.${n}` : `css['${n}']`)
      : JSON.stringify(n),
  );
  // All-global stays a plain string attribute; only a module class needs an
  // expression, and only a mix needs the helper.
  if (exprs.every(e => e.startsWith('"'))) {
    return `className=${JSON.stringify(parts.join(' '))}`;
  }
  if (exprs.length === 1) {
    return `className={${exprs[0]}}`;
  }
  return `className={cx(${exprs.join(', ')})}`;
}

function convertTag(tag) {
  const nameMatch = tag.match(/^<\/?\s*([A-Za-z][\w-]*)/);
  const tagName = nameMatch ? nameMatch[1] : '';
  let out = tag;

  // [innerHTML]="x"
  // A sentinel, restored after the {{ }} pass: the double braces of
  // dangerouslySetInnerHTML would otherwise be eaten as an interpolation.
  out = out.replace(/\[innerHTML\]="([^"]*)"/g, (_, e) => `dangerouslySetInnerHTML=__DSIH__(${e})`);
  // (event)="handler(...)"
  out = out.replace(/\((\w+)\)="([^"]*)"/g, (_, ev, handler) => {
    const on = 'on' + ev[0].toUpperCase() + ev.slice(1);
    return `${on}={() => ${handler.replace(/\$event/g, 'e')}}`;
  });
  // [class.foo]="cond"
  out = out.replace(/\[class\.([\w-]+)\]="([^"]*)"/g, (_, cls, cond) => {
    const ref = moduleClasses.has(cls)
      ? (/^[A-Za-z_$][\w$]*$/.test(cls) ? `css.${cls}` : `css['${cls}']`)
      : JSON.stringify(cls);
    // Deliberately not valid JS: a conditional class has to be merged into
    // the element's existing className by hand, and a marker that still
    // compiles is a marker that ships.
    return `__TODO_COND_CLASS__(${cond}, ${ref})`;
  });
  // [class]="expr" is a whole dynamic class list. It cannot be routed
  // mechanically — the names live inside an arbitrary expression, and under
  // CSS Modules a name built by concatenation never matches a hashed class —
  // so it is flagged loudly for a hand port instead of being half-converted.
  out = out.replace(/\[class\]="([^"]*)"/g, (_, e) => `__TODO_DYNAMIC_CLASS__(${e})`);
  // [attr.foo]="x" and [foo]="x"
  out = out.replace(/\[attr\.([\w:-]+)\]="([^"]*)"/g, (_, a, e) => `${ATTR_RENAME[a] ?? a}={${e}}`);
  out = out.replace(/\[([\w:.-]+)\]="([^"]*)"/g, (_, a, e) => `${ATTR_RENAME[a] ?? a}={${e}}`);
  // class="..."  (after bindings, so [class.x] is already gone)
  out = out.replace(/\bclass="([^"]*)"/g, (_, v) => classAttr(v));
  // plain kebab attributes React renames
  for (const [from, to] of Object.entries(ATTR_RENAME)) {
    out = out.replace(new RegExp(`\\b${from.replace(':', '\\:')}=`, 'g'), `${to}=`);
  }
  // boolean attributes with no value
  // Valueless boolean attributes still need React's spelling.
  out = out.replace(/\s(playsinline|autoplay|novalidate|readonly|spellcheck)(?=[\s/>])/g,
    (_, a) => ` ${ATTR_RENAME[a] ?? a}`);
  // self-close void elements
  if (VOID.has(tagName) && !out.endsWith('/>') && out.startsWith('<') && !out.startsWith('</')) {
    out = out.replace(/\s*>$/, ' />');
  }
  return out;
}

/* ---------- run ---------- */

let jsx = template;
jsx = convertControlFlow(jsx);
// Angular comments are HTML comments; JSX needs them wrapped.
jsx = jsx.replace(/<!--([\s\S]*?)-->/g, (_, c) => `{/*${c}*/}`);
// Tags, one at a time, leaving text nodes alone.
jsx = jsx.replace(/<\/?[A-Za-z][^>]*>/g, convertTag);
// {{ x }} -> {x}  (after tags, so attribute bindings are already handled)
jsx = jsx.replace(/\{\{\s*([\s\S]*?)\s*\}\}/g, (_, e) => `{${e}}`);
// restore the innerHTML objects now the {{ }} pass is done
jsx = jsx.replace(/dangerouslySetInnerHTML=__DSIH__\(([\s\S]*?)\)(?=[\s/>])/g,
  (_, e) => `dangerouslySetInnerHTML={{ __html: ${e} }}`);
// routerLink -> react-router <Link to=…>. An <a> cannot nest, so the next
// </a> after an opened <Link ...> is unambiguously its closing tag.
jsx = jsx.replace(/<a(\s[^>]*?)routerLink=\{([^}]*)\}/g, '<Link$1to={$2}');
jsx = jsx.replace(/routerLink=\{([^}]*)\}/g, 'to={$1}');
{
  let out = '';
  let rest = jsx;
  for (;;) {
    const open = rest.indexOf('<Link');
    if (open === -1) { out += rest; break; }
    const close = rest.indexOf('</a>', open);
    if (close === -1) { out += rest; break; }
    out += rest.slice(0, close) + '</Link>';
    rest = rest.slice(close + '</a>'.length);
  }
  jsx = out;
}

const wantCss = process.argv.includes('--css');
const wantTsx = process.argv.includes('--tsx');
const hostSelector = (src.match(/selector:\s*'([^']+)'/) ?? [])[1] ?? 'app-page';
if (wantCss || !wantTsx) {
  console.log('/* ===== CSS ===== */');
  console.log(moduleSafeCss(styles, hostSelector).trim());
}
if (wantTsx || !wantCss) {
  console.log('/* ===== JSX ===== */');
  console.log(jsx.trim());
  console.log('/* ===== module classes: ' + [...moduleClasses].sort().join(' ') + ' ===== */');
}

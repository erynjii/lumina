#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const PUBLIC = path.join(ROOT, 'public');
const LANGS = ['en', 'es', 'pt', 'ar'];
const NON_EN = ['es', 'pt', 'ar'];
const PAGES = [
  { source: 'index.html', slug: '' },
  { source: 'instructions.html', slug: 'instructions' },
];

const META = require('./i18n-meta.js');
const OG_LOCALE = { en: 'en_US', es: 'es_ES', pt: 'pt_BR', ar: 'ar_SA' };
const BREADCRUMB = {
  home: { en: 'Home', es: 'Inicio', pt: 'Início', ar: 'الرئيسية' },
  pages: {
    'instructions': {
      en: 'Application Instructions',
      es: 'Instrucciones de Aplicación',
      pt: 'Instruções de Aplicação',
      ar: 'تعليمات التطبيق',
    },
  },
};

function urlFor(lang, slug) {
  const base = 'https://luminabymirra.com';
  if (lang === 'en') return slug ? base + '/' + slug : base + '/';
  return slug ? base + '/' + lang + '/' + slug : base + '/' + lang + '/';
}
function pathFor(lang, slug) {
  return urlFor(lang, slug).replace('https://luminabymirra.com', '');
}
function extractT(html) {
  const m = html.match(/const T = (\{[\s\S]*?\});/);
  if (!m) throw new Error('T object not found');
  return eval('(' + m[1] + ')');
}
function escHtml(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function escAttr(s) { return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;'); }

function replaceI18nText(html, T) {
  return html.replace(/<(\w+)([^>]*\sdata-i18n="([^"]+)"[^>]*)>([^<]*)<\/\1>/g, function (m, tag, attrs, key) {
    if (/\sdata-i18n-html="true"/.test(attrs)) return m;
    if (!Object.prototype.hasOwnProperty.call(T, key)) return m;
    return '<' + tag + attrs + '>' + escHtml(T[key]) + '</' + tag + '>';
  });
}
function replaceI18nHtml(html, T) {
  return html.replace(/<(\w+)([^>]*\sdata-i18n="([^"]+)"[^>]*\sdata-i18n-html="true"[^>]*)>([\s\S]*?)<\/\1>/g, function (m, tag, attrs, key) {
    if (!Object.prototype.hasOwnProperty.call(T, key)) return m;
    return '<' + tag + attrs + '>' + T[key] + '</' + tag + '>';
  });
}
function replaceI18nPlaceholders(html, T) {
  return html.replace(/<(\w+)([^>]*\sdata-i18n-ph="([^"]+)"[^>]*)>/g, function (m, tag, attrs, key) {
    if (!Object.prototype.hasOwnProperty.call(T, key)) return m;
    const newAttrs = attrs.replace(/\splaceholder="[^"]*"/, ' placeholder="' + escAttr(T[key]) + '"');
    return '<' + tag + newAttrs + '>';
  });
}
function setHtmlLangDir(html, lang) {
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  return html.replace(/<html\s+lang="[^"]+"\s+dir="[^"]+">/, '<html lang="' + lang + '" dir="' + dir + '">');
}
function setTitle(html, title) {
  return html.replace(/<title>[\s\S]*?<\/title>/, '<title>' + escHtml(title) + '</title>');
}
function setMetaContent(html, sel, content) {
  return html.replace(sel, function (m) {
    return /content="[^"]*"/.test(m) ? m.replace(/content="[^"]*"/, 'content="' + escAttr(content) + '"') : m;
  });
}
function setMetaTags(html, m, lang) {
  html = setMetaContent(html, /<meta\s+name="description"[^>]*>/, m.description);
  html = setMetaContent(html, /<meta\s+property="og:title"[^>]*>/, m.og_title);
  html = setMetaContent(html, /<meta\s+property="og:description"[^>]*>/, m.og_description);
  html = setMetaContent(html, /<meta\s+property="og:locale"(?![^>]*alternate)[^>]*>/, OG_LOCALE[lang]);
  html = setMetaContent(html, /<meta\s+name="twitter:title"[^>]*>/, m.twitter_title);
  html = setMetaContent(html, /<meta\s+name="twitter:description"[^>]*>/, m.twitter_description);
  return html;
}
function setLinkAlternates(html, slug, lang) {
  const canonical = urlFor(lang, slug);
  html = html.replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/, '<link rel="canonical" href="' + canonical + '">');
  const altLines = LANGS.map(function (l) {
    return '  <link rel="alternate" hreflang="' + l + '" href="' + urlFor(l, slug) + '">';
  }).join('\n');
  const xDefault = '  <link rel="alternate" hreflang="x-default" href="' + urlFor('en', slug) + '">';
  const block = /(<link\s+rel="alternate"\s+hreflang="[^"]+"\s+href="[^"]*"\s*\/?>(\s*\n\s*)?){2,}/;
  return html.replace(block, function () { return altLines + '\n' + xDefault + '\n  '; });
}
function buildSwitcher(slug, currentLang) {
  const labels = { en: 'EN', es: 'ES', pt: 'PT', ar: 'AR' };
  const titles = { en: 'English', es: 'Español', pt: 'Português', ar: 'العربية' };
  const items = LANGS.map(function (l) {
    const href = pathFor(l, slug);
    const active = l === currentLang ? ' active' : '';
    const ariaCurrent = l === currentLang ? ' aria-current="page"' : '';
    return '    <a class="lang-btn' + active + '" href="' + href + '" hreflang="' + l + '" title="' + titles[l] + '"' + ariaCurrent + '>' + labels[l] + '</a>';
  }).join('\n');
  return '  <nav class="lang-switcher" aria-label="Language">\n' + items + '\n  </nav>';
}
function replaceSwitcher(html, slug, currentLang) {
  return html.replace(/<nav\s+class="lang-switcher"[\s\S]*?<\/nav>/, buildSwitcher(slug, currentLang));
}
function localizeBreadcrumb(html, slug, lang) {
  const homeName = BREADCRUMB.home[lang] || BREADCRUMB.home.en;
  const homeUrl = urlFor(lang, '');
  const pageName = (BREADCRUMB.pages[slug] && BREADCRUMB.pages[slug][lang]) || (BREADCRUMB.pages[slug] && BREADCRUMB.pages[slug].en) || '';
  const pageUrl = urlFor(lang, slug);
  return html.replace(
    /(<script type="application\/ld\+json">\s*\{\s*"@context":\s*"https:\/\/schema\.org",\s*"@type":\s*"BreadcrumbList"[\s\S]*?<\/script>)/,
    function (match) {
      let out = match;
      out = out.replace(/"name":\s*"Home"/, '"name": ' + JSON.stringify(homeName));
      out = out.replace(/"item":\s*"https:\/\/luminabymirra\.com\/"/, '"item": ' + JSON.stringify(homeUrl));
      if (pageName) {
        out = out.replace(/"name":\s*"Application Instructions"/, '"name": ' + JSON.stringify(pageName));
        out = out.replace(/"item":\s*"https:\/\/luminabymirra\.com\/instructions"/, '"item": ' + JSON.stringify(pageUrl));
      }
      return out;
    }
  );
}
function rewriteInternalLinks(html, lang) {
  if (lang === 'en') return html;
  const prefix = '/' + lang;
  html = html.replace(/href="\/instructions"/g, 'href="' + prefix + '/instructions"');
  html = html.replace(/href="\/"/g, 'href="' + prefix + '/"');
  return html;
}

function generateVariant(sourceHtml, T, slug, lang) {
  const meta = META[slug][lang];
  if (!meta) throw new Error('Missing meta for ' + slug + ' ' + lang);
  let h = sourceHtml;
  h = setHtmlLangDir(h, lang);
  h = setTitle(h, meta.title);
  h = setMetaTags(h, meta, lang);
  h = setLinkAlternates(h, slug, lang);
  h = rewriteInternalLinks(h, lang);
  h = replaceSwitcher(h, slug, lang);
  h = replaceI18nHtml(h, T[lang] || {});
  h = replaceI18nText(h, T[lang] || {});
  h = replaceI18nPlaceholders(h, T[lang] || {});
  h = localizeBreadcrumb(h, slug, lang);
  return h;
}
function patchSourceEnglish(sourceHtml, slug) {
  let h = sourceHtml;
  h = setLinkAlternates(h, slug, 'en');
  h = replaceSwitcher(h, slug, 'en');
  return h;
}

function main() {
  for (let i = 0; i < PAGES.length; i++) {
    const page = PAGES[i];
    const sourcePath = path.join(PUBLIC, page.source);
    let source = fs.readFileSync(sourcePath, 'utf8');
    const T = extractT(source);
    const patched = patchSourceEnglish(source, page.slug);
    if (patched !== source) {
      fs.writeFileSync(sourcePath, patched);
      console.log('Patched source ' + page.source);
      source = patched;
    }
    for (let j = 0; j < NON_EN.length; j++) {
      const lang = NON_EN[j];
      const outDir = path.join(PUBLIC, lang);
      fs.mkdirSync(outDir, { recursive: true });
      const outPath = path.join(outDir, page.source);
      const variant = generateVariant(source, T, page.slug, lang);
      fs.writeFileSync(outPath, variant);
      console.log('Wrote ' + path.relative(ROOT, outPath));
    }
  }
  console.log('Done.');
}
main();

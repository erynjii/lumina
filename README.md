# Lumina by Mirra Professional — Website

Static marketing site for [luminabymirra.com](https://luminabymirra.com).

## Stack

- **Plain HTML/CSS/JS** — no framework, no build tooling required at deploy time.
- **Hosting:** Cloudflare Workers + Static Assets (project `lumina`,
  account `Celimedia`). Deployed via Workers Builds on push to `main`.
- **Image/video assets:** Served from a Shopify CDN bucket
  (`cdn.shopify.com/s/files/1/0701/6729/8284/...`) — not from this repo.

## Repo layout

```
lumina/
├── public/                       # everything served at the edge
│   ├── index.html                # English homepage     → /
│   ├── instructions.html         # English instructions → /instructions
│   ├── privacy.html              # → /privacy   (English-only, legal)
│   ├── terms.html                # → /terms     (English-only, legal)
│   ├── 404.html                  # branded 404
│   ├── lumina.pdf                # → /lumina.pdf
│   ├── sitemap.xml               # → /sitemap.xml (with hreflang alternates)
│   ├── robots.txt                # → /robots.txt
│   ├── img/                      # procedure photos
│   ├── es/                       # Spanish variants
│   │   ├── index.html            # → /es/
│   │   └── instructions.html     # → /es/instructions
│   ├── pt/                       # Portuguese variants
│   └── ar/                       # Arabic variants (RTL)
├── tools/
│   ├── generate-i18n.js          # builds /es/, /pt/, /ar/ from English source
│   └── i18n-meta.js              # per-page meta translations (titles, OG, etc.)
├── wrangler.jsonc                # Cloudflare Worker config
├── README.md
├── .gitignore
└── .gitattributes
```

## Internationalization

The site has full per-language URL variants for SEO:

- `/`, `/instructions` — English (canonical default)
- `/es/`, `/es/instructions` — Spanish
- `/pt/`, `/pt/instructions` — Portuguese
- `/ar/`, `/ar/instructions` — Arabic (RTL)

Every page declares hreflang alternates pointing to all four URL variants, and
`sitemap.xml` lists every variant with `xhtml:link` cross-references so Google
indexes each language independently.

The language switcher at the top-right is plain anchor links — clicking ES on
the homepage takes you to `/es/`. No JavaScript-based content swapping.

### Editing translations

Body translations live inside the `const T = { en, es, pt, ar }` object in
each English source HTML file (`public/index.html`, `public/instructions.html`).
Per-page meta translations (titles, descriptions, Open Graph copy) live in
`tools/i18n-meta.js`. After editing either, regenerate the variants:

```bash
node tools/generate-i18n.js
```

Then commit the regenerated `public/es/`, `public/pt/`, `public/ar/` files
along with the source change.

Privacy and terms are English-only by design — legal pages aren't translated
without a lawyer.

## Deploys

Every push to `main` triggers a Cloudflare Workers Build. The build runs
`npx wrangler deploy`, which uploads `public/` as static assets and points
the Worker at it. Routes:

- `luminabymirra.com/*` → Worker `lumina`
- `www.luminabymirra.com/*` → Worker `lumina`

Preview deploys are created for any non-`main` branch.

## Local development

Serve the `public/` folder so extensionless URLs (`/instructions`, `/privacy`,
`/terms`) resolve correctly:

```bash
cd public
python3 -m http.server 8000
# visit http://localhost:8000
```

For a closer-to-prod preview using Wrangler:

```bash
npx wrangler dev
```

## SEO

- Per-language URLs with full hreflang cross-references (see above).
- `sitemap.xml` and a custom `robots.txt` with `Sitemap:` directive.
- Structured data: `WebSite`, `Organization`, `Brand`, two `Product`,
  `FAQPage` (homepage); `BreadcrumbList` and `HowTo` (instructions page).
- Open Graph and Twitter cards on every page.
- `robots.txt` blocks known AI-training crawlers (GPTBot, Google-Extended,
  ClaudeBot, anthropic-ai, CCBot, PerplexityBot, etc.).

## Distribution

US distributor: **Aurora Bonita LLC**. Manufacturer: **Mirra Professional**
(Mirra Cosméticos, Brazil).

## Secrets

Never commit API tokens. `.gitignore` blocks `*token*.txt`, `.env`, and
specific known token files. If a token is accidentally committed, rotate it
immediately at the issuer (Cloudflare, Resend, etc.) — git history removal
is not a substitute for rotation.

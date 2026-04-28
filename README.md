# Lumina by Mirra Professional — Website

Static marketing site for [luminabymirra.com](https://luminabymirra.com).

## Stack

- **Plain HTML/CSS/JS** — no build step.
- **Hosting:** Cloudflare Workers + Static Assets (project `lumina`,
  account `Celimedia`). Deployed via Workers Builds on push to `main`.
- **Image/video assets:** Served from a Shopify CDN bucket
  (`cdn.shopify.com/s/files/1/0701/6729/8284/...`) — not from this repo.

## Repo layout

```
lumina/
├── public/                 # everything served at the edge
│   ├── index.html          # Homepage   → /
│   ├── privacy.html        # Privacy    → /privacy
│   ├── terms.html          # Terms      → /terms
│   ├── 404.html            # Not Found  → served on any unknown path
│   └── lumina.pdf          # Brochure   → /lumina.pdf
├── wrangler.jsonc          # Cloudflare Worker config (assets binding)
├── README.md
├── .gitignore
├── .gitattributes
└── setup-git.ps1           # One-shot bootstrap (idempotent)
```

`html_handling: "auto-trailing-slash"` in `wrangler.jsonc` is what makes
`/privacy` and `/terms` resolve without the `.html` extension.

## Deploys

Every push to `main` triggers a Cloudflare Workers Build. The build runs
`npx wrangler deploy`, which uploads `public/` as static assets and points
the Worker at it. Routes:

- `luminabymirra.com/*` → Worker `lumina`
- `www.luminabymirra.com/*` → Worker `lumina`

Preview deploys are created for any non-`main` branch.

## Local development

Open `public/index.html` directly in a browser, or serve the `public/`
folder so `/privacy` and `/terms` resolve as clean URLs:

```bash
cd public
python3 -m http.server 8000
# visit http://localhost:8000
```

For a closer-to-prod preview using Wrangler:

```bash
npx wrangler dev
```

## Distribution

US distributor: **Aurora Bonita LLC**. Manufacturer: **Mirra Professional**
(Mirra Cosméticos, Brazil).

## Secrets

Never commit API tokens. `.gitignore` blocks `*token*.txt`, `.env`, and
specific known token files. If a token is accidentally committed, rotate it
immediately at the issuer (Cloudflare, Resend, etc.) — git history removal
is not a substitute for rotation.

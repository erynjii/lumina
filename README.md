# Lumina by Mirra Professional — Website

Static marketing site for [luminabymirra.com](https://luminabymirra.com).

## Stack

- **Plain HTML/CSS/JS** — no build step.
- **Hosting:** Cloudflare Pages (project `lumina-by-mirra`, account `Celimedia`).
- **Assets:** Images and video are served from a Shopify CDN bucket
  (`cdn.shopify.com/s/files/1/0701/6729/8284/...`) — not from this repo.

## Files

- `index.html` — Homepage. Rendered at `/`.
- `privacy.html` — Privacy policy. Rendered at `/privacy`.
- `terms.html` — Terms of service. Rendered at `/terms`.

Cloudflare Pages serves `*.html` at extensionless URLs by default, which is
why `index.html` links to `/privacy` and `/terms`.

## Deploys

Every push to `main` deploys to Cloudflare Pages production once the repo is
connected to the `lumina-by-mirra` Pages project. Preview deploys are created
for any non-`main` branch and for pull requests.

## Local development

Open `index.html` directly in a browser. No server needed. For accurate
relative-link behavior (so `/privacy` resolves correctly), serve the folder:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Distribution

US distributor: **Aurora Bonita LLC**. Manufacturer: **Mirra Professional**
(Mirra Cosméticos, Brazil).

## Secrets

Never commit API tokens. `.gitignore` blocks `*token*.txt`, `.env`, and
specific known token files. If a token is accidentally committed, rotate it
immediately at the issuer (Cloudflare, Resend, etc.) — git history removal
is not a substitute for rotation.

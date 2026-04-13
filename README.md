# HomeStart marketing site

Static site generated with **[Eleventy](https://www.11ty.dev/)** for deployment on **Cloudflare Pages**.

**Companion iOS app repo:** [github.com/martenian/homestart-ios](https://github.com/martenian/homestart-ios)

## Local development

```bash
git clone https://github.com/martenian/homestart-web.git
cd homestart-web
npm install
npm run serve
```

Open the URL Eleventy prints (usually `http://localhost:8080`).

## Production build

```bash
npm run build
```

Output: **`_site/`** (repository root)

## Cloudflare Pages

| Setting | Value |
|--------|--------|
| **Root directory** | Repository root (this repo is standalone) |
| **Build command** | `npm run build` |
| **Build output directory** | `_site` |

Environment: Node 18 or 20 recommended.

## Before launch

1. Edit **`src/_data/site.json`** — real domain, support email, legal entity, address.
2. Legal review of **`privacy-policy`**, **`terms-of-service`**, **`security-overview`**.
3. Replace bracketed *\[placeholders\]* inside page templates where noted.

## Content source of truth

Product claims should stay aligned with the iOS app. See **`CODEBASE_AND_PLAID_REVIEW.md`** in this folder.

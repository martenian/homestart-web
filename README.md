# HomeStart marketing site

Modern single-page landing + legal/trust pages for the **HomeStart** iOS app. Built with **[Eleventy](https://www.11ty.dev/)**, deployed on **Cloudflare Pages**, with a **waitlist API** via **Cloudflare Pages Functions**.

**Companion iOS app:** [github.com/martenian/homestart-ios](https://github.com/martenian/homestart-ios)

---

## Local development

```bash
git clone https://github.com/martenian/homestart-web.git
cd homestart-web
npm install
npm run serve
```

Open the URL Eleventy prints (usually `http://localhost:8080`).

- **Waitlist form** calls `POST /api/waitlist`. That route only exists after deploy (or when using `wrangler pages dev` with Functions). Locally you’ll see a network error message unless you run the dev server below.

### Local preview with Functions (optional)

```bash
npm run build
npx wrangler pages dev _site --kv WAITLIST_KV
```

Create a dev KV namespace in the Cloudflare dashboard (or CLI), then bind `WAITLIST_KV` when prompted or in `wrangler.toml`.

---

## Production build

```bash
npm run build
```

Output: **`_site/`** (includes `_headers` for Cloudflare).

| Setting | Value |
|--------|--------|
| **Build command** | `npm run build` |
| **Output directory** | `_site` |
| **Node** | 18 or 20 |

---

## Waitlist (email capture)

### 1. Cloudflare KV (recommended)

1. In Cloudflare Dashboard → **Workers & Pages** → **KV** → **Create a namespace** (e.g. `homestart-waitlist`).
2. Open your **Pages** project → **Settings** → **Functions** → **KV namespace bindings**.
3. Add binding:
   - **Variable name:** `WAITLIST_KV`
   - **KV namespace:** the namespace you created
4. Redeploy.

Emails are stored as keys `email:{lowercased_email}` with JSON `{ email, ts }`. Duplicates get a friendly JSON response (`You're already on the list.`).

### 2. Webhook (optional, Zapier / Make / etc.)

Add an **environment variable** in Pages → **Settings** → **Environment variables**:

- **Name:** `WAITLIST_WEBHOOK_URL`  
- **Value:** your HTTPS endpoint URL  

Each signup POSTs JSON: `{ email, ts, duplicate }`. You can use **webhook only** (no KV) if your automation stores rows; duplicate detection will not run without KV.

### 3. Neither binding

`POST /api/waitlist` returns **503** with a setup message; the UI shows a clear error.

---

## Brand assets (logos & icons)

Raster files in **`src/images/`** are copied from the iOS app’s asset catalog (same repo machine / manual sync):

| File | Source (iOS) |
|------|----------------|
| `logo.png` | `HomeStartApp/Resources/Assets.xcassets/Logo.imageset/Logo@3x.png` (sharpest; `@2x` also fine) |
| `splash.gif` | `HomeStartApp/Resources/_media/Logo GIF_Fast.gif` (same as `SplashScreen` / `GIFView`) |
| `apple-touch-icon.png` | `AppIcon.appiconset/icon_60pt@3x.png` |
| `favicon.png` | `AppIcon.appiconset/icon_60pt@2x.png` |

After you change the app logo or icon in Xcode, copy the updated PNGs here and redeploy so web and app stay aligned.

---

## Site configuration

Edit **`src/_data/site.json`**:

- `url` — canonical site URL (SEO, sharing)
- `supportEmail` — shown in footer and contact
- `companyLegalName`, `address`, `copyrightYear`

---

## Legal pages

Privacy, Terms, Security, FAQ, and Plaid-focused pages live under their routes (e.g. `/privacy-policy/`). Keep copy aligned with the app and run **legal review** before relying on them.

---

## Content source of truth

Product claims should match the iOS app. See **`CODEBASE_AND_PLAID_REVIEW.md`**.

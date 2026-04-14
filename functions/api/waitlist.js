/**
 * Cloudflare Pages Function — POST /api/waitlist
 *
 * Bindings (set in Cloudflare Pages → Settings → Functions):
 * - WAITLIST_KV: KV namespace (recommended)
 *
 * Optional:
 * - WAITLIST_WEBHOOK_URL: HTTPS URL to POST { email, ts, duplicate } (e.g. Zapier, Make)
 *
 * If neither is set, returns 503 with setup instructions.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function onRequestPost(context) {
  const { request, env } = context;

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!email || !EMAIL_RE.test(email)) {
    return Response.json({ ok: false, error: "Enter a valid email address." }, { status: 400 });
  }

  const kv = env.WAITLIST_KV;
  const webhook = env.WAITLIST_WEBHOOK_URL;

  if (!kv && !webhook) {
    return Response.json(
      {
        ok: false,
        error: "Waitlist storage is not configured. Add WAITLIST_KV or WAITLIST_WEBHOOK_URL in Pages settings.",
      },
      { status: 503 }
    );
  }

  const key = `email:${email}`;
  const now = Date.now();
  const payload = JSON.stringify({ email, ts: now });

  let duplicate = false;

  if (kv) {
    const existing = await kv.get(key);
    if (existing) {
      duplicate = true;
    } else {
      await kv.put(key, payload);
    }
  }

  if (webhook) {
    try {
      await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, ts: now, duplicate }),
      });
    } catch {
      /* webhook is best-effort when KV already stored */
      if (!kv) {
        return Response.json({ ok: false, error: "Could not record signup. Try again." }, { status: 502 });
      }
    }
  }

  if (duplicate) {
    return Response.json({
      ok: true,
      duplicate: true,
      message: "You're already on the list.",
    });
  }

  return Response.json({
    ok: true,
    message: "You're on the list.",
  });
}

export async function onRequest(context) {
  if (context.request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        Allow: "POST, OPTIONS",
      },
    });
  }
  return Response.json({ ok: false, error: "Method not allowed." }, { status: 405 });
}

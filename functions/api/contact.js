/**
 * Cloudflare Pages Function — POST /api/contact
 *
 * Recommended binding:
 * - CONTACT_WEBHOOK_URL: HTTPS endpoint that receives the contact payload
 *
 * Optional binding:
 * - CONTACT_KV: KV namespace for backup message storage
 *
 * If neither is configured, returns 503.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SUBJECT_ALLOWLIST = new Set([
  "product-support",
  "partnerships",
  "privacy",
  "security",
  "other",
]);

export async function onRequestPost(context) {
  const { request, env } = context;

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const company = typeof body.company === "string" ? body.company.trim() : "";
  const subject = typeof body.subject === "string" ? body.subject.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (!name) {
    return Response.json({ ok: false, error: "Enter your name." }, { status: 400 });
  }

  if (!email || !EMAIL_RE.test(email)) {
    return Response.json({ ok: false, error: "Enter a valid email address." }, { status: 400 });
  }

  if (!SUBJECT_ALLOWLIST.has(subject)) {
    return Response.json({ ok: false, error: "Choose a valid subject." }, { status: 400 });
  }

  if (!message || message.length < 10 || message.length > 4000) {
    return Response.json({ ok: false, error: "Enter a message between 10 and 4000 characters." }, { status: 400 });
  }

  const webhook = env.CONTACT_WEBHOOK_URL;
  const kv = env.CONTACT_KV;

  if (!webhook && !kv) {
    return Response.json(
      {
        ok: false,
        error: "Contact form is not configured yet. Add CONTACT_WEBHOOK_URL or CONTACT_KV in Cloudflare Pages settings.",
      },
      { status: 503 }
    );
  }

  const ts = Date.now();
  const payload = { name, email, company, subject, message, ts };

  if (kv) {
    const key = `contact:${ts}:${crypto.randomUUID()}`;
    await kv.put(key, JSON.stringify(payload));
  }

  if (webhook) {
    try {
      const res = await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok && !kv) {
        return Response.json({ ok: false, error: "Could not send your message. Try again." }, { status: 502 });
      }
    } catch {
      if (!kv) {
        return Response.json({ ok: false, error: "Could not send your message. Try again." }, { status: 502 });
      }
    }
  }

  return Response.json({
    ok: true,
    message: "Thanks — your message is on its way.",
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

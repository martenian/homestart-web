/**
 * Waitlist: POST /api/waitlist { email }
 * Requires Cloudflare Pages Function + WAITLIST_KV (or WAITLIST_WEBHOOK_URL) in production.
 */

const form = document.getElementById("waitlist-form");
const emailInput = document.getElementById("waitlist-email");
const submitBtn = document.getElementById("waitlist-submit");
const statusEl = document.getElementById("waitlist-status");

if (form && emailInput && submitBtn && statusEl) {
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function setStatus(message, state) {
    statusEl.textContent = message || "";
    if (state) {
      statusEl.dataset.state = state;
    } else {
      delete statusEl.dataset.state;
    }
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    setStatus("");

    const raw = emailInput.value.trim();
    if (!raw || !emailRe.test(raw)) {
      setStatus("Enter a valid email address.", "error");
      emailInput.focus();
      return;
    }

    submitBtn.disabled = true;
    emailInput.disabled = true;
    setStatus("Sending…", "");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: raw.toLowerCase() }),
      });

      let data = {};
      try {
        data = await res.json();
      } catch {
        /* non-JSON */
      }

      if (res.ok && data.ok) {
        setStatus(data.message || "You're on the list.", "success");
        form.reset();
        return;
      }

      if (res.status === 503 || res.status === 501) {
        setStatus(
          data.error || "Waitlist isn’t configured yet. Check back soon, or email us.",
          "error"
        );
      } else {
        setStatus(data.error || "Something went wrong. Try again.", "error");
      }
    } catch {
      setStatus(
        "Couldn’t reach the server. If you’re running locally, deploy to Cloudflare Pages to test the waitlist.",
        "error"
      );
    } finally {
      if (!statusEl.dataset.state || statusEl.dataset.state !== "success") {
        submitBtn.disabled = false;
        emailInput.disabled = false;
      }
    }
  });
}

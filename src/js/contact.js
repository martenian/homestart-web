const form = document.getElementById("contact-form");
const submitBtn = document.getElementById("contact-submit");
const statusEl = document.getElementById("contact-status");

if (form && submitBtn && statusEl) {
  const fields = {
    name: document.getElementById("contact-name"),
    email: document.getElementById("contact-email"),
    company: document.getElementById("contact-company"),
    subject: document.getElementById("contact-subject"),
    message: document.getElementById("contact-message"),
  };

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function setStatus(message, state) {
    statusEl.textContent = message || "";
    if (state) {
      statusEl.dataset.state = state;
    } else {
      delete statusEl.dataset.state;
    }
  }

  function setDisabled(disabled) {
    submitBtn.disabled = disabled;
    Object.values(fields).forEach((field) => {
      if (field) field.disabled = disabled;
    });
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    setStatus("");

    const payload = {
      name: fields.name.value.trim(),
      email: fields.email.value.trim().toLowerCase(),
      company: fields.company.value.trim(),
      subject: fields.subject.value,
      message: fields.message.value.trim(),
    };

    if (!payload.name) {
      setStatus("Enter your name.", "error");
      fields.name.focus();
      return;
    }

    if (!payload.email || !emailRe.test(payload.email)) {
      setStatus("Enter a valid email address.", "error");
      fields.email.focus();
      return;
    }

    if (!payload.subject) {
      setStatus("Choose what your message is about.", "error");
      fields.subject.focus();
      return;
    }

    if (!payload.message || payload.message.length < 10) {
      setStatus("Add a little more detail so we can help.", "error");
      fields.message.focus();
      return;
    }

    setDisabled(true);
    setStatus("Sending…", "");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let data = {};
      try {
        data = await res.json();
      } catch {
        /* ignore non-JSON */
      }

      if (res.ok && data.ok) {
        setStatus(data.message || "Message sent.", "success");
        form.reset();
        return;
      }

      setStatus(data.error || "Something went wrong. Try again.", "error");
    } catch {
      setStatus("Couldn’t reach the server. Please try again or email us directly.", "error");
    } finally {
      if (statusEl.dataset.state !== "success") {
        setDisabled(false);
      }
    }
  });
}

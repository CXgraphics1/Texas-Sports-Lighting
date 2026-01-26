export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false });

  try {
    const {
      name, email, phone, organization, state, facility,
      projectType, timeline, message, website
    } = req.body || {};

    // honeypot (bots)
    if (typeof website === "string" && website.trim().length > 0) {
      return res.status(200).json({ ok: true });
    }

    if (!name || !email || !message) {
      return res.status(400).json({ ok: false, error: "Missing fields" });
    }

    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM, // e.g. "Texas Sports Lighting <no-reply@texassportslighting.com>"
        to: [process.env.CONTACT_TO_EMAIL],
        reply_to: email,
        subject: `New Quote Request — ${name}`,
        text:
`Name: ${name}
Email: ${email}
Phone: ${phone || ""}
Organization: ${organization || ""}
State: ${state || ""}
Facility: ${facility || ""}
Project Type: ${projectType || ""}
Timeline: ${timeline || ""}

Message:
${message || ""}`.trim(),
      }),
    });

    if (!resp.ok) {
      const t = await resp.text();
      return res.status(500).json({ ok: false, error: t });
    }

    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ ok: false, error: "Server error" });
  }
}

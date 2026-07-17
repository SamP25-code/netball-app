// Thin wrapper around Resend's HTTP API — no SDK needed for a single call.
// Silently no-ops (logging a warning) if not yet configured, so the
// availability check-in's in-app half keeps working even before
// RESEND_API_KEY / NOTIFICATIONS_FROM_EMAIL / the sending domain are set up.
export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.NOTIFICATIONS_FROM_EMAIL;

  if (!apiKey || !from) {
    console.warn(`sendEmail: RESEND_API_KEY/NOTIFICATIONS_FROM_EMAIL not set — skipped email to ${to}`);
    return;
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to, subject, html }),
  });

  if (!res.ok) {
    console.error(`sendEmail: failed to send to ${to} — ${res.status} ${await res.text()}`);
  }
}

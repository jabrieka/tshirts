import { Resend } from "resend";

/**
 * Lightweight notification email via Resend. Sending is best-effort: if
 * RESEND_API_KEY is not configured, or the send fails, we log and move on so a
 * form submission never breaks just because email is down. The database row is
 * always the source of truth.
 *
 * Env:
 *   RESEND_API_KEY  – enables sending (from your Resend dashboard)
 *   CONTACT_EMAIL   – where notifications go (defaults to the studio inbox)
 *   EMAIL_FROM      – verified sender; defaults to Resend's shared test sender,
 *                     which can only deliver to your own Resend account email.
 */
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export const CONTACT_EMAIL = process.env.CONTACT_EMAIL ?? "cosetteproductions@gmail.com";
const EMAIL_FROM = process.env.EMAIL_FROM ?? "Cosette Productions <onboarding@resend.dev>";

export const emailEnabled = Boolean(resend);

export async function sendNotificationEmail(opts: {
  subject: string;
  html: string;
  replyTo?: string;
}): Promise<void> {
  if (!resend) return; // email not configured — skip silently
  try {
    await resend.emails.send({
      from: EMAIL_FROM,
      to: CONTACT_EMAIL,
      subject: opts.subject,
      html: opts.html,
      ...(opts.replyTo ? { replyTo: opts.replyTo } : {}),
    });
  } catch (e) {
    console.error("Failed to send notification email:", e);
  }
}

/** Escapes user-supplied text before embedding in notification HTML. */
export function esc(s: string | null | undefined): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

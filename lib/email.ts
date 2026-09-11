import nodemailer from "nodemailer";

/**
 * Emails the app sends itself (today: invites), through the same mail account
 * Supabase uses for login links — see docs/learning/smtp.md. Server only.
 * Host and port default to Gmail, so only the account and its app password
 * have to be set.
 */
export async function sendEmail(message: {
  to: string;
  subject: string;
  html: string;
  text: string;
}) {
  const user = process.env.SMTP_USER;
  // Google shows app passwords in groups of four; the spaces aren't part of it.
  const pass = process.env.SMTP_PASSWORD?.replace(/\s+/g, "");
  if (!user || !pass) throw new Error("SMTP_USER and SMTP_PASSWORD must be set");
  const port = Number(process.env.SMTP_PORT ?? 587);

  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? "smtp.gmail.com",
    port,
    secure: port === 465, // 465 is encrypted from the start; 587 switches to it
    auth: { user, pass },
  });
  await transport.sendMail({ from: { name: "SiteTrack", address: user }, ...message });
}

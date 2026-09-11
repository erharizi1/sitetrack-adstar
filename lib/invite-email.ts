/**
 * The invite email, from docs/design/final-designs/invite/InviteEmail.dc.html.
 * The app sends it itself (actions/team.ts) instead of Supabase's "Invite user"
 * template, which this project kept replacing with Supabase's English default.
 */

/** Names and the project are typed by people, so they can't be trusted as HTML. */
function escape(value: string) {
  return value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

export function inviteEmail(input: {
  firstName: string;
  invitedBy: string;
  role: string;
  project: string;
  link: string;
}) {
  const e = Object.fromEntries(
    Object.entries(input).map(([key, value]) => [key, escape(value)]),
  ) as typeof input;

  return {
    subject: `${input.invitedBy} të ftoi në SiteTrack`,
    html: `<div style="background:#F1F4F8;padding:24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1F2937;">
  <div style="max-width:520px;margin:0 auto;background:#FFFFFF;border:1px solid #E5E7EB;border-radius:16px;padding:36px;">
    <div style="font-size:16px;font-weight:700;margin:0 0 20px;">SiteTrack</div>
    <p style="font-size:18px;font-weight:600;margin:0 0 20px;">Përshëndetje ${e.firstName},</p>
    <p style="font-size:15px;line-height:1.6;margin:0 0 20px;">
      ${e.invitedBy} të shtoi si <strong>${e.role}</strong> në projektin
      <strong>${e.project}</strong>. Shtyp butonin për të hyrë — nuk të duhet fjalëkalim.
    </p>
    <a href="${e.link}"
       style="display:inline-block;background:#2563EB;color:#FFFFFF;text-decoration:none;font-size:15px;font-weight:600;padding:14px 28px;border-radius:12px;">
      Hyr në SiteTrack
    </a>
    <p style="font-size:13px;line-height:1.5;color:#6B7280;margin:20px 0 0;">
      Linku vlen 24 orë dhe përdoret vetëm një herë. Nëse skadon, kërkoji atij që të ftoi ta dërgojë sërish.
    </p>
    <div style="height:1px;background:#E5E7EB;margin:20px 0;"></div>
    <p style="font-size:12.5px;color:#6B7280;margin:0;">Nuk e prisje këtë email? Mund ta injorosh.</p>
  </div>
</div>`,
    // Plain-text copy for mail apps that don't show HTML (and fewer spam flags).
    text: [
      `Përshëndetje ${input.firstName},`,
      "",
      `${input.invitedBy} të shtoi si ${input.role} në projektin ${input.project}.`,
      "Hap këtë link për të hyrë në SiteTrack — nuk të duhet fjalëkalim:",
      input.link,
      "",
      "Linku vlen 24 orë dhe përdoret vetëm një herë. Nëse skadon, kërkoji atij që të ftoi ta dërgojë sërish.",
    ].join("\n"),
  };
}

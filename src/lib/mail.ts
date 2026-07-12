import { formatCHF, Order } from "./types";

/**
 * E-Mail-Versand über Resend (https://resend.com) — per HTTP, ohne SDK.
 * Ohne RESEND_API_KEY läuft der Demo-Modus: Mail wird geloggt statt versendet.
 *
 * Env:
 *   RESEND_API_KEY      re_...
 *   MAIL_FROM           "JIZAI <bestellung@jizai.ch>"  (Domain in Resend verifizieren;
 *                       zum Testen geht "JIZAI <onboarding@resend.dev>")
 *   ORDER_NOTIFY_EMAIL  optional — erhält bei jeder Bestellung eine Kopie
 */

interface MailResult {
  sent: boolean;
  demo?: boolean;
  error?: string;
}

async function sendMail(to: string, subject: string, html: string): Promise<MailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log(`[mail:demo] An: ${to} — ${subject}`);
    return { sent: false, demo: true };
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.MAIL_FROM || "JIZAI <onboarding@resend.dev>",
        to: [to],
        subject,
        html,
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      console.error("[mail] Resend-Fehler:", res.status, body);
      return { sent: false, error: `Resend ${res.status}` };
    }
    return { sent: true };
  } catch (e) {
    console.error("[mail] Versand fehlgeschlagen:", e);
    return { sent: false, error: String(e) };
  }
}

/* ---------- Bestellbestätigung ---------- */

export function renderOrderEmail(order: Order): string {
  const rows = order.items
    .map(
      (i) => `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #ddd5c4;font-size:14px;color:#242424;">
          JIZAI ${i.name} <span style="color:#9A958B;">— Grösse ${i.size} · ${i.qty}×</span>
        </td>
        <td style="padding:12px 0;border-bottom:1px solid #ddd5c4;font-size:14px;color:#242424;text-align:right;white-space:nowrap;">
          ${formatCHF(i.priceRappen * i.qty)}
        </td>
      </tr>`
    )
    .join("");

  const itemsTotal = order.items.reduce((s, i) => s + i.qty * i.priceRappen, 0);
  const shipping = order.totalRappen - itemsTotal;

  return `<!DOCTYPE html>
<html lang="de">
<body style="margin:0;padding:0;background:#E9E2D6;font-family:Helvetica,Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px;">

    <div style="text-align:center;padding-bottom:28px;">
      <div style="font-size:26px;letter-spacing:10px;color:#242424;font-weight:bold;">JIZAI</div>
      <div style="font-size:11px;letter-spacing:5px;color:#9A958B;padding-top:4px;">ジザイ · BEGIN BEFORE THE NOISE</div>
    </div>

    <div style="background:#faf7f1;border:1px solid #ddd5c4;border-radius:10px;padding:32px 28px;">
      <div style="display:inline-block;background:#8C2F24;color:#E9E2D6;font-size:11px;letter-spacing:2px;padding:6px 12px;border-radius:99px;">
        BESTELLUNG BESTÄTIGT
      </div>

      <h1 style="font-size:22px;color:#242424;margin:18px 0 6px;">Danke, ${escapeHtml(order.name)}.</h1>
      <p style="font-size:14px;color:#6b665c;line-height:1.6;margin:0 0 22px;">
        Deine Bestellung <strong style="color:#242424;">${order.id}</strong> ist bei uns eingegangen.
        Wir packen dein Stück mit Ruhe und Sorgfalt — du hörst von uns, sobald es unterwegs ist.
      </p>

      <table style="width:100%;border-collapse:collapse;">
        ${rows}
        <tr>
          <td style="padding:12px 0 4px;font-size:13px;color:#9A958B;">Versand (CH)</td>
          <td style="padding:12px 0 4px;font-size:13px;color:#9A958B;text-align:right;">${formatCHF(shipping)}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;font-size:15px;color:#242424;font-weight:bold;">Total</td>
          <td style="padding:10px 0;font-size:15px;color:#242424;font-weight:bold;text-align:right;">${formatCHF(order.totalRappen)}</td>
        </tr>
      </table>

      <div style="margin-top:22px;padding-top:18px;border-top:1px solid #ddd5c4;">
        <div style="font-size:11px;letter-spacing:2px;color:#8C2F24;padding-bottom:6px;">LIEFERADRESSE</div>
        <p style="font-size:14px;color:#242424;line-height:1.6;margin:0;">
          ${escapeHtml(order.name)}<br>
          ${escapeHtml(order.street)}<br>
          ${escapeHtml(order.zip)} ${escapeHtml(order.city)}
        </p>
      </div>
    </div>

    <p style="text-align:center;font-size:12px;color:#9A958B;font-style:italic;padding-top:26px;margin:0;">
      First the form. Then the freedom. · 自在
    </p>
    <p style="text-align:center;font-size:11px;color:#b3ada0;padding-top:8px;margin:0;">
      JIZAI · Liestal, Schweiz · hello@jizai.ch
    </p>
  </div>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Bestätigung an Kund:in + optionale Kopie an den Shop. Fehler blockieren die Bestellung nie. */
export async function sendOrderConfirmation(order: Order): Promise<MailResult> {
  const result = await sendMail(
    order.email,
    `Deine JIZAI-Bestellung ${order.id} — Begin before the noise.`,
    renderOrderEmail(order)
  );

  const notify = process.env.ORDER_NOTIFY_EMAIL;
  if (notify) {
    const items = order.items.map((i) => `${i.qty}× ${i.name} (${i.size})`).join(", ");
    await sendMail(
      notify,
      `Neue Bestellung ${order.id} — ${formatCHF(order.totalRappen)}`,
      `<p>${escapeHtml(order.name)} (${escapeHtml(order.email)}) hat bestellt:</p>
       <p><strong>${escapeHtml(items)}</strong></p>
       <p>Total: <strong>${formatCHF(order.totalRappen)}</strong><br>
       ${escapeHtml(order.street)}, ${escapeHtml(order.zip)} ${escapeHtml(order.city)}</p>`
    );
  }
  return result;
}

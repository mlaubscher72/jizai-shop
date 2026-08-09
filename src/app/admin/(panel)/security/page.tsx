import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import QRCode from "qrcode";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { formatSecret, otpauthUrl } from "@/lib/totp";
import { confirmTotpAction, disableTotpAction, startTotpSetupAction } from "../../actions";

export const dynamic = "force-dynamic";

export default async function SecurityPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; off?: string; error?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  const { ok, off, error } = await searchParams;

  /* Root-Zugang hat keinen Datenbank-Eintrag — 2FA gilt für persönliche Konten */
  if (session.email === "root") {
    return (
      <main className="admin-content">
        <header className="admin-head">
          <h1>Sicherheit</h1>
        </header>
        <div className="admin-alert">
          <strong>Du bist über den Root-Zugang angemeldet.</strong> Zwei-Faktor-Authentifizierung
          gilt für persönliche Konten. Melde dich mit deinem eigenen Account an
          (E-Mail + Passwort), um 2FA einzurichten.
        </div>
      </main>
    );
  }

  const user = await db.getUserByEmail(session.email);
  const enabled = Boolean(user?.totpSecret);

  const store = await cookies();
  const setupSecret = store.get("jizai_totp_setup")?.value;
  const qr = setupSecret
    ? await QRCode.toDataURL(otpauthUrl(setupSecret, session.email), {
        margin: 1,
        width: 220,
        color: { dark: "#171614", light: "#E9E2D6" },
      })
    : null;

  return (
    <main className="admin-content">
      <header className="admin-head">
        <h1>Sicherheit</h1>
        <p className="admin-mode">
          Zwei-Faktor-Authentifizierung für <strong>{session.email}</strong>
        </p>
      </header>

      {ok && <div className="admin-alert sec-ok"><strong>2FA ist aktiv.</strong> Ab dem nächsten Login brauchst du zusätzlich den Code aus deiner App.</div>}
      {off && <div className="admin-alert"><strong>2FA wurde deaktiviert.</strong></div>}
      {error === "code" && <div className="admin-alert"><strong>Code stimmt nicht.</strong> Prüfe, ob die Uhrzeit deines Geräts korrekt ist, und versuch es mit dem aktuellen Code nochmal.</div>}
      {error === "nosetup" && <div className="admin-alert"><strong>Einrichtung abgelaufen.</strong> Bitte neu starten.</div>}
      {error === "migration" && (
        <div className="admin-alert">
          <strong>Datenbank noch nicht bereit.</strong> Führe einmalig{" "}
          <code>supabase/migration-2fa.sql</code> im Supabase SQL-Editor aus, dann
          funktioniert die Einrichtung.
        </div>
      )}

      <section className="admin-section">
        <div className="sec-status">
          <span className={`badge ${enabled ? "badge-paid" : "badge-pending"}`}>
            {enabled ? "2FA aktiv" : "2FA nicht aktiv"}
          </span>
        </div>

        {/* ---- Bereits aktiv: abschalten mit gültigem Code ---- */}
        {enabled && !setupSecret && (
          <div className="sec-box">
            <p>
              Dein Konto ist mit einer Authenticator-App geschützt. Beim Login wird nach
              dem Passwort ein 6-stelliger Code verlangt.
            </p>
            <form action={disableTotpAction} className="sec-form">
              <label>
                <span>Aktueller Code zum Abschalten</span>
                <input type="text" name="code" required inputMode="numeric" pattern="[0-9]{6}"
                  maxLength={6} placeholder="000000" />
              </label>
              <button type="submit" className="btn-ghost btn-small" data-hover>
                2FA deaktivieren
              </button>
            </form>
          </div>
        )}

        {/* ---- Einrichtung läuft: QR anzeigen und bestätigen ---- */}
        {setupSecret && (
          <div className="sec-box">
            <ol className="sec-steps">
              <li>
                Installiere eine Authenticator-App, falls noch nicht vorhanden
                (Google Authenticator, 1Password, Authy, Microsoft Authenticator).
              </li>
              <li>Scanne diesen QR-Code mit der App:</li>
            </ol>
            {qr && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={qr} alt="QR-Code für die Authenticator-App" className="sec-qr" />
            )}
            <p className="sec-manual">
              Kein Scanner zur Hand? Secret manuell eintragen:
              <code>{formatSecret(setupSecret)}</code>
            </p>
            <form action={confirmTotpAction} className="sec-form">
              <label>
                <span>Code aus der App zur Bestätigung</span>
                <input type="text" name="code" required autoFocus inputMode="numeric"
                  pattern="[0-9]{6}" maxLength={6} placeholder="000000" />
              </label>
              <button type="submit" className="btn-seal btn-small" data-hover>
                2FA aktivieren
              </button>
            </form>
          </div>
        )}

        {/* ---- Noch nicht aktiv: starten ---- */}
        {!enabled && !setupSecret && (
          <div className="sec-box">
            <p>
              Mit 2FA reicht ein gestohlenes Passwort allein nicht mehr aus — beim Login
              wird zusätzlich ein Code aus deiner Authenticator-App verlangt, der alle
              30 Sekunden wechselt.
            </p>
            <form action={startTotpSetupAction}>
              <button type="submit" className="btn-seal btn-small" data-hover>
                2FA einrichten
              </button>
            </form>
          </div>
        )}
      </section>

      <section className="admin-section">
        <h2 className="au-subhead">Falls du dein Gerät verlierst</h2>
        <p className="sec-note">
          Der Root-Zugang (E-Mail-Feld leer + <code>ADMIN_PASSWORD</code>) ist dein
          Notausgang — er verlangt kein 2FA. Wenn du ihn mit
          <code>ADMIN_ROOT_LOGIN=off</code> abgeschaltet hast, kannst du ihn im
          Vercel-Dashboard unter Settings → Environment Variables jederzeit wieder
          aktivieren. Danach anmelden und hier 2FA neu einrichten.
        </p>
      </section>
    </main>
  );
}

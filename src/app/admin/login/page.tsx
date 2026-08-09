import { redirect } from "next/navigation";
import { getPendingTotp, isAdmin } from "@/lib/auth";
import { loginAction, verifyTotpAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminLogin({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; locked?: string; step?: string }>;
}) {
  if (await isAdmin()) redirect("/admin");
  const { error, locked, step } = await searchParams;
  const lockedSeconds = Number(locked) || 0;

  const pendingEmail = step === "2" ? await getPendingTotp() : null;
  if (step === "2" && !pendingEmail) redirect("/admin/login");

  const lockNote = lockedSeconds > 0 && (
    <p className="checkout-error">
      Zu viele Fehlversuche. Bitte {Math.ceil(lockedSeconds / 60)} Min warten.
    </p>
  );

  /* ---- Schritt 2: Code aus der Authenticator-App ---- */
  if (pendingEmail) {
    return (
      <main className="admin-login">
        <form action={verifyTotpAction} className="admin-login-card">
          <div className="admin-login-head">
            <span className="admin-seal">自在</span>
            <h1>Bestätigung</h1>
            <p>Zwei-Faktor-Code</p>
          </div>
          <p className="admin-login-hint" style={{ textAlign: "left" }}>
            Öffne deine Authenticator-App und gib den aktuellen 6-stelligen Code
            für <strong>{pendingEmail}</strong> ein.
          </p>
          <label>
            <span>Code</span>
            <input
              type="text"
              name="code"
              required
              autoFocus
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength={6}
              placeholder="000000"
              style={{ letterSpacing: "0.4em", textAlign: "center", fontSize: 20 }}
            />
          </label>
          {error && <p className="checkout-error">Code ungültig oder abgelaufen.</p>}
          {lockNote}
          <button type="submit" className="btn-seal" data-hover>
            Bestätigen
          </button>
          <p className="admin-login-hint">
            <a href="/admin/login">← Zurück zum Login</a>
          </p>
        </form>
      </main>
    );
  }

  /* ---- Schritt 1: E-Mail + Passwort ---- */
  return (
    <main className="admin-login">
      <form action={loginAction} className="admin-login-card">
        <div className="admin-login-head">
          <span className="admin-seal">自在</span>
          <h1>JIZAI Studio</h1>
          <p>Admin-Zugang</p>
        </div>
        <label>
          <span>E-Mail</span>
          <input type="email" name="email" placeholder="du@jizai.ch" autoComplete="username" autoFocus />
        </label>
        <label>
          <span>Passwort</span>
          <input type="password" name="password" required placeholder="••••••••" autoComplete="current-password" />
        </label>
        {error && <p className="checkout-error">Login fehlgeschlagen — E-Mail oder Passwort prüfen.</p>}
        {lockNote}
        <button type="submit" className="btn-seal" data-hover>
          Anmelden
        </button>
        <p className="admin-login-hint">
          Root-Zugang: E-Mail leer lassen und das <code>ADMIN_PASSWORD</code> verwenden.
        </p>
      </form>
    </main>
  );
}

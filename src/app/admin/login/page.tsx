import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { loginAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminLogin({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await isAdmin()) redirect("/admin");
  const { error } = await searchParams;

  return (
    <main className="admin-login">
      <form action={loginAction} className="admin-login-card">
        <div className="admin-login-head">
          <span className="admin-seal">自在</span>
          <h1>JIZAI Studio</h1>
          <p>Admin-Zugang</p>
        </div>
        <label>
          <span>Passwort</span>
          <input type="password" name="password" required autoFocus placeholder="••••••••" />
        </label>
        {error && <p className="checkout-error">Falsches Passwort.</p>}
        <button type="submit" className="btn-seal" data-hover>
          Anmelden
        </button>
        <p className="admin-login-hint">
          Demo-Passwort: <code>jizai2026</code> — für Produktion <code>ADMIN_PASSWORD</code> setzen.
        </p>
      </form>
    </main>
  );
}

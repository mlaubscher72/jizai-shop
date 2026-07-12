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
          <span>E-Mail</span>
          <input type="email" name="email" placeholder="du@jizai.ch" autoComplete="username" autoFocus />
        </label>
        <label>
          <span>Passwort</span>
          <input type="password" name="password" required placeholder="••••••••" autoComplete="current-password" />
        </label>
        {error && <p className="checkout-error">Login fehlgeschlagen — E-Mail oder Passwort prüfen.</p>}
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

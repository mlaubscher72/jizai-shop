import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession, roleAtLeast } from "@/lib/auth";
import { ROLE_LABEL, AdminRole } from "@/lib/types";
import { createUserAction, deleteUserAction, updateUserAction } from "../../actions";

export const dynamic = "force-dynamic";

const ROLES: AdminRole[] = ["viewer", "manager", "admin"];

const ROLE_DESC: Record<AdminRole, string> = {
  admin: "Alles, inkl. Benutzerverwaltung",
  manager: "Produkte, Bestände und Bestellungen bearbeiten",
  viewer: "Nur ansehen — keine Änderungen",
};

export default async function AdminUsers() {
  const session = await getSession();
  if (!session || !roleAtLeast(session.role, "admin")) redirect("/admin");

  const users = await db.getUsers();

  return (
    <main className="admin-content">
      <header className="admin-head">
        <h1>Benutzer</h1>
        <p className="admin-mode">
          Rollen: Admin (alles) · Manager (Produkte &amp; Bestellungen) · Viewer (nur lesen).
          Der Root-Zugang über <code>ADMIN_PASSWORD</code> bleibt als Rettungsanker immer aktiv.
        </p>
      </header>

      <section className="admin-section">
        <h2 className="au-subhead">Neuen Benutzer anlegen</h2>
        <form action={createUserAction} className="au-create">
          <label>
            <span>Name</span>
            <input type="text" name="name" required placeholder="Yuki Tanaka" />
          </label>
          <label>
            <span>E-Mail</span>
            <input type="email" name="email" required placeholder="yuki@jizai.ch" />
          </label>
          <label>
            <span>Passwort (min. 8)</span>
            <input type="password" name="password" required minLength={8} placeholder="••••••••" />
          </label>
          <label>
            <span>Rolle</span>
            <select name="role" defaultValue="manager">
              {ROLES.map((r) => (
                <option key={r} value={r}>{ROLE_LABEL[r]}</option>
              ))}
            </select>
          </label>
          <button type="submit" className="btn-seal btn-small" data-hover>Anlegen</button>
        </form>
        <ul className="au-roles-info">
          {ROLES.map((r) => (
            <li key={r}><strong>{ROLE_LABEL[r]}:</strong> {ROLE_DESC[r]}</li>
          ))}
        </ul>
      </section>

      <section className="admin-section">
        <h2 className="au-subhead">{users.length} Benutzer</h2>
        {users.length === 0 ? (
          <p className="admin-empty">
            Noch keine Benutzer — du bist über den Root-Zugang angemeldet. Lege oben deinen
            persönlichen Admin-Account an.
          </p>
        ) : (
          <div className="au-list">
            {users.map((u) => (
              <div className="au-row" key={u.id}>
                <div className="au-id">
                  <strong>{u.name}</strong>
                  <span>{u.email}</span>
                </div>
                <form action={updateUserAction} className="au-edit">
                  <input type="hidden" name="id" value={u.id} />
                  <label>
                    <span>Rolle</span>
                    <select name="role" defaultValue={u.role}>
                      {ROLES.map((r) => (
                        <option key={r} value={r}>{ROLE_LABEL[r]}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span>Neues Passwort (optional)</span>
                    <input type="password" name="password" minLength={8} placeholder="unverändert" />
                  </label>
                  <button type="submit" className="btn-ghost btn-small" data-hover>Speichern</button>
                </form>
                <form action={deleteUserAction}>
                  <input type="hidden" name="id" value={u.id} />
                  <button type="submit" className="au-delete" data-hover
                    disabled={u.email === session.email}
                    title={u.email === session.email ? "Eigener Account" : "Benutzer löschen"}>
                    Löschen
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

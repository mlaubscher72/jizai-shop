import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { logoutAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAdmin())) redirect("/admin/login");

  return (
    <div className="admin-shell">
      <aside className="admin-side">
        <div className="admin-side-brand">
          <span className="admin-seal">自在</span>
          <div>
            <strong>JIZAI Studio</strong>
            <p>Backoffice</p>
          </div>
        </div>
        <nav className="admin-nav">
          <Link href="/admin" data-hover>Dashboard</Link>
          <Link href="/admin/products" data-hover>Produkte</Link>
          <Link href="/admin/orders" data-hover>Bestellungen</Link>
          <Link href="/admin/waitlist" data-hover>Waitlist</Link>
        </nav>
        <div className="admin-side-foot">
          <Link href="/" data-hover>← Zur Website</Link>
          <form action={logoutAction}>
            <button type="submit" data-hover>Abmelden</button>
          </form>
        </div>
      </aside>
      <div className="admin-main">{children}</div>
    </div>
  );
}

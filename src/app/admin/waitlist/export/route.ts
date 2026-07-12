import { db } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

export async function GET() {
  if (!(await isAdmin())) {
    return new Response("Nicht autorisiert", { status: 401 });
  }
  const waitlist = await db.getWaitlist();
  const csv = ["email,angemeldet_am", ...waitlist.map((w) => `${w.email},${w.createdAt}`)].join("\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="jizai-waitlist.csv"`,
    },
  });
}

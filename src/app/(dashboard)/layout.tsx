import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Ensure a row exists in our app users table (Supabase Auth stores users in
  // auth.users, which is separate from our domain schema).
  const existingUser = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);

  if (existingUser.length === 0) {
    await db.insert(users).values({
      id: user.id,
      email: user.email!,
      fullName: user.user_metadata?.full_name ?? user.email!,
    });
  }

  return <AppShell>{children}</AppShell>;
}

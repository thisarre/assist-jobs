import { createClient } from "@/lib/supabase/server";

/**
 * Returns the authenticated Supabase user, or null.
 * Centralizes the createClient() + getUser() boilerplate used by every
 * user-scoped server action and page query.
 */
export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

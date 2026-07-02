"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { profileSchema } from "@/features/settings/schemas/profile";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function updateProfile(formData: unknown) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const parsed = profileSchema.safeParse(formData);

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  try {
    await db
      .update(users)
      .set({
        profile: parsed.data,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    revalidatePath("/settings");
    return { success: true };
  } catch {
    return { error: "Failed to update profile" };
  }
}

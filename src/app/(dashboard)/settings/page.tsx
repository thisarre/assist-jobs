import { createClient } from "@/lib/supabase/server";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ProfileForm } from "@/features/settings/components/profile-form";
import type { ProfileFormData } from "@/features/settings/schemas/profile";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile: ProfileFormData | null = null;

  if (user) {
    const result = await db
      .select({ profile: users.profile })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);

    if (result.length > 0 && result[0].profile) {
      profile = result[0].profile as ProfileFormData;
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
      <p className="mt-2 text-muted-foreground">
        Your freelance profile. This data is used by the AI to personalize
        analysis and outreach.
      </p>
      <div className="mt-8">
        <ProfileForm initialData={profile} />
      </div>
    </div>
  );
}

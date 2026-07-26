import { z } from "zod";
import { companyProfileSchema } from "@/domain/company-profile";
import { requireUser } from "@/lib/auth";
import { getCompanyProfile, listCompanyProfiles, saveCompanyProfile } from "@/lib/company-profile";

const saveProfileSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1).max(120),
  profile: companyProfileSchema,
});

function canEdit(role: string | null, platformRole: string | null) {
  return platformRole === "platform_admin"
    || role === "organization_owner"
    || role === "organization_admin";
}

export async function GET(request: Request) {
  const user = await requireUser();
  if (!user.organizationId) return Response.json({ error: "Organization required" }, { status: 400 });
  const profileId = new URL(request.url).searchParams.get("profileId") ?? undefined;
  return Response.json({
    data: profileId
      ? await getCompanyProfile(user.organizationId, profileId)
      : await listCompanyProfiles(user.organizationId),
  });
}

export async function PUT(request: Request) {
  const user = await requireUser();
  if (!user.organizationId || !canEdit(user.organizationRole, user.platformRole)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await request.json();
  const parsed = saveProfileSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid profile", issues: parsed.error.issues }, { status: 400 });
  }
  const saved = await saveCompanyProfile({
    organizationId: user.organizationId,
    userId: user.id,
    name: parsed.data.name,
    profileId: parsed.data.id,
    profile: parsed.data.profile,
  });
  return Response.json({ data: saved });
}

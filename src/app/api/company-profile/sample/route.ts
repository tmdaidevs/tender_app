import { sampleCompanyProfile } from "@/domain/company-profile";
import { requireUser } from "@/lib/auth";
import { listCompanyProfiles, saveCompanyProfile } from "@/lib/company-profile";

function canEdit(role: string | null, platformRole: string | null) {
  return platformRole === "platform_admin"
    || role === "organization_owner"
    || role === "organization_admin";
}

export async function POST() {
  const user = await requireUser();
  if (!user.organizationId || !canEdit(user.organizationRole, user.platformRole)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }
  const existing = await listCompanyProfiles(user.organizationId);
  const sampleCount = existing.filter((profile) => profile.isSample).length;
  const saved = await saveCompanyProfile({
    organizationId: user.organizationId,
    userId: user.id,
    name: `Sample Profile ${sampleCount + 1}`,
    profile: sampleCompanyProfile,
    isSample: true,
  });
  return Response.json({ data: saved }, { status: 201 });
}

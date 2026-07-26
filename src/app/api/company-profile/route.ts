import { companyProfileSchema } from "@/domain/company-profile";
import { requireUser } from "@/lib/auth";
import { getCompanyProfile, saveCompanyProfile } from "@/lib/company-profile";

function canEdit(role: string | null, platformRole: string | null) {
  return platformRole === "platform_admin"
    || role === "organization_owner"
    || role === "organization_admin";
}

export async function GET() {
  const user = await requireUser();
  if (!user.organizationId) return Response.json({ error: "Organization required" }, { status: 400 });
  return Response.json({ data: await getCompanyProfile(user.organizationId) });
}

export async function PUT(request: Request) {
  const user = await requireUser();
  if (!user.organizationId || !canEdit(user.organizationRole, user.platformRole)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await request.json();
  const parsed = companyProfileSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid profile", issues: parsed.error.issues }, { status: 400 });
  }
  const saved = await saveCompanyProfile({
    organizationId: user.organizationId,
    userId: user.id,
    profile: parsed.data,
  });
  return Response.json({ data: saved });
}

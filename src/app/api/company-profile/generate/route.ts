import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { generateCompanyProfile } from "@/lib/ai/company-profile";

export const maxDuration = 300;

const websiteListSchema = z.array(z.string().url()).max(3);

function canEdit(role: string | null, platformRole: string | null) {
  return platformRole === "platform_admin"
    || role === "organization_owner"
    || role === "organization_admin";
}

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user.organizationId || !user.organizationName || !canEdit(user.organizationRole, user.platformRole)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const formData = await request.formData();
    const websitesValue = formData.get("websites");
    const websites = websiteListSchema.parse(
      typeof websitesValue === "string" ? JSON.parse(websitesValue) : [],
    );
    const files = formData.getAll("documents").filter((value): value is File => value instanceof File);
    if (websites.length === 0 && files.length === 0) {
      return Response.json({ error: "Add at least one website or PDF" }, { status: 400 });
    }
    if (files.length > 5) {
      return Response.json({ error: "Upload no more than five PDFs" }, { status: 400 });
    }
    let totalBytes = 0;
    const pdfs = await Promise.all(files.map(async (file) => {
      if (file.type !== "application/pdf") throw new Error(`${file.name} is not a PDF`);
      if (file.size > 4_000_000) throw new Error(`${file.name} exceeds 4 MB`);
      totalBytes += file.size;
      if (totalBytes > 4_000_000) throw new Error("Combined PDF size exceeds 4 MB");
      const bytes = Buffer.from(await file.arrayBuffer());
      if (bytes.subarray(0, 5).toString("ascii") !== "%PDF-") throw new Error(`${file.name} is not a valid PDF`);
      return { name: file.name.slice(0, 255), mediaType: "application/pdf" as const, bytes };
    }));
    const result = await generateCompanyProfile({
      organizationId: user.organizationId,
      userId: user.id,
      organizationName: user.organizationName,
      websiteUrls: websites,
      pdfs,
    });
    return Response.json({ data: result });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Profile generation failed" },
      { status: 400 },
    );
  }
}

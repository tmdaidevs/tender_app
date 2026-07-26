import { requireUser } from "@/lib/auth";
import { enrichTender } from "@/lib/ai/tender-enrichment";

export const maxDuration = 300;

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await requireUser();
  if (user.platformRole !== "platform_admin") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  try {
    const generation = await enrichTender(id);
    return Response.json({ data: generation });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Enrichment failed" },
      { status: 500 },
    );
  }
}

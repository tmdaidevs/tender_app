import { getTenderById } from "@/lib/tenders";
import { getLatestTenderEnrichment } from "@/lib/ai/tender-enrichment";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const [tender, enrichment] = await Promise.all([
      getTenderById(id),
      getLatestTenderEnrichment(id),
    ]);
    if (!tender) {
      return Response.json({ error: "Tender not found" }, { status: 404 });
    }
    return Response.json({ data: tender, enrichment });
  } catch {
    return Response.json({ error: "Invalid tender identifier" }, { status: 400 });
  }
}

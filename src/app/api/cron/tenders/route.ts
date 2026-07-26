import { syncTedTenders } from "@/connectors/ted";
import { enrichNextTender } from "@/lib/ai/tender-enrichment";

export const maxDuration = 300;

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");

  if (!cronSecret || authorization !== `Bearer ${cronSecret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const synchronization = await syncTedTenders(100);
  let enrichment: Awaited<ReturnType<typeof enrichNextTender>> | { error: string };
  try {
    enrichment = await enrichNextTender();
  } catch (error) {
    enrichment = {
      error: error instanceof Error ? error.message : "Unknown enrichment error",
    };
  }

  return Response.json({
    data: {
      source: "Tenders Electronic Daily (TED)",
      persisted: true,
      synchronizedAt: new Date().toISOString(),
      ...synchronization,
      enrichment,
    },
  });
}

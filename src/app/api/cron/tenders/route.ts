import { syncTedTenders } from "@/connectors/ted";

export const maxDuration = 60;

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");

  if (!cronSecret || authorization !== `Bearer ${cronSecret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const synchronization = await syncTedTenders(100);

  return Response.json({
    data: {
      source: "Tenders Electronic Daily (TED)",
      persisted: true,
      synchronizedAt: new Date().toISOString(),
      ...synchronization,
    },
  });
}

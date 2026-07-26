import { NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { syncTedTenders } from "@/connectors/ted";

function isTrustedOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  return origin === null || origin === request.nextUrl.origin;
}

export async function POST(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const bearer = request.headers.get("authorization");
  const cronAuthorized = Boolean(cronSecret && bearer === `Bearer ${cronSecret}`);
  const user = await getSessionUser();
  const userAuthorized = user?.platformRole === "platform_admin" && isTrustedOrigin(request);

  if (!cronAuthorized && !userAuthorized) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await syncTedTenders(100);
  return Response.json({ data: result, source: "TED", officialSource: true });
}

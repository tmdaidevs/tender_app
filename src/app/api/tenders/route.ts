import { NextRequest } from "next/server";
import { listTenders, listTenderSourceStatuses } from "@/lib/tenders";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") ?? "";
  const countryValue = request.nextUrl.searchParams.get("country");
  const country = countryValue === "DE" || countryValue === "AT" || countryValue === "CH"
    ? countryValue
    : undefined;
  const limit = Number(request.nextUrl.searchParams.get("limit") ?? 30);

  const [tenders, sources] = await Promise.all([
    listTenders({
      q,
      country,
      limit: Number.isFinite(limit) ? limit : 30,
    }),
    listTenderSourceStatuses(),
  ]);
  return Response.json({
    data: tenders,
    meta: { count: tenders.length, sources },
  });
}

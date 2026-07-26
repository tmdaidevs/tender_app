import { NextRequest } from "next/server";
import {
  listTenders,
  listTenderSourceStatuses,
  tenderListInputSchema,
} from "@/lib/tenders";

export async function GET(request: NextRequest) {
  const values = request.nextUrl.searchParams;
  const parsed = tenderListInputSchema.safeParse({
    q: values.get("q") ?? "",
    countries: values.getAll("country"),
    sources: values.getAll("source"),
    buyer: values.get("buyer") ?? "",
    cpv: values.get("cpv") ?? "",
    publishedFrom: values.get("publishedFrom") || undefined,
    publishedTo: values.get("publishedTo") || undefined,
    deadlineFrom: values.get("deadlineFrom") || undefined,
    deadlineTo: values.get("deadlineTo") || undefined,
    minValue: values.get("minValue") ? Number(values.get("minValue")) : undefined,
    maxValue: values.get("maxValue") ? Number(values.get("maxValue")) : undefined,
    currency: values.get("currency") || undefined,
    valueAvailability: values.get("valueAvailability") || "all",
    deadlineAvailability: values.get("deadlineAvailability") || "all",
    sort: values.get("sort") || "deadline_asc",
    limit: Number(values.get("limit") ?? 30),
  });
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid tender filters", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const [tenders, sources] = await Promise.all([
    listTenders(parsed.data),
    listTenderSourceStatuses(),
  ]);
  return Response.json({
    data: tenders,
    meta: { count: tenders.length, sources },
  });
}

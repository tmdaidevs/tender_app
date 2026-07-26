import { getTenderById } from "@/lib/tenders";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const tender = await getTenderById(id);
    if (!tender) {
      return Response.json({ error: "Tender not found" }, { status: 404 });
    }
    return Response.json({ data: tender });
  } catch {
    return Response.json({ error: "Invalid tender identifier" }, { status: 400 });
  }
}

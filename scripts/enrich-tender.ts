import { z } from "zod";
import { enrichTender } from "@/lib/ai/tender-enrichment";
import { getDb } from "@/lib/db";

const sourceIdentifier = z.string().trim().min(1).parse(process.argv[2]);
const rows = await getDb()`
  select id
  from tenders
  where source_identifier = ${sourceIdentifier}
    and lane = 'public_import'
  limit 1
`;
if (!rows[0]) throw new Error(`Tender ${sourceIdentifier} was not found`);

const result = await enrichTender(String(rows[0].id));
console.log(JSON.stringify({
  sourceIdentifier,
  generationId: result.id,
  reused: result.reused,
}));

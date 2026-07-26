# Canonical tender model

TenderLoop exposes public tender details through one source-neutral contract:
`CanonicalTender`, validated by `src/domain/canonical-tender.ts`. The detail
endpoint is `GET /api/tenders/{id}` and currently returns schema version `1.0`.

Every connector must map its upstream response into these sections:

- core opportunity: title, summary, notice type, status and lane;
- buyer: normalized buyer identity;
- classifications and places of performance;
- disclosed value and currency;
- publication, deadline, retrieval and update dates;
- official source identity, notice identifier and official notice URL;
- provenance: immutable version number, timestamp and content hash.

The complete upstream response is retained under `source.record`. This preserves
source evidence and fields not yet promoted into the normalized model. UI and
matching logic must use normalized fields; source-specific fields may only be
used as attributed supplemental evidence.

Adding a source requires:

1. Zod validation at its external API boundary.
2. Mapping to the canonical model before marketplace display.
3. An official URL and stable source notice identifier.
4. Persistence of the complete source response and immutable version changes.
5. No replacement of missing source facts with generated or mock values.

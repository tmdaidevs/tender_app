# Canonical tender model

TenderLoop exposes public tender details through one source-neutral contract:
`CanonicalTender`, validated by `src/domain/canonical-tender.ts`. The detail
endpoint is `GET /api/tenders/{id}` and currently returns schema version `1.0`.

Every connector must map its upstream response into these sections:

- core opportunity: title, summary, notice type, status and lane;
- buyer: normalized buyer identity;
- classifications, places of performance and typed normalized requirements;
- disclosed value and currency;
- publication, deadline, retrieval and update dates;
- official source identity, notice identifier and official notice URL;
- provenance: immutable version number, timestamp and content hash.

The complete upstream response is retained under `source.record`. This preserves
source evidence and fields not yet promoted into the normalized model. UI and
matching logic must use normalized fields; source-specific fields may only be
used as attributed supplemental evidence.

AI enrichment is deliberately separate from the canonical source record. The
detail endpoint returns it in the top-level `enrichment` property when a
completed persisted generation exists. It never replaces official facts in
`data`; see `AI_TENDER_ENRICHMENT.md`.

## Normalized requirement contract

`requirements` contains source-neutral records with a stable ID, category,
matching key, operator, typed value, mandatory state, source URL and path, and
verification status. Supported values include text, boolean, number, money,
codes and dates.

Directly mapped source fields use `verificationStatus: official`. A null
`mandatory` value means the source identifies an opportunity constraint but
does not establish it as a supplier eligibility gate. For example, an
estimated contract value is useful for commercial fit but is not a minimum
turnover requirement.

AI-extracted requirement candidates live in the persisted enrichment record,
use `source.kind: ai_extraction`, and are schema-constrained to
`verificationStatus: candidate`. They must be reviewed against the official
notice before promotion into deterministic eligibility logic.

Adding a source requires:

1. Zod validation at its external API boundary.
2. Mapping to the canonical model before marketplace display.
3. An official URL and stable source notice identifier.
4. Persistence of the complete source response and immutable version changes.
5. No replacement of missing source facts with generated or mock values.

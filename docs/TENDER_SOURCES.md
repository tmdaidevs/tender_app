# Public tender source strategy

Last reviewed: 2026-07-26

Tender records are persisted in Neon PostgreSQL. Each refresh upserts the
source notice into `tenders`, stores the original response in `raw_payload`,
and creates a content-addressed row in `tender_versions` only when the source
payload changes. The marketplace never depends on an in-memory or mock-data
fallback.

## Implemented

### Tenders Electronic Daily (TED)

- Coverage: EU procurement notices, currently filtered to German and Austrian
  digital and professional-service CPV families.
- Interface: public TED Search API, no authentication required.
- Refresh: Vercel Cron calls `/api/cron/tenders` every five minutes.
- Attribution: every result links to its official TED notice.
- Status: production connector.

## Recommended next connectors

### Datenservice Öffentlicher Einkauf — Germany

- Website: https://oeffentlichevergabe.de
- Interface: documented Open Data API at
  https://oeffentlichevergabe.de/documentation/swagger-ui/opendata/index.html
- Data: daily or monthly notice exports in standardized formats.
- License: CC0 according to the portal's Open Data policy.
- Value: adds German national and below-EU-threshold notices not represented
  comprehensively by TED.
- Recommendation: implement next using daily exports, source identifiers and
  the same idempotent upsert/versioning pipeline.

### USP Ausschreibungssuche / data.gv.at — Austria

- Websites: https://ausschreibungen.usp.gv.at and https://www.data.gv.at
- Interface: legally required BVergG 2018 core metadata is published through
  data.gv.at using DCAT-AP.at; the official USP search aggregates the records.
- Value: adds Austrian national and below-EU-threshold procurement notices.
- Constraint: data distributions are decentralized and should be consumed
  through documented catalog metadata rather than HTML scraping.
- Recommendation: build a DCAT catalog connector after validating the current
  public read interface and distribution formats.

### simap.ch — Switzerland

- Website: https://www.simap.ch
- Interface: the official platform exposes current and completed Swiss public
  procurement notices. Its terms describe API use without a user account for
  the corresponding public data volume, with separate API conditions and the
  possibility of future fees.
- Value: authoritative Swiss Confederation, canton and commune coverage.
- Constraint: confirm the supported API contract and usage terms with simap.ch
  before implementation; do not reverse-engineer or scrape private endpoints.
- Recommendation: obtain/document API access, then add a Swiss connector.

## Other portal

`service.bund.de` is an official German publication platform and accepts data
through publisher/content-partner interfaces. No equivalent documented public
bulk reuse API was identified, so the German central Open Data API above is the
safer ingestion source.

# MVP execution plan

Last updated: 2026-07-26

## Assumptions

- The GitHub repository is `tmdaidevs/tender_app`, but the local empty Git
  repository does not yet have a remote configured.
- Neon PostgreSQL is provisioned through the Vercel Marketplace.
- `TenderLoop` is a replaceable working name controlled through configuration.
- Private bids are described as **confidential until the deadline**. The MVP
  does not claim cryptographic sealing.

## Architecture decisions

- Next.js modular monolith, strict TypeScript, App Router, Vercel-compatible.
- Neon PostgreSQL is the hosted persistence layer. Authentication uses
  database-backed opaque sessions with scrypt password hashes.
- Domain rules stay independent of UI and providers.
- Eligibility hard gates execute before an explainable weighted Fit Score.
- No automatic awards, public-portal submissions, payments, or external
  communications.

## Phases

1. **Foundation (in progress):** product shell, configuration, domain rules,
   tests, initial schema and documentation.
2. **Supplier knowledge:** onboarding, secure document ingestion, evidence
   review and Company Bid Profile.
3. **Demand:** official-source connector contract, public opportunity search,
   private tender authoring and immutable publication.
4. **Marketplace:** matching, invitations, clarifications, confidential bids,
   closure, structured human evaluation and award.
5. **Operations:** audit, analytics, north-star dashboard, subscriptions and
   governed proposal scaffolding.
6. **Hardening:** RLS integration tests, uploads, accessibility, German locale,
   E2E flows and deployment.

## Acceptance criteria for this first build slice

- Credible responsive supplier opportunity dashboard with realistic demo data.
- Search, quick filters, saved-state interaction and evidence signals.
- Deterministic hard-gate eligibility and bounded Fit Score tests.
- Centralized brand/environment configuration.
- Initial tenant-aware PostgreSQL schema and RLS policy foundation.
- Clean typecheck, test, lint and production build.

## Completed

- Repository and master specification inspection.
- MVP wording and scope recorded.
- Database-backed application shell, login, public opportunity marketplace,
  TED connector, and typed JSON API.
- Persisted, versioned TED ingestion scheduled every five minutes in production.
- Source attribution column and documented DACH source expansion strategy.
- Initial matching domain rules and unit tests.

## Remaining / external dependencies

- Run the one-time Neon migration/bootstrap in the Vercel Preview environment.
- Promote the verified preview when production publication is approved.
- Complete all marketplace vertical slices and security tests before any claim
  of production readiness.
- Add OpenAI, transactional email and Stripe test credentials only when their
  phases begin.

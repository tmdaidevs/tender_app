# MVP execution plan

Last updated: 2026-07-26

## Assumptions

- The GitHub repository is `tmdaidevs/tender_app`, but the local empty Git
  repository does not yet have a remote configured.
- Supabase has not been created. The application therefore starts with
  deterministic fictional demo data and provider boundaries.
- `TenderLoop` is a replaceable working name controlled through configuration.
- Private bids are described as **confidential until the deadline**. The MVP
  does not claim cryptographic sealing.

## Architecture decisions

- Next.js modular monolith, strict TypeScript, App Router, Vercel-compatible.
- Supabase PostgreSQL/Auth/Storage is the intended hosted persistence layer.
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
- Application shell and supplier opportunity dashboard.
- Initial matching domain rules and unit tests.

## Remaining / external dependencies

- Create Supabase project and supply URL, anon key, service-role key and
  database URL.
- Connect the local repository to GitHub and Vercel.
- Complete all marketplace vertical slices and security tests before any claim
  of production readiness.
- Add OpenAI, transactional email and Stripe test credentials only when their
  phases begin.

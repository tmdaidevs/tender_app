# TenderLoop repository guide

## Layout

- `src/app`: Next.js App Router UI and route handlers.
- `src/domain`: framework-independent domain logic and unit tests.
- `database/migrations`: versioned Neon PostgreSQL schema.
- `docs`: architecture, product boundaries, security notes, and execution status.

## Commands

- `pnpm dev`: local application.
- `pnpm test`: domain tests.
- `pnpm typecheck`: strict TypeScript check.
- `pnpm lint`: lint.
- `pnpm build`: production build.

## Conventions and security boundaries

Use strict TypeScript and Zod at external boundaries. Keep authorization and
state transitions in server-side domain services. Every tenant-owned record
must carry an `organization_id`; authorization must be enforced in server-side
domain services and database policies where applicable. Bid contents are confidential until the deadline and must never
be returned to buyer clients before server-side closure checks pass. AI output
is a suggestion, never evidence or an award decision. Never commit secrets or
real tender data.

## Definition of done

Changes require relevant tests, typecheck, lint, and a production build.
Security-sensitive changes also require a cross-tenant and pre-deadline access
review. Documentation must describe implemented behavior, not future claims.

# System overview

```mermaid
flowchart LR
  UI["Next.js web application"] --> Domain["Domain services"]
  Domain --> DB["Neon PostgreSQL"]
  UI --> Auth["Database-backed sessions"]
  Domain --> Jobs["Typed background workflows"]
  Jobs --> Sources["Official tender sources"]
  Jobs --> AI["Schema-validated AI provider"]
  Domain --> Audit["Append-only audit events"]
```

The implementation is a modular monolith. Public opportunity ingestion uses
the official TED Search API and stores raw source payloads plus immutable
versions. Tenant scope is explicit in data and enforced by server-side domain
services. Authentication uses opaque, hashed session tokens in Neon.

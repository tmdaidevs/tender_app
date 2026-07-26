# System overview

```mermaid
flowchart LR
  UI["Next.js web application"] --> Domain["Domain services"]
  Domain --> DB["Supabase PostgreSQL + RLS"]
  Domain --> Storage["Private object storage"]
  Domain --> Jobs["Typed background workflows"]
  Jobs --> Sources["Official tender sources"]
  Jobs --> AI["Schema-validated AI provider"]
  Domain --> Audit["Append-only audit events"]
```

The initial implementation is a modular monolith. Provider interfaces allow
deterministic local behavior until hosted credentials exist. Tenant scope is
explicit in data and must be enforced at both service and database layers.

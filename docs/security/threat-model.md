# Threat model

Highest-risk assets are supplier documents, evidence, pricing, bid content,
evaluation rationales, identities, and credentials.

Primary threats are cross-tenant access, buyer access to bids before closure,
supplier access to competitors' bids, insecure file processing, SSRF during
website ingestion, prompt injection in documents, leaked signed URLs, and
privileged worker scope errors.

Controls required before production include RLS on tenant tables, server-side
deadline checks, private storage with short-lived signed URLs, MIME/magic-byte
validation, malware quarantine, allowlisted network egress, scoped retrieval,
schema-validated AI output, append-only audit events, rate limits, and explicit
human confirmation for publication and awards.

The current login implementation stores scrypt password hashes and only hashed
opaque session tokens. Cookies are HTTP-only, SameSite=Lax, and Secure in
production. The one-time bootstrap endpoint is unavailable unless a temporary
Vercel secret is configured; that secret must be removed after provisioning.

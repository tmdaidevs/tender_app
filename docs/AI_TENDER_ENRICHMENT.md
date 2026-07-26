# AI tender enrichment

TenderLoop enriches persisted public tenders asynchronously. Page requests never
trigger model calls.

## Flow

1. The scheduled tender import persists the canonical Search API record.
2. The enrichment worker selects one current tender without a completed
   generation for its latest immutable tender version.
3. The source adapter downloads the complete official notice. TED notices use
   `https://ted.europa.eu/en/notice/{publication-number}/xml`.
4. The source snapshot and SHA-256 hash are stored before generation.
5. OpenAI produces a Zod-validated, source-neutral opportunity brief through
   Vercel AI Gateway.
6. The result, model, prompt version, token usage, status and error details are
   persisted in `tender_ai_generations`.
7. The detail API and page read only completed persisted generations.

The cron processes one enrichment per run to bound model spend and execution
time. Identical source hash, prompt version and model combinations are reused.

## Evidence and safety

- Official XML is treated as untrusted data, never model instructions.
- Missing facts remain null or empty; generated estimates and pricing advice are
  prohibited.
- Extracted facts carry the relevant XML element path.
- Risks distinguish source facts, missing information and inference.
- AI output is a navigation aid, not procurement evidence or an award decision.
- The original official notice remains the controlling source.

## Model configuration

Production uses Vercel OIDC authentication and the AI Gateway model string in
`AI_ENRICHMENT_MODEL`. The default is `openai/gpt-5.6-luna`, selected for
high-volume structured extraction. Changing the model creates a new generation
instead of overwriting prior output.

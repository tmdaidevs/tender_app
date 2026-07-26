# Company Bid Profile

The Company Bid Profile is an organization-owned supplier record used for
matching and bid preparation. It does not submit data to a procurement portal
and it does not make eligibility or award decisions.

An organization may keep multiple named profiles for different service lines
or bid strategies. The selected profile is represented by its stable profile
ID, so future bid creation can reference the exact chosen profile rather than
an organization-wide mutable default.

## Creation paths

- Guided setup collects legal identity, capabilities, CPV codes, delivery
  coverage, tender languages, and operational electronic-submission readiness.
- AI-assisted setup accepts up to three public official website pages and five
  PDF documents (up to 4 MB combined). It creates a draft from those sources and leaves unsupported
  fields empty.
- Sample setup creates a persistently marked fictional profile. Sample records
  are for exploring the format and must not be treated as evidence.

Website fetching rejects local and private network targets. PDFs are checked
for media type, size, and the PDF file signature. Source snapshots and hashes
are stored as organization-owned evidence, while generation records retain the
model, prompt version, token usage, result, and error state. Submitted source
content is sent to OpenAI for extraction; the interface discloses this before
generation.

## Procurement interoperability

The profile uses ISO country, language, and currency codes and supports CPV
classification. Electronic-submission fields describe the supplier's
operational readiness, portal accounts, supported document formats, qualified
electronic-signature capability, and tender-validity defaults. This makes the
profile compatible with common eSubmission preparation workflows without
claiming native submission to TED, eVergabe-Online, or another external portal.

AI-generated profiles remain `draft` and require human review. Evidence is
never converted automatically into an exclusion-ground decision, eligibility
decision, or legal conclusion.

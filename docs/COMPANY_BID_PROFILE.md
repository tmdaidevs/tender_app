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
  coverage, tender languages, commercial capacity, personnel, references,
  compliance declarations, certifications, security posture, participation
  preferences, and operational electronic-submission readiness.
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

## Matching-ready fields

The profile separates matchable supplier facts into:

- capabilities: services, CPV codes, industries, technologies, buyer and
  contract types, delivery models, and matching keywords;
- geography: delivery countries, offices, NUTS codes, service regions,
  on-site radius, remote delivery, and data-residency countries;
- commercial capacity: numeric contract-value range, annual turnover by year,
  insurance coverage, currencies, credit rating, mobilization time, available
  FTE, and concurrent-project capacity;
- qualification: structured certifications with issuer, scope, validity and
  verification state, professional registrations, licences, and explicit
  nullable exclusion/compliance declarations;
- experience: team roles, headcount, availability, experience, skills,
  languages and detailed references with dates, value, CPV, geography,
  industry, supplier role, team size and client type;
- security and policy: clearances, GDPR readiness, accessibility standards,
  hosting models, incident response, environmental and social policies;
- participation preferences: minimum notice period, consortium, subcontracting,
  lot participation and preferred currencies;
- evidence: stable evidence IDs, source identity, validity and verification
  status that can be attached to individual matchable claims.

Monetary matching uses the structured numeric fields. The legacy free-text
contract and liability fields remain readable for existing profiles but must
not be used by future deterministic matching. New fields carry defaults so
profiles saved under the earlier schema continue to load without data loss.

AI-generated profiles remain `draft` and require human review. Evidence is
never converted automatically into an exclusion-ground decision, eligibility
decision, or legal conclusion.

import {
  AlertTriangle,
  Award,
  Bot,
  BriefcaseBusiness,
  Building2,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  FileCheck2,
  Landmark,
  ListChecks,
  Scale,
} from "lucide-react";
import { MessageResponse } from "@/components/ai-elements/message";
import type { TenderEnrichmentRecord } from "@/domain/tender-enrichment";

function AiText({ children }: { children: string }) {
  return <MessageResponse className="ai-text">{children}</MessageResponse>;
}

function FactList({
  items,
}: {
  items: Array<{ text: string }>;
}) {
  if (items.length === 0) {
    return <p className="source-absence">No explicit information found in the official notice.</p>;
  }
  return (
    <ul className="enrichment-list">
      {items.map((item, index) => (
        <li key={`${item.text}-${index}`}>
          <CheckCircle2 size={15} />
          <AiText>{item.text}</AiText>
        </li>
      ))}
    </ul>
  );
}

function SectionHeading({
  icon,
  eyebrow,
  title,
}: {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="enrichment-section-heading">
      <span>{icon}</span>
      <div><small>{eyebrow}</small><h2>{title}</h2></div>
    </div>
  );
}

export function EnrichedTenderBrief({
  enrichment,
  officialDetails,
  sourcePanel,
}: {
  enrichment: TenderEnrichmentRecord;
  officialDetails: React.ReactNode;
  sourcePanel: React.ReactNode;
}) {
  const brief = enrichment.result;
  const commercialFacts = [
    ["Estimated value", brief.commercial.estimatedValue],
    ["Contract duration", brief.commercial.duration],
    ["Renewal", brief.commercial.renewal],
    ["Payment terms", brief.commercial.paymentTerms],
  ].filter((item): item is [string, string] => item[1] !== null);

  return (
    <section className="enrichment">
      <div className="opportunity-columns">
        <div className="opportunity-main">
          <article className="executive-brief">
            <span><Bot size={18} /> Executive summary</span>
            <AiText>{brief.executiveSummary}</AiText>
          </article>

          {officialDetails}

        <section className="enrichment-card wide">
          <SectionHeading
            icon={<BriefcaseBusiness size={18} />}
            eyebrow="WHAT IS BEING BOUGHT"
            title="Scope of work"
          />
          <FactList items={brief.scope} />
        </section>

        <section className="enrichment-card">
          <SectionHeading
            icon={<FileCheck2 size={18} />}
            eyebrow="EXPECTED OUTPUTS"
            title="Deliverables"
          />
          <FactList items={brief.deliverables} />
        </section>

        <section className="enrichment-card">
          <SectionHeading
            icon={<ClipboardCheck size={18} />}
            eyebrow="GO / NO-GO"
            title="Eligibility requirements"
          />
          <FactList items={brief.eligibilityRequirements} />
        </section>

        <section className="enrichment-card">
          <SectionHeading
            icon={<Scale size={18} />}
            eyebrow="PROCEDURE"
            title="How the competition works"
          />
          <dl className="enrichment-facts">
            {brief.procedure.procedureType && <div><dt>Type</dt><dd><AiText>{brief.procedure.procedureType}</AiText></dd></div>}
            {brief.procedure.contractNature && <div><dt>Contract</dt><dd><AiText>{brief.procedure.contractNature}</AiText></dd></div>}
            {brief.procedure.submissionMethod && <div><dt>Submission</dt><dd><AiText>{brief.procedure.submissionMethod}</AiText></dd></div>}
            {brief.procedure.submissionLanguages.length > 0 && (
              <div><dt>Languages</dt><dd><AiText>{brief.procedure.submissionLanguages.join(", ")}</AiText></dd></div>
            )}
            {brief.procedure.lotCount !== null && <div><dt>Lots</dt><dd>{brief.procedure.lotCount}</dd></div>}
            {brief.procedure.frameworkAgreement && <div><dt>Framework</dt><dd><AiText>{brief.procedure.frameworkAgreement}</AiText></dd></div>}
          </dl>
        </section>

        <section className="enrichment-card">
          <SectionHeading
            icon={<Building2 size={18} />}
            eyebrow="COMMERCIAL SHAPE"
            title="Contract details"
          />
          {commercialFacts.length > 0 ? (
            <dl className="enrichment-facts">
              {commercialFacts.map(([label, content]) => (
                <div key={label}><dt>{label}</dt><dd><AiText>{content}</AiText></dd></div>
              ))}
            </dl>
          ) : <p className="source-absence">No explicit commercial facts found.</p>}
        </section>

        <section className="enrichment-card">
          <SectionHeading
            icon={<Award size={18} />}
            eyebrow="EVALUATION"
            title="Award criteria"
          />
          {brief.awardCriteria.length > 0 ? (
            <div className="criteria-list">
              {brief.awardCriteria.map((item, index) => (
                <article key={`${item.criterion}-${index}`}>
                  <div>
                    <AiText>{item.criterion}</AiText>
                    {item.weight && <div className="criteria-weight"><AiText>{item.weight}</AiText></div>}
                  </div>
                </article>
              ))}
            </div>
          ) : <p className="source-absence">No explicit award criteria found.</p>}
        </section>

        <section className="enrichment-card">
          <SectionHeading
            icon={<ListChecks size={18} />}
            eyebrow="RESPONSE PREPARATION"
            title="Submission requirements"
          />
          <FactList items={brief.submissionRequirements} />
        </section>

        <section className="enrichment-card">
          <SectionHeading
            icon={<FileCheck2 size={18} />}
            eyebrow="CONTRACT CONDITIONS"
            title="Key terms"
          />
          <FactList items={brief.contractTerms} />
        </section>

        <section className="enrichment-card wide risk-card">
          <SectionHeading
            icon={<AlertTriangle size={18} />}
            eyebrow="HUMAN REVIEW REQUIRED"
            title="Risks and clarification points"
          />
          <div className="risk-grid">
            {brief.risksAndClarifications.map((item, index) => (
              <article key={`${item.title}-${index}`}>
                <span>{item.basis.replace("_", " ")}</span>
                <div className="risk-title"><AiText>{item.title}</AiText></div>
                <AiText>{item.detail}</AiText>
              </article>
            ))}
            {brief.risksAndClarifications.length === 0 && (
              <p className="source-absence">No material clarification points identified.</p>
            )}
          </div>
        </section>
        </div>

        <aside className="opportunity-sidebar">
          <section className="enrichment-card">
            <SectionHeading
              icon={<Landmark size={18} />}
              eyebrow="CONTRACTING AUTHORITY"
              title="Buyer & contact details"
            />
            <dl className="enrichment-facts">
              {brief.buyer.name && <div><dt>Name</dt><dd><AiText>{brief.buyer.name}</AiText></dd></div>}
              {brief.buyer.address && <div><dt>Address</dt><dd><AiText>{brief.buyer.address}</AiText></dd></div>}
              {brief.buyer.contactEmail && <div><dt>Email</dt><dd><AiText>{brief.buyer.contactEmail}</AiText></dd></div>}
              {brief.buyer.contactPhone && <div><dt>Phone</dt><dd><AiText>{brief.buyer.contactPhone}</AiText></dd></div>}
              {brief.buyer.website && <div><dt>Website</dt><dd><AiText>{brief.buyer.website}</AiText></dd></div>}
            </dl>
          </section>

          <section className="enrichment-card">
            <SectionHeading
              icon={<CalendarClock size={18} />}
              eyebrow="KEY DATES"
              title="Procurement timeline"
            />
            {brief.timeline.length > 0 ? (
              <ol className="timeline-list">
                {brief.timeline.map((item, index) => (
                  <li key={`${item.label}-${index}`}>
                    <span />
                    <div>
                      <div className="timeline-label"><AiText>{item.label}</AiText></div>
                      {item.date && <div className="timeline-date"><AiText>{item.date}</AiText></div>}
                      {item.detail && <AiText>{item.detail}</AiText>}
                    </div>
                  </li>
                ))}
              </ol>
            ) : <p className="source-absence">No explicit timeline found.</p>}
          </section>

          {sourcePanel}
        </aside>
      </div>
    </section>
  );
}

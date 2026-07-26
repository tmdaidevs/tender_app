import {
  ArrowLeft,
  ArrowUpRight,
  Database,
  FileText,
  Fingerprint,
  Tags,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getTenderById } from "@/lib/tenders";
import { getLatestTenderEnrichment } from "@/lib/ai/tender-enrichment";
import { MarketplaceSidebar } from "@/app/components/marketplace-sidebar";
import { EnrichedTenderBrief } from "@/app/components/enriched-tender-brief";

function formatDate(value: string | null, includeTime = false) {
  if (!value) return "Not supplied by source";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    ...(includeTime ? { hour: "2-digit", minute: "2-digit" } : {}),
    timeZone: "Europe/Berlin",
  }).format(new Date(value));
}

export default async function OpportunityDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  let tender: Awaited<ReturnType<typeof getTenderById>>;
  let enrichment: Awaited<ReturnType<typeof getLatestTenderEnrichment>>;
  try {
    [tender, enrichment] = await Promise.all([
      getTenderById(id),
      getLatestTenderEnrichment(id),
    ]);
  } catch {
    notFound();
  }
  if (!tender) notFound();

  return (
    <main className="shell">
      <MarketplaceSidebar user={user} active="detail" />
      <section className="content detail-content">
        <Link className="back-link" href="/"><ArrowLeft size={15} /> Back to marketplace</Link>

        <header className="detail-header">
          <div>
            <p>PUBLIC OPPORTUNITY · {tender.source.noticeIdentifier}</p>
            <h1>{tender.title}</h1>
            <span>{tender.buyer.name ?? "Buyer name not supplied by source"}</span>
          </div>
          <a className="primary official-cta" href={tender.source.noticeUrl} target="_blank" rel="noreferrer">
            Open official notice <ArrowUpRight size={16} />
          </a>
        </header>

        <div className="detail-trust-banner">
          <Database size={17} />
          <span>
            Imported from <strong>{tender.source.name}</strong>. Verify submission requirements
            and deadlines on the official notice before responding.
          </span>
        </div>

        {enrichment ? (
          <EnrichedTenderBrief
            enrichment={enrichment}
            officialDetails={(
              <>
                <section className="panel detail-section">
                  <div className="section-title"><FileText size={18} /><h2>Opportunity description</h2></div>
                  <p className="detail-description">
                    {tender.summary ?? "The official source did not supply a normalized description."}
                  </p>
                </section>
                <section className="panel detail-section">
                  <div className="section-title"><Tags size={18} /><h2>Classification</h2></div>
                  <div className="detail-tags">
                    {tender.classifications.cpvCodes.length > 0
                      ? tender.classifications.cpvCodes.map((code) => <span key={code}>CPV {code}</span>)
                      : <p>No CPV codes supplied.</p>}
                  </div>
                </section>
              </>
            )}
            sourcePanel={(
              <section className="panel detail-section">
                <div className="section-title"><Fingerprint size={18} /><h2>Source & provenance</h2></div>
                <dl>
                  <div><dt>Source</dt><dd>{tender.source.name}</dd></div>
                  <div><dt>Notice ID</dt><dd>{tender.source.noticeIdentifier}</dd></div>
                  <div><dt>Retrieved</dt><dd>{formatDate(tender.dates.retrievedAt, true)}</dd></div>
                  <div><dt>Stored version</dt><dd>{tender.provenance.latestVersion ?? "Not versioned"}</dd></div>
                </dl>
                <Link className="api-link" href={`/api/tenders/${tender.id}`}>
                  View canonical JSON <ArrowUpRight size={13} />
                </Link>
              </section>
            )}
          />
        ) : (
          <section className="ai-pending-card">
            <span><Sparkles size={19} /></span>
            <div>
              <small>AI EVIDENCE ENRICHMENT</small>
              <h2>Full opportunity brief is queued</h2>
              <p>
                The scheduled enrichment worker will read the complete official notice,
                preserve its source snapshot, and add evidence-backed sections here.
              </p>
            </div>
          </section>
        )}

        {!enrichment && <div className="detail-grid">
          <section className="panel detail-section">
            <div className="section-title"><FileText size={18} /><h2>Opportunity description</h2></div>
            <p className="detail-description">
              {tender.summary ?? "The official source did not supply a normalized description."}
            </p>
          </section>

          <section className="panel detail-section">
            <div className="section-title"><Tags size={18} /><h2>Classification</h2></div>
            <div className="detail-tags">
              {tender.classifications.cpvCodes.length > 0
                ? tender.classifications.cpvCodes.map((code) => <span key={code}>CPV {code}</span>)
                : <p>No CPV codes supplied.</p>}
            </div>
          </section>

          <aside className="panel detail-section">
            <div className="section-title"><Fingerprint size={18} /><h2>Source & provenance</h2></div>
            <dl>
              <div><dt>Source</dt><dd>{tender.source.name}</dd></div>
              <div><dt>Notice ID</dt><dd>{tender.source.noticeIdentifier}</dd></div>
              <div><dt>Retrieved</dt><dd>{formatDate(tender.dates.retrievedAt, true)}</dd></div>
              <div><dt>Stored version</dt><dd>{tender.provenance.latestVersion ?? "Not versioned"}</dd></div>
            </dl>
            <Link className="api-link" href={`/api/tenders/${tender.id}`}>
              View canonical JSON <ArrowUpRight size={13} />
            </Link>
          </aside>
        </div>}

      </section>
    </main>
  );
}

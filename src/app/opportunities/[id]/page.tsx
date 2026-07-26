import {
  ArrowLeft,
  ArrowUpRight,
  Building2,
  CalendarDays,
  CircleDollarSign,
  Database,
  FileText,
  Fingerprint,
  MapPin,
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

function formatValue(amount: number, currency: string) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
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

        <section className="detail-facts" aria-label="Key tender facts">
          <article>
            <CalendarDays size={18} />
            <small>DEADLINE</small>
            <strong>{formatDate(tender.dates.deadlineAt, true)}</strong>
          </article>
          <article>
            <CircleDollarSign size={18} />
            <small>ESTIMATED VALUE</small>
            <strong>
              {tender.value
                ? formatValue(tender.value.amount, tender.value.currency)
                : "Not disclosed"}
            </strong>
          </article>
          <article>
            <MapPin size={18} />
            <small>PLACE OF PERFORMANCE</small>
            <strong>
              {tender.placesOfPerformance.map((place) => place.countryCode).join(", ") ||
                "Not supplied"}
            </strong>
          </article>
          <article>
            <FileText size={18} />
            <small>NOTICE TYPE</small>
            <strong>{tender.noticeType ?? "Not supplied"}</strong>
          </article>
        </section>

        {enrichment ? (
          <EnrichedTenderBrief enrichment={enrichment} />
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

        <div className="official-data-heading">
          <small>OFFICIAL SOURCE INFORMATION</small>
          <h2>Original opportunity details</h2>
        </div>

        <div className={`detail-grid ${enrichment ? "canonical-detail-grid" : ""}`}>
          <section className="panel detail-section">
            <div className="section-title"><FileText size={18} /><h2>Opportunity description</h2></div>
            <p className="detail-description">
              {tender.summary ?? "The official source did not supply a normalized description."}
            </p>
          </section>

          <aside className="panel detail-section">
            <div className="section-title"><Building2 size={18} /><h2>Contracting authority</h2></div>
            <dl>
              <div><dt>Buyer</dt><dd>{tender.buyer.name ?? "Not supplied"}</dd></div>
              <div><dt>Status</dt><dd>{tender.status}</dd></div>
              <div><dt>Published</dt><dd>{formatDate(tender.dates.publishedAt)}</dd></div>
            </dl>
          </aside>

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
        </div>

      </section>
    </main>
  );
}

import {
  ArrowUpRight,
  Building2,
  ChevronLeft,
  ChevronRight,
  Database,
} from "lucide-react";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import {
  listTenders,
  listTenderSourceStatuses,
  tenderListInputSchema,
} from "@/lib/tenders";
import { MarketplaceFilters } from "@/app/components/marketplace-filters";
import { MarketplaceSidebar } from "@/app/components/marketplace-sidebar";

function formatDeadline(value: string | null) {
  if (!value) return "Not supplied";
  const deadline = new Date(value);
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Europe/Berlin",
  }).format(deadline);
}

function formatValue(value: number | null, currency: string | null) {
  if (value === null || !currency) return "Not disclosed";
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

function sourceHost(value: string) {
  try {
    return new URL(value).hostname;
  } catch {
    return value;
  }
}

function formatSyncTime(value: string | null) {
  if (!value) return "Awaiting first refresh";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "Europe/Berlin",
  }).format(new Date(value));
}

function paginationPages(current: number, total: number) {
  const pages = new Set([1, total, current - 1, current, current + 1]);
  return [...pages].filter((page) => page >= 1 && page <= total).sort((a, b) => a - b);
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const values = (name: string) => {
    const value = params[name];
    return Array.isArray(value) ? value : value ? [value] : [];
  };
  const value = (name: string) => values(name)[0];
  const parsedFilters = tenderListInputSchema.safeParse({
    q: value("q") ?? "",
    countries: values("country"),
    sources: values("source"),
    buyer: value("buyer") ?? "",
    cpv: value("cpv") ?? "",
    publishedFrom: value("publishedFrom"),
    publishedTo: value("publishedTo"),
    deadlineFrom: value("deadlineFrom"),
    deadlineTo: value("deadlineTo"),
    minValue: value("minValue") ? Number(value("minValue")) : undefined,
    maxValue: value("maxValue") ? Number(value("maxValue")) : undefined,
    currency: value("currency"),
    valueAvailability: value("valueAvailability") ?? "all",
    deadlineAvailability: value("deadlineAvailability") ?? "all",
    sort: value("sort") ?? "deadline_asc",
    page: value("page") ? Number(value("page")) : 1,
    limit: 50,
  });
  const filters = parsedFilters.success
    ? parsedFilters.data
    : tenderListInputSchema.parse({ limit: 50 });
  const [result, sources] = await Promise.all([
    listTenders(filters),
    listTenderSourceStatuses(),
  ]);
  const latestSourceSync = sources
    .map((source) => source.lastSuccessfulSyncAt)
    .filter((value): value is string => value !== null)
    .sort()
    .at(-1) ?? null;
  const pageHref = (page: number) => {
    const next = new URLSearchParams();
    for (const [name, rawValue] of Object.entries(params)) {
      if (name === "page" || rawValue === undefined) continue;
      for (const entry of Array.isArray(rawValue) ? rawValue : [rawValue]) next.append(name, entry);
    }
    if (page > 1) next.set("page", String(page));
    const query = next.toString();
    return query ? `/marketplace?${query}` : "/marketplace";
  };
  const visiblePages = paginationPages(result.page, result.totalPages);
  const firstResult = result.total === 0 ? 0 : (result.page - 1) * result.pageSize + 1;
  const lastResult = Math.min(result.page * result.pageSize, result.total);

  return (
    <main className="shell">
      <MarketplaceSidebar user={user} />

      <section className="content">
        <header>
          <div>
            <p>OFFICIAL PUBLIC PROCUREMENT</p>
            <h1>Live tender marketplace</h1>
            <span>Current notices imported from Tenders Electronic Daily.</span>
          </div>
          <div className="last-updated">
            <small>LAST DATABASE REFRESH</small>
            <strong>{formatSyncTime(latestSourceSync)}</strong>
            <span>Scheduled every five minutes</span>
          </div>
        </header>

        <section className="panel">
          <div className="panel-heading">
            <div><h2>Public opportunities</h2><p>Always verify deadline and status on the official submission portal.</p></div>
            <Link className="link" href="/api/tenders">Open JSON API <ArrowUpRight size={15} /></Link>
          </div>
          <MarketplaceFilters filters={filters} sources={sources} />

          <div className="marketplace-columns" aria-hidden="true">
            <span>Opportunity</span>
            <span>Source</span>
            <span>Deadline</span>
            <span>Value</span>
            <span>Official link</span>
          </div>
          <div className="live-list">
            {result.items.map((tender) => (
              <article className="live-tender" key={tender.id}>
                <span className="source-mark"><Building2 size={18} /></span>
                <Link className="live-main" href={`/opportunities/${tender.id}`}>
                  <h3>{tender.title}</h3>
                  <p>{tender.buyerName ?? "Buyer name not supplied"}</p>
                  <small>
                    Notice {tender.sourceIdentifier}
                    <b> Official source</b>
                  </small>
                  <div className="tags">
                    {tender.countryCodes.map((country) => <em key={country}>{country}</em>)}
                    {tender.cpvCodes.slice(0, 3).map((cpv) => <em key={cpv}>CPV {cpv}</em>)}
                  </div>
                  <span className="view-details">View full details <ArrowUpRight size={12} /></span>
                </Link>
                <div className="live-meta source-column">
                  <small>SOURCE</small>
                  <strong>{tender.sourceName}</strong>
                  <a href={tender.sourceBaseUrl} target="_blank" rel="noreferrer">
                    {sourceHost(tender.sourceBaseUrl)}
                  </a>
                </div>
                <div className="live-meta"><small>DEADLINE</small><strong>{formatDeadline(tender.deadlineAt)}</strong></div>
                <div className="live-meta value-column"><small>VALUE</small><strong>{formatValue(tender.estimatedValue, tender.currency)}</strong></div>
                <a className="save" href={tender.sourceUrl} target="_blank" rel="noreferrer">Official portal <ArrowUpRight size={13} /></a>
              </article>
            ))}
            {result.items.length === 0 && (
              <div className="empty-state">
                <Database size={28} />
                <h3>No imported opportunities yet</h3>
                <p>An administrator can run the TED sync. No fallback or mock tenders are displayed.</p>
              </div>
            )}
          </div>
          {result.totalPages > 0 && (
            <nav className="marketplace-pagination" aria-label="Opportunity pages">
              <p>Showing {firstResult}–{lastResult} of {result.total} opportunities</p>
              <div>
                {result.page > 1 ? (
                  <Link className="page-direction" href={pageHref(result.page - 1)}><ChevronLeft size={14} /> Previous</Link>
                ) : (
                  <span className="page-direction disabled"><ChevronLeft size={14} /> Previous</span>
                )}
                {visiblePages.map((page, index) => (
                  <span className="page-number-wrap" key={page}>
                    {index > 0 && page - visiblePages[index - 1] > 1 && <i>…</i>}
                    <Link aria-current={page === result.page ? "page" : undefined} className="page-number" href={pageHref(page)}>{page}</Link>
                  </span>
                ))}
                {result.page < result.totalPages ? (
                  <Link className="page-direction" href={pageHref(result.page + 1)}>Next <ChevronRight size={14} /></Link>
                ) : (
                  <span className="page-direction disabled">Next <ChevronRight size={14} /></span>
                )}
              </div>
            </nav>
          )}
        </section>
        <footer><span>Live Neon PostgreSQL</span><span>Imported notices remain attributable to their official source.</span></footer>
      </section>
    </main>
  );
}

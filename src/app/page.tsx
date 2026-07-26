import {
  ArrowUpRight,
  Building2,
  Database,
  FileText,
  LogOut,
  Search,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { listTenders } from "@/lib/tenders";
import { syncPublicTenders } from "./actions";

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

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; country?: "DE" | "AT" | "CH" }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const tenders = await listTenders({
    q: params.q ?? "",
    country: params.country,
    limit: 50,
  });
  const nextDeadline = tenders.find((tender) => tender.deadlineAt)?.deadlineAt ?? null;

  return (
    <main className="shell">
      <aside className="sidebar">
        <div className="brand"><span className="brandmark">T</span><span>TenderLoop</span></div>
        <div className="workspace">
          <span className="avatar">{user.organizationName?.slice(0, 2).toUpperCase() ?? "TL"}</span>
          <span><strong>{user.organizationName ?? "No organization"}</strong><small>{user.organizationRole ?? "Platform account"}</small></span>
        </div>
        <nav aria-label="Primary navigation">
          <p>MARKETPLACE</p>
          <Link className="nav-link active" href="/"><Search size={18} /> Public opportunities</Link>
          <a className="nav-link" href="/api/tenders"><Database size={18} /> Tenders API</a>
          <p>WORKSPACE</p>
          <span className="nav-link disabled"><FileText size={18} /> Private tenders</span>
          <span className="nav-link disabled"><Building2 size={18} /> Company profile</span>
        </nav>
        <div className="profile-progress">
          <span><ShieldCheck size={17} /> Authenticated <strong>Neon</strong></span>
          <small>{user.email}</small>
        </div>
        <form action="/logout" method="post">
          <button className="logout-button"><LogOut size={16} /> Sign out</button>
        </form>
      </aside>

      <section className="content">
        <header>
          <div>
            <p>OFFICIAL PUBLIC PROCUREMENT</p>
            <h1>Live tender marketplace</h1>
            <span>Current notices imported from Tenders Electronic Daily.</span>
          </div>
          {user.platformRole === "platform_admin" && (
            <form action={syncPublicTenders}>
              <button className="primary"><Database size={17} /> Sync TED now</button>
            </form>
          )}
        </header>

        <section className="signal-grid" aria-label="Marketplace summary">
          <article><span className="signal-icon violet"><Search size={19} /></span><div><small>VISIBLE OPPORTUNITIES</small><strong>{tenders.length}</strong><p>live database records</p></div></article>
          <article><span className="signal-icon teal"><ShieldCheck size={19} /></span><div><small>OFFICIAL SOURCE</small><strong>TED</strong><p>European Union</p></div></article>
          <article><span className="signal-icon amber"><FileText size={19} /></span><div><small>NEXT DEADLINE</small><strong className="date-metric">{formatDeadline(nextDeadline)}</strong><p>source-provided date</p></div></article>
          <article><span className="signal-icon blue"><Database size={19} /></span><div><small>DATA MODE</small><strong>Live</strong><p>no tender fixtures</p></div></article>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div><h2>Public opportunities</h2><p>Always verify deadline and status on the official submission portal.</p></div>
            <a className="link" href="/api/tenders">Open JSON API <ArrowUpRight size={15} /></a>
          </div>
          <form className="market-filters" method="get">
            <label><Search size={17} /><input name="q" defaultValue={params.q} placeholder="Search title, buyer or description" /></label>
            <select name="country" defaultValue={params.country ?? ""} aria-label="Country">
              <option value="">Germany & Austria</option>
              <option value="DE">Germany</option>
              <option value="AT">Austria</option>
              <option value="CH">Switzerland</option>
            </select>
            <button className="primary" type="submit">Search</button>
          </form>

          <div className="marketplace-columns" aria-hidden="true">
            <span>Opportunity</span>
            <span>Source</span>
            <span>Deadline</span>
            <span>Value</span>
            <span>Official link</span>
          </div>
          <div className="live-list">
            {tenders.map((tender) => (
              <article className="live-tender" key={tender.id}>
                <span className="source-mark"><Building2 size={18} /></span>
                <div className="live-main">
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
                </div>
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
            {tenders.length === 0 && (
              <div className="empty-state">
                <Database size={28} />
                <h3>No imported opportunities yet</h3>
                <p>An administrator can run the TED sync. No fallback or mock tenders are displayed.</p>
              </div>
            )}
          </div>
        </section>
        <footer><span>Live Neon PostgreSQL</span><span>Imported notices remain attributable to their official source.</span></footer>
      </section>
    </main>
  );
}

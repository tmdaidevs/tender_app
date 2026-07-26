"use client";

import {
  ArrowUpRight,
  Bell,
  Building2,
  Check,
  ChevronDown,
  CircleHelp,
  Clock3,
  FileCheck2,
  FileText,
  Filter,
  LayoutDashboard,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";

type Opportunity = {
  id: string;
  title: string;
  buyer: string;
  source: string;
  location: string;
  deadline: string;
  value: string;
  fit: number;
  eligible: boolean;
  tags: string[];
};

const opportunities: Opportunity[] = [
  { id: "DE-2026-1842", title: "Cloud migration & managed platform services", buyer: "Stadtwerke Nord", source: "TED Europa", location: "Hamburg, DE", deadline: "6 days", value: "€180k–€240k", fit: 92, eligible: true, tags: ["Cloud", "Managed services"] },
  { id: "TL-PR-1048", title: "AI-enabled customer service transformation", buyer: "Alpenwerk GmbH", source: "Private · Invite only", location: "DACH · Remote", deadline: "4 days", value: "€120k–€160k", fit: 88, eligible: true, tags: ["Data & AI", "Consulting"] },
  { id: "AT-2026-0911", title: "Cybersecurity assessment and ISO 27001 readiness", buyer: "Bundesagentur Digital", source: "USP eProcurement", location: "Vienna, AT", deadline: "11 days", value: "€75k–€110k", fit: 76, eligible: true, tags: ["Cybersecurity", "Compliance"] },
  { id: "CH-2026-338", title: "Digital service design framework", buyer: "Kanton Zürich", source: "simap.ch", location: "Zürich, CH", deadline: "15 days", value: "CHF 200k", fit: 61, eligible: false, tags: ["Design", "Research"] },
];

function Score({ value }: { value: number }) {
  return (
    <div className="score" aria-label={`Fit score ${value} out of 100`}>
      <span>{value}</span>
      <small>FIT</small>
    </div>
  );
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [saved, setSaved] = useState<string[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [active, setActive] = useState("Opportunities");

  const filtered = useMemo(
    () =>
      opportunities.filter((item) =>
        `${item.title} ${item.buyer} ${item.tags.join(" ")}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [query],
  );

  const nav = [
    ["Overview", LayoutDashboard],
    ["Opportunities", Search],
    ["Bid workspaces", FileText],
    ["Company profile", Building2],
    ["Evidence", FileCheck2],
  ] as const;

  return (
    <main className="shell">
      <aside className="sidebar">
        <div className="brand"><span className="brandmark">T</span><span>TenderLoop</span></div>
        <div className="workspace">
          <span className="avatar">NS</span>
          <span><strong>Nordlicht Systems</strong><small>Supplier workspace</small></span>
          <ChevronDown size={16} />
        </div>
        <nav aria-label="Primary navigation">
          <p>WORKSPACE</p>
          {nav.map(([label, Icon]) => (
            <button key={label} className={active === label ? "active" : ""} onClick={() => setActive(label)}>
              <Icon size={18} /> {label}{label === "Opportunities" && <em>12</em>}
            </button>
          ))}
          <p>MANAGE</p>
          <button><Users size={18} /> Team</button>
          <button><Bell size={18} /> Notifications <i /></button>
        </nav>
        <div className="profile-progress">
          <span><ShieldCheck size={17} /> Profile strength <strong>82%</strong></span>
          <div><b /></div>
          <small>3 evidence items need review</small>
        </div>
        <div className="user">
          <span className="avatar person">TM</span>
          <span><strong>Tobias Müller</strong><small>Organization owner</small></span>
          <ChevronDown size={15} />
        </div>
      </aside>

      <section className="content">
        <header>
          <div><p>OPPORTUNITY INTELLIGENCE</p><h1>Good morning, Tobias.</h1><span>Four opportunities deserve your attention today.</span></div>
          <div className="header-actions"><button className="icon-button" aria-label="Help"><CircleHelp size={19} /></button><button className="primary"><Sparkles size={17} /> Create bid profile</button></div>
        </header>

        <section className="signal-grid" aria-label="Marketplace summary">
          <article><span className="signal-icon violet"><Search size={19} /></span><div><small>RELEVANT MATCHES</small><strong>12</strong><p><b>+4</b> since Monday</p></div></article>
          <article><span className="signal-icon teal"><FileText size={19} /></span><div><small>ACTIVE BIDS</small><strong>3</strong><p>2 due this week</p></div></article>
          <article><span className="signal-icon amber"><Clock3 size={19} /></span><div><small>NEAREST DEADLINE</small><strong>4d 8h</strong><p>AI customer service</p></div></article>
          <article><span className="signal-icon blue"><ShieldCheck size={19} /></span><div><small>EVIDENCE COVERAGE</small><strong>87%</strong><p><b>+6%</b> this month</p></div></article>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div><h2>Recommended opportunities</h2><p>Hard eligibility checks run before each explainable Fit Score.</p></div>
            <button className="link">View all 12 <ArrowUpRight size={15} /></button>
          </div>
          <div className="toolbar">
            <label><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search opportunities" /></label>
            <div className="filter-wrap"><button className={filterOpen ? "selected" : ""} onClick={() => setFilterOpen(!filterOpen)}><Filter size={16} /> Filters</button>{filterOpen && <div className="filter-menu"><strong>Quick filters</strong><label><input type="checkbox" defaultChecked /> Eligible only</label><label><input type="checkbox" /> Private tenders</label><label><input type="checkbox" /> Due in 7 days</label></div>}</div>
          </div>
          <div className="table" role="table" aria-label="Recommended opportunities">
            <div className="table-head" role="row"><span>OPPORTUNITY</span><span>DEADLINE</span><span>VALUE</span><span>FIT SCORE</span><span /></div>
            {filtered.map((item) => (
              <article className="opportunity" role="row" key={item.id}>
                <div className="opp-main">
                  <span className={`source-mark ${item.source.includes("Private") ? "private" : ""}`}>{item.source.includes("Private") ? <ShieldCheck size={18} /> : <Building2 size={18} />}</span>
                  <div><h3>{item.title}</h3><p>{item.buyer} · {item.location}</p><small>{item.source} <span>Official source</span></small><div className="tags">{item.tags.map((tag) => <em key={tag}>{tag}</em>)}</div></div>
                </div>
                <div className="deadline"><strong>{item.deadline}</strong><small>remaining</small></div>
                <div className="value"><strong>{item.value}</strong><small>estimated</small></div>
                <div><Score value={item.fit} />{!item.eligible && <small className="gate">1 hard gate</small>}</div>
                <button className={saved.includes(item.id) ? "save saved" : "save"} onClick={() => setSaved((current) => current.includes(item.id) ? current.filter((id) => id !== item.id) : [...current, item.id])}>{saved.includes(item.id) ? <><Check size={14} /> Saved</> : "Review"}</button>
              </article>
            ))}
            {filtered.length === 0 && <div className="empty">No opportunities match “{query}”. Try a category or buyer name.</div>}
          </div>
        </section>

        <div className="bottom-grid">
          <section className="panel compact">
            <div className="panel-heading"><div><h2>Evidence requiring attention</h2><p>Review claims before they can support a bid.</p></div><button className="link">Review inbox <ArrowUpRight size={15} /></button></div>
            <div className="evidence-row"><span className="doc">PDF</span><div><strong>ISO 27001 Certificate</strong><small>Expires in 34 days · Page 1</small></div><em className="amber-pill">EXPIRING</em></div>
            <div className="evidence-row"><span className="doc">WEB</span><div><strong>Azure migration capability</strong><small>Extracted from nordlicht.example/capabilities</small></div><em>NEEDS REVIEW</em></div>
          </section>
          <section className="panel compact liquidity">
            <div className="panel-heading"><div><h2>Marketplace pulse</h2><p>Native private tender liquidity, last 30 days.</p></div></div>
            <div className="north-star"><span>North-star</span><strong>68%</strong><p>received 3+ qualified bids within 7 days</p><div><b /></div><small>Target 75% · <em>+8 pts</em> vs prior period</small></div>
          </section>
        </div>
        <footer><span>Demo workspace · Fictional data</span><span>Bid content remains confidential until the deadline.</span></footer>
      </section>
    </main>
  );
}

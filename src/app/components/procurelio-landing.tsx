"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Check,
  FileCheck2,
  FileText,
  Globe2,
  Layers3,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { ProcurelioLogo } from "@/app/components/procurelio-logo";

export function ProcurelioLanding() {
  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>("[data-reveal]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16 },
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return (
    <main className="landing-shell">
      <nav className="landing-nav" aria-label="Landing page navigation">
        <Link className="landing-wordmark" href="/" aria-label="Procurelio home">
          <ProcurelioLogo />
        </Link>
        <div className="landing-nav-links">
          <a href="#approach">How it works</a>
          <a href="#suppliers">For suppliers</a>
          <a href="#buyers">For buyers</a>
        </div>
        <div className="landing-nav-actions">
          <Link href="/login">Sign in</Link>
          <Link className="landing-button compact" href="/login">Get started <ArrowRight size={14} /></Link>
        </div>
      </nav>

      <section className="landing-hero">
        <div className="hero-copy" data-reveal>
          <p className="landing-eyebrow"><span /> AI-POWERED TENDER MARKETPLACE · DE & AT</p>
          <h1>Tenders,<br /><em>made clear.</em></h1>
          <p className="hero-lead">
            Procurelio turns scattered opportunities and complex requirements into a calm,
            evidence-backed path from discovery to participation.
          </p>
          <div className="hero-actions">
            <Link className="landing-button" href="/login">Create your company profile <ArrowRight size={16} /></Link>
            <Link className="landing-text-link" href="/login">Discover opportunities <span>↗</span></Link>
          </div>
          <div className="hero-trust">
            <span><Check size={13} /> Official-source attribution</span>
            <span><Check size={13} /> Human-controlled decisions</span>
          </div>
        </div>

        <div className="hero-document" data-reveal>
          <div className="document-shadow shadow-one" />
          <div className="document-shadow shadow-two" />
          <article className="opportunity-paper">
            <header>
              <span className="paper-mark"><FileText size={17} /></span>
              <div><small>OPPORTUNITY BRIEF</small><strong>Digital service platform</strong></div>
              <em>DE</em>
            </header>
            <div className="paper-rule" />
            <div className="paper-meta">
              <span><small>BUYER</small>Public institution</span>
              <span><small>DEADLINE</small>18 days</span>
              <span><small>VALUE</small>€180–240k</span>
            </div>
            <div className="match-panel">
              <div className="match-score"><strong>86</strong><small>FIT</small></div>
              <div><small>WHY IT MATCHES</small><p>Cloud delivery · DE language<br />Relevant references · CPV aligned</p></div>
              <BadgeCheck size={20} />
            </div>
            <ul>
              <li><span>01</span><div><strong>Eligibility</strong><small>All required gates evidenced</small></div><Check size={14} /></li>
              <li><span>02</span><div><strong>Qualification</strong><small>4 matching capabilities</small></div><Check size={14} /></li>
              <li><span>03</span><div><strong>Next step</strong><small>Review official documents</small></div><ArrowRight size={14} /></li>
            </ul>
          </article>
          <div className="document-note"><Sparkles size={14} /> Explained, never decided for you</div>
        </div>
      </section>

      <div className="landing-proof" data-reveal>
        <p>One composed workspace for</p>
        <div>
          <span>Public tenders</span><i />
          <span>Private requirements</span><i />
          <span>Qualified suppliers</span><i />
          <span>Germany & Austria</span>
        </div>
      </div>

      <section className="landing-intro" id="approach" data-reveal>
        <p className="section-index">01 · THE APPROACH</p>
        <div>
          <h2>Complex procurement.<br /><em>One clear path.</em></h2>
          <p>Procurelio brings the essential steps into one continuous workflow. Each decision remains traceable, each claim has a source, and every participant knows what comes next.</p>
        </div>
      </section>

      <section className="path-section">
        <div className="path-rail" aria-hidden="true"><span /><span /><span /><span /></div>
        <article className="path-step discover-step" data-reveal>
          <div className="step-copy">
            <p className="section-index">DISCOVER</p>
            <h3>One market.<br />Fewer blind spots.</h3>
            <p>Explore attributable public opportunities and structured private requirements without moving between fragmented portals and inconsistent documents.</p>
            <Link href="/login">Explore the marketplace <ArrowRight size={14} /></Link>
          </div>
          <div className="tender-list-card">
            <div className="mini-search"><Search size={14} /> Cloud, data, consulting <span>12 matches</span></div>
            {[
              ["Digital services framework", "Federal institution", "86"],
              ["Data platform advisory", "Municipal utility", "78"],
              ["Cloud security assessment", "Private buyer", "74"],
            ].map(([title, buyer, score], index) => (
              <div className="mini-tender" key={title}>
                <span className={`tender-dot dot-${index + 1}`} />
                <div><strong>{title}</strong><small>{buyer}</small></div>
                <em>{score}% fit</em>
              </div>
            ))}
          </div>
        </article>

        <article className="path-step matching-step" data-reveal>
          <div className="step-copy">
            <p className="section-index">MATCH</p>
            <h3>See the fit.<br />Understand the reason.</h3>
            <p>Deterministic eligibility checks and explainable fit signals separate genuine opportunity from noise—without hiding the criteria behind an algorithm.</p>
          </div>
          <div className="match-orbit">
            <div className="orbit-card company-card"><Building2 size={17} /><small>COMPANY PROFILE</small><strong>Cloud & Data Services</strong><span>Evidence complete</span></div>
            <div className="orbit-link"><Sparkles size={16} /><strong>86%</strong><small>EXPLAINED FIT</small></div>
            <div className="orbit-card requirement-card"><Layers3 size={17} /><small>REQUIREMENT</small><strong>Data platform delivery</strong><span>4 criteria matched</span></div>
          </div>
        </article>

        <article className="path-step evidence-step" data-reveal>
          <div className="step-copy">
            <p className="section-index">QUALIFY</p>
            <h3>Your company,<br />documented once.</h3>
            <p>Build reusable bid profiles from the material you already trust. AI organizes the evidence; your team reviews what becomes part of the record.</p>
            <Link href="/login">Build an evidence-backed profile <ArrowRight size={14} /></Link>
          </div>
          <div className="evidence-workspace">
            <div className="evidence-sources">
              <span><Globe2 size={16} /><b>Official website</b><Check size={13} /></span>
              <span><FileText size={16} /><b>Capability deck.pdf</b><Check size={13} /></span>
              <span><FileText size={16} /><b>Price list.xlsx</b><Check size={13} /></span>
              <span><FileCheck2 size={16} /><b>ISO certificate.pdf</b><Check size={13} /></span>
              <span><Layers3 size={16} /><b>Past projects</b><Check size={13} /></span>
            </div>
            <div className="evidence-arrow"><ArrowRight size={18} /></div>
            <div className="profile-sheet">
              <small>VERIFIED COMPANY PROFILE</small>
              <strong>Digital delivery profile</strong>
              <div><span>Identity & registration</span><b>Complete</b></div>
              <div><span>Services & CPV</span><b>Complete</b></div>
              <div><span>References</span><b>3 evidenced</b></div>
              <div><span>Submission readiness</span><b>Reviewed</b></div>
            </div>
          </div>
        </article>

        <article className="path-step participate-step" data-reveal>
          <div className="step-copy">
            <p className="section-index">PARTICIPATE</p>
            <h3>Prepare with confidence.<br />Decide with context.</h3>
            <p>Suppliers work from published requirements. Buyers compare against visible criteria. AI assists with structure and preparation while people retain every consequential decision.</p>
          </div>
          <div className="criteria-card">
            <header><ShieldCheck size={18} /><div><small>QUALIFICATION VIEW</small><strong>Published evaluation criteria</strong></div></header>
            <div><span>Technical approach</span><i><b style={{ width: "88%" }} /></i><em>40%</em></div>
            <div><span>Relevant experience</span><i><b style={{ width: "74%" }} /></i><em>30%</em></div>
            <div><span>Commercial fit</span><i><b style={{ width: "68%" }} /></i><em>20%</em></div>
            <div><span>Delivery readiness</span><i><b style={{ width: "82%" }} /></i><em>10%</em></div>
            <footer><BadgeCheck size={14} /> Criteria remain visible throughout evaluation</footer>
          </div>
        </article>
      </section>

      <section className="participants" data-reveal>
        <div className="participants-heading">
          <p className="section-index">02 · TWO SIDES, ONE STANDARD</p>
          <h2>Genuine needs meet<br /><em>capable companies.</em></h2>
        </div>
        <div className="participant-grid">
          <article id="suppliers">
            <span className="participant-icon moss"><Building2 size={21} /></span>
            <small>FOR SUPPLIERS</small>
            <h3>Prove your fit without starting from zero.</h3>
            <p>Create profiles from real evidence, discover suitable opportunities and prepare focused responses against the actual requirements.</p>
            <ul><li><Check size={13} /> Reusable company evidence</li><li><Check size={13} /> Explainable opportunity matching</li><li><Check size={13} /> Structured bid preparation</li></ul>
            <Link href="/login">Create a company profile <ArrowRight size={14} /></Link>
          </article>
          <article id="buyers">
            <span className="participant-icon blue"><FileCheck2 size={21} /></span>
            <small>FOR BUYERS</small>
            <h3>Reach qualified suppliers with clearer requirements.</h3>
            <p>Structure a private tender, publish the criteria and invite companies whose capabilities are supported by evidence.</p>
            <ul><li><Check size={13} /> Guided requirement structuring</li><li><Check size={13} /> Qualified supplier discovery</li><li><Check size={13} /> Human-controlled evaluation</li></ul>
            <Link href="/login">Publish a tender <ArrowRight size={14} /></Link>
          </article>
        </div>
      </section>

      <section className="trust-statement" data-reveal>
        <ShieldCheck size={24} />
        <blockquote>“AI should make procurement more understandable—not less accountable.”</blockquote>
        <p>Every generated suggestion remains reviewable. Every source stays attributable. Every award decision belongs to people.</p>
      </section>

      <section className="landing-final" data-reveal>
        <div className="final-grain" />
        <p className="landing-eyebrow"><span /> A CLEARER WAY TO PARTICIPATE</p>
        <h2>Ready when<br /><em>opportunity arrives.</em></h2>
        <p>Start with your company evidence, explore the live marketplace or bring a requirement to qualified suppliers.</p>
        <div className="final-actions">
          <Link className="landing-button light" href="/login">Create company profile <ArrowRight size={16} /></Link>
          <Link href="/login">Discover opportunities</Link>
          <Link href="/login">Publish a tender</Link>
        </div>
      </section>

      <footer className="landing-footer">
        <Link className="landing-wordmark" href="/" aria-label="Procurelio home"><ProcurelioLogo /></Link>
        <p>Clear procurement for capable companies.</p>
        <div><Link href="/login">Sign in</Link><a href="#approach">How it works</a><span>© 2026 Procurelio</span></div>
      </footer>
    </main>
  );
}

"use client";

import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  Check,
  FileText,
  Globe2,
  LoaderCircle,
  Plus,
  TestTube2,
  Sparkles,
  Trash2,
  UploadCloud,
} from "lucide-react";
import type { CompanyProfile } from "@/domain/company-profile";

const steps = [
  "Company", "Capabilities", "Delivery", "Commercial",
  "Qualification", "Experience", "Bid readiness", "Review",
];

function split(value: string) {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function optionalNumber(value: string) {
  return value === "" ? null : Number(value);
}

export function CompanyProfileBuilder({ initialProfile }: { initialProfile: CompanyProfile }) {
  const [mode, setMode] = useState<"choose" | "manual" | "ai">("choose");
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState(initialProfile);
  const [websites, setWebsites] = useState(initialProfile.identity.website ?? "");
  const [profileName, setProfileName] = useState("");
  const [status, setStatus] = useState<"idle" | "working" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function saveManual() {
    setStatus("working");
    const response = await fetch("/api/company-profile", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: profileName, profile }),
    });
    const body = await response.json();
    if (!response.ok) {
      setStatus("error");
      setMessage(body.error ?? "Profile could not be saved");
      return;
    }
    setStatus("success");
    setMessage("Draft profile saved.");
    window.location.assign(`/company-profile?profileId=${body.data.id}`);
  }

  async function generateWithAi(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("working");
    setMessage("Reading your sources and building an evidence-backed draft…");
    const form = new FormData(event.currentTarget);
    form.set("profileName", profileName);
    const websiteList = websites
      .split(/[\n,]/)
      .map((value) => value.trim())
      .filter(Boolean);
    form.set("websites", JSON.stringify(websiteList));
    const response = await fetch("/api/company-profile/generate", { method: "POST", body: form });
    const body = await response.json();
    if (!response.ok) {
      setStatus("error");
      setMessage(body.error ?? "AI profile generation failed");
      return;
    }
    setStatus("success");
    setMessage("AI draft created. Reloading the company profile…");
    window.location.assign(`/company-profile?profileId=${body.data.id}`);
  }

  async function generateSample() {
    setStatus("working");
    setMessage("Creating a clearly labeled fictional sample profile…");
    const response = await fetch("/api/company-profile/sample", { method: "POST" });
    const body = await response.json();
    if (!response.ok) {
      setStatus("error");
      setMessage(body.error ?? "Sample profile could not be created");
      return;
    }
    window.location.assign(`/company-profile?profileId=${body.data.id}`);
  }

  if (mode === "choose") {
    return (
      <section className="profile-start" aria-label="Create company profile">
        <button className="profile-path primary-path" onClick={() => setMode("manual")}>
          <span><FileText size={22} /></span>
          <div>
            <small>GUIDED SETUP</small>
            <h2>Create Profile</h2>
            <p>Follow a step-by-step guide and enter company information yourself.</p>
          </div>
          <ArrowRight size={18} />
        </button>
        <button className="profile-path ai-path" onClick={() => setMode("ai")}>
          <span><Sparkles size={22} /></span>
          <div>
            <small>FASTER START</small>
            <h2>Build profile with AI</h2>
            <p>Add your official website and PDF evidence. Review every generated field before use.</p>
          </div>
          <ArrowRight size={18} />
        </button>
        <button className="profile-path sample-path" onClick={generateSample} disabled={status === "working"}>
          <span>{status === "working" ? <LoaderCircle className="spin" size={22} /> : <TestTube2 size={22} />}</span>
          <div>
            <small>EXPLORE THE FORMAT</small>
            <h2>Generate Sample Profile</h2>
            <p>Create a fictional, clearly labeled example you can inspect without using it as bid evidence.</p>
          </div>
          <ArrowRight size={18} />
        </button>
        {message && <p className={`builder-message profile-start-message ${status}`}>{message}</p>}
      </section>
    );
  }

  if (mode === "ai") {
    return (
      <section className="profile-builder panel">
        <button className="builder-back" onClick={() => setMode("choose")}><ArrowLeft size={15} /> Choose another method</button>
        <div className="builder-heading">
          <span><Bot size={24} /></span>
          <div>
            <small>AI-ASSISTED PROFILE</small>
            <h2>Build from trusted company sources</h2>
            <p>AI extracts a draft only from the website and PDFs you provide. Missing facts stay empty.</p>
          </div>
        </div>
        <form className="ai-source-form" onSubmit={generateWithAi}>
          <label className="website-input">
            <span>Profile name</span>
            <input
              required
              maxLength={120}
              value={profileName}
              onChange={(event) => setProfileName(event.target.value)}
              placeholder="e.g. DACH Cloud & Data Profile"
            />
          </label>
          <label className="website-input">
            <span><Globe2 size={18} /> Official company websites</span>
            <textarea
              value={websites}
              onChange={(event) => setWebsites(event.target.value)}
              placeholder={"https://www.your-company.de\nhttps://www.your-company.de/about"}
            />
            <small>One URL per line, up to 3. Private and local network addresses are blocked.</small>
          </label>
          <label className="document-drop">
            <UploadCloud size={28} />
            <strong>Upload company PDFs</strong>
            <span>Company register, certifications, references, policies or capability decks</span>
            <input name="documents" type="file" accept="application/pdf,.pdf" multiple />
            <small>Up to 5 PDFs · 4 MB combined</small>
          </label>
          <div className="source-privacy">
            <Check size={15} />
            Sources are stored for your organization and sent to OpenAI for extraction. The result stays a draft and never becomes an eligibility decision.
          </div>
          <button className="primary generate-profile" disabled={status === "working"}>
            {status === "working" ? <LoaderCircle className="spin" size={17} /> : <Sparkles size={17} />}
            {status === "working" ? "Building profile…" : "Build profile with AI"}
          </button>
          {message && <p className={`builder-message ${status}`}>{message}</p>}
        </form>
      </section>
    );
  }

  return (
    <section className="profile-builder panel">
      <button className="builder-back" onClick={() => setMode("choose")}><ArrowLeft size={15} /> Choose another method</button>
      <div className="manual-steps">
        {steps.map((label, index) => (
          <span className={index <= step ? "active" : ""} key={label}>
            <b>{index + 1}</b>{label}
          </span>
        ))}
      </div>
      <div className="manual-form">
        {step === 0 && (
          <>
            <div className="builder-heading compact-heading"><div><small>STEP 1</small><h2>Company identity</h2><p>Enter the legal facts suppliers commonly reuse in tenders.</p></div></div>
            <div className="profile-form-grid">
              <label className="span-two">Profile name<input required maxLength={120} value={profileName} onChange={(e) => setProfileName(e.target.value)} placeholder="e.g. Public Sector Software Profile" /></label>
              <label>Legal company name<input value={profile.identity.legalName ?? ""} onChange={(e) => setProfile({ ...profile, identity: { ...profile.identity, legalName: e.target.value || null } })} /></label>
              <label>Trading name<input value={profile.identity.tradingName ?? ""} onChange={(e) => setProfile({ ...profile, identity: { ...profile.identity, tradingName: e.target.value || null } })} /></label>
              <label>Legal form<input value={profile.identity.legalForm ?? ""} onChange={(e) => setProfile({ ...profile, identity: { ...profile.identity, legalForm: e.target.value || null } })} /></label>
              <label>Registration number<input value={profile.identity.registrationNumber ?? ""} onChange={(e) => setProfile({ ...profile, identity: { ...profile.identity, registrationNumber: e.target.value || null } })} /></label>
              <label>VAT ID<input value={profile.identity.vatId ?? ""} onChange={(e) => setProfile({ ...profile, identity: { ...profile.identity, vatId: e.target.value || null } })} /></label>
              <label>Country code<input maxLength={2} value={profile.identity.registrationCountry ?? ""} onChange={(e) => setProfile({ ...profile, identity: { ...profile.identity, registrationCountry: e.target.value.toUpperCase() || null } })} /></label>
              <label>Official website<input type="url" value={profile.identity.website ?? ""} onChange={(e) => setProfile({ ...profile, identity: { ...profile.identity, website: e.target.value || null } })} /></label>
              <label>Founding year<input type="number" min="1800" max="2200" value={profile.identity.foundingYear ?? ""} onChange={(e) => setProfile({ ...profile, identity: { ...profile.identity, foundingYear: optionalNumber(e.target.value) } })} /></label>
              <label>Employees<input type="number" min="0" value={profile.identity.employeeCount ?? ""} onChange={(e) => setProfile({ ...profile, identity: { ...profile.identity, employeeCount: optionalNumber(e.target.value) } })} /></label>
              <label className="span-two">Registered address<textarea value={profile.identity.registeredAddress ?? ""} onChange={(e) => setProfile({ ...profile, identity: { ...profile.identity, registeredAddress: e.target.value || null } })} /></label>
              <label className="span-two">Company description<textarea value={profile.identity.companyDescription ?? ""} onChange={(e) => setProfile({ ...profile, identity: { ...profile.identity, companyDescription: e.target.value || null } })} /></label>
            </div>
            <div className="repeatable-heading"><strong>Bid contacts</strong><button onClick={() => setProfile({ ...profile, contacts: [...profile.contacts, { name: null, role: null, email: null, phone: null, authorizedSignatory: false }] })}><Plus size={14} /> Add contact</button></div>
            {profile.contacts.map((contact, index) => (
              <div className="profile-form-grid repeatable-row" key={`contact-${index}`}>
                <label>Name<input value={contact.name ?? ""} onChange={(e) => setProfile({ ...profile, contacts: profile.contacts.map((item, i) => i === index ? { ...item, name: e.target.value || null } : item) })} /></label>
                <label>Role<input value={contact.role ?? ""} onChange={(e) => setProfile({ ...profile, contacts: profile.contacts.map((item, i) => i === index ? { ...item, role: e.target.value || null } : item) })} /></label>
                <label>Email<input type="email" value={contact.email ?? ""} onChange={(e) => setProfile({ ...profile, contacts: profile.contacts.map((item, i) => i === index ? { ...item, email: e.target.value || null } : item) })} /></label>
                <label>Phone<input value={contact.phone ?? ""} onChange={(e) => setProfile({ ...profile, contacts: profile.contacts.map((item, i) => i === index ? { ...item, phone: e.target.value || null } : item) })} /></label>
                <label className="profile-checkbox"><input type="checkbox" checked={contact.authorizedSignatory} onChange={(e) => setProfile({ ...profile, contacts: profile.contacts.map((item, i) => i === index ? { ...item, authorizedSignatory: e.target.checked } : item) })} /> Authorized signatory</label>
                <button className="remove-row" aria-label="Remove contact" onClick={() => setProfile({ ...profile, contacts: profile.contacts.filter((_, i) => i !== index) })}><Trash2 size={15} /></button>
              </div>
            ))}
          </>
        )}
        {step === 1 && (
          <>
            <div className="builder-heading compact-heading"><div><small>STEP 2</small><h2>Capabilities</h2><p>Use comma-separated values. These power deterministic matching.</p></div></div>
            <div className="profile-form-grid">
              <label className="span-two">Services<textarea value={profile.capabilities.services.join(", ")} onChange={(e) => setProfile({ ...profile, capabilities: { ...profile.capabilities, services: split(e.target.value) } })} /></label>
              <label>CPV codes<input value={profile.capabilities.cpvCodes.join(", ")} onChange={(e) => setProfile({ ...profile, capabilities: { ...profile.capabilities, cpvCodes: split(e.target.value) } })} /></label>
              <label>Industries<input value={profile.capabilities.industries.join(", ")} onChange={(e) => setProfile({ ...profile, capabilities: { ...profile.capabilities, industries: split(e.target.value) } })} /></label>
              <label>Technologies<input value={profile.capabilities.technologies.join(", ")} onChange={(e) => setProfile({ ...profile, capabilities: { ...profile.capabilities, technologies: split(e.target.value) } })} /></label>
              <label>Delivery countries<input value={profile.capabilities.deliveryCountries.join(", ")} onChange={(e) => setProfile({ ...profile, capabilities: { ...profile.capabilities, deliveryCountries: split(e.target.value.toUpperCase()) } })} /></label>
              <label>Delivery models<input value={profile.capabilities.deliveryModels.join(", ")} onChange={(e) => setProfile({ ...profile, capabilities: { ...profile.capabilities, deliveryModels: split(e.target.value) } })} placeholder="Remote, Hybrid, On-site" /></label>
              <label>Buyer types<input value={profile.capabilities.buyerTypes.join(", ")} onChange={(e) => setProfile({ ...profile, capabilities: { ...profile.capabilities, buyerTypes: split(e.target.value) } })} placeholder="Public sector, Utilities, Enterprise" /></label>
              <label>Contract types<input value={profile.capabilities.contractTypes.join(", ")} onChange={(e) => setProfile({ ...profile, capabilities: { ...profile.capabilities, contractTypes: split(e.target.value) } })} placeholder="Services, Framework agreement" /></label>
              <label className="span-two">Matching keywords<input value={profile.capabilities.keywords.join(", ")} onChange={(e) => setProfile({ ...profile, capabilities: { ...profile.capabilities, keywords: split(e.target.value) } })} placeholder="cloud migration, data platform, cybersecurity" /></label>
            </div>
          </>
        )}
        {step === 2 && (
          <>
            <div className="builder-heading compact-heading"><div><small>STEP 3</small><h2>Delivery footprint & capacity</h2><p>Define where, when and at what scale this profile can deliver.</p></div></div>
            <div className="profile-form-grid">
              <label>Service regions<input value={profile.deliveryFootprint.serviceRegions.join(", ")} onChange={(e) => setProfile({ ...profile, deliveryFootprint: { ...profile.deliveryFootprint, serviceRegions: split(e.target.value) } })} placeholder="DACH, Bavaria, Vienna" /></label>
              <label>Data residency countries<input value={profile.deliveryFootprint.dataResidencyCountries.join(", ")} onChange={(e) => setProfile({ ...profile, deliveryFootprint: { ...profile.deliveryFootprint, dataResidencyCountries: split(e.target.value.toUpperCase()) } })} placeholder="DE, AT" /></label>
              <label>On-site radius (km)<input type="number" min="0" value={profile.deliveryFootprint.onSiteRadiusKm ?? ""} onChange={(e) => setProfile({ ...profile, deliveryFootprint: { ...profile.deliveryFootprint, onSiteRadiusKm: optionalNumber(e.target.value) } })} /></label>
              <label>Available from<input type="date" value={profile.capacity.availableFrom ?? ""} onChange={(e) => setProfile({ ...profile, capacity: { ...profile.capacity, availableFrom: e.target.value || null } })} /></label>
              <label>Available FTE<input type="number" min="0" step="0.1" value={profile.capacity.totalAvailableFte ?? ""} onChange={(e) => setProfile({ ...profile, capacity: { ...profile.capacity, totalAvailableFte: optionalNumber(e.target.value) } })} /></label>
              <label>Concurrent projects<input type="number" min="0" value={profile.capacity.concurrentProjects ?? ""} onChange={(e) => setProfile({ ...profile, capacity: { ...profile.capacity, concurrentProjects: optionalNumber(e.target.value) } })} /></label>
              <label>Mobilization time (days)<input type="number" min="0" value={profile.capacity.typicalMobilizationDays ?? ""} onChange={(e) => setProfile({ ...profile, capacity: { ...profile.capacity, typicalMobilizationDays: optionalNumber(e.target.value) } })} /></label>
              <label className="profile-checkbox"><input type="checkbox" checked={profile.deliveryFootprint.remoteDeliveryAvailable} onChange={(e) => setProfile({ ...profile, deliveryFootprint: { ...profile.deliveryFootprint, remoteDeliveryAvailable: e.target.checked } })} /> Remote delivery available</label>
            </div>
            <div className="repeatable-heading"><strong>Offices and delivery locations</strong><button onClick={() => setProfile({ ...profile, deliveryFootprint: { ...profile.deliveryFootprint, offices: [...profile.deliveryFootprint.offices, { city: null, countryCode: null, nutsCodes: [] }] } })}><Plus size={14} /> Add office</button></div>
            {profile.deliveryFootprint.offices.map((office, index) => (
              <div className="profile-form-grid repeatable-row" key={`office-${index}`}>
                <label>City<input value={office.city ?? ""} onChange={(e) => setProfile({ ...profile, deliveryFootprint: { ...profile.deliveryFootprint, offices: profile.deliveryFootprint.offices.map((item, i) => i === index ? { ...item, city: e.target.value || null } : item) } })} /></label>
                <label>Country<input maxLength={2} value={office.countryCode ?? ""} onChange={(e) => setProfile({ ...profile, deliveryFootprint: { ...profile.deliveryFootprint, offices: profile.deliveryFootprint.offices.map((item, i) => i === index ? { ...item, countryCode: e.target.value.toUpperCase() || null } : item) } })} /></label>
                <label>NUTS codes<input value={office.nutsCodes.join(", ")} onChange={(e) => setProfile({ ...profile, deliveryFootprint: { ...profile.deliveryFootprint, offices: profile.deliveryFootprint.offices.map((item, i) => i === index ? { ...item, nutsCodes: split(e.target.value.toUpperCase()) } : item) } })} /></label>
                <button className="remove-row" aria-label="Remove office" onClick={() => setProfile({ ...profile, deliveryFootprint: { ...profile.deliveryFootprint, offices: profile.deliveryFootprint.offices.filter((_, i) => i !== index) } })}><Trash2 size={15} /></button>
              </div>
            ))}
          </>
        )}
        {step === 3 && (
          <>
            <div className="builder-heading compact-heading"><div><small>STEP 4</small><h2>Commercial capacity</h2><p>Use structured amounts so contract-value and financial gates can be evaluated.</p></div></div>
            <div className="profile-form-grid">
              <label>Minimum contract value<input type="number" min="0" value={profile.financial.contractValueRange.minimum.amount ?? ""} onChange={(e) => setProfile({ ...profile, financial: { ...profile.financial, contractValueRange: { ...profile.financial.contractValueRange, minimum: { ...profile.financial.contractValueRange.minimum, amount: optionalNumber(e.target.value) } } } })} /></label>
              <label>Minimum currency<input maxLength={3} value={profile.financial.contractValueRange.minimum.currency ?? ""} onChange={(e) => setProfile({ ...profile, financial: { ...profile.financial, contractValueRange: { ...profile.financial.contractValueRange, minimum: { ...profile.financial.contractValueRange.minimum, currency: e.target.value.toUpperCase() || null } } } })} /></label>
              <label>Maximum contract value<input type="number" min="0" value={profile.financial.contractValueRange.maximum.amount ?? ""} onChange={(e) => setProfile({ ...profile, financial: { ...profile.financial, contractValueRange: { ...profile.financial.contractValueRange, maximum: { ...profile.financial.contractValueRange.maximum, amount: optionalNumber(e.target.value) } } } })} /></label>
              <label>Maximum currency<input maxLength={3} value={profile.financial.contractValueRange.maximum.currency ?? ""} onChange={(e) => setProfile({ ...profile, financial: { ...profile.financial, contractValueRange: { ...profile.financial.contractValueRange, maximum: { ...profile.financial.contractValueRange.maximum, currency: e.target.value.toUpperCase() || null } } } })} /></label>
              <label>Supported currencies<input value={profile.financial.currencies.join(", ")} onChange={(e) => setProfile({ ...profile, financial: { ...profile.financial, currencies: split(e.target.value.toUpperCase()) } })} /></label>
              <label>Credit rating<input value={profile.financial.creditRating ?? ""} onChange={(e) => setProfile({ ...profile, financial: { ...profile.financial, creditRating: e.target.value || null } })} /></label>
            </div>
            <div className="repeatable-heading"><strong>Annual turnover</strong><button onClick={() => setProfile({ ...profile, financial: { ...profile.financial, annualTurnover: [...profile.financial.annualTurnover, { year: new Date().getFullYear() - 1, amount: 0, currency: "EUR", evidenceIds: [] }] } })}><Plus size={14} /> Add year</button></div>
            {profile.financial.annualTurnover.map((turnover, index) => (
              <div className="profile-form-grid repeatable-row" key={`turnover-${index}`}>
                <label>Year<input type="number" value={turnover.year} onChange={(e) => setProfile({ ...profile, financial: { ...profile.financial, annualTurnover: profile.financial.annualTurnover.map((item, i) => i === index ? { ...item, year: Number(e.target.value) } : item) } })} /></label>
                <label>Amount<input type="number" min="0" value={turnover.amount} onChange={(e) => setProfile({ ...profile, financial: { ...profile.financial, annualTurnover: profile.financial.annualTurnover.map((item, i) => i === index ? { ...item, amount: Number(e.target.value) } : item) } })} /></label>
                <label>Currency<input maxLength={3} value={turnover.currency} onChange={(e) => setProfile({ ...profile, financial: { ...profile.financial, annualTurnover: profile.financial.annualTurnover.map((item, i) => i === index ? { ...item, currency: e.target.value.toUpperCase() } : item) } })} /></label>
                <button className="remove-row" aria-label="Remove turnover year" onClick={() => setProfile({ ...profile, financial: { ...profile.financial, annualTurnover: profile.financial.annualTurnover.filter((_, i) => i !== index) } })}><Trash2 size={15} /></button>
              </div>
            ))}
            <div className="repeatable-heading"><strong>Insurance coverage</strong><button onClick={() => setProfile({ ...profile, financial: { ...profile.financial, insurances: [...profile.financial.insurances, { type: "", coverage: { amount: null, currency: "EUR" }, validUntil: null, evidenceIds: [] }] } })}><Plus size={14} /> Add insurance</button></div>
            {profile.financial.insurances.map((insurance, index) => (
              <div className="profile-form-grid repeatable-row" key={`insurance-${index}`}>
                <label>Type<input value={insurance.type} onChange={(e) => setProfile({ ...profile, financial: { ...profile.financial, insurances: profile.financial.insurances.map((item, i) => i === index ? { ...item, type: e.target.value } : item) } })} placeholder="Professional indemnity" /></label>
                <label>Coverage<input type="number" min="0" value={insurance.coverage.amount ?? ""} onChange={(e) => setProfile({ ...profile, financial: { ...profile.financial, insurances: profile.financial.insurances.map((item, i) => i === index ? { ...item, coverage: { ...item.coverage, amount: optionalNumber(e.target.value) } } : item) } })} /></label>
                <label>Currency<input maxLength={3} value={insurance.coverage.currency ?? ""} onChange={(e) => setProfile({ ...profile, financial: { ...profile.financial, insurances: profile.financial.insurances.map((item, i) => i === index ? { ...item, coverage: { ...item.coverage, currency: e.target.value.toUpperCase() || null } } : item) } })} /></label>
                <label>Valid until<input type="date" value={insurance.validUntil ?? ""} onChange={(e) => setProfile({ ...profile, financial: { ...profile.financial, insurances: profile.financial.insurances.map((item, i) => i === index ? { ...item, validUntil: e.target.value || null } : item) } })} /></label>
                <button className="remove-row" aria-label="Remove insurance" onClick={() => setProfile({ ...profile, financial: { ...profile.financial, insurances: profile.financial.insurances.filter((_, i) => i !== index) } })}><Trash2 size={15} /></button>
              </div>
            ))}
          </>
        )}
        {step === 4 && (
          <>
            <div className="builder-heading compact-heading"><div><small>STEP 5</small><h2>Qualification & compliance</h2><p>Record only current, supportable declarations and credentials.</p></div></div>
            <div className="profile-form-grid">
              <label>Professional registrations<input value={profile.eligibility.professionalRegistrations.join(", ")} onChange={(e) => setProfile({ ...profile, eligibility: { ...profile.eligibility, professionalRegistrations: split(e.target.value) } })} /></label>
              <label>Licences<input value={profile.eligibility.licenses.join(", ")} onChange={(e) => setProfile({ ...profile, eligibility: { ...profile.eligibility, licenses: split(e.target.value) } })} /></label>
              <label>Security clearances<input value={profile.securityAndCompliance.securityClearances.join(", ")} onChange={(e) => setProfile({ ...profile, securityAndCompliance: { ...profile.securityAndCompliance, securityClearances: split(e.target.value) } })} /></label>
              <label>Accessibility standards<input value={profile.securityAndCompliance.accessibilityStandards.join(", ")} onChange={(e) => setProfile({ ...profile, securityAndCompliance: { ...profile.securityAndCompliance, accessibilityStandards: split(e.target.value) } })} placeholder="EN 301 549, WCAG 2.2" /></label>
              <label>Hosting models<input value={profile.securityAndCompliance.hostingModels.join(", ")} onChange={(e) => setProfile({ ...profile, securityAndCompliance: { ...profile.securityAndCompliance, hostingModels: split(e.target.value) } })} /></label>
              <label>Environmental policies<input value={profile.sustainability.environmentalPolicies.join(", ")} onChange={(e) => setProfile({ ...profile, sustainability: { ...profile.sustainability, environmentalPolicies: split(e.target.value) } })} /></label>
              <label>Social policies<input value={profile.sustainability.socialPolicies.join(", ")} onChange={(e) => setProfile({ ...profile, sustainability: { ...profile.sustainability, socialPolicies: split(e.target.value) } })} /></label>
              <label>Declaration valid until<input type="date" value={profile.eligibility.selfDeclarationValidUntil ?? ""} onChange={(e) => setProfile({ ...profile, eligibility: { ...profile.eligibility, selfDeclarationValidUntil: e.target.value || null } })} /></label>
            </div>
            <div className="declaration-grid">
              {([
                ["exclusionGroundsClear", "Exclusion grounds clear"],
                ["taxCompliance", "Tax compliance"],
                ["socialSecurityCompliance", "Social-security compliance"],
                ["insolvencyClear", "No insolvency"],
                ["corruptionAndFraudClear", "Corruption and fraud clear"],
                ["laborLawCompliance", "Labour-law compliance"],
                ["environmentalLawCompliance", "Environmental-law compliance"],
                ["conflictOfInterestClear", "No conflict of interest"],
              ] as const).map(([key, label]) => (
                <label key={key}>{label}<select value={profile.eligibility[key] === null ? "unknown" : String(profile.eligibility[key])} onChange={(e) => setProfile({ ...profile, eligibility: { ...profile.eligibility, [key]: e.target.value === "unknown" ? null : e.target.value === "true" } })}><option value="unknown">Not documented</option><option value="true">Confirmed</option><option value="false">Not satisfied</option></select></label>
              ))}
              <label>GDPR readiness<select value={profile.securityAndCompliance.gdprReady === null ? "unknown" : String(profile.securityAndCompliance.gdprReady)} onChange={(e) => setProfile({ ...profile, securityAndCompliance: { ...profile.securityAndCompliance, gdprReady: e.target.value === "unknown" ? null : e.target.value === "true" } })}><option value="unknown">Not documented</option><option value="true">Confirmed</option><option value="false">Not satisfied</option></select></label>
              <label>Incident response<select value={profile.securityAndCompliance.securityIncidentResponse === null ? "unknown" : String(profile.securityAndCompliance.securityIncidentResponse)} onChange={(e) => setProfile({ ...profile, securityAndCompliance: { ...profile.securityAndCompliance, securityIncidentResponse: e.target.value === "unknown" ? null : e.target.value === "true" } })}><option value="unknown">Not documented</option><option value="true">Confirmed</option><option value="false">Not satisfied</option></select></label>
              <label>Carbon reporting<select value={profile.sustainability.carbonReportingAvailable === null ? "unknown" : String(profile.sustainability.carbonReportingAvailable)} onChange={(e) => setProfile({ ...profile, sustainability: { ...profile.sustainability, carbonReportingAvailable: e.target.value === "unknown" ? null : e.target.value === "true" } })}><option value="unknown">Not documented</option><option value="true">Available</option><option value="false">Not available</option></select></label>
              <label>Diversity policy<select value={profile.sustainability.diversityPolicyAvailable === null ? "unknown" : String(profile.sustainability.diversityPolicyAvailable)} onChange={(e) => setProfile({ ...profile, sustainability: { ...profile.sustainability, diversityPolicyAvailable: e.target.value === "unknown" ? null : e.target.value === "true" } })}><option value="unknown">Not documented</option><option value="true">Available</option><option value="false">Not available</option></select></label>
            </div>
            <div className="repeatable-heading"><strong>Certifications</strong><button onClick={() => setProfile({ ...profile, certifications: [...profile.certifications, { name: "", issuer: null, certificateNumber: null, scope: null, issuedAt: null, validUntil: null, verificationStatus: "unverified", evidenceIds: [] }] })}><Plus size={14} /> Add certification</button></div>
            {profile.certifications.map((certificate, index) => (
              <div className="profile-form-grid repeatable-row" key={`certificate-${index}`}>
                <label>Name<input value={certificate.name} onChange={(e) => setProfile({ ...profile, certifications: profile.certifications.map((item, i) => i === index ? { ...item, name: e.target.value } : item) })} /></label>
                <label>Issuer<input value={certificate.issuer ?? ""} onChange={(e) => setProfile({ ...profile, certifications: profile.certifications.map((item, i) => i === index ? { ...item, issuer: e.target.value || null } : item) })} /></label>
                <label>Certificate number<input value={certificate.certificateNumber ?? ""} onChange={(e) => setProfile({ ...profile, certifications: profile.certifications.map((item, i) => i === index ? { ...item, certificateNumber: e.target.value || null } : item) })} /></label>
                <label>Valid until<input type="date" value={certificate.validUntil ?? ""} onChange={(e) => setProfile({ ...profile, certifications: profile.certifications.map((item, i) => i === index ? { ...item, validUntil: e.target.value || null } : item) })} /></label>
                <label>Scope<input value={certificate.scope ?? ""} onChange={(e) => setProfile({ ...profile, certifications: profile.certifications.map((item, i) => i === index ? { ...item, scope: e.target.value || null } : item) })} /></label>
                <button className="remove-row" aria-label="Remove certification" onClick={() => setProfile({ ...profile, certifications: profile.certifications.filter((_, i) => i !== index) })}><Trash2 size={15} /></button>
              </div>
            ))}
          </>
        )}
        {step === 5 && (
          <>
            <div className="builder-heading compact-heading"><div><small>STEP 6</small><h2>Team & comparable experience</h2><p>Structured roles and references support personnel and prior-project requirements.</p></div></div>
            <div className="repeatable-heading"><strong>Team capacity</strong><button onClick={() => setProfile({ ...profile, team: [...profile.team, { role: "", skills: [], languages: [], certifications: [], headcount: null, availableFte: null, minimumYearsExperience: null, locations: [], evidenceIds: [] }] })}><Plus size={14} /> Add role</button></div>
            {profile.team.map((team, index) => (
              <div className="profile-form-grid repeatable-row" key={`team-${index}`}>
                <label>Role<input value={team.role} onChange={(e) => setProfile({ ...profile, team: profile.team.map((item, i) => i === index ? { ...item, role: e.target.value } : item) })} /></label>
                <label>Headcount<input type="number" min="0" value={team.headcount ?? ""} onChange={(e) => setProfile({ ...profile, team: profile.team.map((item, i) => i === index ? { ...item, headcount: optionalNumber(e.target.value) } : item) })} /></label>
                <label>Available FTE<input type="number" min="0" step="0.1" value={team.availableFte ?? ""} onChange={(e) => setProfile({ ...profile, team: profile.team.map((item, i) => i === index ? { ...item, availableFte: optionalNumber(e.target.value) } : item) })} /></label>
                <label>Minimum experience (years)<input type="number" min="0" value={team.minimumYearsExperience ?? ""} onChange={(e) => setProfile({ ...profile, team: profile.team.map((item, i) => i === index ? { ...item, minimumYearsExperience: optionalNumber(e.target.value) } : item) })} /></label>
                <label>Skills<input value={team.skills.join(", ")} onChange={(e) => setProfile({ ...profile, team: profile.team.map((item, i) => i === index ? { ...item, skills: split(e.target.value) } : item) })} /></label>
                <label>Languages<input value={team.languages.join(", ")} onChange={(e) => setProfile({ ...profile, team: profile.team.map((item, i) => i === index ? { ...item, languages: split(e.target.value.toUpperCase()) } : item) })} /></label>
                <label>Certifications<input value={team.certifications.join(", ")} onChange={(e) => setProfile({ ...profile, team: profile.team.map((item, i) => i === index ? { ...item, certifications: split(e.target.value) } : item) })} /></label>
                <label>Locations<input value={team.locations.join(", ")} onChange={(e) => setProfile({ ...profile, team: profile.team.map((item, i) => i === index ? { ...item, locations: split(e.target.value) } : item) })} /></label>
                <button className="remove-row" aria-label="Remove team role" onClick={() => setProfile({ ...profile, team: profile.team.filter((_, i) => i !== index) })}><Trash2 size={15} /></button>
              </div>
            ))}
            <div className="repeatable-heading"><strong>Project references</strong><button onClick={() => setProfile({ ...profile, references: [...profile.references, { client: null, project: "", description: null, services: [], outcome: null, permissionToDisclose: false, startDate: null, endDate: null, contractValue: { amount: null, currency: "EUR" }, countryCode: null, cpvCodes: [], industries: [], supplierRole: null, teamSize: null, publicSector: null, evidenceIds: [] }] })}><Plus size={14} /> Add reference</button></div>
            {profile.references.map((reference, index) => (
              <div className="profile-form-grid repeatable-row reference-row" key={`reference-${index}`}>
                <label>Project<input value={reference.project} onChange={(e) => setProfile({ ...profile, references: profile.references.map((item, i) => i === index ? { ...item, project: e.target.value } : item) })} /></label>
                <label>Client<input value={reference.client ?? ""} onChange={(e) => setProfile({ ...profile, references: profile.references.map((item, i) => i === index ? { ...item, client: e.target.value || null } : item) })} /></label>
                <label>Start<input type="date" value={reference.startDate ?? ""} onChange={(e) => setProfile({ ...profile, references: profile.references.map((item, i) => i === index ? { ...item, startDate: e.target.value || null } : item) })} /></label>
                <label>End<input type="date" value={reference.endDate ?? ""} onChange={(e) => setProfile({ ...profile, references: profile.references.map((item, i) => i === index ? { ...item, endDate: e.target.value || null } : item) })} /></label>
                <label>Contract value<input type="number" min="0" value={reference.contractValue.amount ?? ""} onChange={(e) => setProfile({ ...profile, references: profile.references.map((item, i) => i === index ? { ...item, contractValue: { ...item.contractValue, amount: optionalNumber(e.target.value) } } : item) })} /></label>
                <label>Currency<input maxLength={3} value={reference.contractValue.currency ?? ""} onChange={(e) => setProfile({ ...profile, references: profile.references.map((item, i) => i === index ? { ...item, contractValue: { ...item.contractValue, currency: e.target.value.toUpperCase() || null } } : item) })} /></label>
                <label>Country<input maxLength={2} value={reference.countryCode ?? ""} onChange={(e) => setProfile({ ...profile, references: profile.references.map((item, i) => i === index ? { ...item, countryCode: e.target.value.toUpperCase() || null } : item) })} /></label>
                <label>Supplier role<input value={reference.supplierRole ?? ""} onChange={(e) => setProfile({ ...profile, references: profile.references.map((item, i) => i === index ? { ...item, supplierRole: e.target.value || null } : item) })} /></label>
                <label>CPV codes<input value={reference.cpvCodes.join(", ")} onChange={(e) => setProfile({ ...profile, references: profile.references.map((item, i) => i === index ? { ...item, cpvCodes: split(e.target.value) } : item) })} /></label>
                <label>Services<input value={reference.services.join(", ")} onChange={(e) => setProfile({ ...profile, references: profile.references.map((item, i) => i === index ? { ...item, services: split(e.target.value) } : item) })} /></label>
                <label>Industries<input value={reference.industries.join(", ")} onChange={(e) => setProfile({ ...profile, references: profile.references.map((item, i) => i === index ? { ...item, industries: split(e.target.value) } : item) })} /></label>
                <label>Team size<input type="number" min="0" value={reference.teamSize ?? ""} onChange={(e) => setProfile({ ...profile, references: profile.references.map((item, i) => i === index ? { ...item, teamSize: optionalNumber(e.target.value) } : item) })} /></label>
                <label>Client type<select value={reference.publicSector === null ? "unknown" : String(reference.publicSector)} onChange={(e) => setProfile({ ...profile, references: profile.references.map((item, i) => i === index ? { ...item, publicSector: e.target.value === "unknown" ? null : e.target.value === "true" } : item) })}><option value="unknown">Not documented</option><option value="true">Public sector</option><option value="false">Private sector</option></select></label>
                <label className="span-two">Description<textarea value={reference.description ?? ""} onChange={(e) => setProfile({ ...profile, references: profile.references.map((item, i) => i === index ? { ...item, description: e.target.value || null } : item) })} /></label>
                <label className="profile-checkbox"><input type="checkbox" checked={reference.permissionToDisclose} onChange={(e) => setProfile({ ...profile, references: profile.references.map((item, i) => i === index ? { ...item, permissionToDisclose: e.target.checked } : item) })} /> Permission to disclose</label>
                <button className="remove-row" aria-label="Remove reference" onClick={() => setProfile({ ...profile, references: profile.references.filter((_, i) => i !== index) })}><Trash2 size={15} /></button>
              </div>
            ))}
          </>
        )}
        {step === 6 && (
          <>
            <div className="builder-heading compact-heading"><div><small>STEP 7</small><h2>Electronic submission readiness</h2><p>Describe actual operational readiness and participation preferences.</p></div></div>
            <div className="profile-form-grid">
              <label>Procurement platforms<input value={profile.procurementReadiness.platforms.join(", ")} onChange={(e) => setProfile({ ...profile, procurementReadiness: { ...profile.procurementReadiness, platforms: split(e.target.value) } })} placeholder="eVergabe-Online, TED eTendering" /></label>
              <label>Tender languages<input value={profile.procurementReadiness.tenderLanguages.join(", ")} onChange={(e) => setProfile({ ...profile, procurementReadiness: { ...profile.procurementReadiness, tenderLanguages: split(e.target.value.toUpperCase()) } })} placeholder="DEU, ENG" /></label>
              <label>Supported formats<input value={profile.procurementReadiness.supportedFormats.join(", ")} onChange={(e) => setProfile({ ...profile, procurementReadiness: { ...profile.procurementReadiness, supportedFormats: split(e.target.value) } })} placeholder="PDF/A, XML, DOCX, XLSX, ZIP" /></label>
              <label>Default tender validity (days)<input type="number" min="0" value={profile.procurementReadiness.defaultTenderValidityDays ?? ""} onChange={(e) => setProfile({ ...profile, procurementReadiness: { ...profile.procurementReadiness, defaultTenderValidityDays: e.target.value ? Number(e.target.value) : null } })} /></label>
              <label>Internal approval lead time (days)<input type="number" min="0" value={profile.procurementReadiness.internalApprovalLeadDays ?? ""} onChange={(e) => setProfile({ ...profile, procurementReadiness: { ...profile.procurementReadiness, internalApprovalLeadDays: optionalNumber(e.target.value) } })} /></label>
              <label>Minimum notice period (days)<input type="number" min="0" value={profile.participationPreferences.minimumNoticeDays ?? ""} onChange={(e) => setProfile({ ...profile, participationPreferences: { ...profile.participationPreferences, minimumNoticeDays: optionalNumber(e.target.value) } })} /></label>
              <label>Preferred currencies<input value={profile.participationPreferences.preferredCurrencies.join(", ")} onChange={(e) => setProfile({ ...profile, participationPreferences: { ...profile.participationPreferences, preferredCurrencies: split(e.target.value.toUpperCase()) } })} /></label>
              <label className="profile-checkbox"><input type="checkbox" checked={profile.procurementReadiness.electronicSubmissionReady} onChange={(e) => setProfile({ ...profile, procurementReadiness: { ...profile.procurementReadiness, electronicSubmissionReady: e.target.checked } })} /> Electronic submission operational</label>
              <label className="profile-checkbox"><input type="checkbox" checked={profile.procurementReadiness.qualifiedElectronicSignature} onChange={(e) => setProfile({ ...profile, procurementReadiness: { ...profile.procurementReadiness, qualifiedElectronicSignature: e.target.checked } })} /> Qualified electronic signature available</label>
              <label className="profile-checkbox"><input type="checkbox" checked={profile.procurementReadiness.multipleOffersSupported} onChange={(e) => setProfile({ ...profile, procurementReadiness: { ...profile.procurementReadiness, multipleOffersSupported: e.target.checked } })} /> Multiple offers supported</label>
              <label className="profile-checkbox"><input type="checkbox" checked={profile.participationPreferences.lotsSupported} onChange={(e) => setProfile({ ...profile, participationPreferences: { ...profile.participationPreferences, lotsSupported: e.target.checked } })} /> Lot participation supported</label>
              <label className="profile-checkbox"><input type="checkbox" checked={profile.participationPreferences.consortiumParticipation} onChange={(e) => setProfile({ ...profile, participationPreferences: { ...profile.participationPreferences, consortiumParticipation: e.target.checked } })} /> Consortium participation</label>
              <label className="profile-checkbox"><input type="checkbox" checked={profile.participationPreferences.subcontractingOffered} onChange={(e) => setProfile({ ...profile, participationPreferences: { ...profile.participationPreferences, subcontractingOffered: e.target.checked } })} /> Offers subcontracting</label>
              <label className="profile-checkbox"><input type="checkbox" checked={profile.participationPreferences.subcontractingAccepted} onChange={(e) => setProfile({ ...profile, participationPreferences: { ...profile.participationPreferences, subcontractingAccepted: e.target.checked } })} /> Accepts subcontracting</label>
            </div>
          </>
        )}
        {step === 7 && (
          <div className="profile-review">
            <Check size={28} />
            <h2>Save as a company-controlled draft</h2>
            <p>{profile.identity.legalName ?? "Unnamed company"} · {profile.capabilities.services.length} services · {profile.procurementReadiness.platforms.length} procurement platforms</p>
            <p>Nothing is published or submitted externally. You can add documents and refine every section later.</p>
          </div>
        )}
      </div>
      <div className="manual-actions">
        <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}><ArrowLeft size={15} /> Back</button>
        {step < steps.length - 1
          ? <button className="primary" onClick={() => setStep(step + 1)}>Continue <ArrowRight size={15} /></button>
          : <button className="primary" onClick={saveManual} disabled={status === "working"}>{status === "working" ? <LoaderCircle className="spin" size={16} /> : <Check size={16} />} Save draft</button>}
      </div>
      {message && <p className={`builder-message ${status}`}>{message}</p>}
    </section>
  );
}

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
  TestTube2,
  Sparkles,
  UploadCloud,
} from "lucide-react";
import type { CompanyProfile } from "@/domain/company-profile";

const steps = ["Company", "Capabilities", "Bid readiness", "Review"];

function split(value: string) {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
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
              <label>Legal form<input value={profile.identity.legalForm ?? ""} onChange={(e) => setProfile({ ...profile, identity: { ...profile.identity, legalForm: e.target.value || null } })} /></label>
              <label>Registration number<input value={profile.identity.registrationNumber ?? ""} onChange={(e) => setProfile({ ...profile, identity: { ...profile.identity, registrationNumber: e.target.value || null } })} /></label>
              <label>VAT ID<input value={profile.identity.vatId ?? ""} onChange={(e) => setProfile({ ...profile, identity: { ...profile.identity, vatId: e.target.value || null } })} /></label>
              <label>Country code<input maxLength={2} value={profile.identity.registrationCountry ?? ""} onChange={(e) => setProfile({ ...profile, identity: { ...profile.identity, registrationCountry: e.target.value.toUpperCase() || null } })} /></label>
              <label>Official website<input type="url" value={profile.identity.website ?? ""} onChange={(e) => setProfile({ ...profile, identity: { ...profile.identity, website: e.target.value || null } })} /></label>
              <label className="span-two">Company description<textarea value={profile.identity.companyDescription ?? ""} onChange={(e) => setProfile({ ...profile, identity: { ...profile.identity, companyDescription: e.target.value || null } })} /></label>
            </div>
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
            </div>
          </>
        )}
        {step === 2 && (
          <>
            <div className="builder-heading compact-heading"><div><small>STEP 3</small><h2>Electronic submission readiness</h2><p>Describe actual operational readiness, not intended future capability.</p></div></div>
            <div className="profile-form-grid">
              <label>Procurement platforms<input value={profile.procurementReadiness.platforms.join(", ")} onChange={(e) => setProfile({ ...profile, procurementReadiness: { ...profile.procurementReadiness, platforms: split(e.target.value) } })} placeholder="eVergabe-Online, TED eTendering" /></label>
              <label>Tender languages<input value={profile.procurementReadiness.tenderLanguages.join(", ")} onChange={(e) => setProfile({ ...profile, procurementReadiness: { ...profile.procurementReadiness, tenderLanguages: split(e.target.value.toUpperCase()) } })} placeholder="DEU, ENG" /></label>
              <label>Supported formats<input value={profile.procurementReadiness.supportedFormats.join(", ")} onChange={(e) => setProfile({ ...profile, procurementReadiness: { ...profile.procurementReadiness, supportedFormats: split(e.target.value) } })} placeholder="PDF/A, XML, DOCX, XLSX, ZIP" /></label>
              <label>Default tender validity (days)<input type="number" min="0" value={profile.procurementReadiness.defaultTenderValidityDays ?? ""} onChange={(e) => setProfile({ ...profile, procurementReadiness: { ...profile.procurementReadiness, defaultTenderValidityDays: e.target.value ? Number(e.target.value) : null } })} /></label>
              <label className="profile-checkbox"><input type="checkbox" checked={profile.procurementReadiness.electronicSubmissionReady} onChange={(e) => setProfile({ ...profile, procurementReadiness: { ...profile.procurementReadiness, electronicSubmissionReady: e.target.checked } })} /> Electronic submission operational</label>
              <label className="profile-checkbox"><input type="checkbox" checked={profile.procurementReadiness.qualifiedElectronicSignature} onChange={(e) => setProfile({ ...profile, procurementReadiness: { ...profile.procurementReadiness, qualifiedElectronicSignature: e.target.checked } })} /> Qualified electronic signature available</label>
            </div>
          </>
        )}
        {step === 3 && (
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

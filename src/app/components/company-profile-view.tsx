import {
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  FileCheck2,
  Globe2,
  Languages,
  Send,
  ShieldCheck,
} from "lucide-react";
import { MessageResponse } from "@/components/ai-elements/message";
import type { CompanyProfile } from "@/domain/company-profile";

function AiValue({ children }: { children: string }) {
  return <MessageResponse className="profile-ai-value">{children}</MessageResponse>;
}

function Chips({ values }: { values: string[] }) {
  return values.length > 0
    ? <div className="profile-chips">{values.map((value) => <span key={value}><AiValue>{value}</AiValue></span>)}</div>
    : <p className="profile-missing">Not documented yet</p>;
}

function Fact({ value }: { value: string | null }) {
  return value ? <AiValue>{value}</AiValue> : <>—</>;
}

export function CompanyProfileView({
  profile,
  completion,
}: {
  profile: CompanyProfile;
  completion: number;
}) {
  return (
    <section className="company-profile-view">
      <div className="profile-overview panel">
        <div>
          <small>COMPANY BID PROFILE</small>
          <div className="profile-name">
            {profile.identity.legalName ? <AiValue>{profile.identity.legalName}</AiValue> : "Company profile draft"}
          </div>
          {profile.identity.companyDescription
            ? <AiValue>{profile.identity.companyDescription}</AiValue>
            : <p className="profile-missing">Add a company description or generate it from evidence.</p>}
        </div>
        <div className="profile-completion">
          <strong>{completion}%</strong>
          <span>profile complete</span>
          <div><b style={{ width: `${completion}%` }} /></div>
        </div>
      </div>

      <div className="profile-section-grid">
        <section className="profile-section panel">
          <div className="profile-section-title"><Building2 size={18} /><div><small>IDENTITY</small><h3>Company facts</h3></div></div>
          <dl>
            <div><dt>Legal form</dt><dd><Fact value={profile.identity.legalForm} /></dd></div>
            <div><dt>Registration</dt><dd><Fact value={profile.identity.registrationNumber} /></dd></div>
            <div><dt>VAT ID</dt><dd><Fact value={profile.identity.vatId} /></dd></div>
            <div><dt>Country</dt><dd><Fact value={profile.identity.registrationCountry} /></dd></div>
            <div><dt>Website</dt><dd><Fact value={profile.identity.website} /></dd></div>
          </dl>
        </section>
        <section className="profile-section panel">
          <div className="profile-section-title"><BriefcaseBusiness size={18} /><div><small>MATCHING</small><h3>Services & CPV</h3></div></div>
          <Chips values={profile.capabilities.services} />
          <Chips values={profile.capabilities.cpvCodes.map((code) => `CPV ${code}`)} />
        </section>
        <section className="profile-section panel">
          <div className="profile-section-title"><Send size={18} /><div><small>ESUBMISSION</small><h3>Electronic submission</h3></div></div>
          <span className={`readiness ${profile.procurementReadiness.electronicSubmissionReady ? "ready" : ""}`}>
            {profile.procurementReadiness.electronicSubmissionReady ? <BadgeCheck size={15} /> : <ShieldCheck size={15} />}
            {profile.procurementReadiness.electronicSubmissionReady ? "Operationally ready" : "Readiness not evidenced"}
          </span>
          <Chips values={profile.procurementReadiness.platforms} />
          <Chips values={profile.procurementReadiness.supportedFormats} />
        </section>
        <section className="profile-section panel">
          <div className="profile-section-title"><Languages size={18} /><div><small>LANGUAGES</small><h3>Tender languages</h3></div></div>
          <Chips values={profile.procurementReadiness.tenderLanguages} />
          <dl>
            <div><dt>Default validity</dt><dd>{profile.procurementReadiness.defaultTenderValidityDays ? `${profile.procurementReadiness.defaultTenderValidityDays} days` : "—"}</dd></div>
            <div><dt>Multiple offers</dt><dd>{profile.procurementReadiness.multipleOffersSupported ? "Supported" : "Not confirmed"}</dd></div>
          </dl>
        </section>
        <section className="profile-section panel">
          <div className="profile-section-title"><FileCheck2 size={18} /><div><small>EVIDENCE</small><h3>Certifications</h3></div></div>
          <Chips values={profile.certifications.map((item) => item.name)} />
        </section>
        <section className="profile-section panel">
          <div className="profile-section-title"><Globe2 size={18} /><div><small>DELIVERY</small><h3>Coverage</h3></div></div>
          <Chips values={profile.capabilities.deliveryCountries} />
          <Chips values={profile.capabilities.deliveryModels} />
        </section>
      </div>
    </section>
  );
}

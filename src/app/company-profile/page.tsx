import { Building2, ShieldCheck } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { emptyCompanyProfile, getCompanyProfile } from "@/lib/company-profile";
import { MarketplaceSidebar } from "@/app/components/marketplace-sidebar";
import { CompanyProfileBuilder } from "@/app/components/company-profile-builder";
import { CompanyProfileView } from "@/app/components/company-profile-view";

export default async function CompanyProfilePage() {
  const user = await requireUser();
  if (!user.organizationId) {
    return (
      <main className="shell">
        <MarketplaceSidebar user={user} active="company-profile" />
        <section className="content"><div className="empty-state"><Building2 size={30} /><h1>Organization required</h1><p>Join an organization before creating a company profile.</p></div></section>
      </main>
    );
  }
  const current = await getCompanyProfile(user.organizationId);
  const profile = current?.profile ?? emptyCompanyProfile;

  return (
    <main className="shell">
      <MarketplaceSidebar user={user} active="company-profile" />
      <section className="content company-profile-page">
        <header>
          <div>
            <p>SUPPLIER WORKSPACE</p>
            <h1>Company Profile</h1>
            <span>Build a reusable, evidence-backed profile for matching and bid preparation.</span>
          </div>
          {current && (
            <div className="profile-status">
              <ShieldCheck size={16} />
              <div><small>{current.status.toUpperCase()}</small><strong>{current.completionPercent}% complete</strong></div>
            </div>
          )}
        </header>

        {current && <CompanyProfileView profile={profile} completion={current.completionPercent} />}

        <div className="profile-builder-intro">
          <small>{current ? "UPDATE PROFILE" : "GET STARTED"}</small>
          <h2>{current ? "Add or improve company evidence" : "How would you like to create the profile?"}</h2>
          <p>Choose guided entry or let AI prepare a draft from trusted company sources.</p>
        </div>
        <CompanyProfileBuilder initialProfile={profile} />
      </section>
    </main>
  );
}

import {
  Building2,
  Database,
  FileText,
  LogOut,
  Search,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import type { SessionUser } from "@/lib/auth";

export function MarketplaceSidebar({
  user,
  active = "marketplace",
}: {
  user: SessionUser;
  active?: "marketplace" | "detail" | "company-profile";
}) {
  return (
    <aside className="sidebar">
      <div className="brand"><span className="brandmark">P</span><span>Procurelio</span></div>
      <div className="workspace">
        <span className="avatar">{user.organizationName?.slice(0, 2).toUpperCase() ?? "TL"}</span>
        <span>
          <strong>{user.organizationName ?? "No organization"}</strong>
          <small>{user.organizationRole ?? "Platform account"}</small>
        </span>
      </div>
      <nav aria-label="Primary navigation">
        <p>MARKETPLACE</p>
        <Link className={`nav-link ${active === "marketplace" ? "active" : ""}`} href="/marketplace">
          <Search size={18} /> Public opportunities
        </Link>
        <Link className="nav-link" href="/api/tenders">
          <Database size={18} /> Tenders API
        </Link>
        <p>WORKSPACE</p>
        <span className="nav-link disabled"><FileText size={18} /> Private tenders</span>
        <Link className={`nav-link ${active === "company-profile" ? "active" : ""}`} href="/company-profile">
          <Building2 size={18} /> Company profile
        </Link>
      </nav>
      <div className="profile-progress">
        <span><ShieldCheck size={17} /> Authenticated <strong>Neon</strong></span>
        <small>{user.email}</small>
      </div>
      <form action="/logout" method="post">
        <button className="logout-button"><LogOut size={16} /> Sign out</button>
      </form>
    </aside>
  );
}

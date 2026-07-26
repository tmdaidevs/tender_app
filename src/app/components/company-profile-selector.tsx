"use client";

import { useRouter } from "next/navigation";
import { Layers3 } from "lucide-react";

export function CompanyProfileSelector({
  profiles,
  selectedId,
}: {
  profiles: Array<{ id: string; name: string; isSample: boolean; completionPercent: number }>;
  selectedId: string | null;
}) {
  const router = useRouter();
  if (profiles.length === 0) return null;

  return (
    <label className="profile-selector">
      <span><Layers3 size={15} /> Active bid profile</span>
      <select
        aria-label="Active bid profile"
        value={selectedId ?? ""}
        onChange={(event) => router.push(`/company-profile?profileId=${event.target.value}`)}
      >
        {profiles.map((profile) => (
          <option key={profile.id} value={profile.id}>
            {profile.name}{profile.isSample ? " · SAMPLE" : ""} · {profile.completionPercent}%
          </option>
        ))}
      </select>
      <small>This profile can later be selected when starting a bid.</small>
    </label>
  );
}

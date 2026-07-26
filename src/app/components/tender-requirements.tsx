import { BadgeCheck, Bot, CircleHelp } from "lucide-react";
import type { NormalizedTenderRequirement } from "@/domain/tender-requirement";

function formatRequirementValue(requirement: NormalizedTenderRequirement) {
  const value = requirement.value;
  if (value.type === "codes") return value.codes.join(", ");
  if (value.type === "money") return `${value.amount.toLocaleString("en-GB")} ${value.currency}`;
  if (value.type === "number") return `${value.amount}${value.unit ? ` ${value.unit}` : ""}`;
  if (value.type === "boolean") return value.value ? "Required" : "Not required";
  return value.value;
}

export function TenderRequirements({
  requirements,
  candidate = false,
}: {
  requirements: NormalizedTenderRequirement[];
  candidate?: boolean;
}) {
  return (
    <section className={`panel detail-section normalized-requirements ${candidate ? "candidate-requirements" : ""}`}>
      <div className="section-title">
        {candidate ? <Bot size={18} /> : <BadgeCheck size={18} />}
        <div>
          <h2>{candidate ? "Requirement candidates" : "Normalized official constraints"}</h2>
          <small>
            {candidate
              ? "Extracted by AI · review before use in eligibility"
              : "Directly normalized from official source fields"}
          </small>
        </div>
      </div>
      {requirements.length === 0 ? (
        <p className="source-absence">
          {candidate
            ? "No structured requirement candidates were extracted."
            : "The current official source record contains no normalized constraints."}
        </p>
      ) : (
        <div className="requirement-list">
          {requirements.map((requirement) => (
            <article key={requirement.id}>
              <div className="requirement-heading">
                <span>{requirement.category}</span>
                <strong>{requirement.title}</strong>
                <em className={requirement.mandatory === true ? "mandatory" : ""}>
                  {requirement.mandatory === true
                    ? "Mandatory"
                    : requirement.mandatory === false
                      ? "Optional"
                      : "Not specified"}
                </em>
              </div>
              <p>{formatRequirementValue(requirement)}</p>
              {requirement.description && <small>{requirement.description}</small>}
              <footer>
                <CircleHelp size={12} />
                {requirement.source.path}
                <a href={requirement.source.url} target="_blank" rel="noreferrer">Source ↗</a>
              </footer>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

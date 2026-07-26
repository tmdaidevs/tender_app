import { Filter, Search, SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import type { TenderListInput, TenderSourceStatus } from "@/lib/tenders";

export function MarketplaceFilters({
  filters,
  sources,
}: {
  filters: TenderListInput;
  sources: TenderSourceStatus[];
}) {
  const activeFilterCount = [
    filters.countries.length > 0,
    filters.sources.length > 0,
    Boolean(filters.buyer),
    Boolean(filters.cpv),
    Boolean(filters.publishedFrom || filters.publishedTo),
    Boolean(filters.deadlineFrom || filters.deadlineTo),
    filters.minValue !== undefined || filters.maxValue !== undefined,
    filters.currency !== undefined,
    filters.valueAvailability !== "all",
    filters.deadlineAvailability !== "all",
    filters.sort !== "deadline_asc",
  ].filter(Boolean).length;

  return (
    <form className="market-filter-form" method="get">
      <div className="search-row">
        <label className="search-field">
          <Search size={17} />
          <input
            name="q"
            defaultValue={filters.q}
            placeholder="Search title, description, buyer, notice ID or CPV"
          />
        </label>
        <button className="primary" type="submit">Search</button>
        <details className="filter-disclosure" open={activeFilterCount > 0}>
          <summary>
            <SlidersHorizontal size={16} />
            Filters
            {activeFilterCount > 0 && <b>{activeFilterCount}</b>}
          </summary>
          <div className="filter-panel">
            <div className="filter-panel-heading">
              <span><Filter size={16} /><strong>Refine opportunities</strong></span>
              <small>Selections take effect only after Apply filters.</small>
            </div>

            <fieldset>
              <legend>Place of performance</legend>
              <div className="choice-row">
                {[
                  ["DE", "Germany"],
                  ["AT", "Austria"],
                  ["CH", "Switzerland"],
                ].map(([code, label]) => (
                  <label key={code}>
                    <input
                      type="checkbox"
                      name="country"
                      value={code}
                      defaultChecked={filters.countries.includes(code as "DE" | "AT" | "CH")}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend>Official source</legend>
              <div className="choice-row">
                {sources.map((source) => (
                  <label key={source.code}>
                    <input
                      type="checkbox"
                      name="source"
                      value={source.code}
                      defaultChecked={filters.sources.includes(source.code)}
                    />
                    {source.name}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="filter-grid">
              <label>
                Buyer or authority
                <input name="buyer" defaultValue={filters.buyer} placeholder="e.g. Stadt Berlin" />
              </label>
              <label>
                CPV code
                <input name="cpv" defaultValue={filters.cpv} placeholder="e.g. 72000000" />
              </label>
              <label>
                Published from
                <input type="date" name="publishedFrom" defaultValue={filters.publishedFrom} />
              </label>
              <label>
                Published to
                <input type="date" name="publishedTo" defaultValue={filters.publishedTo} />
              </label>
              <label>
                Deadline from
                <input type="date" name="deadlineFrom" defaultValue={filters.deadlineFrom} />
              </label>
              <label>
                Deadline to
                <input type="date" name="deadlineTo" defaultValue={filters.deadlineTo} />
              </label>
              <label>
                Minimum value
                <input type="number" min="0" name="minValue" defaultValue={filters.minValue} />
              </label>
              <label>
                Maximum value
                <input type="number" min="0" name="maxValue" defaultValue={filters.maxValue} />
              </label>
              <label>
                Currency
                <select name="currency" defaultValue={filters.currency ?? ""}>
                  <option value="">Any currency</option>
                  <option value="EUR">EUR</option>
                  <option value="CHF">CHF</option>
                </select>
              </label>
              <label>
                Value information
                <select name="valueAvailability" defaultValue={filters.valueAvailability}>
                  <option value="all">Disclosed or undisclosed</option>
                  <option value="disclosed">Value disclosed</option>
                  <option value="undisclosed">Value not disclosed</option>
                </select>
              </label>
              <label>
                Deadline information
                <select name="deadlineAvailability" defaultValue={filters.deadlineAvailability}>
                  <option value="all">Dated or undated</option>
                  <option value="dated">Deadline supplied</option>
                  <option value="undated">No deadline supplied</option>
                </select>
              </label>
              <label>
                Sort results
                <select name="sort" defaultValue={filters.sort}>
                  <option value="deadline_asc">Deadline: soonest</option>
                  <option value="deadline_desc">Deadline: latest</option>
                  <option value="published_desc">Published: newest</option>
                  <option value="published_asc">Published: oldest</option>
                  <option value="value_desc">Value: highest</option>
                  <option value="value_asc">Value: lowest</option>
                </select>
              </label>
            </div>

            <div className="filter-actions">
              <Link href="/"><X size={15} /> Clear all</Link>
              <button className="primary" type="submit">Apply filters</button>
            </div>
          </div>
        </details>
      </div>
    </form>
  );
}

import { Plus } from "lucide-react";
import { SPONSOR_TIERS } from "../../constants/sponsors";
import { formatCurrency } from "../../utils/format";

const TierMatrix = ({ sponsors, event, onOpen }) => (
  <div className="grid gap-4 lg:grid-cols-3">
    {Object.entries(SPONSOR_TIERS).map(([key, tier]) => {
      const members = sponsors
        .filter((sponsor) => sponsor.tier === key)
        .sort((a, b) => b.contractValue - a.contractValue);
      const total = members.reduce(
        (sum, sponsor) => sum + sponsor.contractValue,
        0,
      );
      const openSlots =
        event && tier.limit !== null
          ? Math.max(tier.limit - members.length, 0)
          : 0;

      return (
        <div key={key} className="rounded-3xl border border-line bg-card p-5">
          <div className="flex items-center justify-between gap-3">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${tier.tone}`}
            >
              {tier.label}
            </span>
            <span className="text-sm text-muted">
              {members.length}
              {event && tier.limit !== null ? ` of ${tier.limit}` : ""}
            </span>
          </div>

          <p className="mt-4 font-display text-3xl font-semibold">
            {formatCurrency(total)}
          </p>
          <p className="mt-1 text-xs text-muted">{tier.hint}</p>

          <div className="mt-4 space-y-2">
            {members.map((sponsor) => (
              <button
                key={sponsor.id}
                type="button"
                onClick={() => onOpen(sponsor.id)}
                className="flex w-full items-center justify-between gap-3 rounded-xl border border-line bg-elevated px-4 py-2.5 text-left text-sm transition hover:border-primary"
              >
                <span className="truncate font-semibold">
                  {sponsor.brandName}
                </span>
                <span className="shrink-0 text-muted">
                  {formatCurrency(sponsor.contractValue)}
                </span>
              </button>
            ))}

            {Array.from({ length: openSlots }, (_, index) => (
              <p
                key={index}
                className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-line px-4 py-2.5 text-sm text-muted"
              >
                <Plus className="size-4" />
                Slot open
              </p>
            ))}

            {!members.length && openSlots === 0 && (
              <p className="rounded-xl border border-dashed border-line px-4 py-2.5 text-center text-sm text-muted">
                No sponsors in this tier yet
              </p>
            )}
          </div>
        </div>
      );
    })}
  </div>
);

export default TierMatrix;

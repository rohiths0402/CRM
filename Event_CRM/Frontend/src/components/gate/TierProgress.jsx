import { formatNumber, formatPercent } from "../../utils/format";

const TierProgress = ({ tiers }) => (
  <div className="rounded-3xl border border-line bg-card p-6">
    <h3 className="text-lg font-semibold">Check-in by ticket type</h3>
    <p className="mt-1 text-sm text-muted">
      Each ticket type enters through its own gate and zone.
    </p>

    <div className="mt-5 space-y-5">
      {tiers.map((tier) => {
        const percent = formatPercent(tier.checkedIn, tier.expected);
        return (
          <div key={tier.tierId}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{tier.name}</p>
                <p className="mt-0.5 text-xs text-muted">
                  {tier.gate} · {tier.zone}
                </p>
              </div>
              <p className="shrink-0 text-sm text-muted">
                <span className="font-semibold text-foreground">
                  {formatNumber(tier.checkedIn)}
                </span>{" "}
                / {formatNumber(tier.expected)}
              </p>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-line">
              <div
                className="h-full rounded-full bg-gradient-to-r from-accent to-primary transition-all duration-700"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        );
      })}
      {!tiers.length && (
        <p className="text-sm text-muted">
          No tickets are sold for this event yet.
        </p>
      )}
    </div>
  </div>
);

export default TierProgress;

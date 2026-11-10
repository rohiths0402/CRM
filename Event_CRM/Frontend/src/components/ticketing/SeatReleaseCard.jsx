import { Plus } from "lucide-react";
import Button from "../common/Button";
import StatusBadge from "../common/StatusBadge";
import { formatNumber, formatPercent } from "../../utils/format";

const Legend = ({ swatch, label, value }) => (
  <div className="flex items-center gap-2 text-sm">
    <span className={`size-3 rounded-full ${swatch}`} />
    <span className="text-muted">{label}</span>
    <span className="font-semibold">{formatNumber(value)}</span>
  </div>
);

const SeatReleaseCard = ({ event, tiers, canEdit, onAddTier }) => {
  const released = tiers.reduce((sum, tier) => sum + tier.quota, 0);
  const sold = tiers.reduce((sum, tier) => sum + tier.sold, 0);
  const onOffer = released - sold;
  const notReleased = event.capacity - released;

  return (
    <div className="rounded-3xl border border-line bg-card p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="font-display text-2xl font-semibold">
              {event.title}
            </h3>
            <StatusBadge status={event.status} />
          </div>
          <p className="mt-1 text-sm text-muted">
            {formatNumber(event.capacity)} seats for this event.{" "}
            {formatPercent(released, event.capacity)}% are released for sale
            through tiers.
          </p>
        </div>
        {canEdit && notReleased > 0 && event.status !== "WRAP" && (
          <Button variant="ghost" className="h-10 px-4" onClick={onAddTier}>
            <Plus className="size-4" />
            Add tier for this event
          </Button>
        )}
      </div>

      <div className="mt-5 flex h-3 overflow-hidden rounded-full bg-line">
        <div
          className="h-full bg-gradient-to-r from-accent to-primary"
          style={{ width: `${formatPercent(sold, event.capacity)}%` }}
        />
        <div
          className="h-full bg-primary/30"
          style={{ width: `${formatPercent(onOffer, event.capacity)}%` }}
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-x-8 gap-y-2">
        <Legend swatch="bg-primary" label="Sold" value={sold} />
        <Legend
          swatch="bg-primary/30"
          label="Released, still on offer"
          value={onOffer}
        />
        <Legend swatch="bg-line" label="Not released yet" value={notReleased} />
      </div>

      {tiers.length === 0 && (
        <p className="mt-4 text-sm text-muted">
          This event has no ticket tiers yet. Add a tier to start releasing
          seats.
        </p>
      )}
    </div>
  );
};

export default SeatReleaseCard;

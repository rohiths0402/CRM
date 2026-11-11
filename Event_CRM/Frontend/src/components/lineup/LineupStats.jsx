import { IndianRupee, ListChecks, Mic2, Wallet } from "lucide-react";
import SpotlightCard from "../common/SpotlightCard";
import { formatCurrency, formatPercent } from "../../utils/format";

const LineupStats = ({ slots, event }) => {
  const active = slots.filter((slot) => slot.status !== "CANCELLED");
  const confirmed = active.filter((slot) => slot.status === "CONFIRMED").length;
  const fees = active.reduce((sum, slot) => sum + slot.fee, 0);
  const advance = active.reduce((sum, slot) => sum + slot.advancePaid, 0);
  const items = active.flatMap((slot) => slot.riderItems);
  const ready = items.filter((item) => item.status === "READY").length;

  const stats = [
    {
      label: "Acts in lineup",
      value: active.length,
      note: `${confirmed} confirmed, ${active.length - confirmed} tentative`,
      icon: Mic2,
    },
    {
      label: "Artist fees",
      value: formatCurrency(fees),
      note: `${formatPercent(fees, event.budget)}% of the ${formatCurrency(event.budget)} production budget`,
      icon: IndianRupee,
    },
    {
      label: "Advance paid",
      value: formatCurrency(advance),
      note: `${formatCurrency(Math.max(fees - advance, 0))} balance to pay`,
      icon: Wallet,
    },
    {
      label: "Rider items ready",
      value: `${formatPercent(ready, items.length)}%`,
      note: `${ready} of ${items.length} items ready`,
      icon: ListChecks,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map(({ label, value, note, icon: Icon }) => (
        <SpotlightCard key={label} className="p-5">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-semibold">{label}</p>
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/12 text-primary">
              <Icon className="size-[18px]" />
            </span>
          </div>
          <p className="mt-3 font-display text-3xl font-semibold">{value}</p>
          <p className="mt-1 text-xs text-muted">{note}</p>
        </SpotlightCard>
      ))}
    </div>
  );
};

export default LineupStats;

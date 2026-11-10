import { Handshake, IndianRupee, ListChecks, Wallet } from "lucide-react";
import SpotlightCard from "../common/SpotlightCard";
import { formatCurrency } from "../../utils/format";
import { deliverableStats } from "./sponsorHelpers";

const SponsorStats = ({ sponsors }) => {
  const value = sponsors.reduce(
    (sum, sponsor) => sum + sponsor.contractValue,
    0,
  );
  const received = sponsors.reduce(
    (sum, sponsor) => sum + sponsor.amountReceived,
    0,
  );
  const eventCount = new Set(sponsors.map((sponsor) => sponsor.eventId)).size;

  const checklist = sponsors.reduce(
    (totals, sponsor) => {
      const stats = deliverableStats(sponsor);
      return {
        total: totals.total + stats.total,
        done: totals.done + stats.done,
        overdue: totals.overdue + stats.overdue,
      };
    },
    { total: 0, done: 0, overdue: 0 },
  );

  const stats = [
    {
      label: "Total sponsors",
      value: sponsors.length,
      note: `Across ${eventCount} event${eventCount === 1 ? "" : "s"}`,
      icon: Handshake,
    },
    {
      label: "Contract value",
      value: formatCurrency(value),
      note: "Total of all sponsorship deals",
      icon: IndianRupee,
    },
    {
      label: "Amount received",
      value: formatCurrency(received),
      note: `${formatCurrency(Math.max(value - received, 0))} still to collect`,
      icon: Wallet,
    },
    {
      label: "Deliverables done",
      value: `${checklist.total ? Math.round((checklist.done / checklist.total) * 100) : 0}%`,
      note: `${checklist.done} of ${checklist.total} done${checklist.overdue ? `, ${checklist.overdue} overdue` : ""}`,
      icon: ListChecks,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map(({ label, value: figure, note, icon: Icon }) => (
        <SpotlightCard key={label} className="p-5">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-semibold">{label}</p>
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/12 text-primary">
              <Icon className="size-[18px]" />
            </span>
          </div>
          <p className="mt-3 font-display text-3xl font-semibold">{figure}</p>
          <p className="mt-1 text-xs text-muted">{note}</p>
        </SpotlightCard>
      ))}
    </div>
  );
};

export default SponsorStats;

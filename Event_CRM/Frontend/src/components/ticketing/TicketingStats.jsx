import { BadgePercent, IndianRupee, Radio, Ticket } from "lucide-react";
import SpotlightCard from "../common/SpotlightCard";
import { formatCurrency, formatNumber } from "../../utils/format";
import { promoState } from "./ticketingHelpers";

const TicketingStats = ({ tiers, promos }) => {
  const sold = tiers.reduce((sum, tier) => sum + tier.sold, 0);
  const released = tiers.reduce((sum, tier) => sum + tier.quota, 0);
  const revenue = tiers.reduce((sum, tier) => sum + tier.sold * tier.price, 0);
  const onSale = tiers.filter((tier) => tier.status === "ACTIVE").length;
  const activeCodes = promos.filter(
    (promo) => promoState(promo) === "ACTIVE",
  ).length;

  const stats = [
    {
      label: "Tickets sold",
      value: formatNumber(sold),
      note: `Out of ${formatNumber(released)} tickets released`,
      icon: Ticket,
    },
    {
      label: "Ticket revenue",
      value: formatCurrency(revenue),
      note: "Base price before GST",
      icon: IndianRupee,
    },
    {
      label: "Tiers on sale",
      value: onSale,
      note: `Out of ${tiers.length} tiers in total`,
      icon: Radio,
    },
    {
      label: "Active promo codes",
      value: activeCodes,
      note: "Customers can use these now",
      icon: BadgePercent,
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

export default TicketingStats;

import { Pencil, Trash2 } from "lucide-react";
import Switch from "../common/Switch";
import { TIER_STATUS } from "../../constants/ticketing";
import { capacityTone, formatNumber, formatPercent } from "../../utils/format";
import { rupees, totalPrice } from "./ticketingHelpers";

const headings = [
  "Tier",
  "Event",
  "Base price",
  "GST",
  "Total price",
  "Sold of quota",
  "Available",
  "Sales status",
  "",
];

const TierTable = ({
  tiers,
  canDelete,
  busyId,
  onToggle,
  onEdit,
  onDelete,
}) => (
  <div className="overflow-x-auto rounded-3xl border border-line bg-card">
    <table className="w-full min-w-[1100px] text-left text-sm">
      <thead>
        <tr className="border-b border-line text-xs text-muted">
          {headings.map((heading) => (
            <th key={heading || "actions"} className="px-5 py-4 font-semibold">
              {heading}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {tiers.map((tier) => {
          const percent = formatPercent(tier.sold, tier.quota);
          const status = TIER_STATUS[tier.status];

          return (
            <tr
              key={tier.id}
              className="border-b border-line transition last:border-0 hover:bg-elevated"
            >
              <td className="max-w-64 px-5 py-4">
                <p className="font-semibold">{tier.name}</p>
                {tier.perks && (
                  <p className="mt-0.5 line-clamp-2 text-xs text-muted">
                    {tier.perks}
                  </p>
                )}
              </td>
              <td className="max-w-48 px-5 py-4 text-muted">
                {tier.eventTitle}
              </td>
              <td className="whitespace-nowrap px-5 py-4">
                {rupees(tier.price)}
              </td>
              <td className="whitespace-nowrap px-5 py-4 text-muted">
                {tier.taxPercentage}%
              </td>
              <td className="whitespace-nowrap px-5 py-4 font-semibold">
                {rupees(totalPrice(tier))}
              </td>
              <td className="px-5 py-4">
                <div className="h-1.5 w-28 overflow-hidden rounded-full bg-line">
                  <div
                    className={`h-full rounded-full ${capacityTone(percent)}`}
                    style={{ width: `${Math.min(percent, 100)}%` }}
                  />
                </div>
                <p className="mt-1.5 text-xs text-muted">
                  {formatNumber(tier.sold)} / {formatNumber(tier.quota)} (
                  {percent}%)
                </p>
              </td>
              <td className="whitespace-nowrap px-5 py-4 font-semibold">
                {formatNumber(tier.quota - tier.sold)}
              </td>
              <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={tier.status === "ACTIVE"}
                    disabled={tier.status === "SOLD_OUT" || busyId === tier.id}
                    label={`Put ${tier.name} on sale`}
                    onChange={(checked) => onToggle(tier, checked)}
                  />
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${status.tone}`}
                  >
                    {status.label}
                  </span>
                </div>
              </td>
              <td className="px-5 py-4">
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(tier)}
                    aria-label={`Edit ${tier.name}`}
                    className="grid size-8 place-items-center rounded-full border border-line bg-elevated text-muted transition hover:text-foreground"
                  >
                    <Pencil className="size-3.5" />
                  </button>
                  {canDelete && (
                    <button
                      type="button"
                      onClick={() => onDelete(tier)}
                      aria-label={`Delete ${tier.name}`}
                      className="grid size-8 place-items-center rounded-full border border-line bg-elevated text-muted transition hover:text-rose-500"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);

export default TierTable;

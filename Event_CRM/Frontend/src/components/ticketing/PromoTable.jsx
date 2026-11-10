import { Copy, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Switch from "../common/Switch";
import { PROMO_STATE } from "../../constants/ticketing";
import {
  capacityTone,
  daysUntil,
  formatDate,
  formatNumber,
  formatPercent,
} from "../../utils/format";
import { discountLabel, promoState, todayIso } from "./ticketingHelpers";

const headings = [
  "Code",
  "Discount",
  "Applies to",
  "Uses",
  "Expires",
  "Status",
  "Enabled",
  "",
];

const expiryNote = (isoDate) => {
  const days = daysUntil(isoDate);
  if (days < 0) return "Expired";
  if (days === 0) return "Expires today";
  return `${days} day${days === 1 ? "" : "s"} left`;
};

const PromoTable = ({
  promos,
  events,
  canDelete,
  busyId,
  onToggle,
  onEdit,
  onDelete,
}) => {
  const copyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success(`${code} copied`);
    } catch {
      toast.error("Could not copy the code");
    }
  };

  return (
    <div className="overflow-x-auto rounded-3xl border border-line bg-card">
      <table className="w-full min-w-[1000px] text-left text-sm">
        <thead>
          <tr className="border-b border-line text-xs text-muted">
            {headings.map((heading) => (
              <th
                key={heading || "actions"}
                className="px-5 py-4 font-semibold"
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {promos.map((promo) => {
            const state = promoState(promo);
            const percent = formatPercent(promo.used, promo.maxUses);
            const event = events.find((item) => item.id === promo.eventId);
            const locked =
              promo.expiresOn < todayIso() || promo.used >= promo.maxUses;

            return (
              <tr
                key={promo.id}
                className="border-b border-line transition last:border-0 hover:bg-elevated"
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg bg-elevated px-2.5 py-1 font-mono text-xs font-semibold">
                      {promo.code}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyCode(promo.code)}
                      aria-label={`Copy ${promo.code}`}
                      className="grid size-7 place-items-center rounded-full text-muted transition hover:text-foreground"
                    >
                      <Copy className="size-3.5" />
                    </button>
                  </div>
                </td>
                <td className="whitespace-nowrap px-5 py-4 font-semibold">
                  {discountLabel(promo)}
                </td>
                <td className="max-w-56 px-5 py-4 text-muted">
                  {event ? event.title : "All events"}
                </td>
                <td className="px-5 py-4">
                  <div className="h-1.5 w-28 overflow-hidden rounded-full bg-line">
                    <div
                      className={`h-full rounded-full ${capacityTone(percent)}`}
                      style={{ width: `${Math.min(percent, 100)}%` }}
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-muted">
                    {formatNumber(promo.used)} / {formatNumber(promo.maxUses)}{" "}
                    used
                  </p>
                </td>
                <td className="whitespace-nowrap px-5 py-4">
                  <p>{formatDate(promo.expiresOn)}</p>
                  <p className="mt-0.5 text-xs text-muted">
                    {expiryNote(promo.expiresOn)}
                  </p>
                </td>
                <td className="px-5 py-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${PROMO_STATE[state].tone}`}
                  >
                    {PROMO_STATE[state].label}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <Switch
                    checked={promo.enabled}
                    disabled={locked || busyId === promo.id}
                    label={`Enable ${promo.code}`}
                    onChange={(checked) => onToggle(promo, checked)}
                  />
                </td>
                <td className="px-5 py-4">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(promo)}
                      aria-label={`Edit ${promo.code}`}
                      className="grid size-8 place-items-center rounded-full border border-line bg-elevated text-muted transition hover:text-foreground"
                    >
                      <Pencil className="size-3.5" />
                    </button>
                    {canDelete && (
                      <button
                        type="button"
                        onClick={() => onDelete(promo)}
                        aria-label={`Delete ${promo.code}`}
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
};

export default PromoTable;

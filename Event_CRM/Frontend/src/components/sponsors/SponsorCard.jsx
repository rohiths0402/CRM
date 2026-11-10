import {
  CalendarDays,
  FileCheck2,
  FileWarning,
  TriangleAlert,
} from "lucide-react";
import SpotlightCard from "../common/SpotlightCard";
import { PAYMENT_STATUS, SPONSOR_TIERS } from "../../constants/sponsors";
import { formatCurrency, formatDate, formatPercent } from "../../utils/format";
import { deliverableStats } from "./sponsorHelpers";

const SponsorCard = ({ sponsor, onOpen }) => {
  const tier = SPONSOR_TIERS[sponsor.tier];
  const payment = PAYMENT_STATUS[sponsor.paymentStatus];
  const stats = deliverableStats(sponsor);
  const receivedPercent = formatPercent(
    sponsor.amountReceived,
    sponsor.contractValue,
  );
  const balance = Math.max(sponsor.contractValue - sponsor.amountReceived, 0);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen(sponsor.id)}
      onKeyDown={(key) => {
        if (key.key === "Enter") onOpen(sponsor.id);
      }}
      className="cursor-pointer"
    >
      <SpotlightCard className="h-full p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${tier.tone}`}
          >
            {tier.label}
          </span>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${payment.tone}`}
          >
            {payment.label}
          </span>
        </div>

        <h3 className="mt-4 font-display text-2xl font-semibold leading-tight">
          {sponsor.brandName}
        </h3>
        <p className="mt-1 text-sm text-muted">{sponsor.industry}</p>

        <div className="mt-4 rounded-2xl border border-line bg-elevated p-3.5">
          <p className="truncate text-sm font-semibold">{sponsor.eventTitle}</p>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-muted">
            <CalendarDays className="size-3.5" />
            {formatDate(sponsor.eventDate)}
          </p>
        </div>

        <div className="mt-5">
          <div className="flex items-end justify-between">
            <p className="font-display text-2xl font-semibold">
              {formatCurrency(sponsor.contractValue)}
            </p>
            <p className="text-xs text-muted">contract value</p>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-line">
            <div
              className="h-full rounded-full bg-gradient-to-r from-accent to-primary"
              style={{ width: `${Math.min(receivedPercent, 100)}%` }}
            />
          </div>
          <p className="mt-1.5 text-xs text-muted">
            {formatCurrency(sponsor.amountReceived)} received ·{" "}
            {formatCurrency(balance)} balance
          </p>
        </div>

        <div className="mt-5">
          <div className="flex items-end justify-between text-xs">
            <span className="font-semibold">Deliverables</span>
            <span className="text-muted">
              {stats.done} of {stats.total} done
            </span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-line">
            <div
              className={`h-full rounded-full ${stats.percent === 100 ? "bg-emerald-500" : "bg-primary"}`}
              style={{ width: `${stats.percent}%` }}
            />
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-4 text-xs">
          {sponsor.contractFile ? (
            <span className="flex items-center gap-1.5 font-medium text-emerald-500">
              <FileCheck2 className="size-4" />
              Contract uploaded
            </span>
          ) : (
            <span className="flex items-center gap-1.5 font-medium text-amber-500">
              <FileWarning className="size-4" />
              Contract missing
            </span>
          )}
          {stats.overdue > 0 && (
            <span className="flex items-center gap-1.5 font-semibold text-rose-500">
              <TriangleAlert className="size-4" />
              {stats.overdue} overdue
            </span>
          )}
        </div>
      </SpotlightCard>
    </div>
  );
};

export default SponsorCard;

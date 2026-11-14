import { Ban, ShieldAlert, Timer } from "lucide-react";
import { formatNumber, formatPercent } from "../../utils/format";

const BigNumber = ({ label, hint, value, tone = "" }) => (
  <div>
    <p className="text-sm font-semibold">{label}</p>
    <p className={`mt-2 font-display text-5xl font-semibold ${tone}`}>
      {formatNumber(value)}
    </p>
    <p className="mt-1 text-xs text-muted">{hint}</p>
  </div>
);

const SmallStat = ({
  icon: Icon,
  label,
  hint,
  value,
  tone = "text-primary",
}) => (
  <div className="flex items-center gap-3 rounded-2xl border border-line bg-elevated px-4 py-3">
    <span
      className={`grid size-9 shrink-0 place-items-center rounded-xl bg-primary/12 ${tone}`}
    >
      <Icon className="size-[18px]" />
    </span>
    <div className="min-w-0">
      <p className="text-lg font-semibold leading-tight">
        {formatNumber(value)}
      </p>
      <p className="truncate text-xs text-muted" title={hint}>
        {label}
      </p>
    </div>
  </div>
);

const GateCounters = ({ summary }) => {
  const percent = formatPercent(summary.checkedIn, summary.expected);

  return (
    <div className="rounded-3xl border border-line bg-card p-6">
      <div className="grid gap-6 sm:grid-cols-3">
        <BigNumber
          label="Total expected"
          hint="Valid tickets sold. Cancelled ones are not counted."
          value={summary.expected}
        />
        <BigNumber
          label="Inside now"
          hint="Guests who are already checked in"
          value={summary.checkedIn}
          tone="text-emerald-500"
        />
        <BigNumber
          label="Yet to arrive"
          hint="Expected guests minus inside"
          value={summary.yetToArrive}
          tone="text-amber-500"
        />
      </div>

      <div className="mt-6">
        <div className="flex items-end justify-between text-sm">
          <span className="font-semibold">Arrival progress</span>
          <span className="text-muted">{percent}% inside</span>
        </div>
        <div className="mt-2 h-3 overflow-hidden rounded-full bg-line">
          <div
            className="h-full rounded-full bg-gradient-to-r from-accent to-primary transition-all duration-700"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <SmallStat
          icon={Timer}
          label="Checked in, last 15 minutes"
          hint="Shows how fast the queue is moving"
          value={summary.lastQuarterHour}
        />
        <SmallStat
          icon={ShieldAlert}
          label="Entries refused"
          hint="Duplicate or cancelled tickets that were stopped"
          value={summary.blockedAttempts}
          tone="text-rose-500"
        />
        <SmallStat
          icon={Ban}
          label="Cancelled tickets"
          hint="Refunded tickets, not allowed inside"
          value={summary.cancelled}
          tone="text-muted"
        />
      </div>
    </div>
  );
};

export default GateCounters;

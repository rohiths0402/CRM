import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import StatusBadge from "../common/StatusBadge";
import {
  capacityTone,
  formatCurrency,
  formatDate,
  formatNumber,
  formatPercent,
} from "../../utils/format";

const columns = [
  { key: "title", label: "Event", sortable: true },
  { key: "date", label: "Date", sortable: true },
  { key: "venue", label: "Venue" },
  { key: "status", label: "Status" },
  { key: "fill", label: "Tickets sold", sortable: true },
  { key: "grossRevenue", label: "Revenue", sortable: true },
];

const sortValues = {
  title: (event) => event.title.toLowerCase(),
  date: (event) => event.date,
  fill: (event) => event.ticketsSold / event.capacity,
  grossRevenue: (event) => event.grossRevenue,
};

const SortIcon = ({ active, direction }) => {
  if (!active) return <ArrowUpDown className="size-3.5 opacity-50" />;
  return direction === "asc" ? (
    <ArrowUp className="size-3.5 text-primary" />
  ) : (
    <ArrowDown className="size-3.5 text-primary" />
  );
};

const EventTable = ({ events, onOpen }) => {
  const [sort, setSort] = useState({ key: "date", direction: "asc" });

  const sorted = useMemo(() => {
    const getValue = sortValues[sort.key];
    const factor = sort.direction === "asc" ? 1 : -1;
    return [...events].sort((a, b) => {
      const first = getValue(a);
      const second = getValue(b);
      if (first < second) return -1 * factor;
      if (first > second) return 1 * factor;
      return 0;
    });
  }, [events, sort]);

  const toggleSort = (key) =>
    setSort((current) => ({
      key,
      direction:
        current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));

  return (
    <div className="overflow-x-auto rounded-3xl border border-line bg-card">
      <table className="w-full min-w-[860px] text-left text-sm">
        <thead>
          <tr className="border-b border-line text-xs text-muted">
            {columns.map((column) => (
              <th key={column.key} className="px-5 py-4 font-semibold">
                {column.sortable ? (
                  <button
                    type="button"
                    onClick={() => toggleSort(column.key)}
                    className="flex items-center gap-1.5 transition hover:text-foreground"
                  >
                    {column.label}
                    <SortIcon
                      active={sort.key === column.key}
                      direction={sort.direction}
                    />
                  </button>
                ) : (
                  column.label
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((event) => {
            const percent = formatPercent(event.ticketsSold, event.capacity);
            return (
              <tr
                key={event.id}
                tabIndex={0}
                onClick={() => onOpen(event.id)}
                onKeyDown={(key) => {
                  if (key.key === "Enter") onOpen(event.id);
                }}
                className="cursor-pointer border-b border-line transition last:border-0 hover:bg-elevated"
              >
                <td className="px-5 py-4">
                  <p className="font-semibold">{event.title}</p>
                  <p className="mt-0.5 text-xs text-muted">{event.category}</p>
                </td>
                <td className="whitespace-nowrap px-5 py-4">
                  {formatDate(event.date)}
                </td>
                <td className="px-5 py-4">
                  <p>{event.venue}</p>
                  <p className="mt-0.5 text-xs text-muted">{event.city}</p>
                </td>
                <td className="px-5 py-4">
                  <StatusBadge status={event.status} />
                </td>
                <td className="px-5 py-4">
                  <div className="h-1.5 w-28 overflow-hidden rounded-full bg-line">
                    <div
                      className={`h-full rounded-full ${capacityTone(percent)}`}
                      style={{ width: `${Math.min(percent, 100)}%` }}
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-muted">
                    {formatNumber(event.ticketsSold)} /{" "}
                    {formatNumber(event.capacity)} ({percent}%)
                  </p>
                </td>
                <td className="whitespace-nowrap px-5 py-4 font-semibold">
                  {formatCurrency(event.grossRevenue)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default EventTable;

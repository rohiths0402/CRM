import {
  CheckCircle2,
  ClipboardList,
  DoorClosed,
  Hourglass,
  TriangleAlert,
} from "lucide-react";

const tones = {
  rose: "border-rose-500/30 bg-rose-500/10 text-rose-500",
  amber: "border-amber-500/30 bg-amber-500/10 text-amber-500",
  sky: "border-sky-500/30 bg-sky-500/10 text-sky-500",
};

const plural = (count, one, many) => `${count} ${count === 1 ? one : many}`;

const AttentionChips = ({ counts }) => {
  const chips = [
    {
      key: "conflicts",
      count: counts.conflicts,
      icon: TriangleAlert,
      tone: "rose",
      text: plural(counts.conflicts, "schedule conflict", "schedule conflicts"),
    },
    {
      key: "tentative",
      count: counts.tentative,
      icon: Hourglass,
      tone: "amber",
      text: plural(counts.tentative, "tentative act", "tentative acts"),
    },
    {
      key: "noRoom",
      count: counts.noRoom,
      icon: DoorClosed,
      tone: "amber",
      text: plural(
        counts.noRoom,
        "act without a green room",
        "acts without a green room",
      ),
    },
    {
      key: "riderOpen",
      count: counts.riderOpen,
      icon: ClipboardList,
      tone: "sky",
      text: plural(
        counts.riderOpen,
        "rider not complete",
        "riders not complete",
      ),
    },
  ].filter((chip) => chip.count > 0);

  if (!chips.length) {
    return (
      <p className="flex w-fit items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-500">
        <CheckCircle2 className="size-4" />
        The lineup is clear. No conflicts and every rider is ready.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {chips.map(({ key, icon: Icon, tone, text }) => (
        <span
          key={key}
          className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium ${tones[tone]}`}
        >
          <Icon className="size-4" />
          {text}
        </span>
      ))}
    </div>
  );
};

export default AttentionChips;

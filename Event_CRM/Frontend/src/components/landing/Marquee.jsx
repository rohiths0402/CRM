import { Sparkles } from "lucide-react";
import { EVENT_TYPES } from "../../constants/landing";

const Marquee = () => {
  const items = [...EVENT_TYPES, ...EVENT_TYPES];

  return (
    <div className="overflow-hidden border-y border-line bg-card/50 py-5">
      <div className="flex w-max animate-marquee gap-12">
        {items.map((item, index) => (
          <span
            key={index}
            className="flex items-center gap-12 whitespace-nowrap font-display text-2xl text-muted"
          >
            {item}
            <Sparkles className="size-4 text-primary" />
          </span>
        ))}
      </div>
    </div>
  );
};

export default Marquee;

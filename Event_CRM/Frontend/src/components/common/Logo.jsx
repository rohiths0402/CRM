import { Infinity as InfinityIcon } from "lucide-react";
import { Link } from "react-router-dom";

const Logo = ({ className = "" }) => (
  <Link to="/" className={`flex items-center gap-2.5 ${className}`}>
    <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-accent to-primary text-on-primary">
      <InfinityIcon className="size-5" strokeWidth={2.5} />
    </span>
    <span className="font-display text-xl font-semibold tracking-wide">
      Event CRM
    </span>
  </Link>
);

export default Logo;

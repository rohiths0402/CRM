import { Link } from "react-router-dom";
import { ArrowRight, Inbox } from "lucide-react";
import Button from "../common/Button";
import { useAuth } from "../../context/AuthContext";
import { ROLE_ACCESS } from "../../constants/roles";

const ProposalsBanner = ({ data }) => {
  const { user } = useAuth();

  if (!data || !ROLE_ACCESS[user.role].includes("proposals")) return null;

  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-primary/30 bg-primary/10 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary text-on-primary">
          <Inbox className="size-6" />
        </span>
        <div>
          <p className="font-semibold">
            {data.count} event proposals are waiting for your decision
          </p>
          <p className="text-sm text-muted">Latest: {data.latest}</p>
        </div>
      </div>
      <Button as={Link} to="/proposals" className="h-11 shrink-0">
        Review proposals
        <ArrowRight className="size-4" />
      </Button>
    </div>
  );
};

export default ProposalsBanner;

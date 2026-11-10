import { EVENT_STATUS } from "../../constants/eventStatus";

const StatusBadge = ({ status }) => {
  const { label, tone } = EVENT_STATUS[status];
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone}`}>
      {label}
    </span>
  );
};

export default StatusBadge;

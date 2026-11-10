const VenueFact = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3">
    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/12 text-primary">
      <Icon className="size-4" />
    </span>
    <div className="min-w-0">
      <p className="text-xs text-muted">{label}</p>
      <p className="truncate text-sm font-semibold">{value}</p>
    </div>
  </div>
);

export default VenueFact;

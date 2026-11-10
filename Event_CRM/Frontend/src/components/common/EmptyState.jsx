const EmptyState = ({ icon: Icon, title, text, action }) => (
  <div className="grid place-items-center rounded-3xl border border-dashed border-line bg-card px-6 py-16 text-center">
    <span className="grid size-14 place-items-center rounded-2xl bg-primary/12 text-primary">
      <Icon className="size-7" />
    </span>
    <h3 className="mt-5 font-display text-2xl font-semibold">{title}</h3>
    <p className="mt-2 max-w-sm text-sm text-muted">{text}</p>
    {action && <div className="mt-6">{action}</div>}
  </div>
);

export default EmptyState;

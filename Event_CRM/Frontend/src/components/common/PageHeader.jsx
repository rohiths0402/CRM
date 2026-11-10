const PageHeader = ({ title, description, actions }) => (
  <div className="flex flex-wrap items-end justify-between gap-4">
    <div>
      <h2 className="font-display text-3xl font-semibold sm:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="mt-1 max-w-2xl text-muted">{description}</p>
      )}
    </div>
    {actions}
  </div>
);

export default PageHeader;

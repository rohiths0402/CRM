const InputField = ({ icon: Icon, label, rightSlot, ...props }) => (
  <label className="block">
    <span className="mb-2 block text-sm font-medium text-muted">{label}</span>
    <div className="relative">
      <Icon className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted" />
      <input
        className="h-14 w-full rounded-2xl border border-line bg-card pl-12 pr-12 text-[15px] outline-none transition placeholder:text-muted/60 focus:border-primary focus:ring-4 focus:ring-primary/15"
        {...props}
      />
      {rightSlot && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {rightSlot}
        </div>
      )}
    </div>
  </label>
);

export default InputField;

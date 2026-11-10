const CheckboxField = ({ label, hint, checked, onChange }) => (
  <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-card p-4 transition hover:border-primary">
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="mt-0.5 size-4 accent-[var(--primary)]"
    />
    <span>
      <span className="block text-sm font-medium">{label}</span>
      {hint && <span className="mt-0.5 block text-xs text-muted">{hint}</span>}
    </span>
  </label>
);

export default CheckboxField;

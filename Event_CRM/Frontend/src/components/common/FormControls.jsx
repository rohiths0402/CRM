import { ChevronDown } from "lucide-react";

const controlClass = (error) =>
  `h-12 w-full rounded-xl border bg-card px-4 text-sm outline-none transition placeholder:text-muted/60 focus:border-primary focus:ring-4 focus:ring-primary/15 ${
    error ? "border-rose-500" : "border-line"
  }`;

const FieldShell = ({ label, required, hint, error, children }) => (
  <label className="block">
    <span className="mb-1.5 block text-sm font-medium">
      {label}
      {required && <span className="text-rose-500"> *</span>}
    </span>
    {children}
    {error ? (
      <span className="mt-1.5 block text-xs text-rose-500">{error}</span>
    ) : (
      hint && <span className="mt-1.5 block text-xs text-muted">{hint}</span>
    )}
  </label>
);

export const TextField = ({
  label,
  required,
  hint,
  error,
  prefix,
  ...props
}) => (
  <FieldShell label={label} required={required} hint={hint} error={error}>
    <div className="relative">
      {prefix && (
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted">
          {prefix}
        </span>
      )}
      <input
        className={`${controlClass(error)} ${prefix ? "pl-9" : ""}`}
        {...props}
      />
    </div>
  </FieldShell>
);

export const SelectField = ({
  label,
  required,
  hint,
  error,
  options,
  placeholder,
  ...props
}) => (
  <FieldShell label={label} required={required} hint={hint} error={error}>
    <div className="relative">
      <select
        className={`${controlClass(error)} cursor-pointer appearance-none pr-10`}
        {...props}
      >
        {placeholder && (
          <option value="" className="bg-elevated text-foreground">
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className="bg-elevated text-foreground"
          >
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-muted" />
    </div>
  </FieldShell>
);

export const TextAreaField = ({ label, required, hint, error, ...props }) => (
  <FieldShell label={label} required={required} hint={hint} error={error}>
    <textarea
      rows={3}
      className={`w-full resize-none rounded-xl border bg-card px-4 py-3 text-sm outline-none transition placeholder:text-muted/60 focus:border-primary focus:ring-4 focus:ring-primary/15 ${
        error ? "border-rose-500" : "border-line"
      }`}
      {...props}
    />
  </FieldShell>
);

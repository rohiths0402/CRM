export function FormField({ id, label, icon, children }) {
  return (
    <div className="field">
      <label className="field-label" htmlFor={id}>
        {label}
      </label>
      <div className="input-wrapper">
        <span className="input-icon" aria-hidden="true">{icon}</span>
        {children}
      </div>
    </div>
  );
}

export function SubmitButton({ loading, loadingText, disabled, children }) {
  return (
    <button
      type="submit"
      className="btn btn-primary"
      disabled={loading || disabled}
    >
      <span>{loading ? loadingText : children}</span>
      {!loading && <span className="btn-arrow" aria-hidden="true">→</span>}
    </button>
  );
}

export function Alert({ variant = 'error', children }) {
  if (!children) return null;

  return (
    <p
      className={`alert alert-${variant}`}
      role={variant === 'error' ? 'alert' : 'status'}
    >
      {children}
    </p>
  );
}

export function RecoverySteps({ current }) {
  return (
    <ol className="steps" aria-label="Recovery progress">
      {[1, 2, 3].map((n) => (
        <li
          key={n}
          className={`step ${current >= n ? 'is-active' : ''}`}
          aria-current={current === n ? 'step' : undefined}
        >
          {n}
        </li>
      ))}
    </ol>
  );
}
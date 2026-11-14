import { Loader2, Search, X } from "lucide-react";

const GateSearch = ({ value, onChange, loading, inputRef, example }) => (
  <div>
    <label className="relative block">
      <span className="sr-only">Find a guest</span>
      <Search className="pointer-events-none absolute left-5 top-1/2 size-5 -translate-y-1/2 text-muted" />
      <input
        ref={inputRef}
        value={value}
        onChange={(change) => onChange(change.target.value)}
        autoFocus
        autoComplete="off"
        placeholder="Guest name, mobile number or ticket code"
        className="h-16 w-full rounded-2xl border border-line bg-card pl-14 pr-14 text-base outline-none transition placeholder:text-muted/60 focus:border-primary focus:ring-4 focus:ring-primary/15"
      />
      <span className="absolute right-4 top-1/2 -translate-y-1/2">
        {loading ? (
          <Loader2 className="size-5 animate-spin text-primary" />
        ) : (
          value && (
            <button
              type="button"
              onClick={() => onChange("")}
              aria-label="Clear search"
              className="grid size-8 place-items-center rounded-full text-muted transition hover:text-foreground"
            >
              <X className="size-5" />
            </button>
          )
        )}
      </span>
    </label>
    <p className="mt-2 text-xs text-muted">
      Type at least 3 characters. The ticket code is the number under the QR
      code, for example {example}.
    </p>
  </div>
);

export default GateSearch;

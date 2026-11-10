import { useRef, useState } from "react";
import { FileText, UploadCloud, X } from "lucide-react";
import { MAX_CONTRACT_SIZE, fileSize } from "./sponsorHelpers";

const ContractUpload = ({ value, onChange }) => {
  const inputRef = useRef(null);
  const [error, setError] = useState("");

  const handleFile = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      setError("Only PDF files are allowed");
      return;
    }
    if (file.size > MAX_CONTRACT_SIZE) {
      setError("The PDF must be smaller than 3 MB");
      return;
    }

    setError("");
    const reader = new FileReader();
    reader.onload = () =>
      onChange({ name: file.name, size: file.size, url: reader.result });
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <p className="mb-1.5 text-sm font-medium">Signed contract (PDF)</p>

      {value ? (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-card p-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/12 text-primary">
              <FileText className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{value.name}</p>
              <p className="text-xs text-muted">{fileSize(value.size)}</p>
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="rounded-full border border-line bg-elevated px-3 py-1.5 text-xs font-medium transition hover:border-primary"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={() => onChange(null)}
              aria-label="Remove contract"
              className="grid size-8 place-items-center rounded-full border border-line bg-elevated text-muted transition hover:text-rose-500"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-28 w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-line bg-card px-4 text-center text-sm text-muted transition hover:border-primary hover:text-foreground"
        >
          <UploadCloud className="size-6" />
          Upload the contract, PDF up to 3 MB
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={handleFile}
      />
      {error && <p className="mt-1.5 text-xs text-rose-500">{error}</p>}
    </div>
  );
};

export default ContractUpload;

import { useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";

const MAX_SIZE = 2 * 1024 * 1024;

const PosterUpload = ({ value, onChange }) => {
  const inputRef = useRef(null);
  const [error, setError] = useState("");

  const handleFile = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Choose an image file, JPG, PNG or WebP");
      return;
    }
    if (file.size > MAX_SIZE) {
      setError("The image must be smaller than 2 MB");
      return;
    }

    setError("");
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result);
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <p className="mb-1.5 text-sm font-medium">Poster banner</p>

      {value ? (
        <div className="relative overflow-hidden rounded-2xl border border-line">
          <img
            src={value}
            alt="Event poster preview"
            className="h-44 w-full object-cover"
          />
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="Remove poster"
            className="absolute right-3 top-3 grid size-8 place-items-center rounded-full bg-black/60 text-white transition hover:bg-black/80"
          >
            <X className="size-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-32 w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-line bg-card px-4 text-center text-sm text-muted transition hover:border-primary hover:text-foreground"
        >
          <ImagePlus className="size-6" />
          Upload poster, JPG, PNG or WebP up to 2 MB
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
      {error && <p className="mt-1.5 text-xs text-rose-500">{error}</p>}
    </div>
  );
};

export default PosterUpload;

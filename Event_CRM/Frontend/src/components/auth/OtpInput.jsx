import { useRef } from "react";

const OtpInput = ({ value, onChange, length = 6 }) => {
  const refs = useRef([]);
  const digits = Array.from({ length }, (_, index) => value[index] || "");

  const handleChange = (index, event) => {
    const char = event.target.value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = char;
    onChange(next.join(""));
    if (char && index < length - 1) refs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (event) => {
    event.preventDefault();
    const pasted = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, length);
    onChange(pasted);
    refs.current[Math.min(pasted.length, length - 1)]?.focus();
  };

  return (
    <div className="flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(element) => (refs.current[index] = element)}
          value={digit}
          inputMode="numeric"
          maxLength={1}
          aria-label={`Digit ${index + 1}`}
          onChange={(event) => handleChange(index, event)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          className="size-11 rounded-xl border border-line bg-card text-center text-lg font-semibold outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15 sm:size-12"
        />
      ))}
    </div>
  );
};

export default OtpInput;

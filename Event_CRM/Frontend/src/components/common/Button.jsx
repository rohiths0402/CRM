import { Loader2 } from "lucide-react";

const styles = {
  primary:
    "bg-gradient-to-r from-accent to-primary text-on-primary shadow-[0_12px_32px_-12px_var(--primary)] hover:brightness-110",
  ghost: "border border-line bg-elevated text-foreground hover:bg-card",
};

const Button = ({
  as: Tag = "button",
  variant = "primary",
  loading = false,
  disabled = false,
  className = "",
  children,
  ...props
}) => {
  const isButton = Tag === "button";

  return (
    <Tag
      className={`inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 ${styles[variant]} ${className}`}
      {...(isButton ? { disabled: disabled || loading } : {})}
      {...props}
    >
      {loading && <Loader2 className="size-4 animate-spin" />}
      {children}
    </Tag>
  );
};

export default Button;

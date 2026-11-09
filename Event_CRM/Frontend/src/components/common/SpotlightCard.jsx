const SpotlightCard = ({ children, className = "" }) => {
  const handleMove = (event) => {
    const box = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty(
      "--x",
      `${event.clientX - box.left}px`,
    );
    event.currentTarget.style.setProperty(
      "--y",
      `${event.clientY - box.top}px`,
    );
  };

  return (
    <div
      onMouseMove={handleMove}
      className={`group relative overflow-hidden rounded-3xl border border-line bg-card ${className}`}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(320px circle at var(--x) var(--y), var(--glow), transparent 60%)",
        }}
      />
      <div className="relative">{children}</div>
    </div>
  );
};

export default SpotlightCard;

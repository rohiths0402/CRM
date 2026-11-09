import { useEffect, useRef, useState } from "react";
import { animate, useInView } from "framer-motion";
import { STATS } from "../../constants/landing";

const CountUp = ({ to, suffix = "" }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, {
      duration: 1.8,
      ease: "easeOut",
      onUpdate: (latest) => setValue(Math.round(latest)),
    });
    return () => controls.stop();
  }, [inView, to]);

  return (
    <span ref={ref}>
      {value.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
};

const Stats = () => (
  <section id="stats" className="border-y border-line bg-card/50">
    <div className="mx-auto grid max-w-6xl grid-cols-2 gap-y-10 px-4 py-16 lg:grid-cols-4">
      {STATS.map(({ value, suffix, label }) => (
        <div key={label} className="text-center">
          <p className="text-gold font-display text-5xl font-semibold sm:text-6xl">
            <CountUp to={value} suffix={suffix} />
          </p>
          <p className="mt-2 text-sm text-muted">{label}</p>
        </div>
      ))}
    </div>
  </section>
);

export default Stats;

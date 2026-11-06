import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Clock } from "lucide-react";
import Button from "../common/Button";

const bars = [38, 52, 44, 68, 60, 84, 74, 96];
const ringRadius = 44;
const ringLength = 2 * Math.PI * ringRadius;

const Hero = () => (
  <section className="relative overflow-hidden px-4 pb-24 pt-36 sm:pt-44">
    <div className="bg-grid absolute inset-0 opacity-50" />
    <div className="absolute left-1/2 top-24 size-[520px] -translate-x-1/2 rounded-full bg-primary/20 blur-[130px] animate-float" />

    <div className="relative mx-auto max-w-4xl text-center">
      <motion.h1
        initial={{ opacity: 0, y: 36 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
        className="font-display text-5xl font-semibold leading-[1.05] sm:text-6xl lg:text-7xl"
      >
        Every live moment,
        <br />
        <span className="text-gold">run like clockwork.</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.35 }}
        className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted"
      >
        LOOP brings tickets, sponsors, artists, gates and the P&L of your event
        into one calm terminal.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.5 }}
        className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
      >
        <Button as={Link} to="/login" className="h-13 px-8 text-base">
          Get started
        </Button>
        <Button
          as="a"
          href="#modules"
          variant="ghost"
          className="h-13 px-8 text-base"
        >
          Explore modules
        </Button>
      </motion.div>
    </div>

    <motion.div
      initial={{ opacity: 0, y: 70, rotateX: 16 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 1, delay: 0.7, ease: "easeOut" }}
      style={{ perspective: 1200 }}
      className="relative mx-auto mt-16 max-w-4xl"
    >
      {/* <div className="glass rounded-[32px] p-5 shadow-[0_40px_100px_-40px_var(--primary)] sm:p-8">
        <div className="grid gap-5 sm:grid-cols-[1.6fr_1fr]">
          <div className="rounded-2xl border border-line bg-card p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Ticket sales per hour</p>
              <span className="rounded-full bg-primary/15 px-2.5 py-1 text-xs font-semibold text-primary">
                +12.4%
              </span>
            </div>
            <div className="mt-6 flex h-40 items-end gap-2.5">
              {bars.map((height, index) => (
                <motion.div
                  key={index}
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{
                    duration: 0.8,
                    delay: 1.1 + index * 0.07,
                    ease: "easeOut",
                  }}
                  className="flex-1 rounded-t-lg bg-gradient-to-t from-primary/40 to-accent"
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center justify-center rounded-2xl border border-line bg-card p-5">
            <div className="relative size-28">
              <svg viewBox="0 0 100 100" className="size-full -rotate-90">
                <circle
                  cx="50"
                  cy="50"
                  r={ringRadius}
                  fill="none"
                  stroke="var(--line)"
                  strokeWidth="8"
                />
                <motion.circle
                  cx="50"
                  cy="50"
                  r={ringRadius}
                  fill="none"
                  stroke="var(--primary)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={ringLength}
                  initial={{ strokeDashoffset: ringLength }}
                  animate={{ strokeDashoffset: ringLength * (1 - 0.628) }}
                  transition={{ duration: 1.6, delay: 1.2, ease: "easeOut" }}
                />
              </svg>
              <span className="absolute inset-0 grid place-items-center text-2xl font-semibold">
                62.8%
              </span>
            </div>
            <p className="mt-4 text-sm font-semibold">Checked in</p>
            <p className="text-xs text-muted">9,420 of 15,000 inside</p>
          </div>
        </div>
      </div> */}

      {/* <div className="glass absolute -left-3 top-10 hidden animate-float items-center gap-2.5 rounded-2xl px-4 py-3 shadow-xl md:flex">
        <Clock className="size-5 text-primary" />
        <div className="text-left">
          <p className="text-sm font-semibold">Gates open</p>
          <p className="text-xs text-muted">05:30 PM</p>
        </div>
      </div> */}

      {/* <div className="glass absolute -right-3 bottom-12 hidden animate-float items-center gap-2.5 rounded-2xl px-4 py-3 shadow-xl [animation-delay:2.5s] md:flex">
        <CheckCircle2 className="size-5 text-primary" />
        <div className="text-left">
          <p className="text-sm font-semibold">VVIP table 4</p>
          <p className="text-xs text-muted">Checked in just now</p>
        </div>
      </div> */}
    </motion.div>
  </section>
);

export default Hero;

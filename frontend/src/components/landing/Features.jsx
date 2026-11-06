import SpotlightCard from "../common/SpotlightCard";
import Reveal from "../common/Reveal";
import { FEATURES } from "../../constants/landing";

const Features = () => (
  <section id="modules" className="mx-auto max-w-6xl px-4 py-28">
    <Reveal className="max-w-2xl">
      <h2 className="font-display text-4xl font-semibold sm:text-5xl">
        One terminal for the whole show
      </h2>
      <p className="mt-4 text-lg text-muted">
        Twelve connected modules, each built for the person who uses it on the
        ground.
      </p>
    </Reveal>

    <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {FEATURES.map(({ icon: Icon, title, text }, index) => (
        <Reveal key={title} delay={(index % 3) * 0.08}>
          <SpotlightCard className="h-full p-7">
            <span className="mb-6 grid size-12 place-items-center rounded-2xl bg-primary/12 text-primary">
              <Icon className="size-6" />
            </span>
            <h3 className="text-xl font-semibold">{title}</h3>
            <p className="mt-2 leading-relaxed text-muted">{text}</p>
          </SpotlightCard>
        </Reveal>
      ))}
    </div>
  </section>
);

export default Features;

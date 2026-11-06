import Reveal from "../common/Reveal";
import SpotlightCard from "../common/SpotlightCard";
import { ROLE_CARDS } from "../../constants/landing";

const Roles = () => (
  <section id="roles" className="mx-auto max-w-6xl px-4 py-28">
    <Reveal className="max-w-2xl">
      <h2 className="font-display text-4xl font-semibold sm:text-5xl">
        Everyone sees only what they need
      </h2>
      <p className="mt-4 text-lg text-muted">
        Role based access keeps the gate staff at the gate and the budget with
        the director.
      </p>
    </Reveal>

    <div className="mt-14 grid gap-5 sm:grid-cols-2">
      {ROLE_CARDS.map(({ role, text }, index) => (
        <Reveal key={role} delay={(index % 2) * 0.08}>
          <SpotlightCard className="h-full p-7">
            <h3 className="font-display text-2xl font-semibold">{role}</h3>
            <p className="mt-2 leading-relaxed text-muted">{text}</p>
          </SpotlightCard>
        </Reveal>
      ))}
    </div>
  </section>
);

export default Roles;

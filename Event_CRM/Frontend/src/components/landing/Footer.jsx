import { Link } from "react-router-dom";
import Button from "../common/Button";
import Logo from "../common/Logo";
import Reveal from "../common/Reveal";

const Footer = () => (
  <footer className="px-4 pb-10">
    <Reveal className="mx-auto max-w-6xl">
      <div className="relative overflow-hidden rounded-[36px] border border-line bg-card px-6 py-16 text-center sm:py-20">
        <div className="absolute left-1/2 top-0 size-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/25 blur-[100px]" />
        <div className="relative">
          <h2 className="font-display text-4xl font-semibold sm:text-5xl">
            Ready for your next show?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-muted">
            Sign in and open the terminal your crew will actually enjoy using.
          </p>
          <Button as={Link} to="/login" className="mt-8 h-13 px-9 text-base">
            Sign in to LOOP
          </Button>
        </div>
      </div>

      <div className="mt-10 flex flex-col items-center justify-between gap-4 text-sm text-muted sm:flex-row">
        <Logo />
        <p>© 2026 LOOP Event Operations. All rights reserved.</p>
      </div>
    </Reveal>
  </footer>
);

export default Footer;

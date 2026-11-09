import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Logo from "../common/Logo";
import ThemeToggle from "../common/ThemeToggle";
import Button from "../common/Button";
import { useAuth } from "../../context/AuthContext";

const links = [
  { label: "Modules", href: "#modules" },
  { label: "Live numbers", href: "#stats" },
  { label: "Roles", href: "#roles" },
];

const Navbar = () => {
  const { isAuthenticated } = useAuth();

  return (
    <motion.header
      initial={{ y: -70, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed inset-x-0 top-0 z-40 px-4"
    >
      <div className="glass mx-auto mt-4 flex max-w-6xl items-center justify-between rounded-full py-2.5 pl-5 pr-2.5">
        <Logo />

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted transition hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button
            as={Link}
            to={isAuthenticated ? "/dashboard" : "/login"}
            className="h-10 px-5"
          >
            {isAuthenticated ? "Dashboard" : "Sign in"}
          </Button>
        </div>
      </div>
    </motion.header>
  );
};

export default Navbar;

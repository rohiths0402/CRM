import { useLocation } from "react-router-dom";
import { LogOut, Menu } from "lucide-react";
import ThemeToggle from "../common/ThemeToggle";
import RoleSwitcher from "./RoleSwitcher";
import { useAuth } from "../../context/AuthContext";
import { USE_MOCK } from "../../api/endpoints";
import { MODULES } from "../../constants/modules";
import { ROLE_LABELS } from "../../constants/roles";
import { getInitials } from "../../utils/initials";

const Topbar = ({ onMenuClick }) => {
  const { user, signOut } = useAuth();
  const { pathname } = useLocation();
  const current = MODULES.find((item) => item.path === pathname);
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-line bg-background/80 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open menu"
          className="grid size-10 place-items-center rounded-full border border-line bg-elevated lg:hidden"
        >
          <Menu className="size-[18px]" />
        </button>
        <div>
          <h1 className="text-lg font-semibold leading-tight">
            {current?.label}
          </h1>
          <p className="hidden text-xs text-muted sm:block">{today}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {USE_MOCK && <RoleSwitcher />}
        <ThemeToggle />

        <div className="hidden items-center gap-3 rounded-full border border-line bg-card py-1.5 pl-1.5 pr-4 md:flex">
          <span className="grid size-8 place-items-center rounded-full bg-gradient-to-br from-accent to-primary text-xs font-bold text-on-primary">
            {getInitials(user.name)}
          </span>
          <div className="leading-tight">
            <p className="text-sm font-semibold">{user.name}</p>
            <p className="text-xs text-muted">{ROLE_LABELS[user.role]}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={signOut}
          aria-label="Sign out"
          className="grid size-10 place-items-center rounded-full border border-line bg-elevated text-muted transition hover:text-foreground"
        >
          <LogOut className="size-[18px]" />
        </button>
      </div>
    </header>
  );
};

export default Topbar;

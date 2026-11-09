import { NavLink } from "react-router-dom";
import { X } from "lucide-react";
import Logo from "../common/Logo";
import { useAuth } from "../../context/AuthContext";
import { MODULES } from "../../constants/modules";
import { ROLE_ACCESS, ROLE_LABELS } from "../../constants/roles";
import { getInitials } from "../../utils/initials";

const Sidebar = ({ open, onClose }) => {
  const { user } = useAuth();
  const items = MODULES.filter((item) =>
    ROLE_ACCESS[user.role].includes(item.key),
  );

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity lg:hidden ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-line bg-elevated transition-transform duration-300 lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex h-16 items-center justify-between px-6">
          <Logo />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="grid size-9 place-items-center rounded-full border border-line text-muted lg:hidden"
          >
            <X className="size-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-4">
          {items.map(({ key, label, path, icon: Icon }) => (
            <NavLink
              key={key}
              to={path}
              end
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-primary/12 text-primary"
                    : "text-muted hover:bg-card hover:text-foreground"
                }`
              }
            >
              <Icon className="size-[18px]" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-line p-4">
          <div className="flex items-center gap-3 rounded-2xl bg-card p-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-accent to-primary text-sm font-bold text-on-primary">
              {getInitials(user.name)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{user.name}</p>
              <p className="truncate text-xs text-muted">
                {ROLE_LABELS[user.role]}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

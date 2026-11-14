import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  HelpCircle,
  LogOut,
  Menu,
  Moon,
  Settings,
  Sun,
  User,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { MODULES } from "../../constants/modules";
import { ROLE_LABELS } from "../../constants/roles";
import { getInitials } from "../../utils/initials";

const Topbar = ({ onMenuClick }) => {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  const current = MODULES.find((item) => item.path === pathname);
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = () => {
    setMenuOpen(false);
    signOut();
  };

  const isDark = theme === "dark";

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
            {current?.label || "Overview"}
          </h1>
          <p className="hidden text-xs text-muted sm:block">{today}</p>
        </div>
      </div>

      <div className="relative flex items-center gap-3" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          className={`flex items-center gap-2.5 rounded-full border border-line bg-card py-1.5 pl-1.5 pr-3 transition hover:border-primary/50 ${
            menuOpen ? "border-primary ring-2 ring-primary/20" : ""
          }`}
        >
          <span className="grid size-8 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-accent to-primary text-xs font-bold text-on-primary">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt=""
                className="size-full object-cover"
              />
            ) : (
              getInitials(user?.name || "User")
            )}
          </span>
          <div className="hidden text-left leading-tight sm:block">
            <p className="text-xs font-semibold">{user?.name || "Account"}</p>
            <p className="text-[10px] text-muted">
              {ROLE_LABELS[user?.role] || "User"}
            </p>
          </div>
          <Settings className="size-4 text-muted transition group-hover:text-foreground" />
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-14 w-64 rounded-2xl border border-line bg-card p-2 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="border-b border-line/60 px-3 py-2.5">
              <p className="font-semibold text-sm leading-none text-foreground">
                {user?.name}
              </p>
              <p className="mt-1 text-xs text-muted truncate">
                {user?.email || "admin@loopcrm.com"}
              </p>
              <div className="mt-2 inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                {ROLE_LABELS[user?.role]}
              </div>
            </div>

            <div className="py-1.5 space-y-0.5">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/profile");
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-foreground transition hover:bg-elevated"
              >
                <User className="size-4 text-muted" />
                <span>My Profile</span>
              </button>

              <div className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-foreground transition hover:bg-elevated">
                <span className="flex items-center gap-2.5">
                  {isDark ? (
                    <Moon className="size-4 text-muted" />
                  ) : (
                    <Sun className="size-4 text-muted" />
                  )}
                  <span>Appearance</span>
                </span>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="rounded-lg border border-line bg-card px-2.5 py-1 text-[11px] font-semibold text-muted hover:text-foreground"
                >
                  {isDark ? "Dark" : "Light"}
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  window.open("https://docs.example.com", "_blank");
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-muted transition hover:bg-elevated hover:text-foreground"
              >
                
              </button>
            </div>

            <div className="border-t border-line/60 pt-1">
              <button
                type="button"
                onClick={handleSignOut}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-rose-500 transition hover:bg-rose-500/10"
              >
                <LogOut className="size-4" />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Topbar;

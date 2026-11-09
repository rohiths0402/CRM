import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Loader2, UserCog } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { authService } from "../../api/services/authService";
import { ROLES, ROLE_LABELS } from "../../constants/roles";

const roleList = [
  ROLES.ADMIN,
  ROLES.OPS_LEAD,
  ROLES.SPONSOR_MGR,
  ROLES.GATE_STAFF,
];

const RoleSwitcher = () => {
  const navigate = useNavigate();
  const { user, startSession } = useAuth();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState("");
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleOutside = (event) => {
      if (!wrapperRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const switchRole = async (role) => {
    if (role === user.role) {
      setOpen(false);
      return;
    }
    setPending(role);
    try {
      const session = await authService.loginAsRole(role);
      startSession(session, true);
      setOpen(false);
      navigate("/dashboard");
    } finally {
      setPending("");
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex h-10 items-center gap-2 rounded-full border border-line bg-elevated px-3 text-sm font-medium transition hover:bg-card sm:px-4"
      >
        <UserCog className="size-4 text-primary" />
        <span className="hidden sm:inline">{ROLE_LABELS[user.role]}</span>
        <ChevronDown
          className={`size-4 text-muted transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-12 z-50 w-60 rounded-2xl border border-line bg-elevated p-2 shadow-2xl"
          >
            <p className="px-3 pb-2 pt-1 text-xs text-muted">
              Switch role to preview access
            </p>
            {roleList.map((role) => (
              <button
                key={role}
                type="button"
                role="menuitem"
                disabled={Boolean(pending)}
                onClick={() => switchRole(role)}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition hover:bg-card disabled:opacity-60"
              >
                {ROLE_LABELS[role]}
                {pending === role && (
                  <Loader2 className="size-4 animate-spin text-primary" />
                )}
                {pending !== role && role === user.role && (
                  <Check className="size-4 text-primary" />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RoleSwitcher;

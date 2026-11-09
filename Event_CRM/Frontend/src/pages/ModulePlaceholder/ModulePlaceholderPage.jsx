import { Navigate, useLocation } from "react-router-dom";
import { Hammer } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { MODULES } from "../../constants/modules";
import { ROLE_ACCESS } from "../../constants/roles";

const ModulePlaceholderPage = () => {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const current = MODULES.find((item) => item.path === pathname);

  if (!current || !ROLE_ACCESS[user.role].includes(current.key)) {
    return <Navigate to="/dashboard" replace />;
  }

  const Icon = current.icon;

  return (
    <div className="mx-auto mt-16 max-w-md rounded-3xl border border-line bg-card p-10 text-center">
      <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary/12 text-primary">
        <Icon className="size-7" />
      </span>
      <h2 className="mt-5 font-display text-3xl font-semibold">
        {current.label}
      </h2>
      <p className="mt-2 flex items-center justify-center gap-2 text-sm text-muted">
        <Hammer className="size-4" />
        This module is coming up next in the build.
      </p>
    </div>
  );
};

export default ModulePlaceholderPage;

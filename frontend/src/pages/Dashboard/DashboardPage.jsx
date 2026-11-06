import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Lock, LogOut } from "lucide-react";
import Button from "../../components/common/Button";
import Logo from "../../components/common/Logo";
import ThemeToggle from "../../components/common/ThemeToggle";
import SpotlightCard from "../../components/common/SpotlightCard";
import { useAuth } from "../../context/AuthContext";
import { dashboardService } from "../../api/services/dashboardService";
import { MODULES } from "../../constants/modules";
import { ROLE_ACCESS, ROLE_LABELS } from "../../constants/roles";

const DashboardPage = () => {
  const { user, signOut } = useAuth();
  const [summary, setSummary] = useState(null);
  const allowed = ROLE_ACCESS[user.role];

  useEffect(() => {
    dashboardService.getSummary().then(setSummary);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-line bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <Logo />
          <div className="flex items-center gap-3">
            <span className="hidden rounded-full border border-line bg-card px-4 py-2 text-sm font-medium sm:block">
              {ROLE_LABELS[user.role]}
            </span>
            <ThemeToggle />
            <Button variant="ghost" className="h-10 px-4" onClick={signOut}>
              <LogOut className="size-4" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="font-display text-4xl font-semibold sm:text-5xl">
            Welcome, {user.name.split(" ")[0]}
          </h1>
          <p className="mt-2 text-muted">
            {user.employeeId} · {ROLE_LABELS[user.role]}
          </p>
        </motion.div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {summary
            ? summary.kpis.map((kpi) => (
                <SpotlightCard key={kpi.key} className="p-6">
                  <p className="text-sm text-muted">{kpi.label}</p>
                  <p className="mt-3 font-display text-4xl font-semibold">
                    {kpi.value}
                  </p>
                  <p className="mt-1 text-xs text-muted">{kpi.note}</p>
                </SpotlightCard>
              ))
            : Array.from({ length: 4 }, (_, index) => (
                <div
                  key={index}
                  className="h-36 animate-pulse rounded-3xl bg-card"
                />
              ))}
        </div>

        <h2 className="mt-14 text-xl font-semibold">Your modules</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {MODULES.map(({ key, label, icon: Icon }) => {
            const hasAccess = allowed.includes(key);
            return (
              <div
                key={key}
                className={`flex items-center gap-4 rounded-2xl border border-line bg-card p-5 ${hasAccess ? "" : "opacity-45"}`}
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/12 text-primary">
                  <Icon className="size-5" />
                </span>
                <span className="flex-1 text-sm font-semibold">{label}</span>
                {!hasAccess && <Lock className="size-4 text-muted" />}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;

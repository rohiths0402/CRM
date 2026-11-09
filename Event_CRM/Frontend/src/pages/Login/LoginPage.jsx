import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  Ticket,
  Users,
} from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import Button from "../../components/common/Button";
import InputField from "../../components/common/InputField";
import Logo from "../../components/common/Logo";
import ThemeToggle from "../../components/common/ThemeToggle";
import ForgotPasswordModal from "../../components/auth/ForgotPasswordModal";
import { useAuth } from "../../context/AuthContext";
import { authService } from "../../api/services/authService";
import { USE_MOCK } from "../../api/endpoints";
import { ROLES, ROLE_LABELS } from "../../constants/roles";

const demoRoles = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EMPLOYEE];

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { startSession } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
    rememberMe: true,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState("");
  const [forgotOpen, setForgotOpen] = useState(false);

  const redirectTo = location.state?.from?.pathname || "/dashboard";

  const run = async (key, task) => {
    setError("");
    setPending(key);
    try {
      const session = await task();
      if (session) {
        startSession(session, form.rememberMe);
        navigate(redirectTo, { replace: true });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setPending("");
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.email.trim() || !form.password) {
      setError("Enter your email and password");
      return;
    }
    run("login", () => authService.login(form));
  };

  return (
    <div className="min-h-screen bg-background p-3 lg:p-5">
      <div className="mx-auto grid min-h-[calc(100vh-1.5rem)] max-w-[1400px] overflow-hidden rounded-[32px] border border-line lg:min-h-[calc(100vh-2.5rem)] lg:grid-cols-[1.05fr_1fr]">
        <aside className="relative hidden flex-col justify-between overflow-hidden bg-[#15120d] p-12 text-[#f4efe4] lg:flex">
          <div className="absolute -left-24 top-1/4 size-[420px] rounded-full bg-[#d4af37]/25 blur-[110px] animate-float" />
          <div className="absolute -bottom-32 right-0 size-[380px] rounded-full bg-[#b89065]/20 blur-[110px] animate-float [animation-delay:2s]" />
          <div className="bg-grid absolute inset-0 opacity-20" />

          <div className="relative flex items-center gap-2.5">
            <Logo />
          </div>

          <div className="relative">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="font-display text-6xl font-semibold leading-[1.05]"
            >
              Run every live moment, flawlessly.
            </motion.h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-[#b8b2a3]">
              Ticketing, sponsors, stage and gates in one terminal for the whole
              crew.
            </p>
          </div>

          <div className="relative grid grid-cols-3 gap-3">
            {[
              { icon: Ticket, value: "18,450", label: "Tickets sold" },
              { icon: Users, value: "9,420", label: "Inside now" },
              { icon: ShieldCheck, value: "4 roles", label: "Access levels" },
            ].map(({ icon: Icon, value, label }, index) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.12, duration: 0.6 }}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur"
              >
                <Icon className="mb-3 size-5 text-[#d4af37]" />
                <p className="text-xl font-semibold">{value}</p>
                <p className="text-xs text-[#9a968b]">{label}</p>
              </motion.div>
            ))}
          </div>
        </aside>

        <main className="relative flex flex-col bg-elevated p-6 sm:p-10 lg:p-14">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="flex items-center gap-2 text-sm font-medium text-muted transition hover:text-foreground"
            >
              <ArrowLeft className="size-4" />
              Back to home
            </Link>
            <ThemeToggle />
          </div>

          <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-8">
            <div className="mb-8 lg:hidden">
              <Logo />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="font-display text-4xl font-semibold sm:text-5xl">
                Sign in
              </h2>
              <p className="mt-3 text-muted">
                Welcome back. Sign in to your event terminal.
              </p>
            </motion.div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
              <InputField
                icon={Mail}
                label="Official email"
                type="email"
                autoComplete="email"
                placeholder="you@loop.com"
                value={form.email}
                onChange={(event) =>
                  setForm({ ...form, email: event.target.value })
                }
              />

              <InputField
                icon={Lock}
                label="Password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter your password"
                value={form.password}
                onChange={(event) =>
                  setForm({ ...form, password: event.target.value })
                }
                rightSlot={
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="grid size-9 place-items-center rounded-full text-muted transition hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="size-5" />
                    ) : (
                      <Eye className="size-5" />
                    )}
                  </button>
                }
              />

              <div className="flex items-center justify-between">
                <label className="flex cursor-pointer items-center gap-2.5 text-sm text-muted">
                  <input
                    type="checkbox"
                    checked={form.rememberMe}
                    onChange={(event) =>
                      setForm({ ...form, rememberMe: event.target.checked })
                    }
                    className="size-4 rounded accent-[var(--primary)]"
                  />
                  Remember me
                </label>
                <button
                  type="button"
                  onClick={() => setForgotOpen(true)}
                  className="text-sm font-semibold text-primary hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  role="alert"
                  className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500"
                >
                  {error}
                </motion.p>
              )}

              <Button
                type="submit"
                className="h-14 w-full text-base"
                loading={pending === "login"}
              >
                Sign in
              </Button>
            </form>

            <div className="my-6 flex items-center gap-4 text-xs text-muted">
              <span className="h-px flex-1 bg-line" />
              or
              <span className="h-px flex-1 bg-line" />
            </div>

            <Button
              variant="ghost"
              className="h-14 w-full text-base"
              loading={pending === "google"}
              onClick={() => run("google", authService.googleLogin)}
            >
              {pending !== "google" && <FcGoogle className="size-5" />}
              Continue with Gmail
            </Button>

            {USE_MOCK && (
              <div className="mt-8">
                <p className="mb-3 text-center text-xs text-muted">
                  Demo access, sign in as
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {demoRoles.map((role) => (
                    <button
                      key={role}
                      type="button"
                      disabled={Boolean(pending)}
                      onClick={() =>
                        run(role, () => authService.loginAsRole(role))
                      }
                      className="h-11 rounded-xl border border-line bg-card text-sm font-medium transition hover:border-primary hover:text-primary disabled:opacity-60"
                    >
                      {ROLE_LABELS[role]}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      <ForgotPasswordModal
        open={forgotOpen}
        onClose={() => setForgotOpen(false)}
      />
    </div>
  );
};

export default LoginPage;

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  Lock,
  Mail,
  Smartphone,
  X,
} from "lucide-react";
import Button from "../common/Button";
import InputField from "../common/InputField";
import OtpInput from "./OtpInput";
import { authService } from "../../api/services/authService";
import { MOCK_OTP } from "../../mocks/mockData";
import { USE_MOCK } from "../../api/endpoints";

const methods = [
  {
    key: "email",
    label: "Gmail",
    icon: Mail,
    placeholder: "you@gmail.com",
    type: "email",
  },
  {
    key: "mobile",
    label: "Mobile",
    icon: Smartphone,
    placeholder: "98765 43210",
    type: "tel",
  },
];

const stepOrder = ["identify", "otp", "reset"];

const initialState = {
  step: "identify",
  method: "email",
  identifier: "",
  otp: "",
  resetToken: "",
  next: "",
  confirm: "",
};

const ForgotPasswordModal = ({ open, onClose }) => {
  const [state, setState] = useState(initialState);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [seconds, setSeconds] = useState(0);

  const { step, method, identifier, otp, resetToken, next, confirm } = state;
  const activeMethod = methods.find((item) => item.key === method);
  const update = (changes) =>
    setState((current) => ({ ...current, ...changes }));

  useEffect(() => {
    if (seconds <= 0) return;
    const timer = setTimeout(() => setSeconds((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds]);

  const close = () => {
    setState(initialState);
    setError("");
    setSeconds(0);
    onClose();
  };

  const run = async (task) => {
    setError("");
    setLoading(true);
    try {
      await task();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const sendOtp = () =>
    run(async () => {
      if (!identifier.trim())
        throw new Error(
          `Enter your ${method === "email" ? "Gmail address" : "mobile number"}`,
        );
      await authService.sendOtp({ method, identifier: identifier.trim() });
      update({ step: "otp", otp: "" });
      setSeconds(30);
    });

  const verifyOtp = () =>
    run(async () => {
      if (otp.length < 6) throw new Error("Enter the 6 digit code");
      const result = await authService.verifyOtp({
        identifier: identifier.trim(),
        otp,
      });
      update({ step: "reset", resetToken: result.resetToken });
    });

  const resetPassword = () =>
    run(async () => {
      if (next.length < 8)
        throw new Error("Password must be at least 8 characters");
      if (next !== confirm) throw new Error("Both passwords must match");
      await authService.resetPassword({
        identifier: identifier.trim(),
        resetToken,
        newPassword: next,
      });
      update({ step: "done" });
    });

  const goBack = () => {
    setError("");
    update({ step: step === "reset" ? "otp" : "identify" });
  };

  const stepIndex = stepOrder.indexOf(step);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={close}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Reset password"
            className="w-full max-w-md rounded-[28px] border border-line bg-elevated p-6 shadow-2xl sm:p-8"
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              {step === "otp" || step === "reset" ? (
                <button
                  type="button"
                  onClick={goBack}
                  className="grid size-9 place-items-center rounded-full border border-line text-muted hover:text-foreground"
                  aria-label="Go back"
                >
                  <ArrowLeft className="size-4" />
                </button>
              ) : (
                <span className="size-9" />
              )}

              {step !== "done" && (
                <div className="flex gap-1.5">
                  {stepOrder.map((item, index) => (
                    <span
                      key={item}
                      className={`h-1.5 rounded-full transition-all ${index <= stepIndex ? "w-8 bg-primary" : "w-4 bg-line"}`}
                    />
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={close}
                className="grid size-9 place-items-center rounded-full border border-line text-muted hover:text-foreground"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.2 }}
              >
                {step === "identify" && (
                  <div className="space-y-5">
                    <div>
                      <h2 className="font-display text-3xl font-semibold">
                        Forgot your password?
                      </h2>
                      <p className="mt-2 text-sm text-muted">
                        Pick where we should send a 6 digit code.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 rounded-2xl bg-card p-1.5">
                      {methods.map(({ key, label, icon: Icon }) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() =>
                            update({ method: key, identifier: "" })
                          }
                          className={`flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-semibold transition ${method === key ? "bg-elevated text-primary shadow-sm" : "text-muted"}`}
                        >
                          <Icon className="size-4" />
                          {label}
                        </button>
                      ))}
                    </div>

                    <InputField
                      icon={activeMethod.icon}
                      label={
                        method === "email" ? "Gmail address" : "Mobile number"
                      }
                      type={activeMethod.type}
                      placeholder={activeMethod.placeholder}
                      value={identifier}
                      onChange={(event) =>
                        update({ identifier: event.target.value })
                      }
                    />

                    {error && <p className="text-sm text-red-500">{error}</p>}
                    <Button
                      className="w-full"
                      loading={loading}
                      onClick={sendOtp}
                    >
                      Send code
                    </Button>
                  </div>
                )}

                {step === "otp" && (
                  <div className="space-y-5">
                    <div>
                      <h2 className="font-display text-3xl font-semibold">
                        Enter the code
                      </h2>
                      <p className="mt-2 text-sm text-muted">
                        We sent a 6 digit code to {identifier}.
                      </p>
                    </div>

                    <OtpInput
                      value={otp}
                      onChange={(value) => update({ otp: value })}
                    />

                    {USE_MOCK && (
                      <p className="text-center text-xs text-muted">
                        Demo code: {MOCK_OTP}
                      </p>
                    )}
                    {error && (
                      <p className="text-center text-sm text-red-500">
                        {error}
                      </p>
                    )}

                    <Button
                      className="w-full"
                      loading={loading}
                      onClick={verifyOtp}
                    >
                      Verify code
                    </Button>

                    <p className="text-center text-sm text-muted">
                      {seconds > 0 ? (
                        `Resend code in ${seconds}s`
                      ) : (
                        <button
                          type="button"
                          onClick={sendOtp}
                          className="font-semibold text-primary hover:underline"
                        >
                          Resend code
                        </button>
                      )}
                    </p>
                  </div>
                )}

                {step === "reset" && (
                  <div className="space-y-5">
                    <div>
                      <h2 className="font-display text-3xl font-semibold">
                        Set a new password
                      </h2>
                      <p className="mt-2 text-sm text-muted">
                        Use at least 8 characters.
                      </p>
                    </div>

                    <InputField
                      icon={Lock}
                      label="New password"
                      type="password"
                      placeholder="New password"
                      value={next}
                      onChange={(event) => update({ next: event.target.value })}
                    />
                    <InputField
                      icon={Lock}
                      label="Confirm password"
                      type="password"
                      placeholder="Confirm password"
                      value={confirm}
                      onChange={(event) =>
                        update({ confirm: event.target.value })
                      }
                    />

                    {error && <p className="text-sm text-red-500">{error}</p>}
                    <Button
                      className="w-full"
                      loading={loading}
                      onClick={resetPassword}
                    >
                      Update password
                    </Button>
                  </div>
                )}

                {step === "done" && (
                  <div className="space-y-5 py-4 text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 16,
                      }}
                      className="mx-auto grid size-16 place-items-center rounded-full bg-primary/15 text-primary"
                    >
                      <CheckCircle2 className="size-9" />
                    </motion.div>
                    <div>
                      <h2 className="font-display text-3xl font-semibold">
                        Password updated
                      </h2>
                      <p className="mt-2 text-sm text-muted">
                        You can sign in with your new password now.
                      </p>
                    </div>
                    <Button className="w-full" onClick={close}>
                      Back to sign in
                    </Button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ForgotPasswordModal;

import React, { useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clapperboard,
  Eye,
  EyeOff,
  Loader2,
  Moon,
  ShieldCheck,
  Store,
  Sun,
} from "lucide-react";

import { getTheme, setTheme } from "../../services/preferences";
import { BRAND } from "../../config/brand";
import "./AuthShell.css";

const WORKSPACES = [
  {
    Icon: Clapperboard,
    title: "Production CRM",
    text: "Projects, cast & crew, schedules, budgets and contracts.",
  },
  {
    Icon: Store,
    title: "Vendor CRM",
    text: "Vendors, quotations, purchase orders, invoices and payments.",
  },
  {
    Icon: ShieldCheck,
    title: "Access by role",
    text: "Give each login one workspace or both.",
  },
];

/**
 * Shared frame for the sign-in pages: brand showcase on the left, the page's
 * form on the right, and a light/dark switch. Pass the form as children.
 */
export default function AuthShell({ title, subtitle, footer, wide = false, children }) {
  const [theme, setThemeState] = useState(getTheme);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    setThemeState(next);
  };

  return (
    <div className="lg">
      <aside className="lg-showcase" aria-hidden="true">
        <div className="lg-aurora" />
        <div className="lg-grid" />

        <div className="lg-brand">
          <span className="lg-mark">{BRAND.monogram}</span>
          <span className="lg-brand-name">{BRAND.name}</span>
        </div>

        <div className="lg-pitch">
          <h1>{BRAND.tagline}</h1>
          <p>{BRAND.description}</p>

          <ul className="lg-cards">
            {WORKSPACES.map(({ Icon, title: cardTitle, text }, index) => (
              <li key={cardTitle} style={{ "--i": index }}>
                <span className="lg-card-icon">
                  <Icon size={18} />
                </span>
                <div>
                  <strong>{cardTitle}</strong>
                  <span>{text}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="lg-foot">© {new Date().getFullYear()} {BRAND.name}</p>
      </aside>

      <main className="lg-main">
        <div className="lg-topbar">
          <div className="lg-brand lg-brand-compact">
            <span className="lg-mark">{BRAND.monogram}</span>
            <span className="lg-brand-name">{BRAND.name}</span>
          </div>
          <button
            type="button"
            className="lg-theme"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            title={theme === "dark" ? "Light theme" : "Dark theme"}
          >
            {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
          </button>
        </div>

        <div className={`lg-form ${wide ? "wide" : ""}`}>
          <header>
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </header>
          {children}
        </div>

        <p className="lg-legal">
          {footer || "Your administrator decides which workspaces your login can open."}
        </p>
      </main>
    </div>
  );
}

/** Error / success banner. Change `shakeKey` to replay the shake on a repeated error. */
export function AuthAlert({ type = "error", shakeKey, children }) {
  if (!children) return null;
  const Icon = type === "error" ? AlertCircle : CheckCircle2;
  return (
    <div
      key={shakeKey}
      className={`lg-alert ${type}`}
      role={type === "error" ? "alert" : "status"}
    >
      <Icon size={17} />
      <span>{children}</span>
    </div>
  );
}

/**
 * Input with a floating label. `password` adds a show/hide button;
 * `onCapsLock(bool)` reports Caps Lock while typing.
 */
export function AuthField({ id, label, password = false, onCapsLock, className = "", ...inputProps }) {
  const [visible, setVisible] = useState(false);
  const checkCaps = (event) => {
    if (onCapsLock && event.getModifierState) onCapsLock(event.getModifierState("CapsLock"));
  };

  return (
    <div className={`lg-field ${password ? "has-eye" : ""} ${className}`}>
      <input
        id={id}
        placeholder=" "
        {...inputProps}
        type={password ? (visible ? "text" : "password") : inputProps.type || "text"}
        onKeyDown={onCapsLock ? checkCaps : undefined}
        onKeyUp={onCapsLock ? checkCaps : undefined}
        onBlur={onCapsLock ? () => onCapsLock(false) : undefined}
      />
      <label htmlFor={id}>{label}</label>
      {password && (
        <button
          type="button"
          className="lg-eye"
          onClick={() => setVisible((value) => !value)}
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      )}
    </div>
  );
}

export function AuthSubmit({ loading, loadingText, children }) {
  return (
    <button className="lg-submit" type="submit" disabled={loading}>
      {loading ? (
        <>
          <Loader2 size={18} className="lg-spin" />
          {loadingText}
        </>
      ) : (
        <>
          {children}
          <ArrowRight size={18} className="lg-arrow" />
        </>
      )}
    </button>
  );
}

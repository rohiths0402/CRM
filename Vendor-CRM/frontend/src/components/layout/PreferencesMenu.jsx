import React, { useEffect, useRef, useState } from "react";
import { Database, Loader2, Moon, Settings, Sun } from "lucide-react";
import { getTheme, setTheme } from "../../services/preferences";
import { isAdmin } from "../../services/access";
import { loadSampleData } from "../../services/sampleData";
import "./PreferencesMenu.css";

const THEME_OPTIONS = [
  { value: "dark", label: "Dark", Icon: Moon },
  { value: "light", label: "Light", Icon: Sun },
];

function PreferencesMenu({ user }) {
  const [open, setOpen] = useState(false);
  const [theme, setThemeState] = useState(getTheme);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onClick = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false);
    };
    const onKey = (event) => event.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const chooseTheme = (value) => {
    setTheme(value);
    setThemeState(value);
  };

  const addSampleData = async () => {
    setLoading(true);
    setResult(null);
    try {
      const { lines, added } = await loadSampleData(user);
      setResult({ ok: true, lines, added });
    } catch (error) {
      setResult({
        ok: false,
        lines: [`Stopped part-way: ${error.message || "something went wrong."}`],
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="prefs" ref={ref}>
      <button
        type="button"
        className={`prefs-button ${open ? "open" : ""}`}
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="dialog"
        aria-expanded={open}
        title="Preferences"
      >
        <Settings size={17} />
        <span>Preferences</span>
      </button>

      {open && (
        <div className="prefs-panel" role="dialog" aria-label="Preferences">
          <section>
            <h4>Theme</h4>
            <div className="prefs-theme" role="radiogroup" aria-label="Theme">
              {THEME_OPTIONS.map(({ value, label, Icon }) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={theme === value}
                  className={theme === value ? "active" : ""}
                  onClick={() => chooseTheme(value)}
                >
                  <Icon size={15} />
                  {label}
                </button>
              ))}
            </div>
            <p className="prefs-note">Saved on this browser.</p>
          </section>

          {isAdmin(user) && (
            <section>
              <h4>Sample data</h4>
              <p className="prefs-note">
                Adds demo projects, crew, schedules, vendors, orders, invoices
                and more to this workspace, so every page has something to show.
              </p>
              <button
                type="button"
                className="prefs-action"
                onClick={addSampleData}
                disabled={loading}
              >
                {loading ? <Loader2 size={15} className="prefs-spin" /> : <Database size={15} />}
                {loading ? "Adding sample data…" : "Add sample data"}
              </button>
              {result && (
                <div className={`prefs-result ${result.ok ? "ok" : "error"}`}>
                  {result.lines.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                  {result.ok && result.added > 0 && (
                    <button
                      type="button"
                      className="prefs-link"
                      onClick={() => window.location.reload()}
                    >
                      Reload to see them
                    </button>
                  )}
                </div>
              )}
            </section>
          )}
        </div>
      )}
    </div>
  );
}

export default PreferencesMenu;

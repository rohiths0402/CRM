/**
 * Per-browser preferences. The theme is stored in localStorage and applied as
 * <html data-theme="dark|light">; styles/theme.css holds both palettes.
 */
const THEME_KEY = "crmTheme";
export const THEMES = ["dark", "light"];

export function getTheme() {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (THEMES.includes(saved)) return saved;
  } catch {
    // Storage blocked (private window etc.): fall back to the default.
  }
  return "dark";
}

export function applyTheme(theme) {
  document.documentElement.dataset.theme = THEMES.includes(theme) ? theme : "dark";
}

export function setTheme(theme) {
  applyTheme(theme);
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Not saved, but still applied for this visit.
  }
}

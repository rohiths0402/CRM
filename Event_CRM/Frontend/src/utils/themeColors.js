export const readThemeColors = () => {
  const styles = getComputedStyle(document.documentElement);
  const read = (name) => styles.getPropertyValue(name).trim();

  return {
    primary: read("--primary"),
    accent: read("--accent"),
    card: read("--card"),
    elevated: read("--elevated"),
    line: read("--line"),
    foreground: read("--foreground"),
    muted: read("--muted"),
  };
};

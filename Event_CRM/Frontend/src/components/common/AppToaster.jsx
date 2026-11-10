import { Toaster } from "sonner";
import { useTheme } from "../../context/ThemeContext";

const AppToaster = () => {
  const { theme } = useTheme();

  return (
    <Toaster
      theme={theme}
      position="top-right"
      richColors
      closeButton
      toastOptions={{ style: { fontFamily: "var(--font-sans)" } }}
    />
  );
};

export default AppToaster;

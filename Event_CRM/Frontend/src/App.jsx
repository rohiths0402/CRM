import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import AppRoutes from "./routes/AppRoutes";
import AppToaster from "./components/common/AppToaster";

const App = () => (
  <BrowserRouter>
    <ThemeProvider>
      <AuthProvider>
        <AppRoutes />
        <AppToaster />
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>
);

export default App;

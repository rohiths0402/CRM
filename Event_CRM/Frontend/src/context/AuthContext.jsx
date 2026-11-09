import { createContext, useContext, useEffect, useState } from "react";
import { authService } from "../api/services/authService";
import { clearSession, getToken, saveSession } from "../utils/storage";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      if (!getToken()) {
        setLoading(false);
        return;
      }
      try {
        setUser(await authService.getCurrentUser());
      } catch {
        clearSession();
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, []);

  const startSession = ({ token, user: signedInUser }, rememberMe) => {
    saveSession(token, rememberMe);
    setUser(signedInUser);
  };

  const signOut = async () => {
    try {
      await authService.logout();
    } finally {
      clearSession();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: Boolean(user),
        startSession,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

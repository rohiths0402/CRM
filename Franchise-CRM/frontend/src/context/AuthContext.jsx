import { createContext, useContext, useEffect, useState } from 'react';
import { login as loginApi, logout as logoutApi } from '../services/authService';
import {
  saveRememberCookie,
  getRememberCookie,
  clearRememberCookie,
  saveSessionUser,
  getSessionUser,
  clearSessionUser,
  setSessionLeftAt,
} from '../utils/authStorage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getRememberCookie() || getSessionUser());

  // Check idle timeout when returning after tab switch / visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        setSessionLeftAt(Date.now());
      } else {
        const sessionUser = getSessionUser();
        setSessionLeftAt(null);

        if (!sessionUser && !getRememberCookie()) {
          setUser(null);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const login = async (email, password, remember) => {
    const loggedInUser = await loginApi(email, password, remember);

    if (remember) {
      saveRememberCookie(loggedInUser);
    } else {
      saveSessionUser(loggedInUser);
    }
    setUser(loggedInUser);
  };

  // Update local user data after profile edits (synchronizes topbar and sidebar)
  const updateUser = (patch) => {
    const next = { ...user, ...patch };

    if (getRememberCookie()) {
      saveRememberCookie(next);
    } else {
      saveSessionUser(next);
    }
    setUser(next);
  };

  const logout = async () => {
    try {
      await logoutApi();
    } catch (e) {
      // Clear frontend auth session even if backend logout fails
    }
    clearRememberCookie();
    clearSessionUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
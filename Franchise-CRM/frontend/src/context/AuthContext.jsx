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
  // Page load aagum bodhu: cookie-la irundha adhu, illana sessionStorage
  const [user, setUser] = useState(() => getRememberCookie() || getSessionUser());

  // Tab vittu poi thirumba vandhaa check pannum
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

  const logout = async () => {
    try {
      await logoutApi();
    } catch (e) {
      // Backend fail aanaalum frontend-la logout pannanum
    }
    clearRememberCookie();
    clearSessionUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
import { createContext, useContext, useEffect, useState } from "react";
import { authService } from "../api/services/authService";
import { clearSession, getToken, saveSession } from "../utils/storage";

const AuthContext = createContext(null);
const PROFILE_FIELDS = [
  "name",
  "phone",
  "jobTitle",
  "department",
  "location",
  "avatarUrl",
];

const profileStorageKey = (userId) => `loop_profile_${userId}`;

const restoreProfile = (user) => {
  const savedProfile = localStorage.getItem(profileStorageKey(user.id));
  return savedProfile ? { ...user, ...JSON.parse(savedProfile) } : user;
};

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
        setUser(restoreProfile(await authService.getCurrentUser()));
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
    setUser(restoreProfile(signedInUser));
  };

  const updateProfile = (updates) => {
    if (!user?.id) throw new Error("You must be signed in to update your profile");
    const profile = Object.fromEntries(
      PROFILE_FIELDS.filter((field) => updates[field] !== undefined).map(
        (field) => [field, updates[field]],
      ),
    );
    localStorage.setItem(profileStorageKey(user.id), JSON.stringify(profile));
    setUser((current) => ({ ...current, ...profile }));
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
        updateProfile,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// The provider and its hook intentionally share this context module.
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

import { createContext, useContext, useEffect, useState } from "react";
import { authApi, usersApi } from "../api/client.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  const persistSession = (data) => {
    const { user: u, token } = data;
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(u));
    setUser(u);
  };

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    persistSession(res.data);
    return res;
  };

  const register = async (name, email, password) => {
    const res = await authApi.register({ name, email, password });
    persistSession(res.data);
    return res;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const refreshProfile = async () => {
    const res = await usersApi.profile();
    const profile = res.data;
    localStorage.setItem("user", JSON.stringify(profile));
    setUser(profile);
    return profile;
  };

  const isAdmin = user?.role === "ADMIN";

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshProfile,
        isAuthenticated: !!user,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

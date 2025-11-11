import { createContext, useContext, useEffect, useState } from "react";
import api from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  // Restaurar sesión
  useEffect(() => {
    const saved = localStorage.getItem("session");
    if (saved) {
      try {
        const { token: t, user: u } = JSON.parse(saved);
        setToken(t);
        setUser(u);
        api.defaults.headers.common.Authorization = `Bearer ${t}`;
      } catch {}
    }
    setReady(true);
  }, []);

  const login = ({ token: t, user: u }) => {
    setToken(t);
    setUser(u);
    localStorage.setItem("session", JSON.stringify({ token: t, user: u }));
    api.defaults.headers.common.Authorization = `Bearer ${t}`;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("session");
    delete api.defaults.headers.common.Authorization;
  };

  return (
    <AuthContext.Provider value={{ token, user, ready, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

"use client";

import { createContext, useContext, useState, useEffect } from "react";

interface User {
  id: number;
  email: string;
  username: string;
  role: "USER" | "MODERATOR" | "ADMIN";
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  const getLocale = () => {
    const seg = window.location.pathname.split("/")[1];
    return ["fr", "en"].includes(seg) ? seg : "fr";
  };

  // au chargement, verifier si un token existe dans le localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      // verifier que le token est encore valide
      fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${storedToken}` },
      })
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error("Token invalide");
        })
        .then((data) => {
          setUser(data.user);
          setToken(storedToken);
        })
        .catch(() => {
          localStorage.removeItem("token");
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [API_URL]);

  const login = async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Erreur de connexion");
    }

    const data = await res.json();
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem("token", data.token);
    window.location.href = `/${getLocale()}/dashboard`;
  };

  const register = async (email: string, username: string, password: string) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, username, password }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Erreur d'inscription");
    }

    const data = await res.json();
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem("token", data.token);
    window.location.href = `/${getLocale()}/dashboard`;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    window.location.href = `/${getLocale()}/login`;
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé dans un AuthProvider");
  }
  return context;
}

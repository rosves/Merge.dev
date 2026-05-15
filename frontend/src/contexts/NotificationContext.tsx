"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useSSE } from "@/hooks/useSSE";
import { useAuth } from "./AuthContext";

interface Notification {
  id: number;
  type: "NEW_MESSAGE" | "NEW_NEWS";
  content: string;
  read: boolean;
  createdAt: string;
  userId: number;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  refreshNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Connexion SSE pour recevoir les notifications en temps réel
  useSSE({
    endpoint: "/sse/notifications",
    autoConnect: !!user,
    onMessage: (event) => {
      try {
        const notification = JSON.parse(event.data);
        setNotifications((prev) => [notification, ...prev]);
      } catch (err) {
        console.error("[Notifications] Erreur parsing SSE:", err);
      }
    },
  });

  // Charger les notifications existantes au montage
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    const token = localStorage.getItem("token");

    fetch(`${API_URL}/notifications`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.ok ? res.json() : [])
      .then((data) => setNotifications(data))
      .catch((err) => console.error("[Notifications] Erreur chargement:", err));
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = useCallback((id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    const token = localStorage.getItem("token");
    
    fetch(`${API_URL}/notifications/${id}/read`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    }).catch((err) => console.error("[Notifications] Erreur mark as read:", err));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    const token = localStorage.getItem("token");
    fetch(`${API_URL}/notifications/read-all`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    }).catch((err) => console.error("[Notifications] Erreur mark all as read:", err));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const refreshNotifications = useCallback(() => {
    if (!user) return;
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    const token = localStorage.getItem("token");
    fetch(`${API_URL}/notifications`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.ok ? res.json() : [])
      .then((data) => setNotifications(data))
      .catch((err) => console.error("[Notifications] Erreur refresh:", err));
  }, [user]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        clearAll,
        refreshNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications doit être utilisé dans un NotificationProvider");
  }
  return context;
}

"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/contexts/AuthContext";

interface UseSocketOptions {
  autoConnect?: boolean;
}

export function useSocket(options: UseSocketOptions = {}) {
  const { autoConnect = true } = options;
  const { token } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  useEffect(() => {
    if (!token || !autoConnect) return;

    // Créer la connexion Socket.io
    const socket = io(SOCKET_URL, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    // Événements de connexion
    socket.on("connect", () => {
      console.log("[Socket] Connecté");
      setIsConnected(true);
      setError(null);
    });

    socket.on("disconnect", (reason) => {
      console.log("[Socket] Déconnecté:", reason);
      setIsConnected(false);
    });

    socket.on("connect_error", (err) => {
      console.error("[Socket] Erreur de connexion:", err.message);
      setError(err.message);
      setIsConnected(false);
    });

    // Cleanup à la déconnexion du composant
    return () => {
      socket.disconnect();
    };
  }, [token, autoConnect, SOCKET_URL]);

  // Méthodes helper
  const emit = (event: string, data: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    } else {
      console.warn("[Socket] Tentative d'émission sans connexion");
    }
  };

  const on = (event: string, handler: (...args: any[]) => void) => {
    socketRef.current?.on(event, handler);
  };

  const off = (event: string, handler?: (...args: any[]) => void) => {
    socketRef.current?.off(event, handler);
  };

  return {
    socket: socketRef.current,
    isConnected,
    error,
    emit,
    on,
    off,
  };
}

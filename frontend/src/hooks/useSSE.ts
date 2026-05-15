"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface UseSSEOptions {
  endpoint: string;
  autoConnect?: boolean;
  onMessage?: (event: MessageEvent) => void;
}

export function useSSE({ endpoint, autoConnect = true, onMessage }: UseSSEOptions) {
  const { token } = useAuth();
  const eventSourceRef = useRef<EventSource | null>(null);
  const onMessageRef = useRef(onMessage);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  onMessageRef.current = onMessage;

  useEffect(() => {
    if (!token || !autoConnect) return;

    const url = `${API_URL}${endpoint}?token=${encodeURIComponent(token)}`;
    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setIsConnected(true);
      setError(null);
    };

    eventSource.onerror = () => {
      setError("Erreur de connexion SSE");
      setIsConnected(false);
    };

    eventSource.onmessage = (event) => {
      onMessageRef.current?.(event);
    };

    return () => {
      eventSource.close();
    };
  }, [token, autoConnect, endpoint, API_URL]);

  // Méthode pour fermer manuellement la connexion
  const close = () => {
    eventSourceRef.current?.close();
    setIsConnected(false);
  };

  return {
    isConnected,
    error,
    close,
  };
}

"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslations, useLocale } from "next-intl";
import { useSocket } from "@/hooks/useSocket";
import { useNotifications } from "@/contexts/NotificationContext";
import { Link } from "@/i18n/navigation";
import Navbar from "@/components/Navbar";
import "@/styles/messages.css";

interface User {
  id: number;
  username: string;
  role: string;
}

interface Message {
  id: number;
  content: string;
  senderId: number;
  receiverId: number;
  sender: User;
  createdAt: string;
}

interface Conversation {
  user: User;
  lastMessage?: Message;
  unreadCount: number;
}

export default function MessagesPage() {
  const { user, isLoading, token } = useAuth();
  const router = useRouter();
  const t = useTranslations("messages");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const { emit, on, off, isConnected } = useSocket();
  const { refreshNotifications } = useNotifications();
  const searchParams = useSearchParams();
  const targetUserIdParam = searchParams.get("user");

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  // Charger les conversations au montage
  useEffect(() => {
    if (!user || !token) return;

    fetch(`${API_URL}/messages/conversations`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setConversations(data);
        setLoadingConversations(false);
      })
      .catch((err) => {
        console.error("[Messages] Erreur chargement conversations:", err);
        setLoadingConversations(false);
      });
  }, [user, token, API_URL]);

  // Charger les messages d'une conversation
  const loadMessages = (userId: number) => {
    if (!token) return;

    setLoadingMessages(true);
    setSelectedUserId(userId);
    setConversations((prev) =>
      prev.map((conv) => conv.user.id === userId ? { ...conv, unreadCount: 0 } : conv)
    );

    fetch(`${API_URL}/messages/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setMessages(data);
        setLoadingMessages(false);

        fetch(`${API_URL}/messages/${userId}/read`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        }).catch((err) => console.error("Erreur mark messages read:", err));

        fetch(`${API_URL}/notifications/mark-sender-read/${userId}`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        })
          .then(() => refreshNotifications())
          .catch((err) => console.error("Erreur mark notifications:", err));
      })
      
      .catch((err) => {
        console.error("[Messages] Erreur chargement messages:", err);
        setLoadingMessages(false);
      });
  };

  // Auto-sélectionner une conversation depuis ?user=id (lien "envoyer un message" du profil)
  useEffect(() => {
    if (loadingConversations || !targetUserIdParam || !user || !token) return;

    const targetId = parseInt(targetUserIdParam);
    if (isNaN(targetId) || targetId === user.id) return;

    const existing = conversations.find((c) => c.user.id === targetId);
    if (existing) {
      loadMessages(targetId);
      return;
    }

    // Nouvelle conversation : récupérer l'utilisateur et l'ajouter à la sidebar
    fetch(`${API_URL}/users/${targetId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((profileUser) => {
        if (!profileUser) return;
        setConversations((prev) => [
          { user: { id: profileUser.id, username: profileUser.username, role: profileUser.role }, unreadCount: 0 },
          ...prev,
        ]);
        setSelectedUserId(targetId);
      })
      .catch((err) => console.error("[Messages] Auto-select error:", err));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingConversations]);

  // Écouter les nouveaux messages WebSocket
  useEffect(() => {
    if (!isConnected) return;

    const handleNewMessage = (message: Message) => {
      // Si le message concerne la conversation ouverte, l'ajouter
      if (
        selectedUserId &&
        (message.senderId === selectedUserId || message.receiverId === selectedUserId)
      ) {
        setMessages((prev) => [...prev, message]);
      }

      // Mettre à jour la liste des conversations
      setConversations((prev) =>
        prev.map((conv) => {
          if (conv.user.id === message.senderId || conv.user.id === message.receiverId) {
            return {
              ...conv,
              lastMessage: message,
              unreadCount: (message.senderId === user?.id || message.senderId === selectedUserId) ? conv.unreadCount : conv.unreadCount + 1,
            };
          }
          return conv;
        })
      );
    };

    on("private_message", handleNewMessage);

    return () => {
      off("private_message", handleNewMessage);
    };
  }, [isConnected, selectedUserId, on, off]);

  // Envoyer un message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedUserId || !isConnected) return;

    emit("private_message", {
      receiverId: selectedUserId,
      content: messageInput.trim(),
    });

    setMessageInput("");
  };

  useEffect(() => {
  const messagesContainer = document.getElementById("messages-container");
  if (messagesContainer) {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
}, [messages]);

  if (isLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center">{tCommon("loading")}</div>;
  }

  const selectedConversation = conversations.find((c) => c.user.id === selectedUserId);
  const activeConversation = selectedConversation ?? null;

  const roleToColor = (role?: string) => {
    if (role === "ADMIN") return "amber";
    if (role === "MODERATOR") return "violet";
    return "blue";
  };

  const roleToLabel = (role?: string) => {
    if (role === "ADMIN") return "admin";
    if (role === "MODERATOR") return "mentor";
    return "junior";
  };

  const previewName = activeConversation?.user.username ?? "sélectionnez une conversation";
  const previewRole = roleToLabel(activeConversation?.user.role);

  return (
    <>
      <Navbar />

      <main data-screen-label="conversation">
        <div className="shell">
          <div className="page-eyebrow">{t("eyebrow")}</div>
          <h1 className="page-title">{t("title")}</h1>

          <div className="grid">
            <aside className="side">
              <div className="side-head">
                <span className="side-eyebrow">{t("sideEyebrow")}</span>
                <span className="side-count">{conversations.filter((conv) => conv.unreadCount > 0).length} {t("unread")}</span>
              </div>

              <div className="convs">
                {loadingConversations ? (
                  <div className="state-block">{tCommon("loading")}</div>
                ) : conversations.length === 0 ? (
                  <div className="state-block">
                    <p>{t("noConversations")}</p>
                  </div>
                ) : (
                  conversations.map((conv) => {
                    const initials = conv.user.username.slice(0, 2).toUpperCase();
                    const isActive = selectedUserId === conv.user.id;
                    return (
                      <button
                        key={conv.user.id}
                        type="button"
                        onClick={() => loadMessages(conv.user.id)}
                        className={`conv ${isActive ? "active" : ""}`}
                      >
                        <div className={`avatar md ${roleToColor(conv.user.role)}`}>
                          {initials}
                        </div>
                        <div className="conv-mid">
                          <div className="conv-name-row">
                            <span className="conv-name">{conv.user.username}</span>
                            <span className={`role-pill ${roleToLabel(conv.user.role)}`}>{roleToLabel(conv.user.role)}</span>
                          </div>
                          <span className={`conv-snippet ${conv.unreadCount > 0 ? "unread" : ""}`}>
                            {conv.lastMessage?.content ?? t("noMessageYet")}
                          </span>
                        </div>
                        <div className="conv-end">
                          <span className="conv-time">
                            {conv.lastMessage
                              ? new Date(conv.lastMessage.createdAt).toLocaleTimeString(locale, {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "--:--"}
                          </span>
                          {conv.unreadCount > 0 && <span className="conv-unread" />}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </aside>

            <section className="chat">
              {activeConversation ? (
                <>
                  <div className="chat-head">
                    <div className="head-left">
                      <div className={`avatar lg ${roleToColor(activeConversation.user.role)}`}>
                        {activeConversation.user.username.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="head-name">
                          {activeConversation.user.username}
                          <span className={`role-pill ${roleToLabel(activeConversation.user.role)}`}>{roleToLabel(activeConversation.user.role)}</span>
                        </div>
                        <div className="head-sub">
                          {t("connectedChannel")} · <span style={{ color: isConnected ? "#22c55e" : "#555" }}>{isConnected ? t("online") : t("offline")}</span>
                        </div>
                      </div>
                    </div>
                    <Link href={`/profile/${activeConversation.user.id}`} className="head-link">
                      {t("viewProfile")} <span className="arrow">→</span>
                    </Link>
                  </div>

                  <div id="messages-container" className="messages">
                    {loadingMessages ? (
                      <div className="state-block">{t("loadingMessages")}</div>
                    ) : messages.length === 0 ? (
                      <>
                        <div className="day">{t("today")}</div>
                        <div className="empty-state">
                          <p>{t("emptyTitle")}</p>
                          <p>{t("emptyStart", { name: previewName })}</p>
                          <p className="empty-meta">{t("emptyRole", { role: previewRole })}</p>
                        </div>
                      </>
                    ) : (
                      messages.map((msg) => {
                        const isSent = msg.senderId === user.id;
                        const time = new Date(msg.createdAt).toLocaleTimeString(locale, {
                          hour: "2-digit",
                          minute: "2-digit",
                        });

                        return (
                          <div key={msg.id} className={`row ${isSent ? "me" : "them"}`}>
                            <div className={`avatar sm ${isSent ? roleToColor(user.role) : roleToColor(activeConversation.user.role)}`}>
                              {isSent ? user.username.slice(0, 2).toUpperCase() : activeConversation.user.username.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="b-wrap">
                              <div className="bubble">{msg.content}</div>
                              <span className="b-time">{time}</span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <form onSubmit={handleSendMessage} className="composer">
                    <input
                      type="text"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      placeholder={t("typeMessage")}
                      className="input"
                      disabled={!isConnected}
                    />
                    <button
                      type="submit"
                      disabled={!messageInput.trim() || !isConnected}
                      className="btn"
                    >
                      {t("send")} <span className="arrow">→</span>
                    </button>
                  </form>
                </>
              ) : (
                <div className="chat-empty">
                  <div className="chat-empty-inner">
                    <p className="empty-title">{t("selectConversation")}</p>
                    <p className="empty-copy">{t("selectConversationHint")}</p>
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      <footer>
        <div className="shell foot-inner">
          <span>© 2025 merge · esgi</span>
          <span className="lang">
            <a className="active">fr</a>
            <span className="sep">/</span>
            <a>en</a>
          </span>
        </div>
      </footer>
    </>
  );
}
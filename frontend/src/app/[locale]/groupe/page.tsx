"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslations, useLocale } from "next-intl";
import { useSocket } from "@/hooks/useSocket";
import Navbar from "@/components/Navbar";
import "@/styles/channel.css";

interface User {
  id: number;
  username: string;
  role: string;
}

interface GroupMessage {
  id: number;
  content: string;
  senderId: number;
  sender: User;
  createdAt: string;
}

export default function GroupePage() {
  const { user, isLoading, token } = useAuth();
  const router = useRouter();
  const t = useTranslations("channel");
  const tCommon = useTranslations("common");
  const locale = useLocale();

  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(true);

  const { emit, on, off, isConnected } = useSocket();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }

    // Redirection si USER (pas accès au canal groupe)
    if (!isLoading && user && user.role === "USER") {
      router.push("/dashboard");
    }
  }, [user, isLoading, router]);

  // Charger l'historique des messages au montage
  useEffect(() => {
    if (!user || !token || user.role === "USER") return;

    fetch(`${API_URL}/messages/group/history`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setMessages(data);
        setLoadingMessages(false);
      })
      .catch((err) => {
        console.error("[Groupe] Erreur chargement historique:", err);
        setLoadingMessages(false);
      });
  }, [user, token, API_URL]);

  // Écouter les nouveaux messages WebSocket
  useEffect(() => {
    if (!isConnected) return;

    const handleGroupMessage = (message: GroupMessage) => {
      setMessages((prev) => [...prev, message]);
    };

    on("group_message", handleGroupMessage);

    return () => {
      off("group_message", handleGroupMessage);
    };
  }, [isConnected, on, off]);

  // Auto-scroll en bas quand nouveaux messages
  useEffect(() => {
    const messagesContainer = document.getElementById("group-messages-container");
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }, [messages]);

  // Envoyer un message
  const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!messageInput.trim() || !isConnected) return;

    emit("group_message", {
      content: messageInput.trim(),
    });

    setMessageInput("");
  };

  if (isLoading || !user || user.role === "USER") {
    return <div className="min-h-screen flex items-center justify-center">{tCommon("loading")}</div>;
  }

  const members = [
    { name: "Sophie D.", initials: "SD", role: "mentor", online: true },
    { name: "Marc R.",   initials: "MR", role: "admin",  online: true },
    { name: "Thomas M.", initials: "TM", role: "mentor", online: true },
    { name: "Léa K.",    initials: "LK", role: "mentor", online: true },
    { name: "Rania N.",  initials: "RN", role: "mentor", online: true },
    { name: "Elena H.",  initials: "EH", role: "admin",  online: true },
    { name: "Yann O.",   initials: "YO", role: "mentor", online: false },
    { name: "Pierre A.", initials: "PA", role: "mentor", online: false },
  ];

  const roleToTone = (role: string) => role.toUpperCase() === "ADMIN" ? "amber" : "violet";

  const formatRole = (role: string) => {
    if (role === "ADMIN") return "admin";
    if (role === "MODERATOR") return "mentor";
    return "junior";
  };

  const messageDate = messages.length
    ? new Date(messages[messages.length - 1].createdAt).toLocaleDateString(locale, {
        day: "2-digit",
        month: "long",
      })
    : t("today");

  return (
    <>
      <Navbar />

      <main data-screen-label="channel">
        <div className="shell">
          <div className="page-eyebrow">{t("eyebrow")}</div>
          <h1 className="page-title">{t("title")}</h1>

          <div className="grid">
            <aside className="side">
              <div className="side-head">
                <div>
                  <div className="side-eyebrow">{t("sideEyebrow")}</div>
                  <h3 className="side-title"><span className="hash">#</span>{t("channelName").replace("#", "")}</h3>
                </div>
              </div>

              <div className="members">
                {members.map((member) => (
                  <div className="member" key={member.name}>
                    <div className={`av-wrap ${member.online ? "online" : "offline"}`}>
                      <div className={`avatar md ${roleToTone(member.role)}`}>{member.initials}</div>
                    </div>
                    <div className="member-info">
                      <span className="member-name">{member.name}</span>
                      <span className={`role-pill ${member.role}`}>{member.role}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="side-foot">
                <span>8 {t("membersCount")}</span>
                <span className="count">● 6 {t("onlineCount")}</span>
              </div>
            </aside>

            <section className="chat">
              <div className="chat-head">
                <div>
                  <h3 className="chat-title"><span className="hash">#</span>{t("channelName").replace("#", "")}</h3>
                  <div className="chat-meta">{t("channelMeta")} · {isConnected ? t("connected") : t("offline")}</div>
                </div>
                <div className="chat-meta">{t("history")} {messageDate}</div>
              </div>

              <div id="group-messages-container" className="messages">
                {loadingMessages ? (
                  <div className="state-block">{t("loadingHistory")}</div>
                ) : messages.length === 0 ? (
                  <div className="state-block">{t("emptyChannel")}</div>
                ) : (
                  messages.map((msg) => {
                    const isSent = msg.senderId === user.id;
                    const senderTone = msg.sender.role === "ADMIN" ? "amber" : msg.sender.role === "MODERATOR" ? "violet" : "blue";
                    const time = new Date(msg.createdAt).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
                    return (
                      <div key={msg.id} className={`row ${isSent ? "me" : "them"}`}>
                        <div className={`avatar xs ${isSent ? roleToTone(user.role) : senderTone}`}>
                          {(isSent ? user.username : msg.sender.username).slice(0, 2).toUpperCase()}
                        </div>
                        <div className="b-wrap">
                          {!isSent && (
                            <div className="msg-meta">
                              <span className="msg-name">{msg.sender.username}</span>
                              <span className={`role-pill ${formatRole(msg.sender.role)}`}>{formatRole(msg.sender.role)}</span>
                            </div>
                          )}
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
                  placeholder={t("inputPlaceholder")}
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
            </section>
          </div>
        </div>
      </main>
    </>
  );
}

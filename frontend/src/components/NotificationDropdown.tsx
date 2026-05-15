"use client";

import { useEffect, useRef } from "react";
import { useNotifications } from "@/contexts/NotificationContext";
import { useRouter } from "@/i18n/navigation";

interface Props {
  onClose: () => void;
}

export default function NotificationDropdown({ onClose }: Props) {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div
      ref={ref}
      className="absolute right-0 top-[calc(100%+8px)] w-[320px] bg-[#0f0f0f] border border-[#1f1f1f] rounded-xl shadow-2xl z-50 overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1f1f1f]">
        <span className="font-mono text-[11px] text-[#555] uppercase tracking-wider">notifications</span>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="font-mono text-[11px] text-[#8a8a8a] hover:text-white transition lowercase"
          >
            mark all read
          </button>
        )}
      </div>

      <div className="max-h-[360px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="px-4 py-8 text-center text-[#555] font-mono text-[12px] lowercase">
            no notifications
          </div>
        ) : (
          notifications.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => {
                markAsRead(n.id);
                onClose();
                router.push(n.type === "NEW_MESSAGE" ? "/messages" : "/dashboard");
              }}
              className={`w-full text-left px-4 py-3 border-b border-[#1a1a1a] flex gap-3 items-start transition hover:bg-[#131313] ${
                !n.read ? "bg-[#0d1117]" : ""
              }`}
            >
              <span className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${
                n.type === "NEW_MESSAGE" ? "bg-blue-500" : "bg-amber-400"
              } ${n.read ? "opacity-0" : "opacity-100"}`} />
              <div className="min-w-0 flex-1">
                <p className={`text-[13px] leading-snug break-words ${n.read ? "text-[#8a8a8a]" : "text-[#ededed]"}`}>
                  {n.content}
                </p>
                <span className="font-mono text-[10.5px] text-[#555] mt-1 block">
                  {formatTime(n.createdAt)}
                </span>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

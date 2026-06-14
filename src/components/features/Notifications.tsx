import React from "react";
import { Heart, MessageSquare } from "lucide-react";
import { Notification } from "../../types";

interface NotificationsProps {
  _t: (id: string, en: string) => string;
  notifications: Notification[];
  setDashboardTab: (tab: "obrolan" | "linimasa" | "pemberitahuan") => void;
}

export const Notifications: React.FC<NotificationsProps> = ({
  _t,
  notifications,
  setDashboardTab
}) => {
  return (
    <div id="notifications-container" className="immersive-card p-4 bg-gradient-to-br from-[#1d1916] to-[#141210] border border-amber-900/30 rounded-xl flex flex-col gap-4 animate-fade-in mb-1 h-[810px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-black uppercase text-[#E9C46A] tracking-[0.2em] font-sans">
            🔔 {_t("Pemberitahuan Warkol", "Warkol Notifications")}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 no-scrollbar space-y-3 warkop-scrollbar">
        {notifications.length === 0 ? (
          <div className="text-center py-20 flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/5 text-3xl opacity-30">
              📭
            </div>
            <p className="text-xs text-stone-500 font-sans italic">{_t("Belum ada kabar baru hari ini, kawan.", "No new news today, buddy.")}</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div key={notif.id} className="p-3 bg-black/30 border border-white/5 rounded-xl flex items-start gap-3 hover:bg-white/5 transition-colors cursor-default group">
              <div className={`mt-1 p-2 rounded-lg flex items-center justify-center shrink-0 ${notif.type === 'like' ? 'bg-rose-500/10 text-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.1)]' : 'bg-blue-500/10 text-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.1)]'}`}>
                {notif.type === 'like' ? <Heart size={14} fill="currentColor" /> : <MessageSquare size={14} fill="currentColor" />}
              </div>
              <div className="flex-1 flex flex-col gap-1">
                <p className="text-[11px] leading-relaxed">
                  <span className="font-bold text-stone-200 hover:text-amber-400 cursor-pointer transition-colors">@{notif.sender}</span>
                  {" "}<span className="text-stone-400">{notif.content}</span>
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono text-stone-600 uppercase tracking-tight">{notif.timestamp}</span>
                  <button 
                    onClick={() => setDashboardTab("linimasa")}
                    className="text-[9px] font-black text-amber-500/60 hover:text-amber-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    {_t("LIHAT POST", "VIEW")}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

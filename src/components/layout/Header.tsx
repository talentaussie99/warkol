import React from "react";
import { Bell, Heart, Settings } from "lucide-react";
import { Notification } from "../../types";

interface HeaderProps {
  _t: (id: string, en: string) => string;
  onShowHowToOrder: () => void;
  nongkrongCount: number;
  dashboardTab: string;
  previousTab: string;
  setDashboardTab: (tab: "obrolan" | "linimasa" | "pemberitahuan") => void;
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  currentTime: string;
  onShowSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  _t,
  onShowHowToOrder,
  nongkrongCount,
  dashboardTab,
  previousTab,
  setDashboardTab,
  notifications,
  setNotifications,
  currentTime,
  onShowSettings
}) => {
  return (
    <header className="h-14 flex items-center justify-between px-6 border-b border-white/5 bg-[#151515] sticky top-0 z-50">
      <div id="header-container" className="max-w-[1300px] w-full mx-auto flex items-center justify-between">
        {/* Logo Brand */}
        <div className="flex items-center gap-3">
          <div className="flex items-center">
            <img
              src="https://imgur.com/m16hDt0.jpg"
              alt="WARKOL Logo"
              className="h-11 md:h-12 w-auto object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="h-4 w-[1px] bg-white/10 hidden sm:block"></div>
          
          <button
            type="button"
            onClick={onShowHowToOrder}
            className="text-[9px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded font-mono font-bold tracking-wider hover:bg-amber-500/30 transition-all active:scale-95 cursor-pointer"
          >
            {_t("PERATURAN & FITUR", "RULES & FEATURES")}
          </button>
          
          {/* Center Info Status */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-green-500/10 rounded-full border border-green-500/20">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs font-medium text-green-400">
              <span className="font-mono font-bold text-white mr-1">{nongkrongCount}</span> {_t("Orang Lagi Nongkrong", "People Hanging Out")}
            </span>
          </div>
        </div>

        {/* Time & Interactive Bill Summary */}
        <div className="flex items-center gap-4">
          
          {/* Notification Button */}
          <button
            type="button"
            onClick={() => {
              if (dashboardTab === "pemberitahuan") {
                setDashboardTab(previousTab as any);
              } else {
                setDashboardTab("pemberitahuan");
                setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
              }
            }}
            className={`relative p-2 rounded-full transition-all cursor-pointer select-none active:scale-95 ${
              dashboardTab === "pemberitahuan"
                ? "bg-[#E9C46A] text-neutral-900 shadow-[0_0_15px_rgba(233,196,106,0.3)]"
                : "bg-white/5 text-stone-400 hover:text-white hover:bg-white/10"
            }`}
            title={_t("Pemberitahuan", "Notifications")}
          >
            <Bell size={18} className={dashboardTab === "pemberitahuan" ? "fill-neutral-900" : ""} />
            {notifications.some(n => !n.isRead) && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-pulse border border-[#151515] shadow-[0_0_8px_rgba(244,63,94,0.6)]"></span>
            )}
          </button>

          {/* Settings Button */}
          <button
            type="button"
            onClick={onShowSettings}
            className="p-2 rounded-full bg-white/5 text-stone-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer select-none active:scale-95"
            title={_t("Pengaturan", "Settings")}
          >
            <Settings size={18} />
          </button>

          {/* Saweria Link Button */}
          <a
            id="saweria-donation-button"
            href="https://saweria.co/minekaze"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-[#D4A373] hover:from-amber-400 hover:to-[#c19262] text-neutral-950 px-3 py-1.5 rounded-full text-[11px] font-bold font-sans cursor-pointer transition-all shadow-sm shadow-amber-500/10 active:scale-95 group"
          >
            <Heart size={11} className="text-neutral-950 fill-neutral-950 group-hover:scale-110 transition-transform" />
            <span>{_t("Dukung:", "Support:")} <span className="underline font-black">{_t("Yang Buat", "Creator")}</span></span>
          </a>

          <div className="hidden sm:flex flex-col items-end">
            <span className="font-mono text-sm font-bold text-[#E9C46A] glow-yellow" id="clock">
              {currentTime || "00:00:00 WIB"}
            </span>
            <span className="uppercase tracking-widest text-[8px] text-white/40">Waktu Indonesia Barat</span>
          </div>
        </div>
      </div>
    </header>
  );
};

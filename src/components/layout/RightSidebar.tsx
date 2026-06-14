import React from "react";
import { User, Bell, DollarSign, Clock, PackageOpen } from "lucide-react";
import { MenuItem } from "../../types";
import { renderUserAvatar, PRESET_AVATARS } from "../common/UIComponents";

interface RightSidebarProps {
  _t: (id: string, en: string) => string;
  isLoggedIn: boolean;
  userName: string;
  userAvatar: string;
  userStatus: string;
  userPin: string;
  saldo: number;
  secondsActive: number;
  setSecondsActive?: React.Dispatch<React.SetStateAction<number>>;
  formatActiveDuration: (s: number) => string;
  hunger: number;
  thirst: number;
  isStatsExpanded: boolean;
  setIsStatsExpanded: (v: boolean) => void;
  isEditingName: boolean;
  setIsEditingName: (v: boolean) => void;
  isEditingStatus: boolean;
  setIsEditingStatus: (v: boolean) => void;
  setUserName: (v: string) => void;
  handleNameChange: (newName: string) => void;
  handleUpdateStatus: (v: string) => void;
  handleUpdateAvatar: (v: string) => void;
  setIsLoggedIn: (v: boolean) => void;
  inventory: MenuItem[];
  handleConsumeItem: (instanceId: string) => void;
  setActiveTableId: (id: string) => void;
  setMainView: (view: "chat" | "chess") => void;
  TableId: any;
  pengunjung: any[];
  mobileActiveTab?: string;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  _t,
  isLoggedIn,
  userName,
  userAvatar,
  userStatus,
  userPin,
  saldo,
  secondsActive,
  setSecondsActive,
  formatActiveDuration,
  hunger,
  thirst,
  isStatsExpanded,
  setIsStatsExpanded,
  isEditingName,
  setIsEditingName,
  isEditingStatus,
  setIsEditingStatus,
  setUserName,
  handleNameChange,
  handleUpdateStatus,
  handleUpdateAvatar,
  setIsLoggedIn,
  inventory,
  handleConsumeItem,
  setActiveTableId,
  setMainView,
  TableId,
  pengunjung,
  mobileActiveTab
}) => {
  const [localEditName, setLocalEditName] = React.useState(userName);
  const [localEditStatus, setLocalEditStatus] = React.useState(userStatus);

  React.useEffect(() => {
    if (isEditingName) setLocalEditName(userName);
  }, [isEditingName, userName]);

  React.useEffect(() => {
    if (isEditingStatus) setLocalEditStatus(userStatus);
  }, [isEditingStatus, userStatus]);

  // handle user changing their name with limits
  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localEditName.trim() === "") return;
    if (localEditName.trim() === userName) {
      setIsEditingName(false);
      return;
    }
    
    // Check 7-day limits from visitors data
    const myData = pengunjung.find(p => p.name === userName);
    if (myData && myData.name_changes) {
      const now = Date.now();
      const last7Days = myData.name_changes.filter((dateStr: string) => {
        return now - new Date(dateStr).getTime() < 7 * 24 * 60 * 60 * 1000;
      });
      if (last7Days.length >= 3) {
        alert(_t("Ganti nama maksimal 3x dalam 7 hari kawan!", "Name changes limited to 3 times per 7 days buddy!"));
        setLocalEditName(userName);
        setIsEditingName(false);
        return;
      }
    }

    // In App.tsx we inject this wrapper via handleNameChange prop
    handleNameChange(localEditName.trim());
    setIsEditingName(false);
  };

  const handleStatusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localEditStatus.trim() === "") return;
    
    handleUpdateStatus(localEditStatus.trim());
    setIsEditingStatus(false);
  };

  return (
    <div id="right-column" className={`${mobileActiveTab === "profile" ? "flex" : "hidden"} lg:flex lg:col-span-3 flex-col gap-4 overflow-y-auto warkop-scrollbar pr-1 h-full`}>
      {/* 1. USER PROFILE CARD */}
      {isLoggedIn && (
        <div id="user-profile-card" className="immersive-card p-3.5 bg-gradient-to-br from-[#241F1A] to-[#1C1713] border border-amber-900/40 rounded-xl">
          <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-amber-900/20">
            <span className="text-[10px] font-bold text-[#E9C46A] uppercase flex items-center gap-1.5 font-sans tracking-wider">
              <User size={12} className="text-[#D4A373]" /> {_t("Ini mah saya", "This is me")}
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-[8px] font-mono select-none px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/15 uppercase tracking-widest font-bold">{_t("PELANGGAN", "CUSTOMER")}</span>
              <button
                onClick={() => {
                   setIsLoggedIn(false);
                   setUserName(_t("Kamu (Nongkrong)", "You (Hanging out)"));
                   setActiveTableId(TableId.SANTAI);
                   setMainView("chat");
                }}
                className="text-[8px] bg-[#2a1310] hover:bg-rose-950 text-rose-300 border border-rose-900/45 px-1.5 py-0.5 rounded font-mono font-bold tracking-wider cursor-pointer transition-colors"
              >
                {_t("Cabut Duluan", "Leave")}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            <div className="flex flex-col gap-2.5 bg-[#2d2722]/40 p-2.5 rounded-xl border border-amber-950/20">
              <div className="flex items-center gap-3">
                <div className="relative group flex-shrink-0" title="Klik untuk ubah foto profil">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="avatar-upload"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        handleUpdateAvatar(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                  <label htmlFor="avatar-upload" className="cursor-pointer block">
                    {renderUserAvatar(userAvatar, "w-11 h-11", "transition-transform duration-150 group-hover:scale-105 border border-amber-700/50 shadow-lg")}
                    <div className="absolute inset-0 bg-black/45 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[8px] text-[#E9C46A] font-bold">
                      {_t("Ubah", "Edit")}
                    </div>
                  </label>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                      <DollarSign size={10} className="text-amber-400" />
                      <span className="text-[10px] font-mono font-bold text-amber-200">Rp {saldo.toLocaleString("id-ID")}</span>
                    </div>
                  </div>
                  {isEditingName ? (
                    <form 
                      onSubmit={handleNameSubmit}
                      className="flex items-center gap-1"
                    >
                      <input
                        type="text"
                        maxLength={15}
                        value={localEditName}
                        onChange={(e) => setLocalEditName(e.target.value)}
                        className="bg-stone-900 border border-[#44382C] text-xs px-2 py-0.5 rounded text-[#E0E0E0] w-full focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans"
                        autoFocus
                      />
                      <button type="submit" className="text-[10px] bg-[#D4A373] text-neutral-950 font-bold px-2 py-0.5 rounded cursor-pointer hover:bg-amber-400">Sip</button>
                    </form>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-amber-200 font-sans font-bold glow-yellow truncate block max-w-[120px]">{userName}</span>
                      <button 
                        onClick={() => setIsEditingName(true)} 
                        className="text-[9px] bg-white/5 hover:bg-white/10 text-white/50 hover:text-white px-1.5 py-0.2 rounded border border-white/10 cursor-pointer transition-colors"
                      >
                        {_t("Ubah", "Edit")}
                      </button>
                    </div>
                  )}

                  {isEditingStatus ? (
                    <form
                      onSubmit={handleStatusSubmit}
                      className="flex items-center gap-1 mt-1"
                    >
                      <input
                        type="text"
                        maxLength={35}
                        value={localEditStatus}
                        onChange={(e) => setLocalEditStatus(e.target.value)}
                        className="bg-stone-900 border border-[#44382C] text-xs px-2 py-0.5 rounded text-[#E0E0E0] w-full focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans"
                        autoFocus
                        placeholder="Ketikan status kustom..."
                      />
                      <button
                        type="submit"
                        className="text-[10px] bg-[#D4A373] text-neutral-950 font-bold px-2 py-0.5 rounded cursor-pointer hover:bg-amber-400"
                      >
                        Sip
                      </button>
                    </form>
                  ) : (
                    <div className="flex flex-col gap-1 mt-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-zinc-350 font-sans italic leading-tight truncate block max-w-[110px]">
                          {userStatus}
                        </span>
                        <button
                          onClick={() => setIsEditingStatus(true)}
                          className="text-[9px] bg-white/5 hover:bg-white/10 text-white/50 hover:text-white px-1 py-0.2 rounded border border-white/10 cursor-pointer transition-colors font-mono animate-fade-in"
                          title="Tulis status sendiri kawan"
                        >
                          Tulis Sendiri
                        </button>
                      </div>
                      
                      {/* BBM-style PIN Profil component */}
                      <div className="flex items-center gap-1 mt-1 font-mono text-[9px] text-[#A69076]">
                        <span>PIN:</span>
                        <span 
                          className="font-bold text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 px-1.5 py-0.2 rounded tracking-wider select-all cursor-pointer transition-colors"
                          title={_t("Klik untuk salin PIN kawan", "Click to copy PIN")}
                          onClick={() => {
                            navigator.clipboard.writeText(userPin);
                            /* Optional toast or status bubble update */
                          }}
                        >
                          {userPin}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Status Selection */}
            <div className="pt-2 border-t border-white/[0.03] space-y-1">
              <span className="text-[8px] font-bold text-white/40 uppercase tracking-wider font-mono">Ubah Status Sesuai Vibe:</span>
              <div className="flex flex-wrap gap-1">
                {[
                  "☕ Lagi Ngopi",
                  "🍜 Makan Mie",
                  "♟️ Main Catur Dulu",
                  "🤯 Lagi Puyeng",
                  "🚬 Butuh Sebat"
                ].map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      handleUpdateStatus(status);
                      setIsEditingStatus(false);
                    }}
                    className={`text-[9.5px] px-2 py-0.5 rounded font-sans transition-all cursor-pointer ${
                      userStatus === status 
                        ? "bg-amber-500/15 text-amber-300 border border-amber-500/20" 
                        : "bg-[#1E1A16] text-[#C19262] hover:bg-amber-950/20 hover:text-white border border-white/5"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Online duration readout */}
            <div className="bg-black/25 rounded p-1.5 border border-white/[0.03] flex items-center justify-between text-[10px] font-mono text-zinc-400">
              <div className="flex items-center gap-1">
                <Clock size={11} className="text-[#D4A373]" />
                <span>Aktif Nongkrong:</span>
              </div>
              <span className="text-[#E9C46A] font-bold">{formatActiveDuration(secondsActive)}</span>
            </div>

            {/* 🎒 KANTONG WARGA (SIMPLIFIED INVENTORY) */}
            <div id="warkop-backpack" className="mt-1 pt-2 border-t border-white/5 flex flex-col gap-2">
              <div className="flex items-center justify-between text-[9px] font-mono font-bold text-stone-400 uppercase tracking-widest">
                <span className="flex items-center gap-1">🎒 {_t("Kantong Makanan", "Food Bag")}</span>
                <span className="bg-amber-500/20 text-[#E9C46A] px-1.5 py-0.2 rounded font-sans text-[8px] font-black">
                  {inventory.length} {_t("item", "items")}
                </span>
              </div>

              {inventory.length === 0 ? (
                <div className="bg-black/20 border border-white/5 border-dashed rounded-lg p-2 text-center text-[9px] text-stone-500 italic">
                  {_t("Kantong kosong kawan...", "Empty pouch...")}
                </div>
              ) : (
                <div className="flex flex-col gap-1.5 max-h-[120px] overflow-y-auto no-scrollbar">
                  <div className="grid grid-cols-1 gap-1">
                    {inventory.map((item, idx) => (
                      <button
                        key={`${item.id}-${idx}`}
                        type="button"
                        onClick={() => handleConsumeItem(item.instanceId || "")}
                        className="flex items-center justify-between p-1.5 rounded bg-amber-950/15 hover:bg-[#E9C46A] hover:text-neutral-900 border border-white/5 hover:border-amber-500/40 transition-all text-left text-[10px] cursor-pointer group text-stone-300 font-semibold"
                        title={_t("Klik untuk melahap", "Click to consume")}
                      >
                        <span className="flex items-center gap-1.5">
                          <span className="text-xs">{item.icon}</span>
                          <span className="truncate max-w-[100px]">{item.name}</span>
                        </span>
                        <span className="text-[7.5px] font-mono opacity-80 bg-neutral-900 group-hover:bg-neutral-950 text-amber-300 group-hover:text-[#E9C46A] px-1 py-0.5 rounded uppercase font-black">
                          {_t("Makan", "Eat")}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Body Vitals (Stats) */}
            <div id="sims-stats-card" className="bg-black/20 p-3 rounded-xl border border-amber-900/20 flex flex-col gap-3 mt-1 shadow-inner">
              <div 
                className="flex items-center justify-between border-b border-white/5 pb-2 cursor-pointer select-none group"
                onClick={() => setIsStatsExpanded(!isStatsExpanded)}
              >
                <span className="text-[10px] font-mono font-bold text-stone-400 uppercase tracking-wider flex items-center gap-2 group-hover:text-amber-300 transition-colors">
                  <span className={`w-2.5 h-2.5 rotate-45 border border-emerald-300 drop-shadow-[0_0_5px_#10b981] inline-block animate-spin [animation-duration:3s] ${hunger > 25 && thirst > 25 ? "bg-emerald-400" : "bg-rose-400 drop-shadow-[0_0_5px_#f43f5e]"}`}></span>
                  <span>🔋 {_t("Kondisi Tubuh", "Body Vitals")}</span>
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-stone-500 font-bold transition-transform duration-200">
                    {isStatsExpanded ? "▼" : "▶"}
                  </span>
                </div>
              </div>

              {isStatsExpanded && (
                <div className="animate-fade-in flex flex-col gap-3">
                  {/* Hunger Bar */}
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[11px] font-semibold text-stone-300">
                      <span className="flex items-center gap-1">🍔 {_t("Lapar", "Hunger")}</span>
                      <span className={`font-mono text-xs ${hunger > 60 ? "text-emerald-400" : hunger > 25 ? "text-amber-400" : "text-rose-400 animate-pulse"}`}>
                        {hunger}%
                      </span>
                    </div>
                    <div className="h-2 w-full bg-black/40 border border-white/5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          hunger > 60 ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" : hunger > 25 ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]" : "bg-red-500 animate-pulse"
                        }`}
                        style={{ width: `${hunger}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Thirst Bar */}
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[11px] font-semibold text-stone-300">
                      <span className="flex items-center gap-1">🥤 {_t("Haus", "Thirst")}</span>
                      <span className={`font-mono text-xs ${thirst > 60 ? "text-emerald-400" : thirst > 25 ? "text-amber-400" : "text-rose-400 animate-pulse"}`}>
                        {thirst}%
                      </span>
                    </div>
                    <div className="h-2 w-full bg-black/40 border border-white/5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          thirst > 60 ? "bg-emerald-600 shadow-[0_0_8px_rgba(5,150,105,0.4)]" : thirst > 25 ? "bg-amber-600 shadow-[0_0_8px_rgba(217,119,6,0.4)]" : "bg-red-600 animate-pulse"
                        }`}
                        style={{ width: `${thirst}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. YANG SERING NONGKRONG (VISITORS LIST) */}
      <div id="pengunjung-list" className="immersive-card p-4 bg-gradient-to-br from-[#241F1A] to-[#1C1713] border border-amber-900/30 rounded-xl flex flex-col gap-3 shadow-xl">
        <div className="flex items-center justify-between pb-1.5 border-b border-white/5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-[#E9C46A] uppercase flex items-center gap-1.5 font-sans tracking-wider font-semibold">
              👥 {_t("Yang Sering Nongkrong", "Frequent Visitors")}
            </span>
          </div>
          <span className="text-[8px] font-mono text-white/30 bg-white/5 px-1.5 py-0.5 rounded border border-white/10 uppercase tracking-widest font-bold">
            {pengunjung.filter(p => p.isOnline).length} {_t("Online", "Online")}
          </span>
        </div>

        <div className="space-y-2 max-h-[290px] overflow-y-auto pr-1 no-scrollbar warkop-scrollbar">
          {pengunjung.map((p) => (
            <div key={p.id} className="flex items-center justify-between p-2 bg-black/30 border border-white/[0.03] rounded-lg group transition-all hover:bg-amber-950/20">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <span className={`flex w-2 h-2 rounded-full ${p.isOnline ? "bg-emerald-500" : "bg-stone-700"}`} />
                  {p.isOnline && <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-25"></span>}
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5 google-fonts">
                    <span className="text-[10.5px] font-bold text-stone-200 group-hover:text-amber-200 transition-colors truncate max-w-[100px]" title={p.name}>{p.name}</span>
                    {p.pin && (
                      <button 
                        type="button"
                        className="text-[7.5px] font-mono font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 px-1 py-0.2 rounded border border-amber-500/15 cursor-pointer transition-colors active:scale-90"
                        title={_t(`Klik untuk salin PIN @${p.name}`, `Click to copy PIN of @${p.name}`)}
                        onClick={() => {
                          if (p.pin) {
                            navigator.clipboard.writeText(p.pin);
                          }
                        }}
                      >
                        {p.pin}
                      </button>
                    )}
                  </div>
                  <span className="text-[8.5px] text-stone-500 font-mono italic truncate max-w-[110px]">{p.status}</span>
                </div>
              </div>
              <span className={`text-[8.5px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-widest ${
                p.isOnline 
                  ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20 font-sans" 
                  : "text-stone-600 bg-black/20 border-white/5 font-sans"
              }`}>
                {p.isOnline ? _t("Ngopi", "Here") : _t("Pulang", "Left")}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

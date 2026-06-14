import React from "react";
import { Users, ChefHat, Pin } from "lucide-react";
import { Meja, MenuItem } from "../../types";

interface LeftSidebarProps {
  _t: (id: string, en: string) => string;
  activeTableId: string;
  setActiveTableId: (id: string) => void;
  tables: Meja[];
  setShowCreateRoomModal: (show: boolean) => void;
  MENU_ITEMS: MenuItem[];
  orderConfirmingId: string | null;
  setOrderConfirmingId: (id: string | null) => void;
  ensureAuth: (actionName: string) => boolean;
  setPurchaseConfirmItem: (item: MenuItem | null) => void;
  setShowSettingsModal: (show: boolean) => void;
  setShowHowToOrder: (show: boolean) => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  _t,
  activeTableId,
  setActiveTableId,
  tables,
  setShowCreateRoomModal,
  MENU_ITEMS,
  orderConfirmingId,
  setOrderConfirmingId,
  ensureAuth,
  setPurchaseConfirmItem,
  setShowSettingsModal,
  setShowHowToOrder
}) => {
  return (
    <div id="side-kiri" className="hidden lg:flex lg:col-span-3 flex-col gap-4 overflow-y-auto warkop-scrollbar pr-2 h-full">
      {/* MEJA DIRECTORY */}
      <div id="meja-directory-card" className="immersive-card p-4 bg-[#1f1d1a] border border-white/5 rounded-xl flex flex-col gap-4 animate-fade-in">
        <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-[#E9C46A]" />
            <span className="text-[11px] font-black uppercase text-[#E9C46A] tracking-[0.2em] font-sans">
              {_t("Direktori Meja", "Table Directory")}
            </span>
          </div>
          <span className="text-[10px] font-mono font-bold text-white/30 lowercase">warungpedia.v1</span>
        </div>

        <div className="flex flex-col gap-1.5 max-h-[320px] overflow-y-auto warkop-scrollbar pr-1">
          {tables.map((meja) => (
            <button
              key={meja.id}
              onClick={() => setActiveTableId(meja.id)}
              className={`group flex items-center justify-between p-2.5 rounded-lg border transition-all cursor-pointer relative overflow-hidden ${
                activeTableId === meja.id
                  ? "bg-amber-500/15 border-amber-500/30 shadow-[0_5px_15px_rgba(245,158,11,0.05)]"
                  : "bg-black/20 border-white/5 hover:border-amber-500/20 hover:bg-black/30"
              }`}
            >
              {activeTableId === meja.id && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500"></div>
              )}
              <div className="flex items-center gap-3">
                <span className={`text-[15px] p-1.5 rounded-md bg-[#25221e] border border-white/5 shadow-inner transition-transform group-hover:scale-110 ${activeTableId === meja.id ? "text-amber-500 shadow-amber-500/10" : "text-stone-400"}`}>
                  {meja.icon}
                </span>
                <div className="flex flex-col">
                  <span className={`text-xs font-black tracking-tight font-sans transition-colors ${activeTableId === meja.id ? "text-white" : "text-stone-400 group-hover:text-stone-300"}`}>
                    {meja.name}
                  </span>
                  <span className="text-[9px] text-white/20 font-mono italic flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/60 inline-block"></span>
                    {meja.count} {_t("Tongkrongan", "People")}
                  </span>
                </div>
              </div>
            </button>
          ))}
          <button 
            onClick={() => {
              if (ensureAuth(_t("membuat meja baru", "creating a new table"))) {
                setShowCreateRoomModal(true);
              }
            }}
            className="mt-2 w-full p-2 border border-dashed border-white/10 hover:border-amber-500/30 hover:bg-amber-500/5 rounded-lg flex items-center justify-center gap-2 transition-all group cursor-pointer"
          >
            <div className="w-5 h-5 rounded flex items-center justify-center bg-white/5 text-stone-500 group-hover:text-amber-500 transition-colors">
              <span className="text-xs">+</span>
            </div>
            <span className="text-[10px] font-bold text-stone-500 group-hover:text-amber-300 uppercase tracking-widest font-mono">
              {_t("Buka Meja Baru", "Create New Room")}
            </span>
          </button>
        </div>
      </div>

      {/* MENU WARKOL */}
      <div id="menu-warkol-card" className="immersive-card p-4 bg-[#1f1d1a] border border-white/5 rounded-xl flex flex-col gap-4 animate-fade-in">
        <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
          <div className="flex items-center gap-2">
            <ChefHat size={16} className="text-[#E9C46A]" />
            <span className="text-[11px] font-black uppercase text-[#E9C46A] tracking-[0.2em] font-sans">
              {_t("Menu Warkol", "Warkol Menu")}
            </span>
          </div>
          <button
            onClick={() => setShowHowToOrder(true)}
            className="text-[8px] font-mono text-emerald-400 font-bold uppercase tracking-tighter bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
          >
            {_t("Peraturan", "Rules")}
          </button>
        </div>

        <p className="text-[9px] text-amber-500/60 font-bold mb-0.5 flex items-center gap-1.5 animate-pulse font-mono tracking-tight">
          <span className="w-1 h-1 bg-amber-500 rounded-full"></span>
          {_t("Info: Klik 2x untuk membeli", "Info: Double Click to Buy")}
        </p>

        <div className="grid grid-cols-2 gap-2 max-h-[350px] overflow-y-auto warkop-scrollbar pr-1">
          {MENU_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setOrderConfirmingId(item.id);
                setTimeout(() => {
                  setOrderConfirmingId(null);
                }, 5000);
              }}
              onDoubleClick={(e) => {
                e.preventDefault();
                if (ensureAuth(_t("memesan menu hidangan", "ordering from the menu"))) {
                  setPurchaseConfirmItem(item);
                }
              }}
              className={`p-1.5 border transition-all rounded text-left flex flex-col justify-between group cursor-pointer relative ${
                orderConfirmingId === item.id 
                  ? "bg-amber-600/30 border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)] scale-[1.02]" 
                  : "bg-[#1e1e1e] hover:bg-amber-950/20 border-white/5 hover:border-amber-900/60"
              }`}
              title={item.description}
            >
              {orderConfirmingId === item.id && (
                <div className="absolute top-0 right-0 p-0.5 bg-amber-500 rounded-bl rounded-tr-none text-[#151515]">
                  <Pin size={8} className="fill-current" />
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <span className="text-sm">{item.icon}</span>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-[9px] text-white/70 line-clamp-1 group-hover:text-[#E9C46A] font-sans font-bold">{item.name}</span>
                  <span className="text-[7px] text-white/20 line-clamp-1 font-sans italic leading-none mt-0.5">{item.description}</span>
                </div>
              </div>
              <div className="text-[8.5px] font-mono font-bold text-[#D4A373] self-end mt-1">
                {_t("Rp " + item.price, "IDR " + item.price)}
              </div>
            </button>
          ))}
        </div>

        <div id="settings-card" className="mt-4 pt-3 border-t border-white/5">
          <button
            onClick={() => setShowSettingsModal(true)}
            className="w-full border border-white/10 bg-black/20 hover:bg-amber-950/40 px-3 py-2 text-[10px] text-stone-300 hover:text-amber-200 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer font-bold tracking-wider uppercase font-mono shadow-sm"
          >
            ⚙️ {_t("Pengaturan", "Settings")}
          </button>
        </div>
      </div>
    </div>
  );
};

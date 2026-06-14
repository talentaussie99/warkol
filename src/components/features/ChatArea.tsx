import React from "react";
import { Send, MessageCircle } from "lucide-react";
import { Message, Meja } from "../../types";
import { renderMessageTextWithTags } from "../common/UIComponents";

interface ChatAreaProps {
  _t: (id: string, en: string) => string;
  activeTableId: string;
  getActiveTable: () => Meja;
  INITIAL_MEJA_LIST: Meja[];
  userName: string;
  handleInviteUser: (tableId: string, username: string) => void;
  timeLeft: number;
  isLoggedIn: boolean;
  hunger: number;
  thirst: number;
  ensureAuth: (action: string) => boolean;
  handleSendMessage: (e: React.FormEvent) => void;
  newMsgText: string;
  setNewMsgText: (text: string) => void;
  chatContainerRef: React.RefObject<HTMLDivElement>;
  chats: Record<string, Message[]>;
  messageReports: Record<string, number>;
  getDisplaySender: (sender: string) => string;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  _t,
  activeTableId,
  getActiveTable,
  INITIAL_MEJA_LIST,
  userName,
  handleInviteUser,
  timeLeft,
  isLoggedIn,
  hunger,
  thirst,
  ensureAuth,
  handleSendMessage,
  newMsgText,
  setNewMsgText,
  chatContainerRef,
  chats,
  messageReports,
  getDisplaySender
}) => {
  const activeTable = getActiveTable();

  return (
    <div className="immersive-card flex flex-col relative overflow-hidden transition-all duration-300 h-[810px]">
      {/* INTEGRATED OBROLAN HARI INI */}
      <div className="px-4 py-2.5 border-b border-white/5 bg-[#1f1d1a] flex-shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#E9C46A] uppercase tracking-wider font-sans">
              <span className="text-sm leading-none">{activeTable.icon}</span>
              <span>{_t("Meja:", "Room:")} {activeTable.name}</span>
              {activeTable.creator && (
                <span className="text-[7.5px] lowercase py-0.5 px-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono rounded tracking-wider">
                  {_t("oleh ", "by ")}@{activeTable.creator}
                </span>
              )}
            </div>
            <p className="text-[10px] text-zinc-300 leading-normal mt-0.5 font-sans">
              <strong className="text-zinc-500 mr-1 font-mono">{_t("Topik:", "Topic:")}</strong> {activeTable.topic}
            </p>
          </div>

          {/* Invitation form for custom rooms */}
          {!INITIAL_MEJA_LIST.some(t => t.id === activeTableId) && (
            <div className="flex items-center gap-1 bg-black/25 p-1 rounded border border-white/5 self-start sm:self-auto">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.currentTarget;
                  const input = form.elements.namedItem("inviteUsername") as HTMLInputElement;
                  const nameToInvite = input.value.trim();
                  if (nameToInvite) {
                    if (nameToInvite.toLowerCase() === userName.toLowerCase()) {
                      alert("Kamu tidak bisa mengundang dirimu sendiri, kawan!");
                      return;
                    }
                    handleInviteUser(activeTableId, nameToInvite);
                    input.value = "";
                  }
                }}
                className="flex items-center gap-1"
              >
                <input
                  type="text"
                  name="inviteUsername"
                  required
                  placeholder="Undang kawan..."
                  maxLength={15}
                  className="bg-[#14120F] text-[9.5px] font-mono text-amber-100 placeholder-white/20 px-2 py-0.5 rounded focus:outline-none border border-white/10 w-[110px] focus:border-[#D4A373]"
                />
                <button
                  type="submit"
                  className="bg-[#D4A373] hover:bg-amber-400 text-[9.5px] text-neutral-900 font-bold px-2 py-0.5 rounded cursor-pointer leading-tight transition-all"
                >
                  Undang
                </button>
              </form>
            </div>
          )}
        </div>

        {/* List of invited members if any, for custom tables */}
        {!INITIAL_MEJA_LIST.some(t => t.id === activeTableId) && activeTable.invitedUsers && activeTable.invitedUsers!.length > 0 && (
          <div className="mt-2 pt-1.5 border-t border-white/5 flex items-center gap-1.5 flex-wrap">
            <span className="text-[8.5px] font-mono uppercase tracking-wider text-amber-500/80 font-black">Terundang sekamar:</span>
            {activeTable.invitedUsers!.map((usr, i) => (
              <span key={i} className="text-[9px] font-sans px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-white/5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>{usr}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Anti-Spam Cooldown Active Notice */}
      {timeLeft > 0 && (
        <div className="bg-red-950/45 border-b border-rose-955/20 px-4 py-2 flex items-center justify-between text-[11px] text-rose-300 font-mono animate-pulse flex-shrink-0">
          <span className="flex items-center gap-1.5 font-bold">
            <span className="text-sm select-none">⏳</span>
            <span>Sruput kopi dulu kawan! Cooldown anti-spam: tunggu {timeLeft} detik lagi.</span>
          </span>
          <span className="bg-rose-950/70 text-rose-400 font-black px-2 py-0.5 rounded border border-rose-900/40 text-[10px]">
            {timeLeft}s
          </span>
        </div>
      )}

      {/* Input message form TOP */}
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          if (!isLoggedIn) {
            ensureAuth(_t("mengirim pesan obrolan", "sending a chat message"));
            return;
          }
          handleSendMessage(e);
        }} 
        className="p-2 border-b border-white/5 bg-[#1c1c1c] flex items-center gap-1.5 flex-shrink-0"
      >
        <input
          type="text"
          maxLength={100}
          readOnly={!isLoggedIn || hunger <= 10 || thirst <= 10}
          onClick={() => {
            if (!isLoggedIn) {
              ensureAuth(_t("mengirim pesan obrolan", "sending a chat message"));
            }
          }}
          onFocus={(e) => {
            if (!isLoggedIn) {
              e.currentTarget.blur();
              ensureAuth(_t("mengirim pesan obrolan", "sending a chat message"));
            }
          }}
          placeholder={
            !isLoggedIn 
              ? _t("Klik di sini untuk Join Tongkrongan & mulai ngobrol...", "Click here to Join and start chatting...")
              : (hunger <= 10 || thirst <= 10)
                ? _t("⚠️ Lapar/Haus ≤10%! Makan/minum di menu Sajian dulu...", "⚠️ Hunger/Thirst ≤10%! Eat/drink from Menu first...")
                : _t("Ngobrol bareng bapak-bapak: 'bakar obat nyamuk'...", "Chat with the guys: 'light up mosquito coil'...")
          }
          value={newMsgText}
          onChange={(e) => {
            if (isLoggedIn && hunger > 10 && thirst > 10) {
              setNewMsgText(e.target.value);
            }
          }}
          className={`flex-1 border bg-[#232323] px-3 py-1.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-amber-700/80 font-sans cursor-pointer ${
            (hunger <= 10 || thirst <= 10) ? "opacity-45 border-amber-900/30 cursor-not-allowed bg-black/40 focus:border-transparent text-amber-500/50" : "border-white/5"
          }`}
          disabled={isLoggedIn && (hunger <= 10 || thirst <= 10)}
        />
        <button
          type="submit"
          disabled={isLoggedIn && (!newMsgText.trim() || hunger <= 10 || thirst <= 10)}
          className="bg-[#D4A373] hover:bg-[#c19262] text-neutral-900 p-1.5 rounded transition disabled:opacity-30 flex items-center justify-center cursor-pointer"
        >
          <Send size={14} className="stroke-[2.5]" />
        </button>
      </form>

      {/* Chats Feed Scroller */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3.5 warkop-scrollbar">
        {chats[activeTableId]?.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-stone-500 font-sans py-12">
            <span className="text-3xl mb-1 opacity-60">💨</span>
            <p className="text-xs italic">Warung hening sejenak... Kirimlah pesan buat memancing tawa.</p>
          </div>
        ) : (
          chats[activeTableId]?.slice().reverse().map((msg) => {
            const reportCount = messageReports[msg.id] || 0;
            if (reportCount > 10) return null; // Automatic high-report hiding

            const isUser = msg.role === "user";
            const isAdmin = msg.role === "admin";
            
            // Highlight condition when current user is tagged in a message from others
            const isUserTagged = !isUser && (
              msg.text.toLowerCase().includes(`@${userName.toLowerCase()}`) ||
              msg.text.toLowerCase().includes("@kamu")
            );
            
            return (
              <div
                key={msg.id}
                className={`flex flex-col max-w-[85%] transition-all ${
                  isUser ? "ml-auto items-end" : "items-start"
                } ${
                  isUserTagged 
                    ? "border-l-3 border-amber-500 bg-amber-500/5 p-2 rounded-r-lg shadow-[0_0_15px_rgba(233,196,106,0.12)] border border-[#524436]" 
                    : ""
                }`}
              >
                {/* Message tag notification */}
                {isUserTagged && (
                  <span className="text-[8.5px] font-mono font-bold text-amber-400 flex items-center gap-1 mb-1 animate-pulse uppercase tracking-widest">
                    🔔 Kamu Ditag!
                  </span>
                )}

                {/* Message header details */}
                <div className="flex items-center gap-1.5 mb-1 text-[10px] font-mono flex-wrap">
                  {!isUser && (
                    <span className="text-[#D4A373] font-semibold">{getDisplaySender(msg.sender)}</span>
                  )}
                  {msg.tag && (
                    <span className={`px-1.5 py-0.2 rounded text-[8px] tracking-wide border font-bold ${
                      msg.tag === "Sepuh" ? "bg-amber-900 border-amber-500 text-amber-200" :
                      msg.tag === "Warga" ? "bg-stone-800 border-stone-600 text-stone-300" :
                      msg.tag === "Admin" ? "bg-red-950 border-red-500 text-red-200" :
                      "bg-zinc-800 border-zinc-700 text-zinc-400"
                    }`}>
                      {msg.tag}
                    </span>
                  )}
                  <span className="text-white/20 select-none">•</span>
                  <span className="text-white/20">{msg.timestamp}</span>
                </div>

                {/* Message Bubble Body */}
                <div 
                  className={`px-3 py-2 rounded-2xl text-xs leading-relaxed font-sans shadow-sm select-text ${
                    isUser 
                      ? "bg-[#D4A373] text-neutral-900 font-medium rounded-tr-none" 
                      : isAdmin
                        ? "bg-red-950/40 text-red-100 border border-red-900/50 rounded-tl-none font-medium italic"
                        : "bg-white/5 text-stone-200 border border-white/5 rounded-tl-none"
                  }`}
                >
                  {renderMessageTextWithTags(msg.text, userName)}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
